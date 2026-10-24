import { ALL_LAB_TOPICS } from "../lab/catalog.mjs";

export const ACCESS = {
  public: "무료 체험",
  member: "회원 공개",
  subscriber: "멤버십 전용",
};
export const UNIVERSES = [
  "SCIENCE",
  "TECH",
  "HISTORY",
  "ECONOMY",
  "LITERATURE",
  "ART",
  "HUMAN",
  "ENGINEERING",
];
export const STAGES = [
  {
    id: "question",
    label: "질문",
    minutes: 2,
    title: "먼저, 나의 생각",
    prompt: "이 질문에 대해 지금은 어떻게 생각하나요? 이유와 함께 적어주세요.",
  },
  {
    id: "concept",
    label: "개념",
    minutes: 4,
    title: "탐구에 필요한 개념",
    prompt: "자료에서 배운 핵심 개념을 나의 말로 설명해보세요.",
  },
  {
    id: "explore",
    label: "탐색",
    minutes: 8,
    title: "직접 탐구하고 비교하기",
    prompt: "어떤 조건을 비교했나요? 관찰한 차이와 근거를 적어주세요.",
  },
  {
    id: "apply",
    label: "응용",
    minutes: 4,
    title: "배운 것으로 새롭게 만들기",
    prompt: "배운 개념과 관찰한 근거로 나만의 해결안이나 작품을 설명해보세요.",
  },
  {
    id: "reflect",
    label: "성찰",
    minutes: 2,
    title: "나의 생각은 어떻게 달라졌을까?",
    prompt:
      "처음의 생각과 비교해 무엇이 같거나 달라졌나요? 다음 질문도 남겨주세요.",
  },
];
export const COMPETENCIES = [
  {
    id: "evidence",
    label: "근거로 생각하기",
    description: "주장을 뒷받침하는 자료를 찾고 비교할 수 있어요.",
  },
  {
    id: "problem",
    label: "문제 해결하기",
    description: "조건을 바꾸고 해결 방법을 시험할 수 있어요.",
  },
  {
    id: "create",
    label: "새롭게 만들기",
    description: "배운 것을 연결해 나만의 아이디어를 만들 수 있어요.",
  },
  {
    id: "explain",
    label: "생각 설명하기",
    description: "내 생각과 이유를 다른 사람에게 설명할 수 있어요.",
  },
];
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const FILE_LIMITS = { pdf: 25 * 1024 * 1024, html: 2 * 1024 * 1024 };
export const BUCKET = "learning-materials";
export function newDraft() {
  return {
    slug: "",
    title: "",
    summary: "",
    universe: "SCIENCE",
    ageGroup: "10–12세",
    access: "member",
    goals: [],
    materials: [],
    stages: STAGES.map((s) => ({ ...s, body: "" })),
  };
}
const fail = (message) => {
  throw new Error(message);
};
function clean(value, max, label) {
  if (typeof value !== "string" || value.length > max)
    fail(`${label} 형식을 확인해주세요. (최대 ${max}자)`);
  return value.trim();
}
export function validateDraft(input, publish = false) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    fail("학습자료 형식을 확인해주세요.");
  const draft = {
    slug: clean(input.slug, 80, "주소"),
    title: clean(input.title, 150, "주제명"),
    summary: clean(input.summary, 500, "소개"),
    universe: input.universe,
    ageGroup: clean(input.ageGroup, 40, "권장 연령"),
    access: input.access,
  };
  if (!draft.title) fail("주제명을 입력해주세요.");
  if (draft.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug))
    fail("주소에는 영문 소문자·숫자·하이픈만 사용할 수 있어요.");
  if (
    !UNIVERSES.includes(draft.universe) ||
    !Object.hasOwn(ACCESS, draft.access)
  )
    fail("분야와 공개 범위를 선택해주세요.");
  if (!Array.isArray(input.goals) || input.goals.length > 8)
    fail("학습 목표는 최대 8개예요.");
  draft.goals = input.goals
    .map((g) => clean(g, 300, "학습 목표"))
    .filter(Boolean);
  if (!Array.isArray(input.stages) || input.stages.length !== 5)
    fail("학습은 5단계로 구성해주세요.");
  draft.stages = STAGES.map((stage, i) => ({
    ...stage,
    title: clean(input.stages[i]?.title, 150, "단계 제목"),
    body: clean(input.stages[i]?.body, 6000, "학습 안내"),
    prompt: clean(input.stages[i]?.prompt, 500, "학습 질문"),
  }));
  if (!Array.isArray(input.materials) || input.materials.length > 20)
    fail("주제당 자료는 최대 20개예요.");
  draft.materials = input.materials.map((m) => {
    if (
      !UUID.test(m?.id) ||
      !Number.isInteger(m.stage) ||
      m.stage < 0 ||
      m.stage > 4
    )
      fail("연결한 자료를 확인해주세요.");
    return {
      id: m.id,
      label: clean(m.label, 150, "자료 이름"),
      stage: m.stage,
    };
  });
  if (new Set(draft.materials.map((m) => m.id)).size !== draft.materials.length)
    fail("같은 자료를 중복 연결할 수 없어요.");
  if (publish) {
    if (!draft.slug || !draft.summary || !draft.ageGroup || !draft.goals.length)
      fail("주소·소개·권장 연령·학습 목표를 모두 입력해주세요.");
    if (draft.stages.some((s) => !s.title || !s.body || !s.prompt))
      fail("5단계의 제목·안내·질문을 모두 입력해주세요.");
    if (!draft.materials.length || draft.materials.some((m) => !m.label))
      fail("실제 학습자료를 1개 이상 연결하고 자료 이름을 입력해주세요.");
  }
  return draft;
}
export function validateWebUrl(value) {
  if (typeof value !== "string" || value.length > 2000)
    fail("웹앱 주소를 확인해주세요.");
  if (value.startsWith("/lab/")) {
    if (!ALL_LAB_TOPICS.some((t) => `/lab/${t.id}` === value))
      fail("등록된 ASTERA LAB 주소를 선택해주세요.");
    return value;
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    fail("https:// 로 시작하는 웹앱 주소를 입력해주세요.");
  }
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    host === "localhost" ||
    host.endsWith(".local") ||
    !host.includes(".") ||
    /^[\d.]+$/.test(host) ||
    host.includes(":")
  )
    fail(
      "공개 HTTPS 웹앱 주소를 입력해주세요. 내부망·IP·인증정보 주소는 사용할 수 없어요.",
    );
  return url.href;
}
export function validateUpload(input) {
  if (
    !input ||
    !UUID.test(input.lessonId) ||
    !Object.hasOwn(FILE_LIMITS, input.kind)
  )
    fail("업로드할 주제와 파일 종류를 확인해주세요.");
  const name = clean(input.name, 180, "파일 이름");
  if (
    !name.toLowerCase().endsWith(`.${input.kind}`) ||
    !Number.isInteger(input.size) ||
    input.size < 1 ||
    input.size > FILE_LIMITS[input.kind]
  )
    fail(
      input.kind === "pdf"
        ? "PDF는 25MB 이하의 .pdf 파일을 선택해주세요."
        : "웹앱은 2MB 이하의 단일 .html 파일을 선택해주세요.",
    );
  return {
    lessonId: input.lessonId,
    kind: input.kind,
    originalName: name,
    size: input.size,
    mime: input.kind === "pdf" ? "application/pdf" : "text/html",
  };
}
export function canAccess(access, user, profile, now = Date.now()) {
  if (access === "public") return true;
  if (!user) return false;
  if (access === "member") return true;
  return (
    access === "subscriber" &&
    profile?.is_member === true &&
    (typeof profile.membership_expires_at === "number"
      ? profile.membership_expires_at
      : Date.parse(profile.membership_expires_at)) > now
  );
}
export function normalizeProgress(input) {
  if (
    !input ||
    typeof input !== "object" ||
    !Number.isInteger(input.step) ||
    input.step < 0 ||
    input.step > 4 ||
    typeof input.completed !== "boolean"
  )
    fail("학습 기록 형식을 확인해주세요.");
  const answers = Object.fromEntries(
    STAGES.map((s) => [
      s.id,
      clean(input.answers?.[s.id] ?? "", 4000, "학습 기록"),
    ]),
  );
  const assessment = Object.fromEntries(
    ["pre", "post"].map((key) => {
      const values = input.assessment?.[key] ?? [0, 0, 0, 0];
      if (
        !Array.isArray(values) ||
        values.length !== 4 ||
        values.some((v) => !Number.isInteger(v) || v < 0 || v > 5)
      )
        fail("역량 자기평가 값을 확인해주세요.");
      return [key, values];
    }),
  );
  if (input.step > 0 && assessment.pre.some((v) => v === 0))
    fail("학습 전 자기평가 4개를 먼저 선택해주세요.");
  if (input.completed && assessment.post.some((v) => v === 0))
    fail("학습 후 자기평가 4개를 선택해주세요.");
  const first = STAGES.findIndex((s) => answers[s.id].length < 6);
  if (first >= 0 && (input.completed || input.step > first))
    fail("앞 단계의 질문에 6자 이상 답하고 이어가세요.");
  return {
    answers,
    assessment,
    step: input.step,
    completed: input.completed && first === -1,
  };
}
export function isReadyFile(kind, bytes) {
  if (!bytes.length || bytes.length > FILE_LIMITS[kind]) return false;
  if (kind === "pdf")
    return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  return (
    kind === "html" &&
    /<(?:!doctype\s+html|html|head|body|div|script)\b/i.test(
      new TextDecoder().decode(bytes.slice(0, 4096)),
    )
  );
}
