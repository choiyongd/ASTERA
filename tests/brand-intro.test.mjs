import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import React, { act } from "react";
import { create } from "react-test-renderer";

// Render the actual component with React; no browser, network, or wall-clock sleep.
const require = createRequire(import.meta.url);
const sourcePath = fileURLToPath(new URL("../app/brand-intro.js", import.meta.url));
const { transform } = require("next/dist/build/swc");
const compiled = await transform(await readFile(sourcePath, "utf8"), { filename: sourcePath, jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" } });
const componentModule = new Module(sourcePath);
componentModule.paths = Module._nodeModulePaths(dirname(sourcePath));
componentModule._compile(compiled.code, sourcePath);
const BrandIntro = componentModule.exports.default;

async function mount({ cached = true, reduced = false, strict = false } = {}) {
  let now = 0, sequence = 0, focusCount = 0;
  const timers = new Map(), listeners = new Map(), mediaListeners = new Map();
  const logo = { complete: cached, naturalWidth: cached ? 800 : 0 };
  const media = { matches: reduced, addEventListener: (type, fn) => mediaListeners.set(type, fn), removeEventListener: type => mediaListeners.delete(type) };
  const savedGlobals = { window: globalThis.window, document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.document = { body: { style: { overflow: "auto" } } };
  globalThis.requestAnimationFrame = fn => fn();
  globalThis.window = {
    matchMedia: () => media,
    setTimeout: (fn, ms) => { const id = ++sequence; timers.set(id, { fn, at: now + ms }); return id; },
    clearTimeout: id => timers.delete(id),
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type),
    // A stale marker from older code must not suppress a new page load.
    sessionStorage: { getItem: () => "seen", setItem() {} },
  };
  const element = child => React.createElement(BrandIntro, null, child);
  let renderer;
  await act(async () => { renderer = create(strict ? React.createElement(React.StrictMode, null, element("page one")) : element("page one"), { createNodeMock: el => el.type === "img" ? logo : el.props.className === "site-content" ? { focus: () => focusCount++ } : {} }); });
  return {
    phase: () => renderer.root.findByProps({ className: "brand-intro" }).props["data-phase"],
    blocked: () => renderer.root.findByProps({ className: "site-content" }).props.inert === true,
    overflow: () => document.body.style.overflow,
    timers,
    focusCount: () => focusCount,
    advance: async ms => { const target = now + ms; await act(async () => { while (true) { const due = [...timers.entries()].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0]; if (!due) break; now = due[1].at; timers.delete(due[0]); due[1].fn(); } now = target; }); },
    load: async () => { logo.complete = true; logo.naturalWidth = 800; await act(async () => renderer.root.findByType("img").props.onLoad()); },
    fail: async () => { await act(async () => renderer.root.findByType("img").props.onError()); },
    skip: async () => { await act(async () => renderer.root.findByProps({ className: "brand-intro-skip" }).props.onClick()); },
    escape: async () => { await act(async () => listeners.get("keydown")?.({ key: "Escape", preventDefault() {} })); },
    replay: async () => { await act(async () => listeners.get("astera:replay-intro")?.()); },
    navigate: async () => { await act(async () => renderer.update(element("page two"))); },
    reduceMotion: async () => { media.matches = true; await act(async () => mediaListeners.get("change")?.()); },
    cleanup: async () => { await act(async () => renderer.unmount()); Object.assign(globalThis, savedGlobals); },
  };
}

test("cached official logo plays for two seconds despite an old session marker; internal navigation does not replay", async () => {
  const intro = await mount();
  try { assert.equal(intro.phase(), "playing"); assert.ok(intro.blocked()); assert.equal(intro.overflow(), "hidden"); await intro.advance(1999); assert.equal(intro.phase(), "playing"); await intro.advance(1); assert.equal(intro.phase(), "done"); assert.equal(intro.blocked(), false); assert.equal(intro.overflow(), "auto"); await intro.navigate(); assert.equal(intro.phase(), "done"); await intro.replay(); assert.equal(intro.phase(), "playing"); await intro.advance(2000); assert.equal(intro.phase(), "done"); } finally { await intro.cleanup(); }
});
test("slow image begins the two-second animation only after logo load", async () => {
  const intro = await mount({ cached: false });
  try { assert.equal(intro.phase(), "waiting"); await intro.advance(900); assert.equal(intro.phase(), "waiting"); await intro.load(); assert.equal(intro.phase(), "playing"); await intro.advance(1999); assert.equal(intro.phase(), "playing"); await intro.advance(1); assert.equal(intro.phase(), "done"); } finally { await intro.cleanup(); }
});
test("an unavailable image uses the timed wordmark fallback instead of trapping the page", async () => {
  const intro = await mount({ cached: false });
  try { await intro.advance(1200); assert.equal(intro.phase(), "playing"); await intro.advance(2000); assert.equal(intro.phase(), "done"); assert.equal(intro.blocked(), false); } finally { await intro.cleanup(); }
});
test("logo error, skip, Escape, and changed motion preference release input blocking", async () => {
  for (const action of ["skip", "escape", "reduceMotion"]) {
    const intro = await mount({ cached: false });
    try { await intro.fail(); assert.equal(intro.phase(), "playing"); await intro[action](); assert.equal(intro.phase(), "done"); assert.equal(intro.blocked(), false); await intro.advance(5000); assert.equal(intro.phase(), "done"); if (action !== "reduceMotion") assert.equal(intro.focusCount(), 1); } finally { await intro.cleanup(); }
  }
});
test("reduced-motion users land immediately, and Strict Mode leaves one live exit timer", async () => {
  const reduced = await mount({ reduced: true });
  try { assert.equal(reduced.phase(), "done"); assert.equal(reduced.blocked(), false); assert.equal(reduced.timers.size, 0); } finally { await reduced.cleanup(); }
  const strict = await mount({ strict: true });
  try { assert.equal(strict.phase(), "playing"); assert.equal(strict.timers.size, 1); await strict.advance(2000); assert.equal(strict.phase(), "done"); } finally { await strict.cleanup(); }
});
