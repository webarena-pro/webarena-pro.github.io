// Domain scores follow the order in leaderboardDomains. Average SR is the
// reported overall score, not an unweighted mean of the domain percentages.
const leaderboardDomains = [
  "Productivity", "Communication", "Analytics", "Business operations", "Design & media", "Travel",
];
const benchmarkRepository = "https://github.com/McGill-NLP/webarena-pro";
const benchmarkPaper = "https://arxiv.org/abs/2611.17955";
const genericAgentTraces = "https://huggingface.co/datasets/WebArena-Pro/neurips_2026_traces_generic_agent";
const codingAgentTraces = "https://huggingface.co/datasets/WebArena-Pro/neurips_2026_traces_coding_agents";
const baselineResources = {
  agent: "GenericAgent",
  website: benchmarkRepository,
  paper: benchmarkPaper,
  codeLabel: "GitHub",
  code: benchmarkRepository,
};
// Paper-backed 50-step scores match arXiv:2611.17955v1, Tables 5 and 9.
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
      50: { averageSR: 23.7, domains: [15.1, 27.3, 25.0, 20.6, 25.5, 34.6], traces: genericAgentTraces }
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
      50: { averageSR: 25.3, domains: [20.8, 36.4, 31.3, 17.5, 24.5, 34.6], traces: genericAgentTraces }
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
      50: { averageSR: 5.0, domains: [3.8, 9.1, 12.5, 3.2, 4.1, 3.8], traces: genericAgentTraces }
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
      50: { averageSR: 30.3, domains: [18.9, 38.6, 37.5, 30.2, 30.6, 34.6], traces: genericAgentTraces }
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
      50: { averageSR: 22.3, domains: [18.9, 25.0, 37.5, 23.8, 17.3, 30.8], traces: genericAgentTraces }
    },
  },
  {
    ...baselineResources,
    model: "Qwen 3.8 27B",
    family: "Qwen",
    results: {
      50: { averageSR: 15.7, domains: [7.5, 15.9, 12.5, 14.3, 19.4, 23.1], traces: genericAgentTraces }
    },
  },
  {
    ...baselineResources,
    model: "Gemini 3.1 Pro (omni)",
    family: "Gemini",
    releaseDate: "2026-02-19",
    releaseSource: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/",
    results: {
      50: { averageSR: 30.3, domains: [26.4, 27.3, 43.8, 20.6, 38.8, 26.9], traces: genericAgentTraces }
    },
  },
  {
    agent: "OpenCode",
    website: benchmarkRepository,
    model: "Kimi 3.1 Pro",
    family: "Kimi",
    paper: benchmarkPaper,
    codeLabel: "GitHub",
    code: benchmarkRepository,
    results: {
      50: { averageSR: 60.7, domains: [56.6, 79.5, 68.8, 54.0, 59.2, 53.8], traces: codingAgentTraces }
    },
  },
  {
    agent: "OpenCode",
    website: benchmarkRepository,
    model: "Gemini 3.1 Pro",
    family: "Gemini",
    paper: benchmarkPaper,
    codeLabel: "GitHub",
    code: benchmarkRepository,
    results: {
      50: { averageSR: 48.0, domains: [41.5, 65.9, 50.0, 41.3, 50.0, 38.5], traces: codingAgentTraces }
    },
  },
  {
    agent: "OpenCode",
    website: benchmarkRepository,
    model: "Qwen 3.8 Max Prime",
    family: "Qwen",
    paper: benchmarkPaper,
    codeLabel: "GitHub",
    code: benchmarkRepository,
    results: {
      50: { averageSR: 55.7, domains: [54.7, 70.5, 56.3, 47.6, 55.1, 53.8], traces: codingAgentTraces }
    },
  },
  {
    agent: "Codex",
    website: benchmarkRepository,
    model: "GPT 6.1 Sol",
    family: "GPT",
    paper: benchmarkPaper,
    codeLabel: "GitHub",
    code: benchmarkRepository,
    results: {
      50: { averageSR: 62.3, domains: [60.4, 81.8, 62.5, 49.2, 64.3, 57.7], traces: codingAgentTraces }
    },
  },
  {
    agent: "Claude Code",
    website: benchmarkRepository,
    model: "Claude Opus 5.5",
    family: "Claude",
    paper: benchmarkPaper,
    codeLabel: "GitHub",
    code: benchmarkRepository,
    results: {
      50: { averageSR: 62.3, domains: [60.4, 72.7, 62.5, 57.1, 65.3, 50.0], traces: codingAgentTraces }
    },
  },
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

