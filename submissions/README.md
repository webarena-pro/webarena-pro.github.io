# Accepted leaderboard results

Contributors use the [submission form](https://webarena-pro.github.io/submit.html)
to open a **GitHub issue**. See [scoring archive instructions](../scoring/README.md)
for the small scoring ZIP and separate full-traces archive. No contributor PR
is required.

## Maintainer acceptance

1. Check the issue's latest **SR check passed** comment and linked workflow.
2. Review the full traces, task/run identities, evaluation settings, declared
   versions, and retry selection. CI checks arithmetic and consistency; it does
   not authenticate artifacts or rerun the benchmark.
3. Copy the approved JSON metadata from the issue into `submissions/<id>.json`.
   Use the existing file when correcting an accepted result. Link the source
   issue in the commit or maintainer PR.
4. Run validation and merge to `main`. The Pages workflow downloads the pinned
   scoring ZIP again and fails if any accepted result no longer verifies.
   The build automatically includes accepted JSON in the leaderboard; no edit
   to `script.js` is needed.

Keep the stable scoring ZIP available after acceptance. Only metadata is
committed here; large traces and scoring artifacts are hosted separately.

## JSON contract

Example (replace all values, including the placeholder checksum):

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
  "scoringArchive": "https://example.org/scores.zip",
  "scoringSha256": "REPLACE_WITH_THE_64_CHARACTER_LOWERCASE_SHA256",
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

All fields are required. `code` and `paper` may be `null`. Harness is `AgentLab`
or `Harbor`. URLs use HTTP(S), contain no credentials, and are at most 2,000
characters; `scoringArchive` additionally requires public HTTPS on port 443
without a fragment. The archive bytes must match `scoringSha256`.

IDs use lowercase letters, numbers, and hyphens (maximum 120 characters), and
must match the filename. Agent/model fields are limited to 150 characters;
other version/harness fields to 100. Unknown fields are rejected. Records must
be regular JSON files of at most 64 KiB, directly inside `submissions/`.

`averageSR` is 100 times the number of fully successful tasks divided by 300,
not mean partial credit. `stepBudget` is the string `"50"`, `"100"`, or
`"unlimited"`. CI compares overall and reported domain scores at one decimal
place. Missing/ungraded tasks fail validation; they are not scored failures.

`domainScores` follows Productivity, Communication, Analytics, Business
operations, Design & media, Travel. Unreported values are `null` (shown as “—”).
The form leaves these unreported. Maintainers can populate them from the
validator's computed domain results; reported values must pass verification.

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

Harbor's WebArena-Pro adapter can capture per-action screenshots when exported
with `--record-screenshots`; older runs cannot reconstruct uncaptured images.
A viewer link may supplement the original artifacts but does not replace them.

## Check locally

Use Node.js 22+ and Python 3.11+ from the repository root:

```bash
node --test tests/*.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
python3 scripts/scoring.py verify-directory submissions
node scripts/build-site.cjs
python3 -m http.server 4173 --bind 127.0.0.1 --directory _site
```

The same checks run on maintainer PRs and pushes to `main`; only `main` deploys.
Historical baseline results remain in `script.js` and are not retroactively
verified by the new submission workflow.
