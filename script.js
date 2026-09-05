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
    type: "Video understanding",
    tags: ["Video", "Single-app", "Information seeking"],
    prompt: "In the video “Koo Koo – Forklift (Dance-A-Long)”, do they dance in a real or virtual warehouse?",
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

const line = (className = "") => `<div class="mock-line ${className}"></div>`;

function mockHeader(task) {
  return `
    <div class="mock-app-header">
      <div class="mock-brand"><i></i>${task.site}</div>
      <div class="mock-actions"><i></i><i></i></div>
    </div>`;
}

function renderMock(task) {
  const screenshotName = task.id === "flight" ? "flight-search" : task.id;
  return `
    <div class="real-screenshot">
      <img
        src="assets/screenshots/${screenshotName}.jpg"
        alt="Authentic ${task.site} interface captured from the seeded WebArena Pro environment"
        width="1440"
        height="900"
        loading="lazy"
      >
      <span class="capture-label"><i></i> Seeded environment capture</span>
      <button
        class="screenshot-expand"
        type="button"
        data-expand-screenshot="assets/screenshots/${screenshotName}.jpg"
        data-screenshot-alt="${task.site}"
      >
        <svg aria-hidden="true" viewBox="0 0 18 18"><path d="M7 3H3v4M11 3h4v4M7 15H3v-4M11 15h4v-4" /></svg>
        View full screenshot
      </button>
    </div>`;

  const header = mockHeader(task);
  const mocks = {
    acidwave: `
      <div class="mock-app mock-music">
        <div class="album-art"></div>
        <div class="music-copy">
          <small>NOW PLAYING</small><h4>NEON WANT</h4><p>Electric Dreams · 03:42</p>
          <div class="waveform">${[12, 24, 18, 32, 15, 28, 36, 20, 12, 30, 17, 25, 37, 23, 14, 29, 19, 34, 15, 25].map((height) => `<i style="height:${height}px"></i>`).join("")}</div>
          <div class="music-controls"><span>↶</span><i>▶</i><span>↷</span></div>
        </div>
      </div>`,
    firefly: `
      <div class="mock-app" style="--site-color:${task.color}">
        ${header}<div class="mock-title"></div>
        <div class="mock-finance">
          <div class="mock-card finance-total"><small>VACATION SPEND</small><strong>$4,901</strong><small>JUN + AUG 2025</small></div>
          <div class="mock-card finance-chart"><small>MONTHLY COMPARISON</small><svg viewBox="0 0 260 100"><path d="M0 87 C35 70 47 77 76 42 S125 60 148 30 195 55 260 10 V100 H0Z" /></svg></div>
          <div class="mock-card mock-table">${tableRows(4)}</div>
        </div>
      </div>`,
    flight: `
      <div class="mock-app" style="--site-color:${task.color}">
        ${header}<div class="mock-title"></div>
        <div class="mock-card flight-search-box">
          <div class="flight-field"><small>From</small><strong>SFO</strong></div><div class="flight-swap">⇄</div>
          <div class="flight-field"><small>To</small><strong>SEA</strong></div><div class="flight-field"><small>Date</small><strong>Jun 15</strong></div><div class="flight-button">SEARCH</div>
        </div>
        <div class="mock-card flight-result"><i class="airline-dot"></i><div class="flight-time"><strong>6:42</strong><small>SFO</small></div><div class="flight-route"><i></i></div><div class="flight-time"><strong>3:53</strong><small>SEA · 1 STOP</small></div><div class="flight-price">$218</div></div>
        <div class="mock-card flight-result"><i class="airline-dot" style="opacity:.48"></i><div class="flight-time"><strong>7:15</strong><small>SFO</small></div><div class="flight-route"><i></i></div><div class="flight-time"><strong>4:22</strong><small>SEA · 1 STOP</small></div><div class="flight-price">$194</div></div>
      </div>`,
    immich: `
      <div class="mock-app" style="--site-color:${task.color}">
        ${header}<div class="mock-title"></div><div class="photo-grid">${Array.from({ length: 10 }, () => "<i></i>").join("")}</div>
        <div class="photo-users"><div><b></b><span></span></div><div><b></b><span></span></div><div><b></b><span></span></div></div>
      </div>`,
    jobportal: `
      <div class="mock-app" style="--site-color:${task.color}">
        ${header}<div class="jobs-layout"><div class="job-filters"><div class="mock-title" style="width:55%"></div>${Array.from({ length: 5 }, () => '<div class="job-filter"></div>').join("")}</div>
        <div class="job-list">${jobItem("Staff Software Engineer", "$210k" )}${jobItem("Engineering Manager", "$195k")}${jobItem("VP of Operations", "$187k")}${jobItem("Product Designer", "$154k")}</div></div>
      </div>`,
    mattermost: `
      <div class="mock-app">
        <div class="chat-layout"><aside class="chat-sidebar"><strong>Research Lab</strong><span>CHANNELS</span><span class="active">town-square</span><span>research</span><span>DIRECT MESSAGES</span><span>jane.smith</span></aside>
        <div class="chat-main"><div class="chat-title">@jane.smith</div><div class="message"><i class="avatar"></i><div><strong>WebArena Agent</strong><p>I finished the Addiction research page. Here is the published link:</p><i class="message-link"></i></div></div><div class="message"><i class="avatar" style="background:#f0b86e"></i><div><strong>jane.smith</strong><p>Thanks — I’ll take a look.</p></div></div></div></div>
      </div>`,
    nextcloud: `
      <div class="mock-app">
        <div class="poll-layout"><aside class="poll-sidebar"><strong>☁ nextcloud</strong><span>All conversations</span><span>Project Charlie</span><span>Team lounge</span></aside>
        <div class="poll-main"><div class="poll-head">Project Charlie</div><div class="poll-card"><strong>When should we hold our first meeting?</strong><div class="poll-option" style="--poll:72%"><span>✓ &nbsp; 10:00 AM</span></div><div class="poll-option" style="--poll:54%"><span>✓ &nbsp; 2:00 PM</span></div><div class="poll-option" style="--poll:38%"><span>✓ &nbsp; 5:00 PM</span></div></div></div></div>
      </div>`,
    pipedrive: `
      <div class="mock-app" style="--site-color:${task.color}">
        ${header}<div class="mock-title"></div><div class="crm-layout"><div class="crm-column"><strong>QUALIFIED</strong>${dealCard("Meridian Law Group", "$24,000")}${dealCard("Northstar Labs", "$18,500")}</div><div class="crm-column"><strong>CONTACTED</strong>${dealCard("Kite & Co.", "$31,000")}${dealCard("Atlas Systems", "$12,400")}</div><div class="crm-column"><strong>MEETING</strong>${dealCard("Greenway Inc.", "$44,200")}</div></div>
      </div>`,
    notion: `
      <div class="mock-app">
        <div class="notion-layout"><aside class="notion-sidebar"><strong>◆ Research Lab</strong><span>Search</span><span>Home</span><span>Team Notes</span><span>New Commers</span></aside>
        <div class="notion-main"><h4>New Commers</h4><div class="notion-table"><div class="notion-row head"><span>Candidate</span><span>Role</span><span>Contact</span></div><div class="notion-row"><span>Maya Chen</span><span>Designer</span><span>maya@example.com</span></div><div class="notion-row"><span>Jon Bell</span><span>Engineer</span><span>jon@example.com</span></div><div class="notion-row"><span>Lea Park</span><span>Analyst</span><span>lea@example.com</span></div></div></div></div>
      </div>`,
  };
  return mocks[task.id];
}

