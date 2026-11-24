import test from "node:test";
import assert from "node:assert/strict";
import { applicationEvidence } from "../lib/learning/analytics.mjs";
import { PILOT_TOPICS, validatePilotObservation } from "../lib/learning/pilot.mjs";
import { reviewChecks, reviewCount, validateReviewChecks, requireReviewChecks } from "../lib/learning/review.mjs";
import { validateSourcePublication } from "../lib/learning/stations.mjs";

test("pilot observations use fixed anonymous fields and refer to six distinct drafts", () => {
  assert.equal(new Set(PILOT_TOPICS.map((topic) => topic.id)).size, 6);
  const observation = { band: "lower", minutes: 19, blocker: "concept", outcome: "prompted", revision: 3 };
  assert.deepEqual(validatePilotObservation({ ...observation, studentName: "제외되는 임의 값" }), observation);
  assert.throws(() => validatePilotObservation({ ...observation, band: ["lower"] }));
  assert.throws(() => validatePilotObservation({ ...observation, minutes: 91 }));
  assert.throws(() => validatePilotObservation({ ...observation, outcome: "어떤 답안" }));
});

test("checked editorial categories are necessary to finish the new review, with support for older reviewed drafts", () => {
  const partial = reviewChecks({ source: true, prompt: true });
  assert.equal(reviewCount(partial), 2);
  assert.deepEqual(validateReviewChecks(partial), partial);
  assert.throws(() => validateReviewChecks({ ...partial, visual: "true" }));
  assert.throws(() => requireReviewChecks(partial));
  const lesson = { source: {}, review_status: "reviewed", draft: { access: "member" } };
  assert.doesNotThrow(() => validateSourcePublication(lesson));
  assert.throws(() => validateSourcePublication({ ...lesson, review_checks: partial }), /검수 항목/);
  assert.doesNotThrow(() => validateSourcePublication({ ...lesson, review_checks: { ...partial, visual: true, vocabulary: true } }));
});

test("application history displays a learner’s latest completed evidence without inferring a score", () => {
  const record = {
    lesson_id: "lesson-a", title: "풍차", completed: true,
    answers: { question: "둘이 다르게 보았어요.", explore: "날개가 실제로 돌아갔어요.", apply: "산초의 말에 날개가 돌아가는 모습을 넣었어요." },
  };
  const older = { ...record, release_id: "previous", updated_at: "2026-11-20" };
  const latest = { ...record, release_id: "current", updated_at: "2026-11-21" };
  const underway = { ...record, completed: false, release_id: "new", updated_at: "2026-11-22" };
  assert.deepEqual(applicationEvidence([underway, older, latest]), [{
    releaseId: "current", title: "풍차", updatedAt: "2026-11-21",
    initial: record.answers.question, evidence: record.answers.explore, application: record.answers.apply,
  }]);
});
