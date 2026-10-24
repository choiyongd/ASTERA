import test from "node:test";
import assert from "node:assert/strict";
import { learningAnalytics } from "../lib/learning/analytics.mjs";
import { validateSitePage } from "../lib/learning/site-pages.mjs";
test("dashboard derives current completion and latest-topic self-assessment without invented gains", () => {
  const catalog = [
    { lesson_id: "a", release_id: "r2", universe: "SCIENCE" },
    { lesson_id: "b", release_id: "r3", universe: "SCIENCE" },
    { lesson_id: "c", release_id: "r4", universe: "ART" },
  ];
  const records = [
    {
      lesson_id: "a",
      release_id: "r1",
      completed: true,
      updated_at: "2026-10-23T16:00:00Z",
      assessment: { pre: [1, 1, 1, 1], post: [5, 5, 5, 5] },
    },
    {
      lesson_id: "a",
      release_id: "r2",
      completed: true,
      updated_at: "2026-10-24T16:00:00Z",
      assessment: { pre: [3, 2, 4, 2], post: [2, 4, 4, 3] },
    },
    {
      lesson_id: "b",
      release_id: "r3",
      completed: false,
      updated_at: "2026-10-24T15:00:00Z",
    },
  ];
  const a = learningAnalytics(catalog, records);
  assert.equal(a.totalCompleted, 1);
  assert.equal(a.inProgress, 1);
  assert.equal(a.universes.find((u) => u.universe === "SCIENCE").percent, 50);
  assert.equal(a.universes.find((u) => u.universe === "ART").percent, 0);
  assert.equal(a.assessedCount, 1);
  assert.equal(a.competencies[0].change, -1);
  assert.equal(a.timeline[0].date, "2026-10-25");
  const empty = learningAnalytics(catalog, []);
  assert.equal(empty.competencies[0].pre, null);
  assert.deepEqual(empty.timeline, []);
});
test("page publishing requires a real address and complete text sections", () => {
  const page = {
    title: "이용 가이드",
    slug: "learning-guide",
    summary: "학습을 시작하는 방법",
    sections: [
      { heading: "첫 질문", body: "궁금한 주제를 선택하고 시작하세요." },
    ],
  };
  assert.deepEqual(validateSitePage(page, true), page);
  assert.throws(() => validateSitePage({ ...page, slug: "../admin" }, true));
  assert.throws(() =>
    validateSitePage({ ...page, sections: [{ heading: "", body: "" }] }, true),
  );
});
