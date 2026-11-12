"""Pack and verify JSON-only scoring evidence. Python standard library only."""
import argparse
from decimal import Decimal, ROUND_HALF_UP
import hashlib
import http.client
import io
import ipaddress
import json
import math
from pathlib import Path, PurePosixPath
import re
import socket
import ssl
import stat
import sys
import time
from urllib.parse import urljoin, urlsplit
import zipfile

ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT / 'scoring/test-tasks.json').read_text())
MAX_DOWNLOAD = 25 * 1024 * 1024
MAX_EXPANDED = 100 * 1024 * 1024
MAX_FILE = 2 * 1024 * 1024


def require(condition, message):
    if not condition:
        raise ValueError(message)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f'Duplicate JSON key: {key}')
        result[key] = value
    return result


def read_json(data):
    def invalid(value):
        raise ValueError(f'Non-finite JSON constant: {value}')
    return json.loads(data, object_pairs_hook=unique_object, parse_constant=invalid)


def score(value):
    require(type(value) in (int, float) and math.isfinite(value) and 0 <= value <= 1,
            'Scores must be finite numbers from 0 to 1.')
    return value


def success(value, numeric_score):
    require(type(value) in (int, bool) and value in (0, 1) and bool(value) == (numeric_score == 1),
            'Success flag disagrees with the score (full success requires exactly 1).')


def supported_budget(limit, budget):
    require(type(limit) is int and limit in (50, 100, -1), 'Missing or unsupported original run limit.')
    require(limit == -1 or (budget != 'unlimited' and int(budget) <= limit),
            'The run limit does not support the requested scoring budget.')


def cutoff(payload, budget, limit):
    supported_budget(limit, budget)
    entries = payload.get('step_budget_scores')
    require(isinstance(entries, dict) and budget in entries, f'Missing {budget}-step cutoff score.')
    entry = entries[budget]
    require(isinstance(entry, dict) and entry.get('status', 'available') == 'available',
            f'The {budget}-step score is unavailable or ungraded.')
    value = score(entry.get('score'))
    success(entry.get('success'), value)
    step = entry.get('evaluated_at_step')
    require(type(step) is int and step >= 0 and (budget == 'unlimited' or step <= int(budget)),
            'Cutoff evaluation occurred outside the requested step budget.')
    return value


def agentlab_score(summary, run, budget):
    limit = summary.get('max_steps', run.get('runMaxSteps'))
    require(limit == run.get('runMaxSteps'), 'Manifest and AgentLab run limits disagree.')
    supported_budget(limit, budget)
    if 'step_budget_scores' in summary:
        # A later failure does not invalidate an already completed checkpoint.
        return cutoff(summary, budget, limit)
    require(not summary.get('err_msg'), 'AgentLab attempt contains an error and has no cutoff grade.')
    require(summary.get('score_provenance', {}).get('status', 'terminal') == 'terminal',
            'AgentLab summary contains a historical score, not a terminal grade.')
    require(limit == (-1 if budget == 'unlimited' else int(budget)),
            'Legacy summaries cannot derive another budget without recorded cutoff scores.')
    require(summary.get('terminated') is True or summary.get('truncated') is True,
            'Legacy AgentLab attempt did not finish.')
    steps = summary.get('n_steps')
    require(type(steps) is int and steps >= 0 and (limit == -1 or steps <= limit),
            'Legacy AgentLab step count is missing or exceeds the declared run limit.')
    return score(summary.get('cum_reward'))


def harbor_task_id(trial):
    name = trial.get('task_name', '')
    match = re.fullmatch(r'webarena-pro(?:/test-|\-test-)(\d+)', name)
    require(match is not None, 'Harbor task_name must identify a WebArena-Pro Test task.')
    return match.group(1).zfill(3)


def harbor_score(trial, core, reward, run, budget):
    require(harbor_task_id(trial) == run['taskId'], 'Harbor task identity disagrees with the manifest.')
    require(not trial.get('exception_info'), 'Harbor trial has an unresolved exception.')
    require(core.get('status') == 'graded', 'Harbor Core result is ungraded or erroneous.')
    limit = core.get('max_steps')
    require(limit == run.get('runMaxSteps'), 'Manifest and Harbor run limits disagree.')
    supported_budget(limit, budget)
    native = (trial.get('verifier_result') or {}).get('rewards')
    require(isinstance(native, dict) and isinstance(core.get('rewards'), dict), 'Missing Harbor verifier rewards.')
    terminal = score(core.get('score'))
    success(core.get('success'), terminal)
    for metrics in (core['rewards'], native, reward):
        require(isinstance(metrics, dict), 'Harbor rewards must be objects.')
        require(score(metrics.get('reward')) == terminal, 'Harbor terminal reward files disagree.')
        success(metrics.get('success'), terminal)
    value = cutoff(core, budget, limit)
    key = f'score_at_{budget}'
    for metrics in (core['rewards'], native, reward):
        require(key in metrics and score(metrics[key]) == value, f'Harbor {key} files disagree or are missing.')
    return value