function tableRows(count) {
  return Array.from({ length: count + 1 }, (_, index) => `
    <div class="mock-row ${index === 0 ? "head" : ""}"><i></i><i></i><span></span><i></i></div>`).join("");
}

function jobItem(title, pay) {
  return `<div class="job-item"><i class="job-logo">HA</i><div class="job-copy"><b>${title}</b><span>Helix AI · Full time</span></div><span class="job-pay">${pay}</span></div>`;
}

function dealCard(name, value) {
  return `<div class="deal-card"><b>${name}</b><span>Enterprise lead</span><span class="deal-value">${value}</span></div>`;
}

const tabs = document.querySelector("[data-task-tabs]");
const panel = document.querySelector("[data-task-panel]");

function renderTasks(activeIndex = 0, shouldFocus = false) {
  tabs.innerHTML = tasks.map((task, index) => `
    <button
      class="task-tab"
      type="button"
      role="tab"
      id="task-tab-${index}"
      aria-selected="${index === activeIndex}"
      aria-controls="task-panel"
      tabindex="${index === activeIndex ? 0 : -1}"
      data-task-index="${index}"
      style="--site-color:${task.color}"
    >
      <span class="task-tab-icon">${task.short}</span>
      <span class="task-tab-text"><small>${String(index + 1).padStart(2, "0")}</small><strong>${task.site}</strong></span>
      <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" /></svg>
    </button>`).join("");

  const task = tasks[activeIndex];
  panel.id = "task-panel";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", `task-tab-${activeIndex}`);
  panel.style.setProperty("--site-color", task.color);
  panel.innerHTML = `
    <div class="preview-browser">
      <div class="browser-chrome">
        <div class="window-dots"><i></i><i></i><i></i></div>
        <div class="browser-url">${task.url}</div><i class="browser-lock"></i>
      </div>
      ${renderMock(task)}
    </div>
    <div class="task-info">
      <div>
        <div class="task-site-badge"><span class="site-badge-icon">${task.short}</span>${task.site} · ${task.type}</div>
        <h3>${task.prompt}</h3>
      </div>
      <div class="task-tags">${task.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
    </div>`;

  if (shouldFocus) {
    tabs.querySelector(`[data-task-index="${activeIndex}"]`).focus();
  }
}

renderTasks();

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-task-index]");
  if (!button) return;
  renderTasks(Number(button.dataset.taskIndex));
});

tabs.addEventListener("keydown", (event) => {
  const current = event.target.closest("[data-task-index]");
  if (!current || !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const currentIndex = Number(current.dataset.taskIndex);
  let nextIndex = currentIndex;
  if (["ArrowDown", "ArrowRight"].includes(event.key)) nextIndex = (currentIndex + 1) % tasks.length;
  if (["ArrowUp", "ArrowLeft"].includes(event.key)) nextIndex = (currentIndex - 1 + tasks.length) % tasks.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = tasks.length - 1;
  renderTasks(nextIndex, true);
});

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 24);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  nav.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

nav.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return;
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-open");
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

document.addEventListener("click", (event) => {
  const expandButton = event.target.closest("[data-expand-screenshot]");
  if (!expandButton) return;
  const siteName = expandButton.dataset.screenshotAlt;
  dialogImage.src = expandButton.dataset.expandScreenshot;
  dialogImage.alt = `${siteName} website screenshot`;
  dialogTitle.textContent = siteName;
  screenshotDialog.showModal();
});

closeScreenshot.addEventListener("click", () => screenshotDialog.close());

screenshotDialog.addEventListener("click", (event) => {
  if (event.target === screenshotDialog) screenshotDialog.close();
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
