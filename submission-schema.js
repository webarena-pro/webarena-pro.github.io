(function (root) {
  "use strict";
  const repository = "https://github.com/webarena-pro/webarena-pro.github.io";
  const fields = ["schemaVersion", "id", "agent", "agentVersion", "model", "averageSR",
    "stepBudget", "website", "code", "paper", "traces", "harness", "harnessVersion",
    "benchmarkRevision", "split", "taskCount", "traceContentsConfirmed", "domainScores", "scoringArchive", "scoringSha256"];

  function validateSubmission(record) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return ["The result must be a JSON object."];
    const errors = [];
    for (const key of Object.keys(record)) {
      if (!fields.includes(key)) errors.push(`Unknown field: ${key}.`);
    }
    for (const key of fields) {
      if (!Object.hasOwn(record, key)) errors.push(`Missing field: ${key}.`);
    }
    if (record.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
    if (typeof record.id !== "string" || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(record.id)) {
      errors.push("id must contain 1–120 lowercase letters, numbers, or hyphens.");
    }
    for (const key of ["agent", "model", "agentVersion", "harness", "harnessVersion", "benchmarkRevision"]) {
      const value = record[key];
      const limit = ["agent", "model"].includes(key) ? 150 : 100;
      if (typeof value !== "string" || !value.trim() || value !== value.trim() ||
          value.length > limit || /[\u0000-\u001f\u007f]/.test(value)) {
        errors.push(`${key} must be non-empty text of at most ${limit} characters.`);
      }
    }
    if (!Number.isFinite(record.averageSR) || record.averageSR < 0 || record.averageSR > 100) {
      errors.push("averageSR must be a number from 0 to 100.");
    }
    if (!["50", "100", "unlimited"].includes(record.stepBudget)) {
      errors.push('stepBudget must be "50", "100", or "unlimited".');
    }
    for (const key of ["website", "code", "paper", "traces", "scoringArchive"]) {
      const value = record[key];
      if (["code", "paper"].includes(key) && value === null) continue;
      try {
        if (typeof value !== "string" || value.length > 2000 || value !== value.trim() ||
            /[\s\u0000-\u001f\u007f]/.test(value)) throw new Error();
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
        if (key === "scoringArchive" && (url.protocol !== "https:" || (url.port && url.port !== "443") || url.hash)) throw new Error();
      } catch {
        errors.push(key === "scoringArchive" ? "scoringArchive must be an HTTPS URL on port 443 without credentials or a fragment." : `${key} must be an HTTP(S) URL without embedded credentials.`);
      }
    }
    if (!["AgentLab", "Harbor"].includes(record.harness)) errors.push("Automatic scoring supports AgentLab and Harbor.");
    if (typeof record.scoringSha256 !== "string" || !/^[a-f0-9]{64}$/.test(record.scoringSha256)) {
      errors.push("scoringSha256 must be the 64-character SHA-256 printed by the scoring archive tool.");
    }
    if (record.split !== "test" || record.taskCount !== 300) {
      errors.push("Leaderboard submissions must cover the complete Test split (300 tasks).");
    }
    if (record.traceContentsConfirmed !== true) {
      errors.push("Confirm that the scoring archive covers all tasks and the full traces include every attempt and run configuration.");
    }
    if (!Array.isArray(record.domainScores) || record.domainScores.length !== 6 ||
        record.domainScores.some(score => score !== null && (!Number.isFinite(score) || score < 0 || score > 100))) {
      errors.push("domainScores must contain six percentages from 0 to 100, or null for unreported scores.");
    }
    return errors;
  }

  function fromForm(values, suffix) {
    const slug = `${values.agent}-${values.model}`.normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "").slice(0, 70) || "result";
    return {
      schemaVersion: 1,
      id: `${slug}-${values.stepBudget}-${suffix}`,
      agent: values.agent,
      agentVersion: values.agentVersion,
      model: values.model,
      averageSR: values.averageSR === "" ? NaN : Number(values.averageSR),
      stepBudget: values.stepBudget,
      website: values.website,
      code: values.code || null,
      paper: values.paper || null,
      traces: values.traces,
      scoringArchive: values.scoringArchive,
      scoringSha256: values.scoringSha256,
      harness: values.harness,
      harnessVersion: values.harnessVersion,
      benchmarkRevision: values.benchmarkRevision,
      split: "test",
      taskCount: 300,
      traceContentsConfirmed: values.traceConfirmation === "on",
      domainScores: [null, null, null, null, null, null],
    };
  }

  function filename(record) { return `submissions/${record.id}.json`; }

  function githubIssueUrl(record) {
    const url = new URL(`${repository}/issues/new`);
    url.searchParams.set("title", `[Leaderboard] ${record.agent} / ${record.model} / ${record.stepBudget} steps`.slice(0, 240));
    const body = [
      "## Result",
      `- Agent: ${record.agent} (${record.agentVersion})`,
      `- Model: ${record.model}`,
      `- Reported SR: ${record.averageSR}%`,
      `- Step budget: ${record.stepBudget}`,
      `- Harness: ${record.harness} (${record.harnessVersion})`,
      `- Benchmark revision: ${record.benchmarkRevision}`,
      "", "## Evidence",
      `- Scoring archive: ${record.scoringArchive}`,
      `- Full traces: ${record.traces}`,
      "", "I confirm that the scoring archive covers all 300 Test tasks and the full traces include failures, interrupted runs, and retry details.",
      "", "CI verifies the archive checksum and recomputes SR. Maintainers review the underlying evidence before publishing.",
      "", "<!-- webarena-submission:v2 -->", "```json", JSON.stringify(record), "```",
    ].join("\n");
    url.searchParams.set("body", body);
    return url.href;
  }

  function toLeaderboardEntry(record) {
    return {
      agent: record.agent, model: record.model, website: record.website,
      paper: record.paper, code: record.code, codeLabel: "Code", submissionId: record.id,
      results: {
        [record.stepBudget]: { averageSR: record.averageSR, domains: record.domainScores, traces: record.traces },
      },
    };
  }

  const api = { validateSubmission, fromForm, filename, githubIssueUrl, toLeaderboardEntry };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SubmissionData = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
