import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import React, { act } from "react";
import { create } from "react-test-renderer";
import { ALL_LAB_TOPICS } from "../lib/lab/catalog.mjs";
import { ACTIVITIES } from "../lib/lab/activities.mjs";
import { courseStorageKey } from "../lib/lab/course.mjs";

const require = createRequire(import.meta.url), root = fileURLToPath(new URL("..", import.meta.url)), modules = new Map();
const { transform } = require("next/dist/build/swc");
await Promise.all(["app/lab/course-lab.js", "app/lab/components.js", "app/lab/activity-workbench.js", "app/universe-icons.js", "app/icons.js"].map(async path => {
  const filename = resolve(root, path);
  const result = await transform(await readFile(filename, "utf8"), { filename, jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" } });
  modules.set(filename, { code: result.code });
}));
function loadComponent(filename) {
  const item = modules.get(filename); if (item.exports) return item.exports;
  const m = new Module(filename); m.paths = Module._nodeModulePaths(dirname(filename));
  m.require = id => {
    if (id === "next/link") return ({ children, ...props }) => React.createElement("a", props, children);
    if (id.startsWith("@/")) return require(resolve(root, id.slice(2)));
    if (id.startsWith(".")) { const relative = resolve(dirname(filename), `${id}.js`); if (modules.has(relative)) return loadComponent(relative); }
    return require(id);
  };
  m._compile(item.code, filename); item.exports = m.exports; return m.exports;
}
const CourseLab = loadComponent(resolve(root, "app/lab/course-lab.js")).default;
const text = node => node.children.map(c => typeof c === "string" ? c : text(c)).join("");
const nextInputs = {
  recommendation: ["novelty", 3], sources: ["source", "diary"], allocation: ["preset", "필요에 맞게 2·4·6"], story: ["voice", "child"], art: ["artwork", "wave"], dialogue: ["proposal", "시간·공간을 나누어 사용"], design: ["ramp", true], friend: ["case", "answer"], exchange: ["method", "cycle"], bridge: ["structure", "truss"], news: ["source", "data"], ethics: ["response", "관찰과 도움을 함께 말하기"], heat: ["shade", 80], "art-context": ["object", "cup"],
};

async function mount(topic, store = new Map(), unavailable = false) {
  const original = Object.fromEntries(["window", "localStorage", "requestAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"].map(k => [k, globalThis[k]]));
  const storage = { getItem: key => { if (unavailable) throw Error("blocked"); return store.get(key) || null; }, setItem: (key, value) => { if (unavailable) throw Error("blocked"); store.set(key, value); } };
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage, addEventListener() {}, print() {} };
  globalThis.requestAnimationFrame = fn => fn(); globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let renderer;
  await act(async () => { renderer = create(React.createElement(CourseLab, { topic, activity: ACTIVITIES[topic.id] }), { createNodeMock: () => ({ focus() {}, showModal() {}, close() {}, open: false }) }); });
  return {
    store,
    field: async (key, value = "기록에서 확인한 차이를 근거로 내 생각을 설명해요.") => { await act(async () => renderer.root.findAllByType("textarea").find(n => n.props.id === `course-${key}`).props.onChange({ target: { value } })); },
    submit: async () => { await act(async () => renderer.root.findByType("form").props.onSubmit({ preventDefault() {} })); },
    chooseConcept: async () => { await act(async () => renderer.root.findAllByType("input").find(n => n.props.name === "course-concept" && n.props.value === ACTIVITIES[topic.id].check.answer).props.onChange()); },
    click: async label => { const b = renderer.root.findAllByType("button").find(n => text(n).trim() === label); assert.ok(b, label); await act(async () => b.props.onClick()); },
    change: async () => {
      const [key, value] = nextInputs[ACTIVITIES[topic.id].mode];
      if (["proposal", "response", "preset"].includes(key)) { const b = renderer.root.findAllByType("button").find(n => text(n) === value); await act(async () => b.props.onClick()); }
      else if (key === "ramp") { const box = renderer.root.findAllByType("input").find(n => n.props.type === "checkbox"); await act(async () => box.parent.parent.findAllByType("input")[1].props.onChange({ target: { checked: true } })); }
      else await act(async () => renderer.root.findByProps({ id: `model-${key}` }).props.onChange({ target: { value } }));
    },
    selectEvidence: async () => { const box = renderer.root.findAllByType("input").find(n => n.props.type === "checkbox" && n.parent.props.className === "lab-run-evidence"); assert.ok(box); await act(async () => box.props.onChange()); },
    state: () => JSON.parse(store.get(courseStorageKey(topic.id))),
    error: () => renderer.root.findAllByProps({ role: "alert" }).map(text).join(""),
    has: label => renderer.root.findAllByType("h2").some(n => text(n) === label),
    cleanup: async () => { await act(async () => renderer.unmount()); Object.assign(globalThis, original); },
  };
}

for (const topic of ALL_LAB_TOPICS.filter(t => t.id !== "science-001")) test(`${topic.code}: learner can complete all five screens using the actual controls`, async () => {
  const ui = await mount(topic);
  try {
    await ui.submit(); assert.ok(ui.error());
    await ui.field("initial"); await ui.field("initialReason"); await ui.submit();
    await ui.chooseConcept(); await ui.submit(); await ui.field("prediction");
    await ui.click("이 조건으로 시험하고 기록"); await ui.change(); await ui.click("이 조건으로 시험하고 기록");
    assert.equal(ui.state().runs.length, 2);
    await ui.selectEvidence(); await ui.field("interpretation"); await ui.field("uncertainty"); await ui.submit();
    assert.equal(ui.state().step, 3);
    await ui.field("creation"); await ui.field("creationReason"); await ui.submit();
    await ui.field("final"); await ui.field("finalReason"); await ui.field("nextQuestion"); await ui.submit();
    assert.equal(ui.state().completed, true); assert.ok(ui.has("나의 탐구 기록")); assert.equal(ui.error(), "");
    const previous = ui.store.get(courseStorageKey(topic.id)); await ui.cleanup();
    const restored = await mount(topic, ui.store);
    try { assert.equal(restored.state().completed, true); assert.ok(restored.has("나의 탐구 기록")); assert.equal(restored.store.get(courseStorageKey(topic.id)), previous); } finally { await restored.cleanup(); }
  } catch (e) { await ui.cleanup(); throw e; }
});

test("blocked storage still permits writing and advancing without trapping the learner", async () => {
  const ui = await mount(ALL_LAB_TOPICS.find(t => t.id === "tech-001"), new Map(), true);
  try { await ui.field("initial"); await ui.field("initialReason"); await ui.submit(); assert.ok(ui.has("탐구에 필요한 개념")); assert.equal(ui.error(), ""); } finally { await ui.cleanup(); }
});
test("reset requires the dialog choice and only clears the current topic", async () => {
  const topic = ALL_LAB_TOPICS.find(t => t.id === "tech-001");
  const store = new Map([[courseStorageKey("history-001"), "other record"]]); const ui = await mount(topic, store);
  try { await ui.field("initial"); await ui.click("기록 지우고 다시 시작"); assert.ok(ui.state().initial); await ui.click("계속 탐구하기"); assert.ok(ui.state().initial); await ui.click("기록 지우고 다시 시작"); await ui.click("지우고 새로 시작"); assert.equal(ui.state().initial, ""); assert.equal(store.get(courseStorageKey("history-001")), "other record"); } finally { await ui.cleanup(); }
});
