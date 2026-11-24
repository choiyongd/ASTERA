export const REVIEW_CHECKS = [
  { id: "source", label: "원문·출처", detail: "원자료의 뜻을 유지했고, 문헌과 이용 조건을 확인했어요." },
  { id: "vocabulary", label: "낱말 풀이", detail: "어려운 낱말을 열 수 있고, 뜻과 예문을 초등학생이 이해할 수 있어요." },
  { id: "visual", label: "그림·카드", detail: "그림과 카드 순서가 답에 필요한 단서를 찾는 데 도움이 돼요." },
  { id: "prompt", label: "발문·응용", detail: "학생이 해야 할 일이 분명하고, 배운 개념을 새 상황에 적용해 볼 수 있어요." },
];

export function reviewChecks(input = {}) {
  return Object.fromEntries(REVIEW_CHECKS.map(({ id }) => [id, input?.[id] === true]));
}

export function reviewCount(input) {
  return REVIEW_CHECKS.filter(({ id }) => input?.[id] === true).length;
}

export function validateReviewChecks(input) {
  if (!input || Object.keys(input).length !== REVIEW_CHECKS.length ||
      REVIEW_CHECKS.some(({ id }) => typeof input[id] !== "boolean"))
    throw new Error("네 가지 검수 항목을 확인해주세요.");
  return reviewChecks(input);
}

export function requireReviewChecks(input) {
  if (reviewCount(input) !== REVIEW_CHECKS.length)
    throw new Error("네 가지 검수 항목을 확인한 후 검토 완료를 저장해주세요.");
}
