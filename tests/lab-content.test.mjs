import { lessonDraftFromLab } from "../lib/lab/learning-draft.mjs";
import { validateDraft } from "../lib/learning/domain.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { ALL_LAB_TOPICS } from "../lib/lab/catalog.mjs";
import { ACTIVITIES } from "../lib/lab/activities.mjs";
import {
  defaultLabContent,
  validateLabContent,
  applyLabContent,
} from "../lib/lab/content.mjs";
test("every existing LAB has a complete editable copy draft without changing model bindings", () => {
  for (const topic of ALL_LAB_TOPICS) {
    const original = defaultLabContent(topic.id),
      valid = validateLabContent(original, topic.id);
    assert.deepEqual(valid, original);
    valid.question = "관리자가 수정한 핵심 질문";
    valid.fields.initial.label = "새롭게 생각해볼 질문은?";
    const resolved = applyLabContent(topic, ACTIVITIES[topic.id], valid);
    assert.equal(resolved.topic.title, valid.question);
    if (topic.id !== "science-001") {
      assert.equal(resolved.activity.mode, ACTIVITIES[topic.id].mode);
      assert.equal(
        resolved.activity.check.answer,
        ACTIVITIES[topic.id].check.answer,
      );
    }
    assert.equal(defaultLabContent(topic.id).question, topic.title);
  }
});
test("LAB copy validation rejects missing stages, broken answer IDs and oversized or nontext prompts", () => {
  const id = "tech-001",
    base = defaultLabContent(id);
  for (const change of [
    (c) => {
      c.steps.pop();
    },
    (c) => {
      c.fields.initial.label = 7;
    },
    (c) => {
      c.check.options[0].id = "other";
    },
    (c) => {
      c.reading = "x".repeat(12001);
    },
    (c) => {
      c.concepts[0].body = "";
    },
  ]) {
    const copy = structuredClone(base);
    change(copy);
    assert.throws(() => validateLabContent(copy, id));
  }
  const copy = { ...base, mode: "injected", answer: "wrong", extra: "discard" };
  assert.equal("mode" in validateLabContent(copy, id), false);
  assert.throws(() => defaultLabContent("unknown-lab"));
});

test("all LABs prepare valid linked-course drafts, including copy that needs shortening", () => {
  for (const topic of ALL_LAB_TOPICS) {
    const copy = defaultLabContent(topic.id);
    const first = lessonDraftFromLab(topic, copy);
    assert.doesNotThrow(() => validateDraft(first.draft));
    copy.question = "긴".repeat(200);
    copy.reading = "긴".repeat(12000);
    copy.intro = "긴".repeat(1000);
    const long = lessonDraftFromLab(topic, copy);
    assert.ok(long.shortened);
    assert.doesNotThrow(() => validateDraft(long.draft));
  }
});
