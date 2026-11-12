## Changes

Describe the change. New leaderboard contributors should use the [submission form](https://webarena-pro.github.io/submit.html) to open an issue.

## Accepting a reviewed result (maintainers)

If this PR adds or updates `submissions/*.json`, link the submission issue:

- [ ] The latest issue scoring check passed for the exact archive checksum in this record.
- [ ] Full traces and evaluation settings have been reviewed, including failures, interrupted runs, and selected retries.
- [ ] The result covers all 300 Test tasks at the declared budget and identifies agent, model, harness, and benchmark versions.
- [ ] The archives remain accessible and contain no credentials or access tokens.

CI recomputes SR from the scoring ZIP and rejects a mismatch. Merging publishes the accepted result; aggregation checks do not replace evidence review.
