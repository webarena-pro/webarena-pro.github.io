# Submit a leaderboard result

Use the [submission form](https://webarena-pro.github.io/submit.html) to prepare a
JSON result file. Continue to GitHub, review the prefilled file, commit it on a
new branch (or your fork), and open a pull request against `main`. A GitHub
account is required. If the link cannot prefill the file, download the JSON or
copy it from the form, then add it under `submissions/` in your fork.

Reviewers check the linked artifacts and score before merging. The Pages build
validates every submission and includes merged records in the leaderboard.
No separate edit to `script.js` is needed. CI validates the declared fields;
it does not download traces, recompute success rates, or approve results.

## Manual submission

Add one JSON file directly inside `submissions/`, named `<id>.json`. Use a unique
lowercase ID containing letters, numbers, and hyphens (at most 120 characters).
The form generates one automatically. To correct an existing submission, edit
its existing file in a PR rather than creating a duplicate.

Example (replace all example values with your actual run):

```json
{
  "schemaVersion": 1,
  "id": "my-agent-my-model-50-unique-id",
  "agent": "My agent",
  "agentVersion": "1.0.0",
  "model": "Exact model name and version",
  "averageSR": 40.0,
  "stepBudget": "50",
  "website": "https://example.org",
  "code": null,
  "paper": null,
  "traces": "https://example.org/traces",
  "harness": "Harbor",
  "harnessVersion": "Exact release or commit",
  "benchmarkRevision": "WebArena-Pro release tag or commit",
  "split": "test",
  "taskCount": 300,
  "traceContentsConfirmed": true,
  "domainScores": [null, null, null, null, null, null]
}
```

All fields shown are required. `code` and `paper` may be `null`. URLs must use
HTTP(S), contain no embedded credentials, and be at most 2,000 characters.
`agent` and `model` are limited to 150 characters; the other version/harness
fields are limited to 100. Files must be regular JSON files of at most 64 KiB.
Unknown fields are rejected to catch typos.

`averageSR` is a percentage from 0 to 100: the proportion of the 300 Test tasks
with full success (final reward exactly 1) at the declared step budget. It is
not the mean partial-credit reward. `stepBudget` is the string `"50"`, `"100"`,
or `"unlimited"`. Document your evaluation mode/settings, retries, and selected
attempts in the archive. Ungraded infrastructure failures must be identified
and resolved with reviewers; do not silently exclude them or treat them as
ordinary scored failures.

`domainScores` contains six percentages in this order: Productivity,
Communication, Analytics, Business operations, Design & media, Travel.
Unreported values must be `null`, which the site displays as “—”. The form
leaves them unreported; you can add verified domain scores to the JSON before
opening the PR. Do not infer them from the overall score.

## Trace artifacts

Provide a stable, downloadable archive or dataset accessible to reviewers.
Preserve the task IDs, all evaluated attempts (including failures and
interrupted runs), and run configuration: agent/model versions, harness,
benchmark revision, task split, budgets, evaluation settings, and retry policy.
Include recorded screenshots and referenced media. Identify missing artifacts.
Keep credentials, API keys, and access tokens out of committed files and shared
logs. Arrange reviewer access separately when the artifacts are private.

- **AgentLab:** per-task summaries (`summary_info.json` or `summary.json`),
  original step logs, and recorded screenshots/media.
- **Harbor / coding agents:** each trial's `result.json`, `agent/` logs
  (including `trajectory.json` where available), `verifier/reward.json` for
  graded trials, `artifacts/manifest.json`, and the collected WebArena-Pro
  evidence in `artifacts/webarena-evidence/`. Include service/error diagnostics
  for interrupted or ungraded trials and explain absent result artifacts.
- **Other harnesses:** equivalent per-task results, agent/tool interactions,
  observations, and evaluation evidence, with their format documented.

Harbor's WebArena-Pro adapter can capture per-action screenshots when exported
with `--record-screenshots`; older runs cannot reconstruct uncaptured images.
A viewer link may supplement the original artifacts but does not replace them.

## Check locally

From the repository root, with Node.js 22 or later:

```bash
node --test tests/*.test.cjs
node scripts/build-site.cjs
python3 -m http.server 4173 --bind 127.0.0.1 --directory _site
```

The same validation and build run on pull requests. A merge to `main` deploys
through GitHub Pages. Existing published baseline results remain in `script.js`;
new JSON submissions are added to those results during the build.
