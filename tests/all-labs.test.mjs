import test from "node:test";
import assert from "node:assert/strict";
import { ALL_LAB_TOPICS, FIRST_TOPICS, getLabForSlug } from "../lib/lab/catalog.mjs";
import { ACTIVITIES } from "../lib/lab/activities.mjs";
import { CATEGORIES, DESIGN_FEATURES, allocationResult, bridgeResult, defaults, designResult, exchangeResult, heatResult, modelProblem, normalizeInputs, recommendationResult, snapshot } from "../lib/lab/models.mjs";
import { COURSE_FIELDS, canCompleteCourse, courseRecord, courseStorageKey, freshCourse, recordExperiment, restoreCourse, validateCourseStep } from "../lib/lab/course.mjs";
import { EXPLORE_ITEMS } from "../lib/content.js";
import { filterLibrary } from "../lib/library-search.mjs";

const SECOND = {
  recommendation: { novelty: 3 }, sources: { source: "diary" }, allocation: { a: 2, b: 4, c: 6 }, story: { voice: "child" }, art: { artwork: "wave" }, dialogue: { proposal: "mixed" }, design: { ramp: true }, friend: { case: "answer" }, exchange: { method: "cycle" }, bridge: { structure: "truss" }, news: { source: "data" }, ethics: { response: "care" }, heat: { shade: 80 }, "art-context": { object: "cup" },
};
function completed(topic, activity) {
  let state = { ...freshCourse(topic, activity), ...Object.fromEntries(COURSE_FIELDS.map(key => [key, "관찰한 근거를 바탕으로 생각을 설명해요."])), concept: activity.check.answer };
  state = recordExperiment(state, activity).state;
  state = { ...state, inputs: { ...state.inputs, ...SECOND[activity.mode] } };
  state = recordExperiment(state, activity).state;
  return { ...state, evidence: [state.runs[1].key], step: 4, completed: true };
}

