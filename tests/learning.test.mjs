import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  newDraft,
  validateDraft,
  validateWebUrl,
  validateUpload,
  normalizeProgress,
  isReadyFile,
  canAccess,
  STAGES,
} from "../lib/learning/domain.mjs";

test("access boundaries distinguish visitors, accounts, active and expired memberships", () => {
  const now = Date.parse("2026-10-24T00:00:00Z"),
    user = { id: "u" };
  assert.equal(canAccess("public", null, null, now), true);
  assert.equal(canAccess("member", null, null, now), false);
  assert.equal(canAccess("member", user, null, now), true);
  assert.equal(
    canAccess(
      "subscriber",
      user,
      { is_member: true, membership_expires_at: "2026-10-23" },
      now,
    ),
    false,
  );
  assert.equal(
    canAccess(
      "subscriber",
      user,
      { is_member: true, membership_expires_at: "2026-10-25" },
      now,
    ),
    true,
  );
  assert.equal(
    canAccess(
      "subscriber",
      user,
      { is_member: false, membership_expires_at: "2027-01-01" },
      now,
    ),
    false,
  );
  assert.equal(canAccess("anything", user, null, now), false);
});
test("publishing requires actual material and complete learning instructions", () => {
  const draft = { ...newDraft(), title: "내 첫 번째 질문" };
  assert.equal(validateDraft(draft).title, draft.title);
  assert.throws(() => validateDraft(draft, true));
  const complete = {
    ...draft,
    slug: "first-question",
    summary: "비교하며 배우는 질문",
    goals: ["두 자료를 비교한다."],
    materials: [{ id: randomUUID(), label: "실제 자료", stage: 2 }],
    stages: STAGES.map((s) => ({
      ...s,
      body: "이 단계에서 실제 자료를 비교하고 생각을 남겨보세요.",
    })),
  };
  assert.equal(
    validateDraft(complete, true).stages.reduce((n, s) => n + s.minutes, 0),
    20,
  );
  assert.throws(() =>
    validateDraft(
      {
        ...complete,
        materials: [...complete.materials, ...complete.materials],
      },
      true,
    ),
  );
});
test("web apps reject executable URLs, internal addresses and unregistered LAB paths", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://example.com",
    "https://localhost",
    "https://192.168.1.5",
    "https://[::1]",
    "https://user:pass@example.com",
    "https://example.com:8080",
    "/lab/not-a-lab",
    "//evil.test",
    "/lab/science-001?x=1",
  ]) {
    assert.throws(() => validateWebUrl(url), url);
  }
  assert.equal(validateWebUrl("/lab/science-001"), "/lab/science-001");
  assert.equal(
    validateWebUrl("https://example.com/activity"),
    "https://example.com/activity",
  );
});
test("uploads check file kind, size and actual header rather than just its name", () => {
  const id = randomUUID();
  assert.equal(
    validateUpload({ lessonId: id, kind: "pdf", name: "학습.pdf", size: 100 })
      .mime,
    "application/pdf",
  );
  assert.throws(() =>
    validateUpload({
      lessonId: id,
      kind: "html",
      name: "app.html",
      size: 2097153,
    }),
  );
  assert.throws(() =>
    validateUpload({ lessonId: id, kind: "pdf", name: "app.html", size: 100 }),
  );
  assert.equal(
    isReadyFile("pdf", new TextEncoder().encode("%PDF-1.7 test")),
    true,
  );
  assert.equal(
    isReadyFile("pdf", new TextEncoder().encode("<script>alert(1)</script>")),
    false,
  );
});
test("completion and stage advances cannot bypass unanswered stages", () => {
  const answers = Object.fromEntries(STAGES.map((s) => [s.id, ""]));
  assert.throws(() =>
    normalizeProgress({
      answers,
      assessment: { pre: [2, 2, 2, 2], post: [3, 3, 3, 3] },
      step: 4,
      completed: true,
    }),
  );
  assert.throws(() =>
    normalizeProgress({ answers, step: 1, completed: false }),
  );
  for (const s of STAGES) answers[s.id] = "내가 관찰한 근거를 설명합니다.";
  assert.equal(
    normalizeProgress({
      answers,
      assessment: { pre: [2, 2, 2, 2], post: [3, 3, 3, 3] },
      step: 4,
      completed: true,
    }).completed,
    true,
  );
});