function agentCell(row, entry, label) {
  const cell = resultCell(row, label, "results-agent");
  if (entry.website) {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = entry.website;
    link.target = "_blank";
    link.rel = "noreferrer";
    cell.replaceChildren(link);
  }
  return cell;
}

function modelCell(row, entry) {
  const cell = resultCell(row, entry.model, "results-model", true);
  if (entry.isNew) {
    const badge = document.createElement("span");
    badge.className = "results-new-label";
    badge.textContent = "New";
    cell.append(badge);
  }
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
    if (entry.isNew) overallRow.className = "results-row-new";
    resultCell(overallRow, isReported ? String(rank).padStart(2, "0") : "—", "results-rank");
    agentCell(overallRow, entry, agentLabel);
    modelCell(overallRow, entry);
    const scoreCell = resultCell(overallRow, formatScore(scores.averageSR, "%"), "results-score");
    if (Number.isInteger(scores.passed) && Number.isInteger(entry.taskCount)) {
      const passed = document.createElement("small");
      passed.textContent = `${scores.passed} / ${entry.taskCount}`;
      scoreCell.append(passed);
    }
    resourceCell(overallRow, scores.traces, "View", `Traces for ${entry.agent} with ${entry.model} at ${selectedBudget} steps`);
    resourceCell(overallRow, entry.paper, "Paper ↗", `Paper for ${entry.agent} with ${entry.model}`, entry.isNew ? "—" : "");
    resourceCell(overallRow, entry.code, `${entry.codeLabel} ↗`, `WebArena-Pro benchmark code for ${entry.agent} with ${entry.model}`, entry.codeLabel);
    overallResults.append(overallRow);

    const domainRow = document.createElement("tr");
    if (entry.isNew) domainRow.className = "results-row-new";
    agentCell(domainRow, entry, agentLabel);
    modelCell(domainRow, entry);
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

const tasks = [
  {
    id: "acidwave",
    logo: "acidwave.svg",
    taskId: "403",
    site: "Acidwave",
    type: "Audio-guided travel booking",
    tags: ["Audio", "2 apps", "Multi-step"],
    prompt: "Listen to the recording titled \"Trailer Static\" on Acidwave and identify the cities named in the spoken audio. For each distinct city that has accommodation listings on TravelMap, complete one accommodation booking. Count repeated mentions of the same city only once, and skip cities that have no listings there. You may choose any available property and booking details (dates, number of guests, and length of stay) independently for each city; the bookings do not need to form a single travel itinerary.",
  },
  {
    id: "erp-next",
    logo: "erp-next.svg",
    taskId: "322",
    site: "ERPNext",
    type: "Customer onboarding and invoicing",
    tags: ["Business operations", "Multi-step", "State change"],
    prompt: "Create and submit a Sales Invoice for this new customer:\n\n  - Company: Maple Lantern Architecture Inc.\n  - Customer type: Company\n  - Customer group: All Customer Groups\n  - Territory: All Territories\n  - Contact: Evelyn Hart, Sales Operations Manager\n  - Email: evelyn.hart@maplelantern.example\n  - Phone: +1 613-555-0147\n  - Mobile: +1 613-555-0192\n  - Address: Suite 420, 100 Example Boulevard, Ottawa, Ontario K1P 5G4, Canada\n\n  Invoice details:\n\n  - Posting date: August 7, 2026\n  - Due date: August 21, 2026\n  - Price list: Standard Selling\n  - Currency: EUR\n  - Remarks: Ottawa studio workstation setup\n  - 4 × Executive Desk\n  - 8 × 27in 4K Monitor \n  - 4 × Ergo Office Chair \n  - 4 × USB-C Docking Station \n  - 4 × Cable Management Kit",
    screenshotSize: [1280, 720],
  },
  {
    id: "firefly",
    logo: "firefly.png",
    taskId: "062",
    site: "Firefly III",
    type: "Conditional travel budgeting",
    tags: ["2 apps", "Data analysis", "State change"],
    prompt: "In Firefly, find the most expensive single transaction tagged Vacation between June 1 and August 31, 2025, and note its amount and report in the following form: 2025 max: C$X,XXX.XX\n\nThen in flight-search, find the cheapest one-way economy flight from JFK to LAX on 2026-08-15, and note its price. If the JFK-to-LAX 2026 flight is cheaper than the most expensive 2025 Vacation transaction, create a piggy bank in Firefly named \"Cheaper Flight Fund\" with target amount equal to the JFK-to-LAX flight price, saving from TD Chequing, and add C$50 from TD Chequing to it. Otherwise, do nothing.",
  },
  {
    id: "flight-search",
    logo: "flight-search.svg",
    taskId: "340",
    site: "Flight Search",
    type: "Multi-city trip optimization",
    tags: ["3 apps", "Planning", "Comparison"],
    prompt: "Find the cheapest multi-city economy itinerary for one adult departing Montreal (YUL) on September 20, 2026, visiting Lisbon (LIS) and Berlin (BER) exactly once, spending two nights in one city and three nights in the other, and departing the final city for Montreal on September 26. Intercity flights must arrive on the same local calendar day so every lodging night is usable. Then find the cheapest available Travelmap accommodation for one guest for the corresponding dates. Report the route (City1, num nights as int), (City2, num nights), combined total in US$X,XXX.XX.",
  },
  {
    id: "immich",
    logo: "immich.ico",
    taskId: "087",
    site: "Immich",
    type: "Photo organization and sharing",
    tags: ["Visual", "Multi-step", "Access control"],
    prompt: "Create separate albums to save photos from April 5, 2015 and April 27, 2026 named “250405” and “260427,” respectively, and share both albums with agent2 and agent3 with viewer access.",
  },
  {
    id: "jobportal",
    logo: "jobportal.svg",
    taskId: "096",
    site: "Job Portal",
    type: "Job posting revision",
    tags: ["Comparison", "Multi-step", "State change"],
    prompt: "Close the two intern job postings with the earliest application deadlines. Then create new part-time versions of those roles that require at least 1 year of experience, with the income increased by 25% compared to the original postings. Set the application deadline for the new postings to two months from now.",
  },
  {
    id: "mattermost",
    logo: "mattermost.png",
    taskId: "118",
    site: "Mattermost",
    type: "Cross-app operational reporting",
    tags: ["4 apps", "Data analysis", "Communication"],
    prompt: "Find the two action items in Bob's infrastructure status report for the week of March 10. Then, count the open deals currently shown in the Lead stage. Next, find how many Groceries expenses there are from 2026-01-01 through 2026-03-31 and their total. Finally, find how many one-way economy flights from Denver (DEN) to Las Vegas (LAS) on 2026-06-15 include United Airlines. Post the combined summary in the infrastructure status discussion.",
  },
  {
    id: "metabase",
    logo: "metabase.png",
    taskId: "325",
    site: "Metabase",
    type: "Layered revenue visualization",
    tags: ["Data analysis", "Visualization", "Multi-step"],
    prompt: "Create a monthly order_summary combo chart with four layers:\n\n  1. Revenue by acquisition source\n  2. Total revenue over time\n  3. Three-month revenue average over time\n  4. Distinct orders over time",
  },
  {
    id: "minerva-lite",
    logo: "minerva-lite.svg",
    taskId: "137",
    site: "Minerva Lite",
    type: "Schedule-aware travel coordination",
    tags: ["5 apps", "Planning", "Communication"],
    prompt: "Find the cheapest 4-day round-trip flight from ICN to KIX during the first week of October 2026 that minimizes missed classes based on my current schedule. Then ask whether Emma is available. Also, post the itinerary and ask who else can join the trip (in case). Finally, add this as a new trip in the Travel Budget database, making sure to distinguish it from the existing trip.",
    screenshotSize: [1280, 720],
  },
  {
    id: "mydrive",
    logo: "mydrive.svg",
    taskId: "147",
    site: "MyDrive",
    type: "Multilingual algorithm files",
    tags: ["Coding", "Files", "Multi-step"],
    prompt: "\"Create an algorithm folder with Q1 and Q2 subfolders. In each folder, write the given algorithm in Python, Java, and JavaScript, using filenames in the {question}_{language} format, such as Q1_python.py and Q1_java.java.\n\nQ1: Write a function that returns the nth value of the Fibonacci sequence.\nQ2: Given two n x n binary matrices mat and target, return true if mat can be made equal to target by rotating mat in 90-degree increments; otherwise, return false. (n == mat.length == target.length, n == mat[i].length == target[i].length)\"",
    screenshotSize: [1280, 720],
  },
  {
    id: "nextcloud",
    logo: "nextcloud.ico",
    taskId: "170",
    site: "Nextcloud",
    type: "Secure recruiting collaboration",
    tags: ["Files", "Communication", "Access control"],
    prompt: "Send the Marketing Assistant resume files in both .docx and .pdf formats to Nancy, Lisa, and Richard in a group chat. Then, request the creation of a “Marketing Assistant Interview Result” file in the interview folder and share the file request link with them. Set the expiration date to the end of next week (Sunday of the following calendar week), and protect it with the password 'marketing'.",
  },
  {
    id: "notion",
    logo: "notion.svg",
    taskId: "189",
    site: "Notion",
    type: "Shared travel budget coordination",
    tags: ["2 apps", "Data analysis", "Communication"],
    prompt: "I’m planning a domestic flight trip with the two people I most recently interacted with across the connected communication platforms. In the Travel Budget database,  assign one person to the accommodation-related items and the other to the activity-related items using the email property. Then share in the group message how much each person should pay.",
  },
  {
    id: "password-manager",
    logo: "password-manager.svg",
    taskId: "194",
    site: "Password Manager",
    type: "Payment card comparison",
    tags: ["Comparison", "Information retrieval"],
    prompt: "Which saved payment card expires the soonest?",
    screenshotSize: [1280, 720],
  },
  {
    id: "penpot",
    logo: "penpot.png",
    taskId: "204",
    site: "Penpot",
    type: "Detailed modal component design",
    tags: ["Visual", "Multi-step", "Content creation"],
    prompt: "Create a new file and make a 1000×1000 board named “Base Modal” and design a calendar modal component inside it. The modal should be an 800×800 rectangle with a white background (#ffffff), 12px border radius, and a drop shadow of 0 0 12px #000000 at 15% opacity. Inside the modal, include a 48px “Title” text, a 36px “description” text, and a 700×200 button with background color #dfdfdf and 12px border radius. Then, group the rectangle, texts, and button together.",
    screenshotSize: [1280, 720],
  },
  {
    id: "peppermint",
    logo: "peppermint.ico",
    taskId: "420",
    site: "Peppermint",
    type: "Customer ranking and onboarding",
    tags: ["2 apps", "Data analysis", "State change"],
    prompt: "Identify the three referral-acquired customers with the highest total qualifying order value during 2024. Include only paid, shipped, and completed orders. Add those three customers to Peppermint using their names and emails, avoiding duplicates by email. Create a linked “Referral onboarding — [full name]” ticket for each, assigned to Priya Sharma. Include their rank, qualifying order count, and total order value. Set the first-ranked customer’s ticket to High priority and the other two to Medium.",
    screenshotSize: [1280, 720],
  },
  {
    id: "pipedrive",
    logo: "pipedrive.svg",
    taskId: "230",
    site: "PipeCRM",
    type: "Deal comparison and follow-up",
    tags: ["Comparison", "Multi-step", "State change"],
    prompt: "For the organization Nimbus Cloud Services, find its two open deals, determine which one has the lower value, and add a task activity to that lower-value deal due on 2026-05-20 with subject exactly: Benchmark task: follow up on lower-value Nimbus deal.",
  },
  {
    id: "thunderbird",
    logo: "thunderbird.ico",
    taskId: "243",
    site: "Thunderbird",
    type: "Conditional vacation reply drafts",
    tags: ["Email", "Filtering", "Content creation"],
    prompt: "Draft and save vacation-reply emails for the relevant threads. For every unread email, create a draft telling the sender that I am on vacation and will respond as soon as possible. For every read email received after Jan 20 that has not already been notified, create a draft telling the sender that I am on vacation. Do not send any of the drafts.",
    screenshotSize: [1280, 720],
  },
  {
    id: "travelmap",
    logo: "travelmap.svg",
    taskId: "252",
    site: "TravelMap",
    type: "Trip changes and host research",
    tags: ["Travel", "Multi-step", "Communication"],
    prompt: "First, handle the existing Vancouver trip by opening Trips, reviewing booking BKG-2001, opening the associated Vancouver listing, checking the bike-storage details, and reviewing the existing Inbox conversation with Priya. Then return to Trips and cancel booking BKG-2001. After that, find Joshua Tree Artist Dome, read the host bio and policies, save the listing, and send Jordan a message asking whether sunset hot-tub use is allowed and whether cell service is reliable for arrival.",
    screenshotSize: [1280, 720],
  },
  {
    id: "x-lite",
    logo: "x-lite.svg",
    taskId: "263",
    site: "X Lite",
    type: "Video research and public sharing",
    tags: ["Video", "3 apps", "Content creation"],
    prompt: "I’m preparing for air travel and want to learn how to avoid losing luggage. Please find a relevant video guide, create a document (page) that summarizes all the tips for preventing luggage loss, and then share the document (page) in a public post. Mention the speaker's name inside of the post.",
    screenshotSize: [1280, 720],
  },
  {
    id: "yt-lite",
    logo: "yt-lite.svg",
    taskId: "293",
    site: "YouTube Lite",
    type: "Video-guided report creation",
    tags: ["Video", "Visual", "2 apps"],
    prompt: "Find a YouTube video that teaches how to write a poem and has a yellow clock in its thumbnail. After watching the video, create a report in the Personal Travel workspace in Notion with the title “How to Write a Poem.” Set the page emoji to match the title of the last poem mentioned in the video, and include the presenter’s Instagram account in the page content.",
  },
];

const websiteGrid = document.querySelector("[data-website-grid]");
const taskDialog = document.querySelector("[data-task-dialog]");
const panel = document.querySelector("[data-task-panel]");
const taskTitle = document.querySelector("[data-task-title]");
const closeTask = document.querySelector("[data-close-task]");

websiteGrid.innerHTML = tasks.map((task, index) => `
  <button class="website-tile" type="button" data-task-index="${index}"
    aria-label="View ${task.site} task example" aria-haspopup="dialog" aria-controls="task-dialog">
    <span class="website-logo"><img src="assets/websites/${task.logo}" alt="" width="48" height="48" loading="lazy"></span>
    <span>${task.site}</span>
  </button>`).join("");

taskDialog.id = "task-dialog";

function showTask(activeIndex) {
  const task = tasks[activeIndex];
  const screenshotPath = `assets/screenshots/${task.id}.jpg`;
  const [screenshotWidth, screenshotHeight] = task.screenshotSize || [1440, 900];
  taskTitle.textContent = task.site;
  panel.innerHTML = `
    <div class="task-description">
      <span class="example-number">Example ${String(activeIndex + 1).padStart(2, "0")} / ${tasks.length}</span>
      <h3>${task.type}</h3>
      <p class="task-prompt"></p>
      <p class="task-tags">${task.tags.map(tag => `<span>${tag}</span>`).join("")}</p>
      <a class="task-website-link" href="https://${task.id}.websites.webarenapro.win/" target="_blank" rel="noopener noreferrer">Open ${task.site} <span aria-hidden="true">↗</span></a>
      <p class="task-demo-note">Shared read-only demo · Changes cannot be saved.<br><a href="https://websites.webarenapro.win/" target="_blank" rel="noopener noreferrer">Demo login details</a></p>
    </div>
    <figure class="task-figure">
      <a class="task-screenshot-link" href="${screenshotPath}" target="_blank" rel="noopener noreferrer" aria-label="View full ${task.site} screenshot (opens in a new tab)">
        <img src="${screenshotPath}" alt="${task.site} interface from the seeded WebArena-Pro environment" width="${screenshotWidth}" height="${screenshotHeight}">
      </a>
      <figcaption>
        <span>Seeded benchmark environment</span>
        <a href="${screenshotPath}" target="_blank" rel="noopener noreferrer">View full screenshot ↗</a>
      </figcaption>
    </figure>`;
  panel.querySelector(".task-prompt").textContent = task.prompt;
  taskDialog.showModal();
  taskDialog.scrollTop = 0;
  document.body.style.overflow = "hidden";
}

websiteGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-task-index]");
  if (button) showTask(Number(button.dataset.taskIndex));
});
closeTask.addEventListener("click", () => taskDialog.close());
taskDialog.addEventListener("close", () => { document.body.style.overflow = ""; });
taskDialog.addEventListener("click", event => {
  if (event.target === taskDialog) taskDialog.close();
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
