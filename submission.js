const submissionForm = document.querySelector("[data-submission-form]");
const submissionError = document.querySelector("[data-submission-error]");
const submissionReady = document.querySelector("[data-submission-ready]");
let submissionDownloadUrl;

function clearPreparedSubmission() {
  submissionReady.hidden = true;
  submissionError.hidden = true;
  if (submissionDownloadUrl) URL.revokeObjectURL(submissionDownloadUrl);
  submissionDownloadUrl = null;
}

submissionForm.addEventListener("input", clearPreparedSubmission);
submissionForm.addEventListener("change", clearPreparedSubmission);
submissionForm.addEventListener("submit", event => {
  event.preventDefault();
  clearPreparedSubmission();
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

  const json = JSON.stringify(record, null, 2) + "\n";
  const path = SubmissionData.filename(record);
  const fullUrl = SubmissionData.githubFileUrl(record);
  // GitHub may reject oversized URLs. Keep the download and manual editor usable.
  const needsManualPaste = fullUrl.length > 7000;
  submissionReady.querySelector("[data-submission-github]").href = needsManualPaste
    ? SubmissionData.githubFileUrl(record, false) : fullUrl;
  submissionReady.querySelector("[data-submission-fallback]").hidden = !needsManualPaste;
  submissionReady.querySelector("[data-submission-json]").value = json;
  submissionReady.querySelector("[data-submission-file]").textContent = path;

  submissionDownloadUrl = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const download = submissionReady.querySelector("[data-submission-download]");
  download.href = submissionDownloadUrl;
  download.download = `${record.id}.json`;
  submissionReady.hidden = false;
  submissionReady.focus();
});

submissionForm.querySelector('button[type="submit"]').disabled = false;
