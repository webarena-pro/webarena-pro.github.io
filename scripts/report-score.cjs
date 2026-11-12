const fs = require('node:fs');
const marker = '<!-- webarena-scoring-check -->';
const clean = value => String(value).replace(/[<>`\r\n]/g, ' ').replace(/@/g, '＠').slice(0, 1800);

function commentBody(report, runUrl) {
  const text = report.status === 'passed'
    ? `**SR check passed:** ${report.successes}/${report.tasks} tasks succeeded: **${report.computedSR.toFixed(1)}%**, matching the reported result at ${report.stepBudget} steps.\n\nArchive SHA-256: \`${report.archiveSha256}\`. This checks score aggregation; maintainers still review trace authenticity and evaluation settings.`
    : `**SR check failed:** ${clean(report.error)}\n\nCorrect the scoring archive or submission metadata and edit this issue to rerun the check. Missing/ungraded tasks are not counted as scored failures.`;
  return `${marker}\n${text}\n\n[Workflow details](${runUrl})`;
}

async function reportIssue(event, report, runUrl, api) {
  // Avoid publishing a stale verdict when the author edits an issue during validation.
  const current = await api(`/issues/${event.issue.number}`);
  if (current.body !== event.issue.body) return;
  let previous;
  for (let page = 1; page <= 10; page++) {
    const comments = await api(`/issues/${event.issue.number}/comments?per_page=100&page=${page}`);
    previous = comments.find(comment => comment.user.login === 'github-actions[bot]' && comment.body.startsWith(marker));
    if (previous || comments.length < 100) break;
  }
  const payload = { body: commentBody(report, runUrl) };
  if (previous) await api(`/issues/comments/${previous.id}`, 'PATCH', payload);
  else await api(`/issues/${event.issue.number}/comments`, 'POST', payload);
}

async function api(route, method = 'GET', payload) {
  const response = await fetch(`${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}${route}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
  return response.json();
}

if (require.main === module) {
  const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const report = fs.existsSync('.score-report.json')
    ? JSON.parse(fs.readFileSync('.score-report.json', 'utf8'))
    : { status: 'failed', error: 'Validation did not finish. See the workflow run.' };
  const runUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  reportIssue(event, report, runUrl, api).catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { commentBody, reportIssue };
