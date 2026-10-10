export const STORAGE_KEY = "astera_lab_science_001_v1";
export const BUDGET = 6;
export const QUESTION = "우주에 우리만 살고 있을까?";
export const ANSWERS = [
  { id: "likely", label: "다른 생명도 있을 것 같아요" },
  { id: "unlikely", label: "우리만 있을 것 같아요" },
  { id: "unsure", label: "아직 판단하기 어려워요" },
];
export const PLANETS = [
  { id: "luma", name: "루마", letter: "A", kind: "바다 후보 행성", temperature: "12°C ± 25°C", hint: "푸른 표면이 보여요. 그것이 바다인지는 아직 몰라요.", tone: "blue" },
  { id: "nox", name: "녹스", letter: "B", kind: "얼음으로 덮인 행성", temperature: "−85°C ± 20°C", hint: "표면은 얼음이에요. 얼음 아래는 어떨까요?", tone: "ice" },
  { id: "pyra", name: "피라", letter: "C", kind: "화산 활동 행성", temperature: "120°C ± 35°C", hint: "표면은 뜨겁지만, 지하 환경은 다를 수 있어요.", tone: "fire" },
];
export const INVESTIGATIONS = [
  { id: "water", name: "물의 상태", cost: 1, icon: "water", question: "액체 물이 있을 수 있는 곳은 어디일까?" },
  { id: "energy", name: "에너지원", cost: 1, icon: "energy", question: "생명 활동에 쓸 에너지는 어디에서 올까?" },
  { id: "chemistry", name: "화학 단서", cost: 2, icon: "chemistry", question: "이 물질은 생명 없이도 만들어질까?" },
  { id: "repeat", name: "다시 관찰", cost: 2, icon: "repeat", question: "다른 때에 관찰해도 같은 단서가 보일까?" },
];

// All planets, measurements and observations below are fictional teaching data.
// They model evidence interpretation, not actual exoplanet measurements or life probabilities.
export const FINDINGS = {
  luma: {
    water: { title: "대기에서 수증기 신호", detail: "수증기가 있는 듯한 자료를 얻었어요. 표면의 액체 물을 직접 확인한 것은 아니에요.", limit: "구름과 지표를 구분하는 추가 관찰이 필요해요." },
    energy: { title: "별에서 비교적 안정된 에너지", detail: "별빛의 변화가 작아요. 생명이 사용할 수 있는 에너지원의 후보예요.", limit: "에너지가 있다고 생명이 있다는 뜻은 아니에요." },
    chemistry: { title: "산소로 해석할 수 있는 신호", detail: "빛을 분석하니 산소의 흔적과 비슷한 모양이 보여요.", limit: "별빛에 의해 물이 분해되어도 산소가 생길 수 있어요." },
    repeat: { title: "다른 날에도 비슷한 신호", detail: "같은 장비로 다시 관찰했을 때도 비슷한 산소 신호가 보여요.", limit: "같은 장비의 반복만으로 장비 오류를 모두 제외할 수 없어요." },
  },
  nox: {
    water: { title: "얼음 아래 액체층의 후보", detail: "가상 탐사선의 자료가 얼음 아래 액체층이 있다는 설명과 잘 맞아요.", limit: "액체층의 깊이와 성분은 아직 확인하지 못했어요." },
    energy: { title: "지하에서 나오는 열", detail: "표면 아래에 열이 나는 곳이 있을 수 있어요. 별빛이 약해도 다른 에너지원이 있을 수 있죠.", limit: "생명에 쓸 수 있는 에너지의 양은 더 조사해야 해요." },
    chemistry: { title: "탄소를 포함한 물질", detail: "탄소를 포함한 물질의 흔적으로 해석할 수 있어요.", limit: "이런 물질은 생명 없이 화학 반응으로도 만들어져요." },
    repeat: { title: "관찰마다 다른 신호", detail: "신호의 세기가 일정하지 않아요. 주변 잡음이나 변화하는 환경을 함께 살펴야 해요.", limit: "자료가 불확실하다는 것은 생명이 없다는 증거도 아니에요." },
  },
  pyra: {
    water: { title: "표면의 액체 물 단서는 부족", detail: "현재의 표면 온도 추정과 압력 자료로는 표면에 액체 물이 유지된다고 보기 어려워요.", limit: "지하의 다른 온도·압력 환경은 별도로 조사해야 해요." },
    energy: { title: "활발한 화산 에너지", detail: "지하의 열과 화학 반응이 에너지원의 후보가 될 수 있어요.", limit: "생명에게 너무 뜨거운 곳일 수도 있어요. 지역별 환경이 중요해요." },
    chemistry: { title: "메탄으로 해석할 수 있는 신호", detail: "메탄의 흔적과 비슷한 모양이 보여요. 어떤 생명은 메탄을 만들기도 해요.", limit: "암석과 물의 반응 같은 비생물 과정으로도 메탄이 생길 수 있어요." },
    repeat: { title: "화산 활동과 함께 변하는 신호", detail: "관찰한 메탄 후보 신호가 화산 활동과 함께 변해요.", limit: "지질 활동이라는 다른 설명을 비교해야 해요. 생명 존재 여부를 확정할 수 없어요." },
  },
};
export const ADAPTATIONS = [
  { id: "shell", name: "환경을 견디는 보호막", detail: "몸을 감싸는 막이 있어요." },
  { id: "chemical", name: "화학 반응을 쓰는 몸", detail: "빛 대신 주변 물질로 에너지를 얻어요." },
  { id: "sensor", name: "변화를 느끼는 감각", detail: "어둠에서도 주변의 변화를 알아차려요." },
];
export const SOURCES = [
  { title: "NASA · 생명 흔적과 다른 설명", url: "https://astrobiology.nasa.gov/news/false-positives-false-negatives-the-world-of-distant-biosignatures-attracts-and-confounds/" },
  { title: "NASA GISS · 생명 흔적의 오해를 검토하는 방법", url: "https://www.giss.nasa.gov/pubs/abs/ha09810h.html" },
];