def archive_objects(data):
    require(len(data) <= MAX_DOWNLOAD, 'Scoring archive exceeds 25 MiB.')
    objects = {}
    total = 0
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        require(len(entries) <= 1501, 'Too many ZIP entries.')
        for info in entries:
            name = info.filename
            parts = PurePosixPath(name).parts
            require(name and not name.startswith('/') and '\\' not in name and '..' not in parts and
                    str(PurePosixPath(name)) == name.rstrip('/'), 'Unsafe ZIP member path.')
            require(not stat.S_ISLNK(info.external_attr >> 16), 'ZIP symlinks are not allowed.')
            require(not info.flag_bits & 1, 'Encrypted ZIP files are not supported.')
            if info.is_dir():
                continue
            require(name.endswith('.json') and name not in objects, 'ZIP must contain unique JSON files only.')
            require(info.file_size <= MAX_FILE, f'{name}: JSON file exceeds 2 MiB.')
            total += info.file_size
            require(total <= MAX_EXPANDED, 'Expanded archive exceeds 100 MiB.')
            with archive.open(info) as stream:
                raw = stream.read(MAX_FILE + 1)
            require(len(raw) <= MAX_FILE, 'JSON file exceeds its size limit.')
            obj = read_json(raw)
            require(isinstance(obj, dict), f'{name}: expected a JSON object.')
            objects[name] = obj
    return objects


def rounded_rate(wins, count):
    return float((Decimal(wins) * 100 / Decimal(count)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP))


def rounded_claim(value):
    require(type(value) in (int, float) and math.isfinite(value) and 0 <= value <= 100, 'Invalid reported percentage.')
    return float(Decimal(str(value)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP))


def compute_archive(data, submission):
    objects = archive_objects(data)
    manifest = objects.get('manifest.json', {})
    require(manifest.get('schemaVersion') == 1 and manifest.get('split') == 'test', 'Invalid scoring manifest.')
    for key in ('harness', 'benchmarkRevision', 'stepBudget'):
        require(manifest.get(key) == submission.get(key), f'Scoring manifest {key} disagrees with the submission.')
    harness, budget = manifest['harness'], manifest['stepBudget']
    require(harness in ('AgentLab', 'Harbor') and budget in ('50', '100', 'unlimited'), 'Unsupported harness or budget.')
    runs = manifest.get('runs')
    require(isinstance(runs, list) and len(runs) == 300, 'Expected exactly 300 scored task attempts.')
    seen, referenced, outcomes = set(), {'manifest.json'}, {}
    for run in runs:
        require(isinstance(run, dict), 'Invalid run manifest entry.')
        task = run.get('taskId')
        require(isinstance(task, str) and task in CATALOG['tasks'], f'Unknown Test task ID: {task}')
        require(task not in seen, f'Duplicate task ID: {task}')
        seen.add(task)
        origin = run.get('sourceRun')
        require(isinstance(origin, str) and origin.strip(), f'{task}: missing source run identity.')
        def get_file(key):
            member = run.get(key)
            require(isinstance(member, str) and member in objects and member not in referenced,
                    f'{task}: missing or reused {key} artifact.')
            referenced.add(member)
            return objects[member]
        try:
            if harness == 'AgentLab':
                value = agentlab_score(get_file('summary'), run, budget)
            else:
                value = harbor_score(get_file('trial'), get_file('core'), get_file('reward'), run, budget)
        except (ValueError, TypeError, AttributeError) as exc:
            raise ValueError(f'Task {task}: {exc}') from exc
        outcomes[task] = int(value == 1)
    require(seen == set(CATALOG['tasks']), 'Scoring archive does not cover the exact Test task set.')
    require(referenced == set(objects), 'Archive contains unreferenced JSON files; package only the selected scoring artifacts.')
    wins = sum(outcomes.values())
    domains = []
    for i, name in enumerate(CATALOG['domains']):
        ids = [task for task, domain in CATALOG['tasks'].items() if domain == i]
        solved = sum(outcomes[task] for task in ids)
        domains.append({'name': name, 'successes': solved, 'tasks': len(ids), 'sr': rounded_rate(solved, len(ids))})
    return {'successes': wins, 'tasks': 300, 'computedSR': rounded_rate(wins, 300),
            'stepBudget': budget, 'domains': domains}


