// Domain scores follow the order in leaderboardDomains. Average SR is the
// reported overall score, not an unweighted mean of the domain percentages.
const leaderboardDomains = [
  "Productivity", "Communication", "Analytics", "Business operations", "Design & media", "Travel",
];
const benchmarkRepository = "https://github.com/McGill-NLP/webarena-pro";
const benchmarkPaper = null; // Add the WebArena-Pro arXiv URL when available.
const baselineResources = {
  agent: "GenericAgent",
  paper: benchmarkPaper,
  codeLabel: "GitHub",
  code: benchmarkRepository,
};
const leaderboardEntries = [
  {
    ...baselineResources,
    model: "Gemini 3.1 Pro",
    family: "Gemini",
    releaseDate: "2026-02-19",
    releaseSource: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/",
    results: {
      30: { averageSR: 29.3, domains: [30.4, 26.7, 37.5, 22.0, 32.0, 33.3], traces: null },
      50: { averageSR: 29.3, domains: [28.3, 27.3, 43.8, 20.6, 33.7, 30.8], traces: null }
    },
  },
  {
    ...baselineResources,
    model: "Gemini 3.1 Flash Lite",
    family: "Gemini",
    releaseDate: "2026-03-03",
    releaseSource: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/",
    results: {
      30: { averageSR: 21.4, domains: [14.3, 13.3, 37.5, 19.0, 27.8, 22.2], traces: null },
      50: { averageSR: 23.7, domains: [15.1, 27.3, 25.0, 20.6, 25.5, 34.6], traces: null }
    },
  },
  {
    ...baselineResources,
    model: "GPT-5.5",
    family: "GPT",
    releaseDate: "2026-04-23",
    releaseSource: "https://openai.com/index/introducing-gpt-5-5/",
    results: {
      30: { averageSR: 33.3, domains: [32.1, 28.9, 43.8, 39.0, 34.0, 22.2], traces: null },
    },
  },
  {
    ...baselineResources,
    model: "Claude Opus 4.7",
    family: "Claude",
    releaseDate: "2026-04-16",
    releaseSource: "https://www.anthropic.com/news/claude-opus-4-7",
    results: {
      30: { averageSR: 22.0, domains: [16.1, 20.0, 25.0, 15.3, 29.9, 22.2], traces: null },
      50: { averageSR: 25.3, domains: [20.8, 36.4, 31.3, 17.5, 24.5, 34.6], traces: null }
    },
  },
  {
    ...baselineResources,
    model: "Qwen 3.6 27B",
    family: "Qwen",
    releaseDate: "2026-04-21",
    releaseSource: "https://qwen.ai/blog?id=qwen3.6-27b",
    results: {
      30: { averageSR: 13.7, domains: [8.9, 15.6, 12.5, 8.5, 17.5, 18.5], traces: null },
      50: { averageSR: 13.0, domains: [5.7, 22.7, 12.5, 7.9, 15.3, 15.4], traces: null }
    },
  },
  {
    ...baselineResources,
    model: "Qwen 3.5 9B",
    family: "Qwen",
    releaseDate: "2026-03-02",
    releaseSource: "https://github.com/QwenLM/Qwen3.8/blob/main/README.md",
    results: {
      30: { averageSR: 6.0, domains: [3.6, 0.0, 6.2, 5.1, 11.3, 3.7], traces: null },
      50: { averageSR: 5.0, domains: [3.8, 9.1, 12.5, 3.2, 4.1, 3.8], traces: null }
    },
  },
  {
    ...baselineResources,
    model: "Gemma4 31B",
    family: "Gemma",
    releaseDate: "2026-04-02",
    releaseSource: "https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/",
    results: {
      30: { averageSR: 22.7, domains: [21.4, 20.0, 37.5, 22.0, 20.6, 29.6], traces: null },
      50: { averageSR: 30.3, domains: [18.9, 38.6, 37.5, 30.2, 30.6, 34.6], traces: null }
    },
  },
  {
    ...baselineResources,
    model: "Gemma4 26B A4B",
    family: "Gemma",
    releaseDate: "2026-04-02",
    releaseSource: "https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/",
    results: {
      30: { averageSR: 20.1, domains: [17.9, 24.4, 25.0, 22.0, 18.8, 14.8], traces: null },
      50: { averageSR: 22.3, domains: [18.9, 25.0, 37.5, 23.8, 17.3, 30.8], traces: null }
    },
  },
  {
    ...baselineResources,
    model: "Qwen 3.8 27B",
    family: "Qwen",
    results: {
      50: { averageSR: 15.7, domains: [7.5, 15.9, 12.5, 14.3, 19.4, 23.1], traces: null }
    },
  },
  {
    ...baselineResources,
    model: "Gemini 3.1 Pro (omni†)",
    family: "Gemini",
    releaseDate: "2026-02-19",
    releaseSource: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/",
    results: {
      50: { averageSR: 30.3, domains: [26.4, 27.3, 43.8, 20.6, 38.8, 26.9], traces: null }
    },
  },
  {
    agent: "OpenCode",
    model: "Kimi 3.1 Pro",
    family: "Kimi",
    paper: benchmarkPaper,
    codeLabel: "GitHub",
    code: benchmarkRepository,
    results: {
      50: { averageSR: 60.3, domains: [56.6, 79.5, 68.8, 54.0, 59.2, 50.0], traces: null }
    },
  },
  {
    agent: "OpenCode",
    model: "Gemini 3.1 Pro",
    family: "Gemini",
    paper: benchmarkPaper,
    codeLabel: "GitHub",
    code: benchmarkRepository,
    results: {
      50: { averageSR: 47.0, domains: [39.6, 65.9, 43.8, 41.3, 49.0, 38.5], traces: null }
    },
  },
  {
    agent: "Codex",
    model: "GPT 6.1 Sol",
    family: "GPT",
    paper: benchmarkPaper,
    codeLabel: "GitHub",
    code: benchmarkRepository,
    results: {
      50: { averageSR: 61.7, domains: [60.4, 81.8, 62.5, 49.2, 63.3, 53.8], traces: null }
    },
  },
  {
    agent: "Claude Code",
    model: "Claude Opus 5.5",
    family: "Claude",
    paper: benchmarkPaper,
    codeLabel: "GitHub",
    code: benchmarkRepository,
    results: {
      50: { averageSR: 62.3, domains: [60.4, 72.7, 62.5, 57.1, 65.3, 50.0], traces: null }
    },
  }
];

