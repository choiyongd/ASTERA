import test from "node:test";
import assert from "node:assert/strict";
import { splitPrompt, splitReading, splitAnswer, joinAnswer } from "../lib/learning/presentation.mjs";

test("existing lesson markers become optional sections while plain lessons stay intact", () => {
  for (const label of ["중학생 더 생각하기", "중학생 더 생각하기(선택)"]) {
    assert.deepEqual(splitPrompt(`기본 질문\n무엇을 보았나요?\n\n${label}\n두 자료를 비교하세요.`), {
      main: "무엇을 보았나요?", extra: "두 자료를 비교하세요.",
    });
  }
  assert.deepEqual(splitPrompt("자료 두 개를 비교하세요."), { main: "자료 두 개를 비교하세요.", extra: "" });
  assert.deepEqual(splitReading("먼저 읽기\n짧은 본문\n\n이어서 더 읽고 싶을 때 아래 두 자료를 읽어요.\n\n더 읽기 · A\n긴 본문"), {
    main: "먼저 읽기\n짧은 본문", extra: "더 읽기 · A\n긴 본문",
  });
});
test("optional answers round-trip through the existing answer record format", () => {
  assert.deepEqual(splitAnswer(joinAnswer("기본 답변이에요.", "두 자료를 비교했어요.")), {
    main: "기본 답변이에요.", extra: "두 자료를 비교했어요.",
  });
  assert.equal(joinAnswer("예전 답변 그대로", ""), "예전 답변 그대로");
});