def public_target(url):
    parsed = urlsplit(url)
    require(parsed.scheme == 'https' and parsed.hostname and parsed.port in (None, 443) and
            not parsed.username and not parsed.password and not parsed.fragment, 'Archive URL must be public HTTPS on port 443, without credentials or fragments.')
    addresses = socket.getaddrinfo(parsed.hostname, 443, type=socket.SOCK_STREAM)
    require(addresses and all(ipaddress.ip_address(item[4][0]).is_global for item in addresses),
            'Archive URLs must resolve only to public IP addresses.')
    return parsed, addresses[0][4][0]


class PinnedHTTPS(http.client.HTTPSConnection):
    def __init__(self, host, address):
        super().__init__(host, timeout=20, context=ssl.create_default_context())
        self.address = address

    def connect(self):
        sock = socket.create_connection((self.address, 443), timeout=self.timeout)
        self.sock = self._context.wrap_socket(sock, server_hostname=self.host)


def download_archive(url):
    deadline = time.monotonic() + 90
    for _ in range(6):
        require(time.monotonic() < deadline, 'Archive download timed out.')
        parsed, address = public_target(url)
        connection = PinnedHTTPS(parsed.hostname, address)
        try:
            target = parsed.path or '/'
            if parsed.query:
                target += '?' + parsed.query
            connection.request('GET', target, headers={'User-Agent': 'WebArena-Pro-score-validator', 'Accept-Encoding': 'identity'})
            response = connection.getresponse()
            if response.status in (301, 302, 303, 307, 308):
                location = response.getheader('Location')
                require(location is not None, 'Archive redirect has no destination.')
                url = urljoin(url, location)
                continue
            require(response.status == 200, f'Archive download returned HTTP {response.status}.')
            length = response.getheader('Content-Length')
            require(length is None or int(length) <= MAX_DOWNLOAD, 'Scoring archive exceeds 25 MiB.')
            body = bytearray()
            while True:
                require(time.monotonic() < deadline, 'Archive download timed out.')
                chunk = response.read(min(65536, MAX_DOWNLOAD + 1 - len(body)))
                if not chunk:
                    return bytes(body)
                body.extend(chunk)
                require(len(body) <= MAX_DOWNLOAD, 'Scoring archive exceeds 25 MiB.')
        finally:
            connection.close()
    raise ValueError('Too many archive redirects.')


def verify_submission(submission, data=None):
    digest = submission.get('scoringSha256', '')
    require(isinstance(digest, str) and re.fullmatch('[a-f0-9]{64}', digest), 'Missing or invalid scoring archive SHA-256.')
    if data is None:
        data = download_archive(submission['scoringArchive'])
    require(hashlib.sha256(data).hexdigest() == digest, 'Scoring archive SHA-256 mismatch.')
    result = compute_archive(data, submission)
    reported = rounded_claim(submission.get('averageSR'))
    require(reported == result['computedSR'],
            f'Reported SR {reported:.1f}% does not match computed SR {result["computedSR"]:.1f}% ({result["successes"]}/300).')
    claimed_domains = submission.get('domainScores', [])
    require(isinstance(claimed_domains, list) and len(claimed_domains) == 6, 'Expected six domain scores.')
    for claimed, computed in zip(claimed_domains, result['domains']):
        if claimed is not None:
            require(rounded_claim(claimed) == computed['sr'], f'{computed["name"]}: reported domain SR does not match {computed["sr"]:.1f}%.')
    return {**result, 'reportedSR': reported, 'archiveSha256': digest, 'status': 'passed'}