const leaderboard = document.querySelector("#results");
// The build embeds validated records merged into submissions/*.json.
leaderboardEntries.push(...JSON.parse(document.querySelector("#accepted-submissions").textContent));
const leaderboardTabs = [...leaderboard.querySelectorAll("[data-results-view]")];
const budgetButtons = [...leaderboard.querySelectorAll("[data-step-budget]")];
const overallResults = leaderboard.querySelector("[data-overall-results]");
const domainResults = leaderboard.querySelector("[data-domain-results]");
let selectedBudget = "50";
let selectedView = "overall";

leaderboard.querySelectorAll("[data-sr-help]").forEach(help => {
  const trigger = help.querySelector("button");
  const tooltip = help.querySelector("[role='tooltip']");
  const show = () => { tooltip.hidden = false; };
  const hide = () => { tooltip.hidden = true; };
  help.addEventListener("mouseenter", show);
  help.addEventListener("mouseleave", () => {
    if (document.activeElement !== trigger) hide();
  });
  trigger.addEventListener("focus", show);
  trigger.addEventListener("blur", hide);
  trigger.addEventListener("click", show);
  document.addEventListener("click", event => {
    if (!help.contains(event.target)) hide();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") hide();
  });
});

function formatStepBudget(budget) {
  return budget === "unlimited" ? "Unlimited steps" : `${budget} steps`;
}

function formatScore(score, suffix = "") {
  return Number.isFinite(score) ? `${score.toFixed(1)}${suffix}` : "—";
}

