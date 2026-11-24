export const PILOT_TOPICS = [
  { id: "127003f5-62cb-555f-8ee2-40a0433cbca0", focus: "관찰과 해석", criterion: "산초의 말에 직접 볼 수 있는 단서와 자기 판단을 구분해 담았다." },
  { id: "9c07fff0-85ef-511e-803b-0de265ef8568", focus: "지도 읽기", criterion: "지도에서 커 보이는 것과 실제 넓이를 구분하고, 확인할 자료를 하나 댔다." },
  { id: "ae14c316-32a3-55d4-887a-565340819cd0", focus: "그림으로 수학 설명하기", criterion: "변이 더 많을 때 원과 선 사이의 빈 곳이 어떻게 달라지는지 그림을 근거로 설명했다." },
  { id: "9d1bf790-9c1b-552f-8981-007e07579729", focus: "작품과 관객", criterion: "보기만 하는 경우와 직접 접는 경우를 비교해, 관객이 바꿀 수 있는 점을 하나 설명했다." },
  { id: "014125b6-e75e-5ff4-8c2a-b55cac62054b", focus: "규칙을 새 상황에 쓰기", criterion: "게임 조건에 맞는 규칙을 고르고, 다른 규칙이 맞지 않는 입력 한 가지를 들었다." },
  { id: "232fdaee-0800-544d-8315-1d23e7e474da", focus: "공정한 규칙 만들기", criterion: "발표 기회가 없던 학생도 참여하도록 하는 장치를 규칙에 넣고 그 이유를 설명했다." },
];

export const PILOT_BANDS = { lower: "초등 3–4학년", upper: "초등 5–6학년" };
export const PILOT_BLOCKERS = { none: "막힌 곳 없음", question: "질문", concept: "개념", explore: "탐색", apply: "응용", reflect: "성찰" };
export const PILOT_OUTCOMES = {
  independent: "스스로 기준을 충족했어요",
  prompted: "힌트를 받고 기준을 충족했어요",
  not_yet: "아직 기준에 이르지 못했어요",
  not_observed: "응용까지 관찰하지 못했어요",
};

const known = (values, key) => typeof key === "string" && Object.hasOwn(values, key);

export function validatePilotObservation(input) {
  if (!input || !known(PILOT_BANDS, input.band) ||
      !known(PILOT_BLOCKERS, input.blocker) || !known(PILOT_OUTCOMES, input.outcome) ||
      !Number.isInteger(input.minutes) || input.minutes < 1 || input.minutes > 90 ||
      !Number.isInteger(input.revision) || input.revision < 1)
    throw new Error("학년군, 소요 시간, 막힌 단계, 적용 결과를 확인해주세요.");
  return { band: input.band, minutes: input.minutes, blocker: input.blocker, outcome: input.outcome, revision: input.revision };
}