def pack(args):
    source = Path(args.source).resolve()
    selection = read_json(Path(args.selection).read_bytes()) if args.selection else None
    candidates = {}
    if selection is not None:
        require(isinstance(selection, dict), 'Selection must map task IDs to run directories.')
        for task, name in selection.items():
            directory = (source / name).resolve()
            require(directory.is_relative_to(source), 'Selected run must be inside the source directory.')
            candidates[task] = directory
    else:
        if args.harness == 'AgentLab':
            files = list(source.rglob('summary_info.json'))
            files += [file for file in source.rglob('summary.json') if not (file.parent / 'summary_info.json').exists()]
        else:
            files = source.rglob('result.json')
        for file in sorted(files):
            if args.harness == 'AgentLab':
                match = re.search(r'(?:webarena-pro-bgym\.|^)(\d{3})(?:_|-)', file.parent.name)
                if not match:
                    continue
                task = match.group(1)
            else:
                trial = read_json(file.read_bytes())
                if 'task_name' not in trial:
                    continue
                task = harbor_task_id(trial)
            require(task not in candidates, f'Multiple attempts for task {task}; provide --selection. No best-of selection is automatic.')
            candidates[task] = file.parent
    require(set(candidates) == set(CATALOG['tasks']), 'Source must contain exactly the 300 Test tasks. Use --selection for explicit run mapping.')
    manifest = {'schemaVersion': 1, 'harness': args.harness, 'benchmarkRevision': args.benchmark_revision,
                'stepBudget': args.step_budget, 'split': 'test', 'runs': []}
    payloads = {}
    for task, directory in sorted(candidates.items()):
        run = {'taskId': task, 'sourceRun': str(directory.relative_to(source))}
        def add(key, relative, fields):
            original = read_json((directory / relative).read_bytes())
            compact = {key: original[key] for key in fields if key in original}
            # Preserve error presence without exporting messages/configuration secrets.
            for error_key in ('err_msg', 'exception_info'):
                if error_key in compact:
                    compact[error_key] = True if compact[error_key] else None
            member = f'runs/{task}/{key}.json'
            payloads[member] = compact
            run[key] = member
            return original
        if args.harness == 'AgentLab':
            filename = 'summary_info.json' if (directory / 'summary_info.json').is_file() else 'summary.json'
            summary = add('summary', filename, ['cum_reward','max_steps','step_budget_scores','score_provenance','err_msg','terminated','truncated','n_steps'])
            run['runMaxSteps'] = summary.get('max_steps', args.legacy_max_steps)
        else:
            add('trial','result.json',['task_name','exception_info','verifier_result'])
            core = add('core','artifacts/webarena-evidence/result.json', ['schema_version','status','score','success','max_steps','step_budget_scores','rewards','steps'])
            add('reward','verifier/reward.json',['reward','success','score_at_50','score_at_100','score_at_unlimited'])
            run['runMaxSteps'] = core.get('max_steps')
        manifest['runs'].append(run)
    payloads['manifest.json'] = manifest
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name, payload in sorted(payloads.items()):
            archive.writestr(name, json.dumps(payload, allow_nan=False, separators=(',', ':')))
    data = buffer.getvalue()
    result = compute_archive(data, manifest)
    Path(args.output).write_bytes(data)
    print(json.dumps({**result, 'scoringSha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('pack')
    p.add_argument('--source', required=True)
    p.add_argument('--harness', choices=['AgentLab','Harbor'], required=True)
    p.add_argument('--benchmark-revision', required=True)
    p.add_argument('--step-budget', choices=['50','100','unlimited'], required=True)
    p.add_argument('--legacy-max-steps', type=int, choices=[50,100,-1])
    p.add_argument('--selection', help='JSON mapping each Test task ID to a selected run directory relative to source')
    p.add_argument('--output', required=True)
    v = sub.add_parser('verify')
    v.add_argument('submission')
    v.add_argument('--archive', help='Use a local ZIP instead of downloading')
    v.add_argument('--report')
    d = sub.add_parser('verify-directory')
    d.add_argument('directory', nargs='?', default='submissions')
    args = parser.parse_args()
    try:
        if args.command == 'pack':
            pack(args)
        elif args.command == 'verify':
            result = verify_submission(read_json(Path(args.submission).read_bytes()),
                                       Path(args.archive).read_bytes() if args.archive else None)
            if args.report:
                Path(args.report).write_text(json.dumps(result, indent=2) + '\n')
            print(json.dumps(result, indent=2))
        else:
            for file in sorted(Path(args.directory).glob('*.json')):
                result = verify_submission(read_json(file.read_bytes()))
                print(f'{file.name}: {result["successes"]}/300 = {result["computedSR"]:.1f}% — passed')
    except Exception as exc:
        message = str(exc)
        if args.command == 'verify' and args.report:
            Path(args.report).write_text(json.dumps({'status': 'failed', 'error': message}) + '\n')
        print('Scoring validation failed: ' + message, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