test("every library question has a unique, matching LAB; the first eight cover all eight universes", () => {
  assert.equal(ALL_LAB_TOPICS.length, 17); assert.equal(EXPLORE_ITEMS.length, 17);
  assert.equal(new Set(FIRST_TOPICS.map(t => t.universe)).size, 8);
  assert.equal(new Set(ALL_LAB_TOPICS.map(t => t.id)).size, 17);
  assert.equal(new Set(ALL_LAB_TOPICS.map(t => courseStorageKey(t.id))).size, 17);
  for (const item of EXPLORE_ITEMS) {
    const topic = getLabForSlug(item.slug);
    assert.equal(item.labId, topic.id); assert.equal(item.title, topic.title); assert.equal(item.code, topic.code); assert.equal(item.universe, topic.universe);
    assert.ok(topic.id === "science-001" || ACTIVITIES[topic.id]);
  }
});
test("topic search handles Korean titles, codes with or without spaces, and combined filters", () => {
  assert.deepEqual(filterLibrary(EXPLORE_ITEMS, { query: "알고리즘" }).map(t => t.labId), ["tech-001"]);
  assert.deepEqual(filterLibrary(EXPLORE_ITEMS, { query: " HISTORY001 " }).map(t => t.labId), ["history-001"]);
  assert.deepEqual(filterLibrary(EXPLORE_ITEMS, { query: "ai", universe: "TECH", age: "7-9세" }).map(t => t.labId), ["tech-002"]);
  assert.equal(filterLibrary(EXPLORE_ITEMS, { query: "알고리즘", universe: "ART" }).length, 0);
  assert.equal(filterLibrary(EXPLORE_ITEMS, { query: "없는주제" }).length, 0);
  assert.equal(filterLibrary(EXPLORE_ITEMS).length, 17);
});
test("recommendation keeps six distinct items and varies exposure without inventing taste measurements", () => {
  for (const category of CATEGORIES) for (let novelty = 0; novelty <= 3; novelty++) {
    const r = recommendationResult({ interest: category.id, novelty });
    assert.equal(r.items.length, 6); assert.equal(new Set(r.items.map(i => i.id)).size, 6);
    assert.equal(r.familiar, 6 - novelty); assert.equal(r.diversity, 1 + novelty);
  }
});
test("resource distribution preserves budget and reports need, shortage, and surplus separately", () => {
  assert.deepEqual(allocationResult({ a: 4, b: 4, c: 4 }).rows.map(r => [r.short, r.extra]), [[0, 2], [0, 0], [2, 0]]);
  assert.ok(allocationResult({ a: 2, b: 4, c: 6 }).rows.every(r => !r.short && !r.extra));
  for (let a = 0; a <= 12; a++) for (let b = 0; b <= 12 - a; b++) {
    const v = { a, b, c: 12 - a - b }; assert.equal(modelProblem("allocation", v), ""); assert.equal(allocationResult(v).total, 12);
  }
  assert.ok(modelProblem("allocation", { a: 12, b: 12, c: 12 }));
  assert.ok(modelProblem("allocation", { a: 0, b: 0, c: 0 }));
});
test("all design feature combinations enforce the budget and identify unmet user conditions", () => {
  for (let mask = 0; mask < 32; mask++) for (const budget of [10, 12]) {
    const v = Object.fromEntries(DESIGN_FEATURES.map((f, i) => [f.id, !!(mask & (1 << i))])); v.budget = budget;
    const r = designResult(v); assert.equal(!!modelProblem("design", v), r.cost > budget);
    for (const u of r.users) assert.deepEqual(u.missing, u.needs.filter(id => !v[id]));
  }
  const all = { wide: true, ramp: true, contrast: true, labels: true, auto: true, budget: 10 };
  assert.equal(designResult(all).cost, 12); assert.ok(modelProblem("design", all));
  assert.equal(modelProblem("design", { ...all, budget: 12 }), "");
});
test("bridge outcomes respond to length, reinforcement, and load in the declared rule model", () => {
  for (const structure of ["beam", "truss", "arch"]) {
    const basic = { structure, span: 3, load: 5, reinforce: false };
    assert.ok(bridgeResult({ ...basic, span: 6 }).limit <= bridgeResult(basic).limit);
    assert.ok(bridgeResult({ ...basic, reinforce: true }).limit >= bridgeResult(basic).limit);
    for (let load = 1; load <= 12; load++) { const r = bridgeResult({ ...basic, load }); assert.equal(r.pass, load <= r.limit); assert.ok(r.cost <= 12); }
  }
});
test("heat model isolates condition effects, bounds its index, and does not report Celsius", () => {
  const base = { green: 20, shade: 20, traffic: 70 }; const r = heatResult(base);
  assert.equal(r.index, 73); assert.ok(heatResult({ ...base, green: 80 }).index < r.index);
  assert.ok(heatResult({ ...base, shade: 80 }).index < r.index); assert.ok(heatResult({ ...base, traffic: 100 }).index > r.index);
  for (const green of [0, 50, 100]) for (const shade of [0, 50, 100]) for (const traffic of [0, 50, 100]) { const n = heatResult({ green, shade, traffic }).index; assert.ok(n >= 0 && n <= 100); }
});
test("exchange distinguishes paired barter, an agreed cycle, and token acceptance", () => {
  assert.equal(exchangeResult({ method: "barter", agreement: "all" }).fulfilled, 0);
  assert.equal(exchangeResult({ method: "cycle", agreement: "all" }).fulfilled, 3);
  assert.equal(exchangeResult({ method: "token", agreement: "all" }).fulfilled, 3);
  assert.equal(exchangeResult({ method: "token", agreement: "partial" }).fulfilled, 2);
});

