import test from "node:test";
import assert from "node:assert/strict";
import { newDraft } from "../lib/learning/domain.mjs";
import {
  validateStationPack,
  validateStation,
  validateSourcePublication,
} from "../lib/learning/stations.mjs";
import { stationUuid } from "../lib/learning/station-ids.mjs";
export const stationFixture = (number = 91) => ({
  stationId: `V2-문학-${number}`,
  category: "문학",
  volume: 1,
  pages: [21, 22, 23],
  filename: "검증용.pdf",
  hash: "a".repeat(64),
  originalStudent: "핵심 질문과 학생 활동 원문",
  teacherNotes: "관리자 전용 예상 답변",
  sourceReading: "원문 출처와 비영리 이용 조건",
  draft: {
    ...newDraft(),
    title: "검증용 정거장",
    slug: `station-test-${number}`,
    summary: "두 시점을 비교해요.",
    goals: ["근거를 설명해요."],
    stages: newDraft().stages.map((s) => ({
      ...s,
      body: "자료를 읽고 근거를 기록해요.",
    })),
  },
});
test("import rejects duplicate station identifiers and malformed provenance before any write", () => {
  const entry = stationFixture();
  assert.equal(validateStation(entry).draft.stages.length, 5);
  assert.throws(
    () =>
      validateStationPack({
        format: "astera-stations/v1",
        entries: [entry, entry],
      }),
    /중복/,
  );
  for (const bad of [
    { pages: [0] },
    { hash: "other" },
    { category: "unknown" },
    { teacherNotes: "a".repeat(18001) },
    { draft: { ...entry.draft, access: "public" } },
  ])
    assert.throws(() => validateStation({ ...entry, ...bad }));
  assert.equal(stationUuid(entry.stationId), stationUuid(entry.stationId));
  assert.notEqual(
    stationUuid(entry.stationId),
    stationUuid(entry.stationId + ":source"),
  );
});
test("source courses require explicit review and cannot enter the paid scope", () => {
  const lesson = { source: {}, draft: stationFixture().draft };
  assert.throws(() => validateSourcePublication(lesson), /검토/);
  assert.doesNotThrow(() =>
    validateSourcePublication({ ...lesson, review_status: "reviewed" }),
  );
  assert.throws(
    () =>
      validateSourcePublication({
        ...lesson,
        review_status: "reviewed",
        draft: { ...lesson.draft, access: "subscriber" },
      }),
    /비영리/,
  );
});
