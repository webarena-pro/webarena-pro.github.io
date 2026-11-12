const fs = require('node:fs');
const { validateSubmission } = require('../submission-schema.js');

function parseIssue(body) {
  const marker = '<!-- webarena-submission:v2 -->';
  if (typeof body !== 'string' || body.split(marker).length !== 2) throw new Error('Missing or repeated submission metadata marker. Use the submission form.');
  const match = body.split(marker)[1].match(/^\s*```json\r?\n([^]*?)\r?\n```\s*$/);
  if (!match) throw new Error('Missing submission JSON. Use the submission form.');
  const record = JSON.parse(match[1]);
  const errors = validateSubmission(record);
  if (errors.length) throw new Error(errors.join(' '));
  const visible = body.split(marker)[0];
  for (const [label, value] of [['Reported SR', `${record.averageSR}%`], ['Step budget', record.stepBudget], ['Scoring archive', record.scoringArchive]]) {
    const lines = visible.split(/\r?\n/).filter(line => line.startsWith(`- ${label}:`));
    if (lines.length !== 1 || lines[0] !== `- ${label}: ${value}`) {
      throw new Error(`${label} disagrees with the submission JSON. Update both, or regenerate the issue with the submission form.`);
    }
  }
  return record;
}

if (require.main === module) {
  try {
    const event = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
    fs.writeFileSync(process.argv[3], JSON.stringify(parseIssue(event.issue.body), null, 2));
  } catch (error) {
    fs.writeFileSync('.score-report.json', JSON.stringify({ status: 'failed', error: error.message }));
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { parseIssue };
