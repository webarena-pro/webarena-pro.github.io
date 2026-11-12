# Scoring archive for leaderboard submissions

Use the [submission form](https://webarena-pro.github.io/submit.html) to open a
prefilled GitHub **issue**. No fork, branch, or pull request is needed. Provide:

1. A small **scoring ZIP**, publicly downloadable over HTTPS, and its SHA-256.
2. A separate link to the **full traces**, accessible to reviewers.

The issue workflow downloads only the scoring ZIP. It checks the checksum,
requires the exact 300 Test task IDs, recomputes success rate at the selected
step budget, and fails if it disagrees with the reported result. Its bot comment
links to the workflow and is updated when the issue is edited. Maintainers
review the full evidence before publishing a result.

## Create the scoring ZIP

Clone this website repository. Run the commands below from its root with
Python 3.11 or later; no packages or harness installations are needed.

For **AgentLab**, point `--source` at the directory containing your per-task run
directories with `summary_info.json` (or `summary.json`):

```bash
python3 scripts/scoring.py pack \
  --harness AgentLab \
  --source /path/to/agentlab/results \
  --benchmark-revision YOUR_BENCHMARK_COMMIT_OR_TAG \
  --step-budget 50 \
  --output scores.zip
```

For **Harbor / coding agents**, point it at the job directory containing the
trial directories:

```bash
python3 scripts/scoring.py pack \
  --harness Harbor \
  --source /path/to/harbor/job \
  --benchmark-revision YOUR_BENCHMARK_COMMIT_OR_TAG \
  --step-budget 50 \
  --output scores.zip
```

The tool prints the computed overall/domain SR, size, and `scoringSha256`.
Upload the ZIP to a stable public download location, such as a dataset pinned
to a commit. Paste the download URL, checksum, and overall SR into the form.
Use `100` or `unlimited` for another budget and prepare a separate submission.

The exporter copies only scoring fields. It does not package screenshots,
trajectories, model messages, full configuration, or final answers. Preserve
those in the separate full-traces archive. Error messages are reduced to an
error-presence flag. Review your artifacts before sharing them.

### Run selection and older outputs

AgentLab task IDs are read from native `webarena-pro-bgym.001_…` run directory
names (or `001-…`). Harbor IDs come from the native trial `task_name`, such as
`webarena-pro/test-001`.

If there are retries or nonstandard directory names, supply
`--selection selected-runs.json`. This JSON object must map **every** Test task
ID to one run directory relative to `--source`, for example:

```json
{"001": "run-directory-for-001", "002": "run-directory-for-002"}
```

That snippet is abbreviated; the real mapping must include all 300 IDs from
[test-tasks.json](test-tasks.json). The exporter fails on duplicate attempts
without explicit selection; it never automatically chooses the highest score.
Document the selection/retry policy and retain **all** attempts in the full
traces for review. Do not select successful retries to inflate SR.

Older AgentLab summaries without `max_steps` need `--legacy-max-steps 50`
(or `100` / `-1` for unlimited), matching the actual run configuration. If they
also lack cutoff scores, only their original budget is supported. They must
be completed, graded, error-free runs. Reviewers check this declared legacy
limit against the original configuration. Missing cutoff grades cannot be
reconstructed by relabeling a longer run.

## What CI computes

`SR = 100 × number of selected tasks with score exactly 1 / 300`.
Partial credit is not success. Comparison uses decimal rounding to **one
percentage-point decimal place**, matching the leaderboard (for example,
127/300 is 42.3%). Domain rates, when reported, are also recomputed using the
fixed task-to-domain mapping. The form leaves domain scores unreported.

- **AgentLab:** use the requested entry in `step_budget_scores`. Check its
  availability, numeric score, success flag, evaluation step, and original run
  limit. A valid cutoff survives a later interrupted attempt; an unavailable
  grade never falls back to `cum_reward`. Legacy summaries without cutoff
  metadata use terminal `cum_reward` only at the original run budget.
- **Harbor:** use the requested `step_budget_scores` entry in the collected
  Core result. Cross-check terminal rewards and `score_at_50`, `score_at_100`,
  or `score_at_unlimited` against the native trial result and verifier reward
  file. Require a graded Core result and no unresolved trial exception.

CI rejects missing/duplicate/unknown task IDs, missing or ungraded artifacts,
inconsistent reward files, unsupported budgets, checksum mismatches, and SR
mismatches. A graded score of zero is valid; an ungraded infrastructure error
is not silently counted as zero or dropped from the denominator.

This verifies aggregation and artifact consistency. It does **not** rerun the
benchmark, authenticate user-supplied grades, or approve retry policies.
Maintainers still review the full traces and evaluation configuration. The
fixed Test catalog records its source revision; changes to the benchmark task
set require a reviewed catalog update, not a submitter-provided denominator.

## Archive format

The exporter creates a ZIP with `manifest.json` at its root and scoring JSON
under `runs/<task-id>/`. Its manifest contains:

```json
{
  "schemaVersion": 1,
  "harness": "AgentLab",
  "benchmarkRevision": "YOUR_BENCHMARK_COMMIT_OR_TAG",
  "stepBudget": "50",
  "split": "test",
  "runs": [
    {
      "taskId": "001",
      "sourceRun": "original-run-directory",
      "runMaxSteps": 50,
      "summary": "runs/001/summary.json"
    }
  ]
}
```

Again, the example shows one run; all 300 are required. For Harbor each run
uses `trial`, `core`, and `reward` paths instead of `summary`, corresponding to:

| Native artifact | Packed artifact |
| --- | --- |
| `result.json` | `runs/<id>/trial.json` |
| `artifacts/webarena-evidence/result.json` | `runs/<id>/core.json` |
| `verifier/reward.json` | `runs/<id>/reward.json` |

`harness`, `benchmarkRevision`, and `stepBudget` must match the issue metadata.
`runMaxSteps` is the original run limit (`50`, `100`, or `-1`), not a new limit
chosen during packaging. JSON files must be uniquely referenced. No extra
JSON, binaries, symlinks, encrypted members, or unsafe member paths are allowed.
Limits: 25 MiB compressed, 100 MiB expanded, 2 MiB per JSON, 1,501 ZIP members.
Downloads require public HTTPS on port 443 without credentials or fragments;
redirects must also resolve to public addresses. Links requiring login or
returning an HTML preview cannot be used for the scoring ZIP.

## Verify locally and correct a submission

Save the issue's JSON metadata to `submission.json`, then run:

```bash
python3 scripts/scoring.py verify submission.json --archive scores.zip
# Omit --archive to test the public download, as CI does:
python3 scripts/scoring.py verify submission.json
```

A mismatch exits nonzero. To correct an issue, update both its visible result
and its JSON metadata, including the checksum if the ZIP changed. You can also
regenerate the form and copy the new issue body into the existing issue. Editing
the issue reruns CI; posting a comment does not. Keep the submission marker and
JSON block intact. Do not open a duplicate issue for a correction.

After approval, a maintainer adds the verified metadata under `submissions/`.
The Pages workflow repeats score verification before publishing. See the
[maintainer instructions](../submissions/README.md).