for (const topic of ALL_LAB_TOPICS.filter(t => t.id !== "science-001")) {
  const activity = ACTIVITIES[topic.id];
  test(`${topic.code}: full inquiry validates, survives reload, and preserves experiment-time predictions`, () => {
    const state = completed(topic, activity); assert.ok(canCompleteCourse(state, activity));
    const restored = restoreCourse(JSON.parse(JSON.stringify(state)), topic, activity);
    assert.deepEqual(restored, state);
    assert.ok(validateCourseStep({ ...state, concept: "wrong" }, activity, 1));
    assert.ok(validateCourseStep({ ...state, evidence: ["fake"] }, activity, 2));
    assert.ok(validateCourseStep({ ...state, finalReason: "" }, activity, 4));
    const r = courseRecord({ ...state, prediction: "나중에 예측을 고쳐도 첫 기록의 예측은 그대로 남아요." }, topic, activity);
    assert.equal(r.runs[0].predictionAtRun, state.prediction); assert.equal(r.question, topic.title); assert.equal(r.evidence.length, 1);
    assert.ok(state.runs.every(run => run.label && run.observations.length && run.limit));
  });
}
test("comparison requires two real experiments and rejects duplicate conditions and over-budget tests", () => {
  const topic = ALL_LAB_TOPICS.find(t => t.id === "economy-001"), activity = ACTIVITIES[topic.id];
  let state = freshCourse(topic, activity); assert.ok(recordExperiment(state, activity).error);
  state.prediction = "필요량이 다른 모둠의 부족량이 달라질 것이다.";
  state = recordExperiment(state, activity).state;
  assert.equal(recordExperiment(state, activity).state.runs.length, 1);
  assert.equal(recordExperiment({ ...state, inputs: { a: 8, b: 8, c: 8 } }, activity).state.runs.length, 1);
  assert.ok(validateCourseStep({ ...state, runs: [state.runs[0], state.runs[0]] }, activity, 2));
});
test("record comparison cannot be completed by switching only the lens of one source, voice, or artwork", () => {
  for (const id of ["history-001", "literature-001", "art-001"]) {
    const topic = ALL_LAB_TOPICS.find(t => t.id === id), activity = ACTIVITIES[id];
    const state = completed(topic, activity), first = state.runs[0].inputs;
    const second = { ...first, lens: { sources: "missing", story: "unknown", art: "context" }[activity.mode] };
    const s = { ...state, runs: [snapshot(activity.mode, first), snapshot(activity.mode, second)] }; s.evidence = [s.runs[0].key];
    assert.ok(validateCourseStep(s, activity, 2));
  }
  const topic = ALL_LAB_TOPICS.find(t => t.id === "tech-005"), activity = ACTIVITIES[topic.id];
  const s = completed(topic, activity); s.runs[1] = snapshot("news", { source: "date" }); s.evidence = [s.runs[0].key];
  assert.ok(validateCourseStep(s, activity, 2));
});
test("restoring corrupt records recomputes results, removes forged evidence, and prevents skipped completion", () => {
  const topic = ALL_LAB_TOPICS.find(t => t.id === "tech-001"), activity = ACTIVITIES[topic.id];
  const good = completed(topic, activity);
  const corrupt = { ...good, runs: [...good.runs, { inputs: {}, observations: ["fake"] }, good.runs[0]], evidence: ["forged", good.runs[0].key], finalReason: "", completed: true };
  corrupt.runs[0] = { ...corrupt.runs[0], observations: ["false measurement"], key: "tampered" };
  const r = restoreCourse(corrupt, topic, activity);
  assert.equal(r.runs.length, 2); assert.deepEqual(r.runs[0].observations, snapshot(activity.mode, good.runs[0].inputs).observations);
  assert.deepEqual(r.evidence, [good.runs[0].key]); assert.equal(r.completed, false);
  assert.deepEqual(restoreCourse({ ...good, labId: "other" }, topic, activity), freshCourse(topic, activity));
  assert.deepEqual(restoreCourse({ ...good, version: 999 }, topic, activity), freshCourse(topic, activity));
  assert.equal(restoreCourse({ step: 4, completed: true, version: 1, labId: topic.id }, topic, activity).step, 0);
  assert.deepEqual(normalizeInputs("design", { wide: "false", budget: 11, auto: true, dangerous: true }), { ...defaults("design"), auto: true });
});
