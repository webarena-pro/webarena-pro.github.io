# WebArena Pro project website

The WebArena Pro project website is a dependency-free static site.
Its GitHub Pages address is https://webarena-pro.github.io/.

The task explorer uses screenshots captured directly from the seeded local
benchmark environments. The publication site has no runtime dependency on
those containers; the optimized captures live in `assets/screenshots/`.

## Overview

The overview contains a single sentence introducing the benchmark's 300 tasks
across 20 self-hosted applications. The existing `#abstract` anchor remains available.

## Task examples

The task explorer shows all 20 benchmark websites in an alphabetical logo grid:
five columns and four rows on desktop, four columns on tablets, and two on phones.
Each logo opens an accessible dialog with an example task, its screenshot,
and a direct link to that website’s shared read-only demo. The examples emphasize longer,
more involved workflows: conditional decisions, work across multiple apps,
precise design constraints, and multi-step state changes. Every example includes
the complete original task intent, task tags, and a link to the full environment screenshot.
The dialog closes with its Close button, Escape, or a click on the backdrop.
Website logos are bundled in `assets/websites/`, copied from the shared demo catalog
at `webarena-pro/webarena-pro` commit `bb47401e`.

The prompts are copied verbatim from the benchmark's task configs at
[`8c77164`](https://github.com/McGill-NLP/webarena-pro/tree/8c771645431d656917152a477be5003a86bb47ec/webarena-pro-core/src/webarena_pro_core/config).
Their source task IDs are stored as `taskId` in `script.js` and listed below:

| Website | Config | Task ID |
| --- | --- | --- |
| Acidwave | `acidwave.raw.json` | 403 |
| ERPNext | `erp-next.raw.json` | 322 |
| Firefly III | `firefly.raw.json` | 062 |
| Flight Search | `flight-search.raw.json` | 340 |
| Immich | `immich.raw.json` | 087 |
| Job Portal | `jobportal.raw.json` | 096 |
| Mattermost | `mattermost.raw.json` | 118 |
| Metabase | `metabase.raw.json` | 325 |
| Minerva Lite | `minerva-lite.raw.json` | 137 |
| MyDrive | `mydrive.raw.json` | 147 |
| Nextcloud | `nextcloud.raw.json` | 170 |
| Notion | `notion.raw.json` | 189 |
| Password Manager | `password-manager.raw.json` | 194 |
| Penpot | `penpot.raw.json` | 204 |
| Peppermint | `peppermint.raw.json` | 420 |
| PipeCRM | `pipedrive.raw.json` | 230 |
| Thunderbird | `thunderbird.raw.json` | 243 |
| TravelMap | `travelmap.raw.json` | 252 |
| X Lite | `x-lite.raw.json` | 263 |
| YouTube Lite | `yt-lite.raw.json` | 293 |

Password Manager task 194 comes from the same config in commit `bb47401e`.
Its 1280 × 720 screenshot shows the shared demo’s Payment Cards list, captured
on November 16, 2026; it contains only seeded benchmark data.

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

## Color themes

Both pages follow the device color scheme on first visit. The header's theme
button switches between light and dark mode and saves the choice in local storage
under `webarena-pro-theme`, shared by the homepage and submission form. Device
changes are followed until a visitor chooses a theme. If storage is blocked,
the switch still works for the current page.

`theme.js` applies the preference before the stylesheet loads to avoid a light
flash. Theme colors live in `styles.css`; `assets/logo-light.png` and
`assets/logo-dark.png` are the supplied logos, displayed according to the theme.
Task screenshots keep their original colors.

## Resource links

Author names link to verified personal websites or LinkedIn profiles in a new
tab. Junyi Song and Yunjia Tian remain plain text until their preferred personal
or LinkedIn URLs can be confirmed.

The header uses borderless logo-and-label links for arXiv, GitHub, Hugging Face,
the leaderboard, and Citation. Hugging Face opens
`https://huggingface.co/WebArena-Pro`, and the leaderboard and
Citation links jump to their page sections. GitHub opens
`https://github.com/McGill-NLP/webarena-pro`. arXiv opens
`https://arxiv.org/abs/2611.17955`. The citation section includes the complete
paper BibTeX entry and a Copy button.

Icons are stored locally in `assets/icons/`, including the arXiv mark from
[Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/icons/arxiv.svg)
(CC0), GitHub's mark from
[Octicons](https://github.com/primer/octicons/blob/main/icons/mark-github-24.svg)
(MIT), and the Hugging Face logo from its
[brand assets](https://huggingface.co/brand). The review, trophy, and citation
symbols are custom SVGs.

## Demo website links

The header’s Websites resource opens the task grid; there is no separate Websites
section. Each task dialog links directly to its application at
`https://<site>.websites.webarenapro.win/`, which signs visitors in automatically.
Everyone uses the same set of 20 application containers. Browsing and search are available, while content changes are blocked
by the demo gateway. Benchmark prompts retain their original instructions, so
examples can describe edits that cannot be saved in the public read-only demo.

## Leaderboard

The leaderboard appears after the overview and task examples and defaults to the Overall
tab at 50 steps. The 50, 100, and Unlimited step buttons apply to both the Overall
and By domain tabs. Hover, focus, or click either view's Overall SR header to
show the success criterion. Press Escape or click elsewhere to dismiss it.
The 50-step view includes paper baselines, four additional coding-agent runs,
and three GenericAgent checkpoints. The 100-step view shows the final results
from those three GenericAgent runs.

Both views show **Submitted by** and **Config**. The WebArena-Pro team ran the
paper baselines and the four coding-agent evaluations below. Google DeepMind
self-reported the three Gemini 4 GenericAgent runs. Config shows the recorded
reasoning effort and identifies checkpoints from longer runs. The paper
describes high reasoning effort in [Section 4.1](https://arxiv.org/html/2611.17955v1).
Accepted submissions can supply their own attribution and configuration.

The paper's 50-step overall and domain scores follow Tables 5 and 9 of
[arXiv:2611.17955v1](https://arxiv.org/pdf/2611.17955v1). The Kimi 3.1 Pro
score of 60.7% follows Table 5 and the abstract.
Unreported scores use `null`, display as “—”, and receive no rank or medal.
Tied scores share a competition rank.
The omni configuration uses `watch()` and `listen()`. Domain task counts are
53, 44, 16, 63, 98, and 26 (300 overall); success requires a final reward of 1.

### Codex and Gemini CLI results

Each run used high reasoning effort and a 50-step budget on all 300 Test tasks.
The per-model Hugging Face trace datasets require repository access. The domain
rates use the selected task outcomes and the [scoring catalog](scoring/test-tasks.json).

| Agent | Model | Strict passes | Success rate | Trace dataset |
| --- | --- | ---: | ---: | --- |
| Codex | GPT-6.2 Astra | 192 / 300 | 64.0% | [Astra](https://huggingface.co/datasets/WebArena-Pro/traces_codex_gpt-6.2_astra_high) |
| Codex | GPT-6.2 Sol | 183 / 300 | 61.0% | [Sol](https://huggingface.co/datasets/WebArena-Pro/traces_codex_gpt-6.2_sol_high) |
| Gemini CLI | Gemini 4 Neon | 185 / 300 | 61.7% | [Neon](https://huggingface.co/datasets/WebArena-Pro/traces_gemini_cli_gemini-4-neon_high) |
| Gemini CLI | Gemini 4 Carbon | 160 / 300 | 53.3% | [Carbon](https://huggingface.co/datasets/WebArena-Pro/traces_gemini_cli_gemini-4-carbon_high) |

### Google DeepMind GenericAgent results

Eric at Google DeepMind shared these self-reported results on November 12, 2026.
The 50-step scores are midpoint checkpoints from the same 100-step runs.
Google DeepMind supplied overall strict pass counts at both budgets.

| Model | 50-step checkpoint | 100 steps | Benchmark release | Full traces |
| --- | --- | --- | --- | --- |
| Gemini 4 Carbon (`gemini-4-carbon`) | 137 / 300 (45.7%) | 170 / 300 (56.7%) | v0.6.2 (`f21693c6`) | [Carbon](https://drive.google.com/file/d/1V9iOWjsfshCzywmQegO8PGjVbYgGJkYF/view?usp=drivesdk&resourcekey=0-HHPWwBz_6v_pKVCDRExzAg) |
| Gemini 4 Argon (`gemini-4-argon`) | 147 / 300 (49.0%) | 165 / 300 (55.0%) | v0.6.0 (`c8ec3a77`) | [Argon](https://drive.google.com/file/d/1o-65zPCLQ8cMyEx72qAfrcVJGg_3yCEY/view?usp=drivesdk&resourcekey=0-TcLkJFx2WFSyGTJXhWdzDQ) |
| Gemini 4 Hydrogen (`gemini-4-hydrogen`) | 120 / 300 (40.0%) | 141 / 300 (47.0%) | v0.6.2 (`f21693c6`) | [Hydrogen](https://drive.google.com/file/d/1TNB9kl-BByL9EdaqIFDOF6Ig3THTAEbc/view?usp=drivesdk&resourcekey=0-NXZYcxOLNm4SKa11IR9Eqw) |

The reported setup uses BrowserGym GenericAgent with temperature 1.0, high
reasoning effort, viewport screenshots and accessibility trees, native
audio/video `listen()`, and Whisper (`whisper-1`) transcription. The Tier-2
rubric judge is `gemini-3.1-pro-preview`. The reported terminal-provenance rule
scores non-terminal early stops as zero at completion while preserving valid
midpoint checkpoints. Overall SR uses strict full-rubric completion, not mean
rubric reward.

Each row links to the original model-specific trace archive from Google DeepMind.
The website displays the overall scores as reported. Domain breakdowns were
not supplied.

### Historical figures

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

### Result data and resource links

Form-submitted results are reviewed as JSON files in `submissions/` and included
by the build after merge. Existing baseline entries remain in `leaderboardEntries` in
`script.js`. Each entry has an agent,
model, submitter name, paper URL, code URL, and results keyed by step budget. Domain scores
follow `leaderboardDomains`; `averageSR` is the reported overall success rate,
not an unweighted average of the domain scores. Both views rank entries by
that score and mark the top three ranks with gold, silver, and bronze medal
emojis beside the agent names. Table text uses regular weight throughout.

The baseline uses GenericAgent. Existing baseline Code links point to the
WebArena-Pro benchmark repository defined by `benchmarkRepository`, with a
GitHub label. Existing baseline Paper entries use `benchmarkPaper`, which
links to the WebArena-Pro paper at `https://arxiv.org/abs/2611.17955`.
For the paper baselines, the 50-step Traces links open the public
[GenericAgent dataset](https://huggingface.co/datasets/WebArena-Pro/neurips_2026_traces_generic_agent)
for its seven published model cohorts, or the
[coding-agent dataset](https://huggingface.co/datasets/WebArena-Pro/neurips_2026_traces_coding_agents)
for OpenCode, Codex, and Claude Code. The GenericAgent dataset does not contain
the standard Gemini 3.1 Pro or Qwen 3.6 27B cohorts; their trace links remain
unavailable. Historical 30-step trace links are also unavailable.
Set each budget's `traces` field to its trace URL when available.
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
