const submissionForm = document.querySelector("[data-submission-form]");
const submissionError = document.querySelector("[data-submission-error]");

submissionForm.addEventListener("submit", event => {
  event.preventDefault();
  submissionError.hidden = true;
  if (!submissionForm.reportValidity()) return;
  const values = Object.fromEntries([...new FormData(submissionForm)]
    .map(([key, value]) => [key, value.trim()]));
  const record = SubmissionData.fromForm(values, crypto.randomUUID().slice(0, 8));
  const errors = SubmissionData.validateSubmission(record);
  if (errors.length) {
    submissionError.textContent = errors.join(" ");
    submissionError.hidden = false;
    return;
  }
  const url = SubmissionData.githubIssueUrl(record);
  if (url.length > 8000) {
    submissionError.textContent = "These links are too long to prepare the GitHub issue. Use shorter stable archive and resource URLs.";
    submissionError.hidden = false;
    return;
  }
  window.location.assign(url);
});

submissionForm.querySelector('button[type="submit"]').disabled = false;
