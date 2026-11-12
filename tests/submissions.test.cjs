const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validateSubmission, fromForm, githubIssueUrl } = require('../submission-schema.js');
const { readSubmissions, buildSite } = require('../scripts/build-site.cjs');
const { parseIssue } = require('../scripts/read-issue.cjs');
const root = path.resolve(__dirname, '..');

const values = {
  agent: 'Example agent', agentVersion: '1.0', model: 'Example model',
  averageSR: '42.3', stepBudget: '50', website: 'https://example.org',
  code: '', paper: '', traces: 'https://example.org/traces?revision=abc&format=zip',
  harness: 'Harbor', harnessVersion: '0.1', benchmarkRevision: 'v1.0.0',
  traceConfirmation: 'on', scoringArchive: 'https://example.org/scores.zip', scoringSha256: 'a'.repeat(64),
};
const record = () => fromForm(values, 'a1b2c3d4');

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'webarena-submissions-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'submissions'));
  fs.mkdirSync(path.join(dir, 'assets'));
  fs.writeFileSync(path.join(dir, 'assets', 'example.txt'), 'asset');
  for (const name of ['index.html', 'submit.html', 'styles.css', 'script.js', 'submission.js', 'submission-schema.js']) {
    fs.copyFileSync(path.join(root, name), path.join(dir, name));
  }
  return dir;
}

function save(dir, result = record(), name = `${result.id}.json`) {
  fs.writeFileSync(path.join(dir, 'submissions', name), JSON.stringify(result));
}

test('form output supports each budget and harness without fabricating domain scores', () => {
  for (const stepBudget of ['50', '100', 'unlimited']) {
    for (const harness of ['AgentLab', 'Harbor']) {
      const result = fromForm({ ...values, stepBudget, harness }, 'a1b2c3d4');
      assert.deepEqual(validateSubmission(result), []);
      assert.deepEqual(result.domainScores, Array(6).fill(null));
      assert.equal(result.code, null);
    }
  }
});

test('GitHub issue handoff preserves all metadata, Unicode, and URL punctuation', () => {
  const result = fromForm({ ...values, agent: 'Agent & café', model: '模型 / v2' }, 'a1b2c3d4');
  assert.deepEqual(validateSubmission(result), []);
  const url = new URL(githubIssueUrl(result));
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.pathname, '/webarena-pro/webarena-pro.github.io/issues/new');
  assert.ok(url.searchParams.get('title').startsWith('[Leaderboard]'));
  assert.deepEqual(parseIssue(url.searchParams.get('body')), result);
  assert.ok(url.href.length < 8000);
});

test('issue parsing rejects malformed metadata and edits that disagree with the reported score', () => {
  const body = new URL(githubIssueUrl(record())).searchParams.get('body');
  for (const invalid of [null, '', body + '\n<!-- webarena-submission:v2 -->',
    body.replace('```json', '```text'), body.replace('"taskCount":300', '"taskCount":299'),
    body.replace('- Reported SR: 42.3%', '- Reported SR: 99%'),
    body.replace('- Step budget: 50', '- Step budget: 100'),
    body.replace('- Scoring archive: https://example.org/scores.zip', '- Scoring archive: https://example.org/other.zip')]) {
    assert.throws(() => parseIssue(invalid));
  }
  assert.deepEqual(parseIssue(body.replaceAll('\n', '\r\n')), record());
});

test('validation rejects invalid scores, partial splits, missing evidence, and unsafe links', () => {
  const cases = [
    { averageSR: -1 }, { averageSR: 101 }, { averageSR: '42' }, { averageSR: NaN },
    { averageSR: null }, { stepBudget: '30' }, { stepBudget: 50 },
    { taskCount: 299 }, { split: 'dev' }, { traceContentsConfirmed: false },
    { scoringArchive: 'http://example.org/scores.zip' }, { scoringArchive: 'https://example.org:444/scores.zip' },
    { scoringArchive: 'https://example.org/scores.zip#fragment' }, { scoringSha256: 'bad' },
    { agentVersion: '' }, { harness: 'Custom runner' }, { harness: ' ' }, { benchmarkRevision: '' },
    { traces: 'javascript:alert(1)' }, { website: 'https://user:secret@example.org' },
    { code: 'data:text/html,hello' }, { paper: 'https://example.org/\nunsafe' },
    { domainScores: [0] }, { domainScores: [null, null, null, null, null, 101] },
    { id: '../escape' }, { unexpected: true },
  ];
  for (const change of cases) assert.ok(validateSubmission({ ...record(), ...change }).length, JSON.stringify(change));
  assert.ok(validateSubmission(fromForm({ ...values, averageSR: '' }, 'a1b2c3d4')).length);
  const missing = record(); delete missing.traces;
  assert.ok(validateSubmission(missing).some(error => error.includes('Missing field: traces')));
  assert.ok(validateSubmission(null).length);
});