function resultCell(row, text, className = "", isHeading = false) {
  const cell = document.createElement(isHeading ? "th" : "td");
  if (isHeading) cell.scope = "row";
  if (className) cell.className = className;
  cell.textContent = text;
  row.append(cell);
  return cell;
}

function resourceCell(row, url, label, description, unavailableLabel = "Coming soon") {
  const cell = resultCell(row, "", "results-resource");
  const resource = document.createElement(url ? "a" : "span");
  resource.textContent = url ? label : unavailableLabel;
  if (url) {
    resource.href = url;
    resource.target = "_blank";
    resource.rel = "noreferrer";
    resource.setAttribute("aria-label", description);
  } else {
    resource.className = "results-unavailable";
    resource.title = `${description}: link coming soon`;
  }
  cell.append(resource);
}

function renderLeaderboard() {
  const entries = leaderboardEntries
    .filter(entry => entry.results[selectedBudget])
    .slice()
    .sort((a, b) => (b.results[selectedBudget].averageSR ?? -1) - (a.results[selectedBudget].averageSR ?? -1));
  const hasResults = entries.length > 0;
  leaderboard.querySelectorAll("[role='tooltip']").forEach(tooltip => { tooltip.hidden = true; });

  leaderboardTabs.forEach(tab => {
    const isSelected = tab.dataset.resultsView === selectedView;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !isSelected;
  });
  budgetButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.stepBudget === selectedBudget));
  });
  leaderboard.querySelectorAll("[data-results-budget-label]").forEach(label => {
    label.textContent = formatStepBudget(selectedBudget);
  });
  leaderboard.querySelectorAll("[data-results-table-wrap], [data-results-scroll]").forEach(element => {
    element.hidden = !hasResults;
  });
  leaderboard.querySelectorAll("[data-results-empty]").forEach(element => {
    element.hidden = hasResults;
    element.querySelector("strong").textContent = `Results for ${formatStepBudget(selectedBudget).toLowerCase()} are not available yet.`;
  });

  overallResults.replaceChildren();
  domainResults.replaceChildren();
  let rank = 0;
  entries.forEach((entry, index) => {
    const scores = entry.results[selectedBudget];
    const isReported = Number.isFinite(scores.averageSR);
    if (isReported && (index === 0 || scores.averageSR !== entries[index - 1].results[selectedBudget].averageSR)) {
      rank = index + 1;
    }
    const medal = isReported ? ["🥇", "🥈", "🥉"][rank - 1] : null;
    const agentLabel = medal ? `${medal} ${entry.agent}` : entry.agent;

    const overallRow = document.createElement("tr");
    resultCell(overallRow, isReported ? String(rank).padStart(2, "0") : "—", "results-rank");
    const agentCell = resultCell(overallRow, agentLabel, "results-agent");
    if (entry.website) {
      const link = document.createElement("a");
      link.textContent = agentLabel;
      link.href = entry.website;
      link.target = "_blank";
      link.rel = "noreferrer";
      agentCell.replaceChildren(link);
    }
    resultCell(overallRow, entry.model, "results-model", true);
    resultCell(overallRow, formatScore(scores.averageSR, "%"), "results-score");
    resourceCell(overallRow, scores.traces, "View", `Traces for ${entry.agent} with ${entry.model} at ${selectedBudget} steps`);
    resourceCell(overallRow, entry.paper, "Paper ↗", `Paper for ${entry.agent} with ${entry.model}`, "");
    resourceCell(overallRow, entry.code, `${entry.codeLabel} ↗`, `WebArena-Pro benchmark code for ${entry.agent} with ${entry.model}`, entry.codeLabel);
    overallResults.append(overallRow);

    const domainRow = document.createElement("tr");
    resultCell(domainRow, agentLabel, "results-agent");
    resultCell(domainRow, entry.model, "results-model", true);
    scores.domains.forEach(score => {
      resultCell(domainRow, formatScore(score));
    });
    resultCell(domainRow, formatScore(scores.averageSR), "results-overall");
    domainResults.append(domainRow);
  });
}

leaderboardTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    selectedView = tab.dataset.resultsView;
    renderLeaderboard();
  });
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = leaderboardTabs.indexOf(tab);
    let nextIndex = (index + (event.key === "ArrowLeft" ? -1 : 1) + leaderboardTabs.length) % leaderboardTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = leaderboardTabs.length - 1;
    selectedView = leaderboardTabs[nextIndex].dataset.resultsView;
    renderLeaderboard();
    leaderboardTabs[nextIndex].focus({ preventScroll: true });
  });
});

budgetButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedBudget = button.dataset.stepBudget;
    renderLeaderboard();
  });
});

renderLeaderboard();

const overviewTabs = [...document.querySelectorAll("[data-overview-tab]")];
function selectOverviewTab(selectedTab) {
  overviewTabs.forEach(tab => {
    const isSelected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !isSelected;
  });
}
overviewTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectOverviewTab(tab));
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = (index + (event.key === "ArrowLeft" ? -1 : 1) + overviewTabs.length) % overviewTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = overviewTabs.length - 1;
    selectOverviewTab(overviewTabs[nextIndex]);
    overviewTabs[nextIndex].focus({ preventScroll: true });
  });
});

const tasks = [
  {
    id: "acidwave",
    site: "Acidwave",
    short: "AW",
    color: "#d9468f",
    url: "acidwave.local / songs",
    type: "Audio comparison",
    tags: ["Audio", "Single-app", "Comparison"],
    prompt: "Among GREYLINE, NEON WANT, RETURN POSTCARD, and BRASS STEP, which song has the longest instrumental intro—that is, which one starts its lyrics latest?",
  },
  {
    id: "erp-next",
    site: "ERPNext",
    type: "Delivery management",
    tags: ["Business operations", "Multi-step", "State change"],
    prompt: "Add a new delivery note for customer Boreal Retail Partners East Office with the MAT-DN-RET series with source warehouse Goods In Transit - WAC for one ACOUSTIC-PANEL",
    screenshotSize: [1280, 720],
  },
  {
    id: "firefly",
    site: "Firefly III",
    short: "FF",
    color: "#5a3cf0",
    url: "firefly.local / transactions",
    type: "Financial analysis",
    tags: ["Data analysis", "Single-app", "Information seeking"],
    prompt: "Find which vacation month was more expensive: June 2025 or August 2025.",
  },
  {
    id: "flight",
    site: "Flight Search",
    short: "FS",
    color: "#2563eb",
    url: "flights.local / search",
    type: "Travel search",
    tags: ["Search", "Comparison", "Information seeking"],
    prompt: "Find the earliest one-way economy flight from San Francisco (SFO) to Seattle (SEA) on 2026-06-15.",
  },
  {
    id: "immich",
    site: "Immich",
    short: "IM",
    color: "#4250af",
    url: "immich.local / administration",
    type: "System administration",
    tags: ["Visual", "State change", "Long horizon"],
    prompt: "Delete all users who are not using any storage space.",
  },
  {
    id: "jobportal",
    site: "Job Portal",
    short: "JP",
    color: "#3b82f6",
    url: "jobs.local / search",
    type: "Structured search",
    tags: ["Filter", "Sort", "Information seeking"],
    prompt: "How many jobs did Helix AI post, and which ones have the highest salaries?",
  },
  {
    id: "mattermost",
    site: "Mattermost",
    short: "MM",
    color: "#152c53",
    url: "mattermost.local / engineering / deployments",
    type: "Cross-app research",
    tags: ["4 apps", "Information seeking", "Content creation"],
    prompt: "In Mattermost, find the Tuesday item in the Engineering team’s Deployments schedule for March 10–14. Then total the Home Internet payments from January through April 2026 in Firefly, count the nonstop one-way economy flights from Denver to Las Vegas on June 15, 2026, and post the combined summary on X.",
  },
  {
    id: "metabase",
    site: "Metabase",
    type: "Dashboard customization",
    tags: ["Data analysis", "Visualization", "State change"],
    prompt: "I would like to see the sales dashboard first when I log into Metabase. The dashboard is missing a plot on the monthly revenue trend, and a filter by date.",
  },
  {
    id: "minerva-lite",
    site: "Minerva Lite",
    type: "Course planning",
    tags: ["Planning", "Multi-step", "State change"],
    prompt: "Sign up for three classes that will most help me complete my degree in the winter",
    screenshotSize: [1280, 720],
  },
  {
    id: "mydrive",
    site: "MyDrive",
    type: "File organization",
    tags: ["Files", "Multi-step", "State change"],
    prompt: "Create a folder for each file type and then sort the entire drive by file type",
    screenshotSize: [1280, 720],
  },
  {
    id: "nextcloud",
    site: "Nextcloud",
    short: "NC",
    color: "#0082c9",
    url: "nextcloud.local / talk",
    type: "Collaboration",
    tags: ["Communication", "Multi-step", "State change"],
    prompt: "Set up a poll for the first Project Charlie meeting with options at 10 AM, 2 PM, and 5 PM, and share it in a group conversation with Betty, Daniel, Barbara, and Alex. Mark all three options and add a checkmark reaction afterward.",
  },
  {
    id: "notion",
    site: "Notion",
    short: "NT",
    color: "#111827",
    url: "notion.local / team-notes",
    type: "Cross-app synthesis",
    tags: ["2 apps", "Table", "Content creation"],
    prompt: 'Create a new page “New Commers” under Team Notes, with a table listing accepted candidates, their jobs, and contact details.',
  },
  {
    id: "penpot",
    site: "Penpot",
    type: "Multi-page design",
    tags: ["Visual", "Multi-step", "Content creation"],
    prompt: "Create a new file with three pages. Rename the pages to Rectangle, Triangle, and Circle, and add the corresponding shape to each page.",
    screenshotSize: [1280, 720],
  },
  {
    id: "peppermint",
    site: "Peppermint",
    type: "Incident triage",
    tags: ["Support", "Filtering", "Information seeking"],
    prompt: "Summarize the current high-priority incident tickets owner and status",
    screenshotSize: [1280, 720],
  },
  {
    id: "pipedrive",
    site: "PipeCRM",
    short: "PC",
    color: "#1f2937",
    url: "pipecrm.local / leads",
    type: "Sales workflow",
    tags: ["2 apps", "Email", "State change"],
    prompt: "Send an email to the contact on the Meridian Law Group lead to arrange a meeting next monday, then register the activity.",
  },
  {
    id: "thunderbird",
    site: "Thunderbird",
    type: "Email recovery",
    tags: ["Email", "Information seeking", "State change"],
    prompt: "If any unread emails were accidentally moved to the trash, recover them and summarize the information in each recovered email.",
    screenshotSize: [1280, 720],
  },
  {
    id: "travelmap",
    site: "TravelMap",
    type: "Stay planning",
    tags: ["Travel", "Information seeking", "Communication"],
    prompt: "Read the Leslieville listing details, house rules, and check-in policy, then message Maya asking whether early check-in around 1 PM is possible and whether keypad instructions arrive the same day.",
    screenshotSize: [1280, 720],
  },
  {
    id: "x-lite",
    site: "X Lite",
    type: "Group coordination",
    tags: ["Communication", "Multi-step", "State change"],
    prompt: "Create a private coordination chat for the Saturday annotation session and include the confirmed attendees.",
    screenshotSize: [1280, 720],
  },
  {
    id: "yt-lite",
    site: "YouTube Lite",
    short: "YT",
    color: "#dc2626",
    url: "yt-lite.local",
    type: "Video understanding and design",
    tags: ["Video", "2 apps", "Content creation"],
    prompt: "Find a video related to breakfast recipes, identify the three main fruit ingredients shown in the video, and use Penpot to draw three circles in the colors of those fruits.",
  },
];

