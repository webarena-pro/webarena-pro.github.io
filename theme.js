(() => {
  const storageKey = "webarena-pro-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const validTheme = value => value === "light" || value === "dark" ? value : null;
  let preference = null;

  try { preference = validTheme(localStorage.getItem(storageKey)); }
  catch { /* Theme switching still works when storage is unavailable. */ }

  function applyTheme() {
    const theme = preference || (systemTheme.matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content", theme === "dark" ? "#1f2937" : "#ffffff"
    );
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
      button.title = `Switch to ${nextTheme} mode`;
      button.querySelector("[data-theme-label]").textContent = `${nextTheme === "dark" ? "Dark" : "Light"} mode`;
    });
  }

  // Run in the head, before the stylesheet, to avoid a light flash on dark visits.
  applyTheme();

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.hidden = false;
      button.addEventListener("click", () => {
        preference = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        try { localStorage.setItem(storageKey, preference); }
        catch { /* Keep the choice for this page even if it cannot be saved. */ }
        applyTheme();
      });
    });
  });

  systemTheme.addEventListener("change", () => {
    if (!preference) applyTheme();
  });
  window.addEventListener("storage", event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = validTheme(event.newValue);
    applyTheme();
  });
})();