export function freshMission() {
  return { version: 1, step: 0, initial: "", initialReason: "", concept: "", selectedPlanet: "luma", observations: [], priority: "", evidence: [], priorityReason: "", uncertainty: "", adaptation: "", adaptationReason: "", final: "", finalReason: "", nextQuestion: "", completed: false };
}
const validPlanet = (id) => PLANETS.some((p) => p.id === id);
const validAnswer = (id) => ANSWERS.some((a) => a.id === id);
export const observationKey = (planet, investigation) => `${planet}:${investigation}`;
export function observationDetails(key) {
  if (typeof key !== "string" || key.split(":").length !== 2) return null;
  const [planetId, investigationId] = key.split(":");
  const planet = PLANETS.find((p) => p.id === planetId);
  const investigation = INVESTIGATIONS.find((i) => i.id === investigationId);
  return planet && investigation ? { key, planet, investigation, ...FINDINGS[planetId][investigationId] } : null;
}
export function spentBudget(state) {
  return state.observations.reduce((sum, key) => sum + (observationDetails(key)?.investigation.cost ?? 0), 0);
}
export function observe(state, planetId, investigationId) {
  const key = observationKey(planetId, investigationId);
  const observation = observationDetails(key);
  if (!observation || state.observations.includes(key)) return { state, error: "already-or-invalid" };
  if (spentBudget(state) + observation.investigation.cost > BUDGET) return { state, error: "budget" };
  return { state: { ...state, observations: [...state.observations, key], completed: false }, error: null };
}
export function validateStep(state, step = state.step) {
  const text = (value) => typeof value === "string" && value.trim().length > 0;
  if (step === 0) return validAnswer(state.initial) && text(state.initialReason) ? "" : "지금의 생각을 고르고, 그렇게 생각한 이유를 한 문장 적어주세요.";
  if (step === 1) return state.concept === "clue" ? "" : "물의 단서가 무엇을 말해주는지 먼저 생각해보세요.";
  if (step === 2) {
    if (state.observations.length < 2) return "조사를 2개 이상 해보세요. 한 행성을 깊게 보거나 다른 행성을 비교해도 좋아요.";
    if (!validPlanet(state.priority)) return "다음에 더 탐사할 행성을 골라주세요.";
    if (!state.evidence.some((key) => state.observations.includes(key) && observationDetails(key)?.planet.id === state.priority)) return "선택한 행성에서 직접 조사한 단서를 하나 이상 근거로 골라주세요.";
    if (!text(state.priorityReason) || !text(state.uncertainty)) return "그 행성을 선택한 이유와 아직 확인하지 못한 점을 적어주세요.";
  }
  if (step === 3 && (!ADAPTATIONS.some((a) => a.id === state.adaptation) || !text(state.adaptationReason))) return "몸의 특징을 하나 고르고, 행성의 환경과 어떻게 연결되는지 적어주세요.";
  if (step === 4 && (!validAnswer(state.final) || !text(state.finalReason) || !text(state.nextQuestion))) return "지금의 생각, 생각의 근거, 다음에 탐구할 질문을 남겨주세요.";
  return "";
}
export function canComplete(state) {
  return [0, 1, 2, 3, 4].every((step) => !validateStep(state, step));
}
export function restoreMission(raw) {
  const base = freshMission();
  if (!raw || typeof raw !== "object" || raw.version !== 1) return base;
  for (const key of ["initialReason", "priorityReason", "uncertainty", "adaptationReason", "finalReason", "nextQuestion"]) {
    base[key] = typeof raw[key] === "string" ? raw[key].slice(0, 2000) : "";
  }
  base.initial = validAnswer(raw.initial) ? raw.initial : "";
  base.final = validAnswer(raw.final) ? raw.final : "";
  base.priority = validPlanet(raw.priority) ? raw.priority : "";
  base.selectedPlanet = validPlanet(raw.selectedPlanet) ? raw.selectedPlanet : "luma";
  base.adaptation = ADAPTATIONS.some((a) => a.id === raw.adaptation) ? raw.adaptation : "";
  base.concept = raw.concept === "clue" ? "clue" : "";
  // Replay validated purchases; never trust a stored balance or accept overspending.
  for (const key of (Array.isArray(raw.observations) ? raw.observations.slice(0, 12) : [])) {
    const observation = observationDetails(key);
    if (observation) base.observations = observe(base, observation.planet.id, observation.investigation.id).state.observations;
  }
  base.evidence = Array.isArray(raw.evidence) ? [...new Set(raw.evidence.filter((key) => base.observations.includes(key)))] : [];
  const requestedStep = Number.isInteger(raw.step) ? Math.min(4, Math.max(0, raw.step)) : 0;
  while (base.step < requestedStep && !validateStep(base)) base.step += 1;
  base.completed = raw.completed === true && canComplete(base);
  return base;
}
export function buildRecord(state) {
  return {
    topic: "SCIENCE 001 · LIFE FINDER", question: QUESTION, version: 1,
    completed: state.completed && canComplete(state),
    initial: { answer: ANSWERS.find((a) => a.id === state.initial)?.label ?? "", reason: state.initialReason },
    observations: state.observations.map(observationDetails).filter(Boolean).map(({ planet, investigation, title, detail, limit }) => ({ planet: planet.name, investigation: investigation.name, cost: investigation.cost, title, detail, limit })),
    tokensUsed: spentBudget(state), tokensAvailable: BUDGET,
    priority: { planet: PLANETS.find((p) => p.id === state.priority)?.name ?? "", evidence: state.evidence, reason: state.priorityReason, uncertainty: state.uncertainty },
    imaginedLife: { feature: ADAPTATIONS.find((a) => a.id === state.adaptation)?.name ?? "", reason: state.adaptationReason, note: "과학적 단서를 바탕으로 한 창작이며, 발견된 생명체가 아닙니다." },
    final: { answer: ANSWERS.find((a) => a.id === state.final)?.label ?? "", reason: state.finalReason, nextQuestion: state.nextQuestion },
    dataNote: "행성과 관찰 결과는 교육용 가상 자료입니다.",
  };
}
