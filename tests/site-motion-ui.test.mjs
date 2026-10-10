import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import React, { act, useState } from "react";
import { create } from "react-test-renderer";
import * as motion from "../lib/site-motion.mjs";

const require = createRequire(import.meta.url), sourcePath = fileURLToPath(new URL("../app/site-motion.js", import.meta.url));
let pathname = "/";
const router = { push() {} };
const compiled = await require("next/dist/build/swc").transform(await readFile(sourcePath, "utf8"), { filename: sourcePath, jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" } });
const componentModule = new Module(sourcePath); componentModule.paths = Module._nodeModulePaths(dirname(sourcePath));
componentModule.require = name => name === "next/navigation" ? { usePathname: () => pathname, useRouter: () => router } : name === "../lib/site-motion.mjs" ? motion : require(name);
componentModule._compile(compiled.code, sourcePath);
const SiteMotion = componentModule.exports.default;

function StatefulPage() { const [text, setText] = useState(""); return React.createElement("input", { value: text, onChange: event => setText(event.target.value) }); }
async function mount() {
  pathname = "/";
  const saved = { window: globalThis.window, MutationObserver: globalThis.MutationObserver, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  const content = { dataset: { ready: "false" } }, listeners = new Map(), mutations = [], animations = [], preferenceListeners = new Map();
  const media = { matches: false, addEventListener: (type, fn) => preferenceListeners.set(type, fn), removeEventListener: type => preferenceListeners.delete(type) };
  class Mutation { constructor(callback) { this.callback = callback; mutations.push(this); } observe(target, options) { this.options = options; } disconnect() { this.disconnected = true; } }
  const frame = { closest: () => content, querySelectorAll: () => [], contains: () => false,
    animate: () => { const item = { cancelled: false, cancel() { this.cancelled = true; } }; animations.push(item); return item; },
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type), removeAttribute() {},
  };
  globalThis.IS_REACT_ACT_ENVIRONMENT = true; globalThis.MutationObserver = Mutation;
  globalThis.window = { matchMedia: () => media, MutationObserver: Mutation, setTimeout, clearTimeout, IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} } };
  let renderer;
  const tree = () => React.createElement(React.StrictMode, null, React.createElement(SiteMotion, null, React.createElement(StatefulPage)));
  await act(async () => { renderer = create(tree(), { createNodeMock: element => element.props.className === "site-route-frame" ? frame : {} }); });
  return { animations, listeners, mutations,
    ready: async value => { content.dataset.ready = value ? "true" : "false"; await act(async () => mutations.findLast(observer => !observer.disconnected && observer.options?.attributeFilter).callback()); },
    reduce: async value => { media.matches = value; await act(async () => preferenceListeners.get("change")()); },
    type: async text => { await act(async () => renderer.root.findByType("input").props.onChange({ target: { value: text } })); },
    value: () => renderer.root.findByType("input").props.value,
    navigate: async () => { pathname = "/about"; await act(async () => renderer.update(tree())); },
    cleanup: async () => { await act(async () => renderer.unmount()); Object.assign(globalThis, saved); },
  };
}

test("actual motion shell waits for intro completion, suspends on replay, and responds to reduced-motion changes", async () => {
  const shell = await mount();
  try {
    assert.equal(shell.animations.length, 0); assert.equal(shell.listeners.size, 0);
    await shell.ready(true); assert.equal(shell.animations.length, 1); assert.ok(shell.listeners.has("click"));
    await shell.ready(false); assert.ok(shell.animations[0].cancelled); assert.equal(shell.listeners.size, 0);
    await shell.ready(true); assert.equal(shell.animations.length, 2);
    await shell.reduce(true); assert.ok(shell.animations[1].cancelled); assert.equal(shell.listeners.size, 0);
    await shell.reduce(false); assert.equal(shell.animations.length, 3);
  } finally { await shell.cleanup(); }
  assert.equal(shell.listeners.size, 0); assert.ok(shell.mutations.every(observer => observer.disconnected));
});

test("path entrance does not key or remount the persistent child, and typing does not restart animations", async () => {
  const shell = await mount();
  try {
    await shell.ready(true); await shell.type("나의 탐구 기록"); assert.equal(shell.animations.length, 1);
    await shell.navigate(); assert.ok(shell.animations[0].cancelled); assert.equal(shell.animations.length, 2);
    assert.equal(shell.value(), "나의 탐구 기록");
  } finally { await shell.cleanup(); }
});
