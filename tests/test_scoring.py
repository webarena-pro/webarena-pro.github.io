import argparse
import contextlib
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import socket
import stat
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('scoring', ROOT / 'scripts/scoring.py')
scoring = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scoring)
TASKS = sorted(scoring.CATALOG['tasks'])


def checkpoint(value, step=50):
    return {'score': value, 'success': value == 1, 'evaluated_at_step': step}


def fixture(harness='AgentLab', budget='50', wins=127):
    manifest = {'schemaVersion': 1, 'split': 'test', 'harness': harness,
                'benchmarkRevision': 'fixture-revision', 'stepBudget': budget, 'runs': []}
    objects = {'manifest.json': manifest}
    for i, task in enumerate(TASKS):
        value = 1 if i < wins else 0.5
        run = {'taskId': task, 'sourceRun': f'webarena-pro-bgym.{task}_0', 'runMaxSteps': -1}
        # Later success deliberately differs from the requested 50-step score.
        cutoffs = {'50': checkpoint(value), '100': checkpoint(1, 100), 'unlimited': checkpoint(1, 120)}
        if harness == 'AgentLab':
            run['summary'] = f'runs/{task}/summary.json'
            objects[run['summary']] = {'max_steps': -1, 'step_budget_scores': cutoffs,
                                       'cum_reward': 1, 'err_msg': None}
        else:
            for key in ('trial', 'core', 'reward'):
                run[key] = f'runs/{task}/{key}.json'
            reward = {'reward': 1.0, 'success': 1, 'score_at_50': value, 'score_at_100': 1, 'score_at_unlimited': 1}
            objects[run['trial']] = {'task_name': f'webarena-pro/test-{task}', 'exception_info': None,
                                      'verifier_result': {'rewards': copy.deepcopy(reward)}}
            objects[run['core']] = {'schema_version': 1, 'status': 'graded', 'score': 1.0, 'success': True,
                                     'max_steps': -1, 'step_budget_scores': cutoffs, 'rewards': copy.deepcopy(reward)}
            objects[run['reward']] = reward
        manifest['runs'].append(run)
    return objects


def zip_objects(objects):
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name, value in objects.items():
            archive.writestr(name, value if isinstance(value, bytes) else json.dumps(value))
    return output.getvalue()


def record_for(objects, data=None, average=42.3):
    data = zip_objects(objects) if data is None else data
    return {**{key: objects['manifest.json'][key] for key in ('harness', 'benchmarkRevision', 'stepBudget')},
            'scoringArchive': 'https://example.org/scores.zip', 'scoringSha256': hashlib.sha256(data).hexdigest(),
            'averageSR': average, 'domainScores': [None] * 6}


