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
    id: "yt-lite",
    site: "YouTube Lite",
    short: "YT",
    color: "#dc2626",
    url: "yt-lite.local",
    type: "Video understanding and design",
    tags: ["Video", "2 apps", "Content creation"],
    prompt: "Find a video related to breakfast recipes, identify the three main fruit ingredients shown in the video, and use Penpot to draw three circles in the colors of those fruits.",
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
    id: "notion",
    site: "Notion",
    short: "NT",
    color: "#111827",
    url: "notion.local / team-notes",
    type: "Cross-app synthesis",
    tags: ["2 apps", "Table", "Content creation"],
    prompt: 'Create a new page “New Commers” under Team Notes, with a table listing accepted candidates, their jobs, and contact details.',
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
      <img src="${screenshotPath}" alt="${task.site} interface from the seeded WebArena-Pro environment" width="1440" height="900" loading="lazy">
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