const tabs = document.querySelector("[data-task-tabs]");
const panel = document.querySelector("[data-task-panel]");

tabs.innerHTML = tasks.map((task, index) => `
  <button
    class="task-tab"
    type="button"
    role="tab"
    id="task-tab-${index}"
    aria-selected="false"
    aria-controls="task-panel"
    tabindex="-1"
    data-task-index="${index}"
  >${task.site}</button>`).join("");

function renderTasks(activeIndex = 0, shouldFocus = false) {
  const task = tasks[activeIndex];
  const screenshotName = task.id === "flight" ? "flight-search" : task.id;
  const screenshotPath = `assets/screenshots/${screenshotName}.jpg`;
  const [screenshotWidth, screenshotHeight] = task.screenshotSize || [1440, 900];
  tabs.querySelectorAll("[data-task-index]").forEach((button, index) => {
    button.setAttribute("aria-selected", String(index === activeIndex));
    button.tabIndex = index === activeIndex ? 0 : -1;
  });

  panel.id = "task-panel";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", `task-tab-${activeIndex}`);
  panel.innerHTML = `
    <div class="task-description">
      <span class="example-number">Example ${String(activeIndex + 1).padStart(2, "0")} / ${tasks.length}</span>
      <h3>${task.site}</h3>
      <p class="task-prompt">${task.prompt}</p>
      <p class="task-tags">${task.tags.map(tag => `<span>${tag}</span>`).join("")}</p>
    </div>
    <figure class="task-figure">
      <img src="${screenshotPath}" alt="${task.site} interface from the seeded WebArena-Pro environment" width="${screenshotWidth}" height="${screenshotHeight}" loading="lazy">
      <figcaption>
        <span>${task.site} environment · ${task.type}</span>
        <button class="screenshot-expand" type="button" data-expand-screenshot="${screenshotPath}" data-screenshot-alt="${task.site}">View full screenshot</button>
      </figcaption>
    </figure>`;

  if (shouldFocus) {
    const activeTab = tabs.querySelector(`[data-task-index="${activeIndex}"]`);
    activeTab.focus({ preventScroll: true });
    activeTab.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

renderTasks();

tabs.addEventListener("click", event => {
  const button = event.target.closest("[data-task-index]");
  if (button) renderTasks(Number(button.dataset.taskIndex));
});

tabs.addEventListener("keydown", event => {
  const current = event.target.closest("[data-task-index]");
  if (!current || !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const index = Number(current.dataset.taskIndex);
  let nextIndex = index;
  if (["ArrowDown", "ArrowRight"].includes(event.key)) nextIndex = (index + 1) % tasks.length;
  if (["ArrowUp", "ArrowLeft"].includes(event.key)) nextIndex = (index - 1 + tasks.length) % tasks.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = tasks.length - 1;
  renderTasks(nextIndex, true);
});

const copyButton = document.querySelector("[data-copy-citation]");
const citation = document.querySelector("[data-citation]");
copyButton.addEventListener("click", async () => {
  const label = copyButton.querySelector("span");
  try {
    await navigator.clipboard.writeText(citation.textContent.trim());
    label.textContent = "Copied";
    window.setTimeout(() => { label.textContent = "Copy"; }, 1800);
  } catch {
    label.textContent = "Select text";
  }
});

const screenshotDialog = document.querySelector("[data-screenshot-dialog]");
const dialogImage = document.querySelector("[data-dialog-image]");
const dialogTitle = document.querySelector("[data-screenshot-title]");
const closeScreenshot = document.querySelector("[data-close-screenshot]");

panel.addEventListener("click", event => {
  const button = event.target.closest("[data-expand-screenshot]");
  if (!button) return;
  dialogImage.src = button.dataset.expandScreenshot;
  dialogImage.alt = `${button.dataset.screenshotAlt} environment screenshot`;
  dialogTitle.textContent = button.dataset.screenshotAlt;
  screenshotDialog.showModal();
  document.body.style.overflow = "hidden";
});

closeScreenshot.addEventListener("click", () => screenshotDialog.close());
screenshotDialog.addEventListener("close", () => { document.body.style.overflow = ""; });
screenshotDialog.addEventListener("click", event => {
  if (event.target === screenshotDialog) screenshotDialog.close();
});
