const submissionForm = document.querySelector("[data-submission-form]");
const submissionError = document.querySelector("[data-submission-error]");
const submissionRepository = "https://github.com/webarena-pro/webarena-pro.github.io";

function buildSubmissionUrl(result) {
  const url = new URL(`${submissionRepository}/issues/new`);
  url.searchParams.set("title", `[Leaderboard] ${result.agent} / ${result.model} / ${result.stepBudget} steps`);
  url.searchParams.set("body", [
    "## Result",
    "",
    `- **Average SR (%):** ${result.averageSR}`,
    `- **Step budget:** ${result.stepBudget}`,
    `- **Model:** ${result.model}`,
    `- **Agent name:** ${result.agent}`,
    `- **Agent / company URL:** ${result.website}`,
    `- **Code URL (optional):** ${result.code || "Not provided"}`,
    `- **Paper URL (optional):** ${result.paper || "Not provided"}`,
    "",
    "## Evaluation traces",
    "",
    `**Traces URL:** ${result.traces}`,
    "",
    "- [x] The linked files include the AgentLab harness `summary.json` files.",
    "- [x] The linked files include full execution traces for every evaluated task, including unsuccessful runs.",
    "",
    "The summaries and full traces are supplied to compute and verify success rate.",
    "The trace-viewer format specification will be published separately.",
  ].join("\n"));
  return url;
}

submissionForm.addEventListener("submit", event => {
  event.preventDefault();
  submissionError.hidden = true;
  const data = new FormData(submissionForm);
  const result = Object.fromEntries([...data].map(([key, value]) => [key, value.trim()]));
  if (!submissionForm.reportValidity()) return;
  if (!result.agent || !result.model || !["50", "100", "unlimited"].includes(result.stepBudget) ||
      result.averageSR === "" || !Number.isFinite(Number(result.averageSR)) ||
      Number(result.averageSR) < 0 || Number(result.averageSR) > 100 || !result.traceConfirmation) {
    submissionError.textContent = "Complete the required fields and confirm that both summaries and full traces are included.";
    submissionError.hidden = false;
    return;
  }

  const url = buildSubmissionUrl(result);
  // GitHub handles the final submission. This site only opens a prefilled draft.
  // Keep oversized URLs out of navigation, where they can fail with HTTP 414.
  if (url.href.length > 8000) {
    submissionError.textContent = "These links are too long to prepare a GitHub issue. Use shorter share links for your resources and traces.";
    submissionError.hidden = false;
    return;
  }
  window.location.assign(url.href);
});

submissionForm.querySelector('button[type="submit"]').disabled = false;
