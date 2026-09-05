# WebArena Pro project website

The WebArena Pro project website is a dependency-free static site.
Its GitHub Pages address is https://webarena-pro.github.io/ once Pages is enabled
and the first deployment succeeds.

The task explorer uses screenshots captured directly from the seeded local
benchmark environments. The publication site has no runtime dependency on
those containers; the optimized captures live in `assets/screenshots/`.

## Preview locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4173>.

## Deploy with GitHub Pages

The workflow in `.github/workflows/pages.yml` runs on pushes to `main` and can
also be started manually from the Actions tab. It validates the JavaScript,
packages `index.html`, `styles.css`, `script.js`, and `assets/`, and deploys the
artifact to the `github-pages` environment. No package installation or static
site generator is needed.

In repository **Settings → Pages**, set **Source** to **GitHub Actions**.
GitHub Pages requires a public repository on the free organization plan;
private repositories require a plan that supports private-repository Pages.
After enabling Pages, rerun the deployment workflow if its initial run failed.

Update the files in this repository and push to `main` to publish future changes.
The published results use judge evaluation; DAG evaluation is coming soon.
