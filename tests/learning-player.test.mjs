import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Module, { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import React, { act } from "react";
import { create } from "react-test-renderer";
import { newDraft, validateDraft, STAGES, COMPETENCIES } from "../lib/learning/domain.mjs";
const require = createRequire(import.meta.url),
  root = fileURLToPath(new URL("..", import.meta.url));
const file = resolve(root, "app/learn/learning-player.js");
const readingFile = resolve(root, "app/learn/reading-deck.js");
const { transform } = require("next/dist/build/swc");
const compile = async (filename) => (await transform(await readFile(filename, "utf8"), {
  filename,
  jsc: {
    parser: { syntax: "ecmascript", jsx: true },
    transform: { react: { runtime: "automatic" } },
  },
  module: { type: "commonjs" },
})).code;
const [code, readingCode] = await Promise.all([compile(file), compile(readingFile)]);
const readingModule = new Module(readingFile);
readingModule.paths = Module._nodeModulePaths(dirname(readingFile));
readingModule.require = (id) => id === "../universe-icons" ? { UniverseIcon: () => null } : require(id);
readingModule._compile(readingCode, readingFile);
const content = {
  ...newDraft(),
  title: "자료를 비교하는 질문",
  slug: "compare",
  summary: "관찰하고 비교해요.",
  stages: STAGES.map((s) => ({ ...s, body: "실제 자료를 읽고 탐구해주세요." })),
};
const text = (n) =>
  n.children.map((c) => (typeof c === "string" ? c : text(c))).join("");
async function mount({
  authenticated = false,
  storage = new Map(),
  request,
  lesson = content,
} = {}) {
  const original = Object.fromEntries(
    ["window", "localStorage", "IS_REACT_ACT_ENVIRONMENT"].map((k) => [
      k,
      globalThis[k],
    ]),
  );
  const local = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, v),
    removeItem: (k) => storage.delete(k),
  };
  globalThis.localStorage = local;
  globalThis.window = {
    addEventListener() {},
    removeEventListener() {},
    location: { reload() {} },
    print() {},
    confirm: () => true,
  };
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const m = new Module(file);
  m.paths = Module._nodeModulePaths(dirname(file));
  m.require = (id) =>
    id === "next/link"
      ? ({ children, ...props }) => React.createElement("a", props, children)
      : id === "@/lib/learning/client"
        ? { learningRequest: request }
        : id === "./reading-deck"
          ? readingModule.exports
        : id.startsWith("@/")
          ? require(resolve(root, id.slice(2)))
          : require(id);
  m._compile(code, file);
  let renderer;
  await act(async () => {
    renderer = create(
      React.createElement(m.exports.default, {
        content: lesson,
        releaseId: "release-test",
        version: 1,
        materials: [],
        initialProgress: null,
        authenticated,
      }),
      { createNodeMock: () => ({ focus() {} }) },
    );
  });
  return {
    renderer,
    storage,
    async answer() {
      await act(async () =>
        renderer.root
          .findByType("textarea")
          .props.onChange({
            target: { value: "관찰한 차이를 근거로 생각을 설명합니다." },
          }),
      );
    },
    async assess(phase) {
      for (const c of COMPETENCIES)
        await act(async () =>
          renderer.root
            .findAllByType("input")
            .find((i) => i.props.name === phase + c.id && i.props.value === 3)
            .props.onChange(),
        );
    },
    async next() {
      await act(async () =>
        renderer.root
          .findByType("form")
          .props.onSubmit({ preventDefault() {} }),
      );
    },
    alerts: () =>
      renderer.root.findAllByProps({ role: "alert" }).map(text).join(""),
    async close() {
      await act(async () => renderer.unmount());
      Object.assign(globalThis, original);
    },
  };
}
test("reading cards and sources survive draft validation and are usable in the concept stage", async () => {
  const deck = {
    version: 1,
    source: "원자료 12쪽",
    references: [{ title: "참고 문헌", url: "https://example.com/lesson", license: "" }],
    cards: [
      { kind: "concept", title: "같은 지구, 다른 지도", body: "둥근 지구를 종이에 펴요.", panels: [] },
      { kind: "compare", title: "자료를 열어 비교하기", body: "①과 ②를 살펴봐요.", panels: [
        { label: "적도 가까이", text: "원이 작아요.", visual: "map-equator" },
        { label: "극 가까이", text: "원이 커요.", visual: "map-pole" },
      ] },
    ],
  };
  assert.deepEqual(validateDraft({ ...content, readingDeck: deck }).readingDeck, deck);
  const ui = await mount({ lesson: { ...content, readingDeck: deck } });
  try {
    await ui.answer();
    await ui.next();
    const root = ui.renderer.root;
    const button = (label) => root.findAllByType("button").find((b) => text(b) === label);
    assert.equal(root.findByProps({ href: "https://example.com/lesson" }).type, "a");
    await act(async () => button("다음 카드 →").props.onClick());
    assert.equal(root.findAllByProps({ "data-visual": "map-pole" }).length, 0);
    await act(async () => button("② 자료 열기").props.onClick());
    assert.equal(root.findByProps({ "data-visual": "map-pole" }).type, "div");
    await act(async () => button("읽어주기").props.onClick());
    assert.ok(root.findAllByProps({ role: "status" }).some((node) => text(node).includes("한국어 음성")));
  } finally {
    await ui.close();
  }
});
test("learners finish all five stages without optional assessments and restore browser records", async () => {
  const ui = await mount();
  try {
    await ui.answer();
    await ui.next();
    for (let i = 1; i <= 4; i++) {
      await ui.answer();
      await ui.next();
    }
    assert.ok(
      ui.renderer.root
        .findAllByType("h2")
        .some((n) => text(n) === "나의 탐구 기록"),
    );
    const saved = JSON.parse(ui.storage.get("astera:learn:release-test:v2"));
    assert.equal(saved.completed, true);
    assert.deepEqual(saved.assessment.post, [0, 0, 0, 0]);
    await ui.close();
    const restored = await mount({ storage: ui.storage });
    try {
      assert.ok(
        restored.renderer.root
          .findAllByType("h2")
          .some((n) => text(n) === "나의 탐구 기록"),
      );
    } finally {
      await restored.close();
    }
  } catch (e) {
    await ui.close();
    throw e;
  }
});
test("member progress serializes revisions and keeps the current record on conflicts", async () => {
  const requests = [];
  let fail = false;
  const ui = await mount({
    authenticated: true,
    request: async (url, body) => {
      requests.push(body);
      if (fail)
        throw Object.assign(new Error("다른 기기에서 변경했어요."), {
          status: 409,
        });
      return { progress: { revision: body.revision + 1 } };
    },
  });
  try {
    await ui.answer();
    await ui.assess("pre");
    await ui.next();
    assert.equal(requests[0].revision, 0);
    await ui.answer();
    await ui.next();
    assert.equal(requests.at(-1).revision, 1);
    fail = true;
    await ui.answer();
    await ui.next();
    assert.match(ui.alerts(), /다른 기기/);
    assert.equal(
      ui.renderer.root.findByType("textarea").props.value,
      "관찰한 차이를 근거로 생각을 설명합니다.",
    );
  } finally {
    await ui.close();
  }
});
