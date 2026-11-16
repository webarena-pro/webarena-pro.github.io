const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../theme.js"), "utf8");

function page({ dark = false, saved = null, blocked = false } = {}) {
  const window = new EventTarget();
  const document = new EventTarget();
  const media = new EventTarget();
  media.matches = dark;
  window.matchMedia = () => media;
  document.documentElement = { dataset: {} };
  const label = {};
  const button = new EventTarget();
  button.hidden = true;
  button.setAttribute = (name, value) => { button[name] = value; };
  button.querySelector = () => label;
  let ready = false;
  document.querySelectorAll = () => ready ? [button] : [];
  const meta = { setAttribute: (name, value) => { meta[name] = value; } };
  document.querySelector = () => meta;
  const localStorage = {
    getItem() { if (blocked) throw new Error("Blocked"); return saved; },
    setItem(key, value) { if (blocked) throw new Error("Blocked"); saved = value; },
  };
  vm.runInNewContext(source, { window, document, localStorage });
  const initial = document.documentElement.dataset.theme;
  ready = true;
  document.dispatchEvent(new Event("DOMContentLoaded"));
  return {
    initial, button, label, meta,
    theme: () => document.documentElement.dataset.theme,
    saved: () => saved,
    click: () => button.dispatchEvent(new Event("click")),
    system(value) { media.matches = value; media.dispatchEvent(new Event("change")); },
    storage(value) {
      window.dispatchEvent(Object.assign(new Event("storage"), { key: "webarena-pro-theme", newValue: value }));
    },
  };
}

test("device theme applies before the body and follows changes until the visitor chooses", () => {
  const p = page({ dark: true });
  assert.equal(p.initial, "dark");
  assert.equal(p.button.hidden, false);
  assert.equal(p.meta.content, "#1f2937");
  assert.equal(p.button["aria-label"], "Switch to light mode");
  p.system(false);
  assert.equal(p.theme(), "light");
  p.click();
  assert.equal(p.theme(), "dark");
  assert.equal(p.saved(), "dark");
  p.system(true);
  p.system(false);
  assert.equal(p.theme(), "dark");
});

test("saved choice overrides the device, survives a new page, and synchronizes across tabs", () => {
  const p = page({ dark: true, saved: "light" });
  assert.equal(p.initial, "light");
  p.click();
  assert.equal(page({ saved: p.saved() }).initial, "dark");
  p.storage("light");
  assert.equal(p.theme(), "light");
  assert.equal(p.label.textContent, "Dark mode");
  p.storage(null);
  assert.equal(p.theme(), "dark");
  p.system(false);
  assert.equal(p.theme(), "light");
  assert.equal(page({ dark: true, saved: "invalid" }).initial, "dark");
});

test("blocked storage does not prevent theme switching", () => {
  const p = page({ blocked: true });
  assert.equal(p.initial, "light");
  p.click();
  assert.equal(p.theme(), "dark");
  p.click();
  assert.equal(p.theme(), "light");
});
