# WebArena Pro project website

The WebArena Pro project website is a dependency-free static site.
Its GitHub Pages address is https://webarena-pro.github.io/.

The task explorer uses screenshots captured directly from the seeded local
benchmark environments. The publication site has no runtime dependency on
those containers; the optimized captures live in `assets/screenshots/`.

## Task examples

The task explorer contains examples from 19 of the 20 benchmark websites,
ordered alphabetically by application name. Every example includes a prompt,
task tags, and an expandable screenshot. The original ten prompts are retained.

The nine added prompts are copied from the benchmark's task configs at
[`f41f8e1`](https://github.com/webarena-pro/webarena-pro/tree/f41f8e10f22322bc7796a9b2317bf3f4397e7a66/webarena-pro-core/src/webarena_pro_core/config).
Their source task IDs are listed below for future updates:

| Website | Config | Task ID |
| --- | --- | --- |
| ERPNext | `erp-next.raw.json` | 038 |
| Metabase | `metabase.raw.json` | 125 |
| Minerva Lite | `minerva-lite.raw.json` | 134 |
| MyDrive | `mydrive.raw.json` | 145 |
| Penpot | `penpot.raw.json` | 202 |
| Peppermint | `peppermint.raw.json` | 216 |
| Thunderbird | `thunderbird.raw.json` | 234 |
| TravelMap | `travelmap.raw.json` | 248 |
| X Lite | `x-lite.raw.json` | 256 |

The existing Metabase capture is reused. Eight additional screenshots are
1280 × 720 captures from saved benchmark runs, converted to JPEG without
changing their contents. They illustrate the application, not a completed task:

- Gemini 3.1 Pro runs on October 15, 2026: ERPNext task 038 (step 1), Minerva
  Lite 132, MyDrive 145, Penpot 202, Peppermint 214,
  Thunderbird 234, and TravelMap 248 (all other captures at step 0).
- Qwen3.8 27B run on November 1, 2026: X Lite task 256 (step 1, Messages view).

Edit the `tasks` array in `script.js` to update examples. Set `screenshotSize`
when a capture differs from the original 1440 × 900 size so the browser reserves
the correct aspect ratio while the image loads.

## Preview locally

```bash
node scripts/build-site.cjs
python3 -m http.server 4173 --bind 127.0.0.1 --directory _site
```

Use Node.js 22 or later, then open <http://127.0.0.1:4173>. Rebuild after editing
submission files so the preview includes them.

## Resource links

The header uses borderless logo-and-label links for arXiv, GitHub, Hugging Face,
the leaderboard, and BibTeX. Hugging Face opens
`https://huggingface.co/WebArena-Pro`, and the leaderboard and
BibTeX links jump to their page sections. GitHub opens
`https://github.com/McGill-NLP/webarena-pro`. arXiv remains disabled until its
resource URL is available.

Icons are stored locally in `assets/icons/`, including the arXiv mark from
[Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/icons/arxiv.svg)
(CC0), GitHub's mark from
[Octicons](https://github.com/primer/octicons/blob/main/icons/mark-github-24.svg)
(MIT), and the Hugging Face logo from its
[brand assets](https://huggingface.co/brand). The review, trophy, and citation
symbols are custom SVGs.

## Leaderboard

The leaderboard appears directly below Latest news and defaults to the Overall
tab at 50 steps. The 50, 100, and Unlimited step buttons apply to both the Overall
and By domain tabs. Hover, focus, or click either view's Overall SR header to
show the success criterion; press Escape or click elsewhere to dismiss it. Published leaderboard results
currently cover 50 steps; 100 and unlimited steps display empty states.

Both views identify the agent separately from the model. The 50-step table
contains 13 reported configurations: nine GenericAgent configurations, OpenCode
with Kimi 3.1 Pro and Gemini 3.1 Pro, Codex with GPT 6.1 Sol, and Claude Code
with Claude Opus 5.5. The November 11, 2026 results are led by Claude Code at
62.3%, followed by Codex at 61.7% and OpenCode / Kimi 3.1 Pro at 60.3%.
Unreported scores use `null`, display as “—”, and receive no rank or medal.
Tied scores share a competition rank.
The omni configuration uses `watch()` and `listen()`. Domain task counts are
53, 44, 16, 63, 98, and 26 (300 overall); success requires a final reward of 1.

Historical 30-step data and success-rate figure assets are retained in the
repository, but the figures are not displayed on the homepage. Known release dates and
primary-source URLs remain stored with existing entries. New entries do not infer
missing release dates; the optional timeline generator skips entries without a
release date or a reported score. The existing figure assets are historical
snapshots, not the current leaderboard. To regenerate the
SVG and PNG exports in `assets/figures/` from the same `leaderboardEntries` data
(requires Node.js and Python with `matplotlib`):

```bash
python3 -m pip install -r scripts/requirements.txt
python3 scripts/generate_sr_figures.py
```

Plotting dependencies are only needed when regenerating the figures.

New results are reviewed as JSON files in `submissions/` and included by the
build after merge. Existing baseline entries remain in `leaderboardEntries` in
`script.js`. Each entry has an agent,
model, paper URL, code URL, and results keyed by step budget. Domain scores
follow `leaderboardDomains`; `averageSR` is the reported overall success rate,
not an unweighted average of the domain scores. Both views rank entries by
that score and mark the top three ranks with gold, silver, and bronze medal
emojis beside the agent names. Table text uses regular weight throughout.

The baseline uses GenericAgent. Existing baseline Code links point to the
WebArena-Pro benchmark repository defined by `benchmarkRepository`, with a
GitHub label. Existing baseline Paper entries use `benchmarkPaper`, which is
currently `null`; Paper cells stay blank until the WebArena-Pro arXiv URL is
added there. Set each budget's `traces` field to its trace URL when available.
Other missing URLs appear as placeholders, not links. Submitted entries use
their supplied agent website, code, paper, and traces URLs; missing domain
scores display as “—”.

## Result submissions

The leaderboard's **Submit results** link opens `submit.html`. The form opens a
prefilled GitHub **issue** with agent/model information, versions, benchmark
revision, the reported SR and budget, a small scoring ZIP URL and SHA-256, and a
separate full-traces URL. Code and paper URLs are optional. Contributors do not
need to fork the repository or open a pull request.

`.github/workflows/validate-submission.yml` runs when a submission issue is
opened, edited, or reopened. It parses the shared submission schema, downloads
the checksum-pinned JSON-only ZIP, and uses `scripts/scoring.py` to recompute SR
for AgentLab or Harbor. The workflow fails on score disagreement at one decimal
place, incomplete Test coverage, invalid/ungraded artifacts, or an unsupported
budget. A bot comment reports the result on the issue. CI downloads no full
traces and executes no submitted code.

Maintainers review the full traces, settings, and retry policy before accepting
a result. This check verifies score aggregation, not trace authenticity or a
new benchmark execution. After approval, maintainers save the issue's JSON
under `submissions/`. The Pages workflow rechecks its score, then
`scripts/build-site.cjs` embeds it in `_site/index.html` for publication.
Existing historical baselines in `script.js` are unchanged by this workflow.

See [scoring/README.md](scoring/README.md) for archive creation and scoring rules,
and [submissions/README.md](submissions/README.md) for maintainer instructions.

## Deploy with GitHub Pages

The workflow in `.github/workflows/pages.yml` validates pull requests targeting
`main` and deploys pushes to `main`. It can also be started manually from the
Actions tab; only runs on `main` can deploy. It validates JavaScript and submission records, runs the JavaScript/Python submission tests, verifies accepted scoring archives,
builds the static site with Node.js, and deploys `_site/` to the `github-pages`
environment. No package installation or third-party build dependencies are needed.

In repository **Settings → Pages**, set **Source** to **GitHub Actions**.
GitHub Pages requires a public repository on the free organization plan;
private repositories require a plan that supports private-repository Pages.
After enabling Pages, rerun the deployment workflow if its initial run failed.

Update the files in this repository and push to `main` to publish future changes.
The published results use judge evaluation; DAG evaluation is coming soon.
