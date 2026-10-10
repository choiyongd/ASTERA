import test from "node:test";
import assert from "node:assert/strict";
import { BUDGET, PLANETS, INVESTIGATIONS, buildRecord, canComplete, freshMission, observationDetails, observe, restoreMission, spentBudget, validateStep } from "../lib/lab/science.mjs";

function finishedMission() {
  let state = { ...freshMission(), initial: "likely", initialReason: "우주에는 많은 행성이 있기 때문이다.", concept: "clue" };
  state = observe(state, "luma", "water").state;
  state = observe(state, "luma", "chemistry").state;
  return { ...state, step: 4, priority: "luma", evidence: ["luma:water"], priorityReason: "수증기를 찾아 액체 물을 더 확인하고 싶다.", uncertainty: "수증기가 바다를 뜻하지는 않는다.", adaptation: "shell", adaptationReason: "환경이 변하면 보호막이 도움이 될 수 있다.", final: "unsure", finalReason: "산소도 생명 없이 만들어질 수 있어 아직 모른다.", nextQuestion: "어떤 관찰로 다른 설명을 확인할까?", completed: true };
}

test("one purchase is charged once, including a repeated click", () => {
  const state = observe(freshMission(), "luma", "chemistry").state;
  assert.equal(spentBudget(state), 2);
  const repeated = observe(state, "luma", "chemistry");
  assert.equal(repeated.error, "already-or-invalid");
  assert.strictEqual(repeated.state, state);
  assert.equal(spentBudget(repeated.state), 2);
});

test("every purchase sequence respects the six-token limit", () => {
  let count = 0;
  function walk(state) {
    assert.ok(spentBudget(state) <= BUDGET);
    assert.equal(new Set(state.observations).size, state.observations.length);
    count += 1;
    for (const planet of PLANETS) for (const investigation of INVESTIGATIONS) {
      const result = observe(state, planet.id, investigation.id);
      if (!result.error) walk(result.state);
      else assert.strictEqual(result.state, state);
    }
  }
  walk(freshMission());
  assert.ok(count > 1000);
});

test("invalid observations do not spend tokens or appear in records", () => {
  const state = freshMission();
  assert.strictEqual(observe(state, "unknown", "water").state, state);
  assert.strictEqual(observe(state, "luma", "unknown").state, state);
  assert.equal(observationDetails("luma:water:fake"), null);
  assert.equal(observationDetails(null), null);
});

test("restoring corrupted or stale saved data safely returns a fresh mission", () => {
  for (const raw of [null, [], "text", { version: 9 }, { version: 1, observations: "invalid", step: 4, completed: true }]) {
    assert.deepEqual(restoreMission(raw), freshMission());
  }
});

test("saved purchases are replayed and cannot manufacture tokens or exceed the budget", () => {
  const restored = restoreMission({ version: 1, observations: ["luma:chemistry", "luma:chemistry", "nox:chemistry", "pyra:chemistry", "luma:water", "invalid"], tokens: 999, evidence: ["luma:water", "nox:chemistry", "nox:chemistry"], step: 4, completed: true });
  assert.equal(spentBudget(restored), 6);
  assert.deepEqual(restored.observations, ["luma:chemistry", "nox:chemistry", "pyra:chemistry"]);
  assert.deepEqual(restored.evidence, ["nox:chemistry"]);
  assert.equal(restored.step, 0);
  assert.equal(restored.completed, false);
});

test("a priority requires an observed clue from the selected planet and written uncertainty", () => {
  const valid = finishedMission();
  assert.equal(validateStep(valid, 2), "");
  assert.notEqual(validateStep({ ...valid, priority: "nox" }, 2), "");
  assert.notEqual(validateStep({ ...valid, evidence: [] }, 2), "");
  assert.notEqual(validateStep({ ...valid, uncertainty: "  " }, 2), "");
});

test("an uncertain conclusion can complete; missing reasoning or next question cannot", () => {
  const valid = finishedMission();
  assert.equal(canComplete(valid), true);
  assert.equal(canComplete({ ...valid, finalReason: " " }), false);
  assert.equal(canComplete({ ...valid, nextQuestion: "" }), false);
  assert.equal(canComplete({ ...valid, initialReason: "" }), false);
  assert.equal(canComplete({ ...valid, adaptationReason: "" }), false);
});

test("a completed record survives reload with the same budget and evidence", () => {
  const state = finishedMission();
  const restored = restoreMission(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored, state);
  const record = buildRecord(restored);
  assert.equal(record.completed, true);
  assert.equal(record.tokensUsed, 3);
  assert.equal(record.observations.length, 2);
  assert.equal(record.priority.planet, "루마");
  assert.equal(record.final.answer, "아직 판단하기 어려워요");
  assert.match(record.dataNote, /가상/);
});

test("restoration returns to the first incomplete prerequisite and limits saved text", () => {
  const restored = restoreMission({ ...finishedMission(), initialReason: "", step: 4, completed: true, finalReason: "가".repeat(3000) });
  assert.equal(restored.step, 0);
  assert.equal(restored.completed, false);
  assert.equal(restored.finalReason.length, 2000);
});