class ScoringTests(unittest.TestCase):
    def test_catalog_matches_published_domain_counts(self):
        self.assertEqual(len(TASKS), 300)
        self.assertEqual([list(scoring.CATALOG['tasks'].values()).count(i) for i in range(6)], [53,44,16,63,98,26])
        self.assertNotEqual(set(TASKS), {str(i).zfill(3) for i in range(1,301)})

    def test_native_harnesses_use_selected_cutoff_not_final_or_mean_reward(self):
        for harness in ('AgentLab', 'Harbor'):
            for budget, average, wins in [('50', 42.3, 127), ('100', 100, 300), ('unlimited', 100, 300)]:
                with self.subTest(harness=harness, budget=budget):
                    objects = fixture(harness, budget)
                    data = zip_objects(objects)
                    result = scoring.verify_submission(record_for(objects, data, average), data)
                    self.assertEqual(result['successes'], wins)
                    self.assertEqual(result['computedSR'], average)
                    self.assertEqual(sum(domain['successes'] for domain in result['domains']), wins)
                    self.assertEqual(result['status'], 'passed')

    def test_reported_overall_and_domain_disagreement_fail(self):
        objects = fixture(); data = zip_objects(objects); record = record_for(objects, data)
        with self.assertRaisesRegex(ValueError, 'does not match computed'):
            scoring.verify_submission({**record, 'averageSR': 42.4}, data)
        result = scoring.verify_submission(record, data)
        domains = [item['sr'] for item in result['domains']]
        scoring.verify_submission({**record, 'domainScores': domains}, data)
        domains[0] = 99.9
        with self.assertRaisesRegex(ValueError, 'domain SR'):
            scoring.verify_submission({**record, 'domainScores': domains}, data)
        # 127/300 is 42.333...%; comparison is at one decimal, including submitted precision.
        scoring.verify_submission({**record, 'averageSR': 42.333333}, data)
        self.assertEqual(scoring.rounded_claim(42.35), 42.4)

    def test_zero_is_a_valid_grade_and_partial_credit_is_not_success(self):
        for value in (0, 0.5, 0.999999):
            objects = fixture(wins=0)
            for run in objects['manifest.json']['runs']:
                objects[run['summary']]['step_budget_scores']['50'] = checkpoint(value)
            data = zip_objects(objects)
            self.assertEqual(scoring.verify_submission(record_for(objects, data, 0), data)['successes'], 0)

    def test_checksum_is_enforced_before_scores(self):
        objects = fixture(); data = zip_objects(objects)
        with self.assertRaisesRegex(ValueError, 'SHA-256 mismatch'):
            scoring.verify_submission({**record_for(objects, data), 'scoringSha256': '0' * 64}, data)

    def test_coverage_duplicates_wrong_ids_missing_artifacts_and_metadata(self):
        for case in ('missing', 'duplicate', 'unknown', 'artifact', 'reuse', 'extra', 'revision', 'budget', 'harness'):
            with self.subTest(case=case):
                objects = fixture(); manifest = objects['manifest.json']; runs = manifest['runs']
                record = record_for(objects)
                if case == 'missing': runs.pop()
                if case == 'duplicate': runs[1]['taskId'] = runs[0]['taskId']
                if case == 'unknown': runs[0]['taskId'] = '99999'
                if case == 'artifact': del objects[runs[0]['summary']]
                if case == 'reuse': runs[1]['summary'] = runs[0]['summary']
                if case == 'extra': objects['extra.json'] = {}
                if case == 'revision': manifest['benchmarkRevision'] = 'other'
                if case == 'budget': manifest['stepBudget'] = '100'
                if case == 'harness': manifest['harness'] = 'Harbor'
                with self.assertRaises(ValueError): scoring.compute_archive(zip_objects(objects), record)

    def test_unavailable_invalid_and_out_of_budget_checkpoints_do_not_fall_back(self):
        for harness in ('AgentLab', 'Harbor'):
            for case in ('unavailable', 'absent', 'success', 'nan', 'string', 'boolean', 'late', 'run-limit'):
                with self.subTest(harness=harness, case=case):
                    objects = fixture(harness); run = objects['manifest.json']['runs'][0]
                    native = objects[run['summary' if harness == 'AgentLab' else 'core']]
                    entry = native['step_budget_scores']['50']
                    if case == 'unavailable': entry['status'] = 'unavailable'
                    if case == 'absent': del native['step_budget_scores']['50']
                    if case == 'success': entry['success'] = False
                    if case == 'nan': entry['score'] = float('nan')
                    if case == 'string': entry['score'] = '1'
                    if case == 'boolean': entry['score'] = True
                    if case == 'late': entry['evaluated_at_step'] = 51
                    if case == 'run-limit': native['max_steps'] = 25; run['runMaxSteps'] = 25
                    with self.assertRaises(ValueError): scoring.compute_archive(zip_objects(objects), record_for(objects))

    def test_agentlab_completed_checkpoint_survives_later_error(self):
        run = {'runMaxSteps': 100}
        summary = {'max_steps': 100, 'err_msg': 'later interruption', 'step_budget_scores': {'50': checkpoint(1)}}
        self.assertEqual(scoring.agentlab_score(summary, run, '50'), 1)
        with self.assertRaisesRegex(ValueError, 'Missing 100'):
            scoring.agentlab_score(summary, run, '100')
        with self.assertRaisesRegex(ValueError, 'does not support'):
            scoring.agentlab_score(summary, run, 'unlimited')

    def test_agentlab_legacy_requires_original_limit_and_terminal_grade(self):
        native = {'cum_reward': 1.0, 'terminated': True, 'truncated': False, 'err_msg': None, 'n_steps': 12}
        self.assertEqual(scoring.agentlab_score(native, {'runMaxSteps': 50}, '50'), 1)
        cases = [({'err_msg': 'crash'}, 50), ({'terminated': False}, 50), ({'n_steps': 51}, 50),
                 ({'score_provenance': {'status': 'last_evaluation'}}, 50), ({}, None), ({}, 100)]
        for change, limit in cases:
            with self.subTest(change=change, limit=limit), self.assertRaises(ValueError):
                scoring.agentlab_score({**native, **change}, {'runMaxSteps': limit}, '50')

    def test_harbor_cross_checks_trial_core_and_verifier(self):
        for case in ('trial-task', 'exception', 'ungraded', 'terminal-reward', 'reward-success', 'cutoff', 'missing-rewards'):
            with self.subTest(case=case):
                objects = fixture('Harbor'); run = objects['manifest.json']['runs'][0]
                trial, core, reward = [objects[run[key]] for key in ('trial','core','reward')]
                if case == 'trial-task': trial['task_name'] = 'webarena-pro/test-999'
                if case == 'exception': trial['exception_info'] = {'exception_type': 'timeout'}
                if case == 'ungraded': core['status'] = 'error'
                if case == 'terminal-reward': reward['reward'] = 0
                if case == 'reward-success': reward['success'] = 0
                if case == 'cutoff': trial['verifier_result']['rewards']['score_at_50'] = 0
                if case == 'missing-rewards': trial['verifier_result'] = None
                with self.assertRaises(ValueError): scoring.compute_archive(zip_objects(objects), record_for(objects))

    def test_zip_rejects_unsafe_non_json_duplicate_and_nonfinite_members(self):
        for name, value in [('../manifest.json', {}), ('/manifest.json', {}), ('runs\\a.json', {}),
                            ('image.png', {}), ('manifest.json', b'{"a":1,"a":2}'),
                            ('manifest.json', b'{"a":NaN}'), ('manifest.json', [])]:
            with self.subTest(name=name, value=value), self.assertRaises(ValueError):
                scoring.archive_objects(zip_objects({name: value}))
        raw = io.BytesIO()
        with zipfile.ZipFile(raw, 'w') as archive:
            member = zipfile.ZipInfo('link.json'); member.create_system = 3
            member.external_attr = (stat.S_IFLNK | 0o777) << 16
            archive.writestr(member, '{}')
        with self.assertRaisesRegex(ValueError, 'symlinks'): scoring.archive_objects(raw.getvalue())

    def test_zip_limits_apply_before_parsing(self):
        data = zip_objects({'one.json': {'large': 'a' * 1000}, 'two.json': {'large': 'b' * 1000}})
        for variable, limit in [('MAX_DOWNLOAD', 10), ('MAX_FILE', 100), ('MAX_EXPANDED', 1500)]:
            with self.subTest(variable=variable), patch.object(scoring, variable, limit), self.assertRaises(ValueError):
                scoring.archive_objects(data)

    def test_pack_both_harnesses_preserves_scores_and_strips_large_private_fields(self):
        for harness in ('AgentLab', 'Harbor'):
            with self.subTest(harness=harness), tempfile.TemporaryDirectory() as temporary:
                source = Path(temporary) / 'source'; source.mkdir()
                objects = fixture(harness)
                for run in objects['manifest.json']['runs']:
                    directory = source / run['sourceRun']; directory.mkdir()
                    paths = {'summary': 'summary_info.json'} if harness == 'AgentLab' else {
                        'trial':'result.json', 'core':'artifacts/webarena-evidence/result.json', 'reward':'verifier/reward.json'}
                    for key, relative in paths.items():
                        target = directory / relative; target.parent.mkdir(parents=True, exist_ok=True)
                        target.write_text(json.dumps({**objects[run[key]], 'config': {'secret': 'DO_NOT_EXPORT'},
                                                      'final_answer': 'LARGE_PRIVATE_MESSAGE'}))
                args = argparse.Namespace(source=str(source), harness=harness, benchmark_revision='fixture-revision',
                    step_budget='50', output=str(Path(temporary)/'scores.zip'), legacy_max_steps=None, selection=None)
                with contextlib.redirect_stdout(io.StringIO()) as output: scoring.pack(args)
                report = json.loads(output.getvalue()); data = Path(args.output).read_bytes()
                self.assertEqual(report['computedSR'], 42.3)
                self.assertEqual(report['scoringSha256'], hashlib.sha256(data).hexdigest())
                self.assertNotIn('DO_NOT_EXPORT', json.dumps(scoring.archive_objects(data)))
                self.assertNotIn('LARGE_PRIVATE_MESSAGE', json.dumps(scoring.archive_objects(data)))
                if harness == 'AgentLab':
                    duplicate = source / f'webarena-pro-bgym.{TASKS[0]}_retry'; duplicate.mkdir()
                    (duplicate/'summary_info.json').write_text('{}')
                    with self.assertRaisesRegex(ValueError, 'Multiple attempts'): scoring.pack(args)
                    selection = Path(temporary)/'selection.json'
                    selection.write_text(json.dumps({run['taskId']: run['sourceRun'] for run in objects['manifest.json']['runs']}))
                    args.selection = str(selection)
                    with contextlib.redirect_stdout(io.StringIO()): scoring.pack(args)
                    selection.write_text(json.dumps({TASKS[0]: '../escape'}))
                    with self.assertRaisesRegex(ValueError, 'inside the source'): scoring.pack(args)

    def test_verify_cli_returns_nonzero_and_failure_report_for_mismatch(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary); objects = fixture(); data = zip_objects(objects)
            (directory/'scores.zip').write_bytes(data)
            (directory/'submission.json').write_text(json.dumps(record_for(objects, data, 99)))
            result = subprocess.run([sys.executable, str(ROOT/'scripts/scoring.py'), 'verify', 'submission.json',
                                     '--archive', 'scores.zip', '--report', 'report.json'], cwd=directory, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(json.loads((directory/'report.json').read_text())['status'], 'failed')
            self.assertIn('does not match computed SR 42.3%', result.stderr)


class DownloadTests(unittest.TestCase):
    def test_private_addresses_and_unsafe_urls_fail(self):
        def answer(address): return [(socket.AF_INET, socket.SOCK_STREAM, 6, '', (address, 443))]
        for address in ('127.0.0.1', '10.0.0.1', '169.254.169.254', '::1', 'fc00::1'):
            with self.subTest(address=address), patch.object(socket, 'getaddrinfo', return_value=answer(address)):
                with self.assertRaisesRegex(ValueError, 'public IP'): scoring.public_target('https://example.org/file')
        with patch.object(socket, 'getaddrinfo', return_value=answer('8.8.8.8')):
            for url in ('http://example.org/file', 'https://example.org:8443', 'https://user:pass@example.org', 'https://example.org/#a'):
                with self.subTest(url=url), self.assertRaises(ValueError): scoring.public_target(url)
            self.assertEqual(scoring.public_target('https://example.org/file')[1], '8.8.8.8')
        with patch.object(socket, 'getaddrinfo', return_value=answer('8.8.8.8')+answer('127.0.0.1')):
            with self.assertRaises(ValueError): scoring.public_target('https://example.org/file')

    def test_download_redirect_revalidation_size_limits_and_http_errors(self):
        class Response:
            def __init__(self, status=200, body=b'zip', headers=None):
                self.status, self.stream, self.headers = status, io.BytesIO(body), headers or {}
            def getheader(self, name): return self.headers.get(name)
            def read(self, size): return self.stream.read(size)
        class Connection:
            def __init__(self, response): self.response = response; self.closed = False
            def request(self, *args, **kwargs): self.request_args = (args, kwargs)
            def getresponse(self): return self.response
            def close(self): self.closed = True
        parsed = scoring.urlsplit('https://example.org/scores.zip?download=1')
        good = Connection(Response())
        with patch.object(scoring, 'public_target', return_value=(parsed, '8.8.8.8')), patch.object(scoring, 'PinnedHTTPS', return_value=good):
            self.assertEqual(scoring.download_archive(parsed.geturl()), b'zip')
            self.assertTrue(good.closed)
            self.assertEqual(good.request_args[0][1], '/scores.zip?download=1')
        redirect = Connection(Response(302, headers={'Location':'https://127.0.0.1/private'}))
        with patch.object(scoring, 'public_target', side_effect=[(parsed, '8.8.8.8'), ValueError('private redirect')]) as target, patch.object(scoring, 'PinnedHTTPS', return_value=redirect):
            with self.assertRaisesRegex(ValueError, 'private redirect'): scoring.download_archive(parsed.geturl())
            self.assertEqual(target.call_args.args[0], 'https://127.0.0.1/private')
            self.assertTrue(redirect.closed)
        for response in (Response(403), Response(headers={'Content-Length':'26'}), Response(body=b'x'*26)):
            with patch.object(scoring, 'MAX_DOWNLOAD', 25), patch.object(scoring, 'public_target', return_value=(parsed, '8.8.8.8')), patch.object(scoring, 'PinnedHTTPS', return_value=Connection(response)):
                with self.assertRaises(ValueError): scoring.download_archive(parsed.geturl())


if __name__ == '__main__':
    unittest.main()
