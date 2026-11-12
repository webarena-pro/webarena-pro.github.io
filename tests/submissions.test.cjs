const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validateSubmission, fromForm, githubFileUrl } = require('../submission-schema.js');
const { readSubmissions, buildSite } = require('../scripts/build-site.cjs');
const root = path.resolve(__dirname, '..');

const values = {
  agent: 'Example agent', agentVersion: '1.0', model: 'Example model',
  averageSR: '42.3', stepBudget: '50', website: 'https://example.org',
  code: '', paper: '', traces: 'https://example.org/traces?revision=abc&format=zip',
  harness: 'Harbor', harnessVersion: '0.1', benchmarkRevision: 'v1.0.0',
  traceConfirmation: 'on',
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
    for (const harness of ['AgentLab', 'Harbor', 'Custom runner']) {
      const result = fromForm({ ...values, stepBudget, harness }, 'a1b2c3d4');
      assert.deepEqual(validateSubmission(result), []);
      assert.deepEqual(result.domainScores, Array(6).fill(null));
      assert.equal(result.code, null);
    }
  }
});

test('GitHub handoff preserves the file and content, including Unicode and URL punctuation', () => {
  const result = fromForm({ ...values, agent: 'Agent & café', model: '模型 / v2' }, 'a1b2c3d4');
  assert.deepEqual(validateSubmission(result), []);
  const url = new URL(githubFileUrl(result));
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.pathname, '/webarena-pro/webarena-pro.github.io/new/main');
  assert.equal(url.searchParams.get('filename'), `submissions/${result.id}.json`);
  assert.deepEqual(JSON.parse(url.searchParams.get('value')), result);
  assert.equal(new URL(githubFileUrl(result, false)).searchParams.has('value'), false);
});

test('validation rejects invalid scores, partial splits, missing evidence, and unsafe links', () => {
  const cases = [
    { averageSR: -1 }, { averageSR: 101 }, { averageSR: '42' }, { averageSR: NaN },
    { averageSR: null }, { stepBudget: '30' }, { stepBudget: 50 },
    { taskCount: 299 }, { split: 'dev' }, { traceContentsConfirmed: false },
    { agentVersion: '' }, { harness: ' ' }, { benchmarkRevision: '' },
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