test('build includes accepted results at the declared budget and retains existing leaderboard data', t => {
  const dir = fixture(t);
  const result = { ...record(), stepBudget: '100', domainScores: [10, 20, null, 30, 40, 50] };
  save(dir, result);
  assert.equal(buildSite(dir), 1);
  const html = fs.readFileSync(path.join(dir, '_site/index.html'), 'utf8');
  const entries = JSON.parse(html.match(/id="accepted-submissions">(.*?)<\/script>/s)[1]);
  assert.equal(entries[0].agent, result.agent);
  assert.deepEqual(Object.keys(entries[0].results), ['100']);
  assert.equal(entries[0].results['100'].averageSR, 42.3);
  assert.deepEqual(entries[0].results['100'].domains, result.domainScores);
  assert.equal(entries[0].results['100'].traces, result.traces);
  assert.equal(fs.readFileSync(path.join(dir, '_site/script.js'), 'utf8'), fs.readFileSync(path.join(root, 'script.js'), 'utf8'));
});

test('submitted markup remains JSON data and cannot escape into the page', t => {
  const dir = fixture(t);
  const result = { ...record(), agent: '</script><img src=x onerror=alert(1)> $& $`' };
  save(dir, result);
  buildSite(dir);
  const html = fs.readFileSync(path.join(dir, '_site/index.html'), 'utf8');
  assert.ok(!html.includes('<img src=x'));
  const entries = JSON.parse(html.match(/id="accepted-submissions">(.*?)<\/script>/s)[1]);
  assert.equal(entries[0].agent, result.agent);
});

test('invalid JSON, mismatched filenames, and unsupported files fail the build', t => {
  for (const scenario of ['json', 'filename', 'directory', 'symlink', 'score']) {
    const dir = fixture(t);
    if (scenario === 'json') fs.writeFileSync(path.join(dir, 'submissions/broken.json'), '{');
    if (scenario === 'filename') save(dir, record(), 'wrong.json');
    if (scenario === 'directory') fs.mkdirSync(path.join(dir, 'submissions/nested'));
    if (scenario === 'symlink') fs.symlinkSync(path.join(dir, 'index.html'), path.join(dir, 'submissions/link.json'));
    if (scenario === 'score') save(dir, { ...record(), averageSR: 500 });
    assert.throws(() => buildSite(dir), /submissions\//);
    assert.ok(!fs.existsSync(path.join(dir, '_site')));
  }
});

test('an empty collection works; rebuilding removes withdrawn results and obsolete assets', t => {
  const dir = fixture(t);
  save(dir);
  buildSite(dir);
  fs.unlinkSync(path.join(dir, 'submissions', `${record().id}.json`));
  fs.unlinkSync(path.join(dir, 'assets/example.txt'));
  assert.deepEqual(readSubmissions(dir), []);
  assert.equal(buildSite(dir), 0);
  assert.ok(fs.readFileSync(path.join(dir, '_site/index.html'), 'utf8').includes('id="accepted-submissions">[]</script>'));
  assert.ok(!fs.existsSync(path.join(dir, '_site/assets/example.txt')));
});

test('issue workflow posts, updates only its own comment, and suppresses stale results', async () => {
  const { commentBody, reportIssue } = require('../scripts/report-score.cjs');
  const event = {issue: {number: 7, body: 'original'}};
  const report = {status: 'passed', successes: 127, tasks: 300, computedSR: 42.3, stepBudget: '50', archiveSha256: 'a'.repeat(64)};
  const own = {id: 10, user: {login:'github-actions[bot]'}, body: '<!-- webarena-scoring-check -->old'};
  const imitation = {...own, id: 9, user: {login:'someone'}};
  for (const scenario of ['new', 'update', 'stale']) {
    const writes = [];
    const api = async (route, method, payload) => {
      if (method) { writes.push({route, method, payload}); return {}; }
      if (route === '/issues/7') return {body: scenario === 'stale' ? 'edited' : 'original'};
      return scenario === 'update' ? [imitation, own] : [imitation];
    };
    await reportIssue(event, report, 'https://github.com/example/actions/runs/1', api);
    assert.equal(writes.length, scenario === 'stale' ? 0 : 1);
    if (scenario === 'new') assert.equal(writes[0].method, 'POST');
    if (scenario === 'update') assert.deepEqual([writes[0].method,writes[0].route], ['PATCH','/issues/comments/10']);
    if (writes.length) assert.match(writes[0].payload.body, /127\/300.*42\.3%/);
  }
  const failed = commentBody({status:'failed',error:'<script> @someone `bad`\n'}, 'https://example.org');
  assert.match(failed, /SR check failed/);
  assert.ok(!failed.includes('@someone') && !failed.includes('<script>'));
});
