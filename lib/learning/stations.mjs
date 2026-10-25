import { validateDraft } from "./domain.mjs";
export const STATION_FORMAT = "astera-stations/v1";
export const SOURCE_CATEGORIES = [
  "문학",
  "생활문화",
  "예술",
  "철학",
  "과학",
  "인문교양",
  "현대 문화",
  "현대 예술",
  "현대 철학",
  "현대 문학",
  "현대 인문학",
  "현대 과학",
  "현대 기술",
];
const fail = (message) => {
  throw new Error(message);
};
function text(value, max, name) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    fail(`${name} 형식을 확인해주세요.`);
  return value.trim();
}
export function validateStation(input) {
  if (!input || typeof input !== "object") fail("정거장 자료를 확인해주세요.");
  const stationId = text(input.stationId, 60, "정거장 ID");
  if (!/^(?:V2-[가-힣]+|[A-Z]{3})-\d{2}$/.test(stationId))
    fail("정거장 ID 형식을 확인해주세요.");
  if (
    !SOURCE_CATEGORIES.includes(input.category) ||
    ![1, 2, 3].includes(input.volume)
  )
    fail("원문 분야와 권을 확인해주세요.");
  if (
    !Array.isArray(input.pages) ||
    !input.pages.length ||
    input.pages.length > 20 ||
    input.pages.some((p) => !Number.isInteger(p) || p < 1 || p > 1600)
  )
    fail("원문 쪽수를 확인해주세요.");
  const draft = validateDraft(input.draft);
  if (draft.materials.length || draft.access !== "member")
    fail("가져오는 초안은 회원 공개 설정과 빈 자료 목록으로 준비해주세요.");
  if (!/^[a-f0-9]{64}$/.test(input.hash)) fail("원문 식별값을 확인해주세요.");
  return {
    stationId,
    category: input.category,
    volume: input.volume,
    pages: input.pages,
    filename: text(input.filename, 200, "원문 파일명"),
    hash: input.hash,
    draft,
    originalStudent: text(input.originalStudent, 18000, "학생판 원문"),
    teacherNotes: text(input.teacherNotes, 18000, "교사판"),
    sourceReading: text(input.sourceReading, 18000, "출처·권리"),
  };
}
export function validateStationPack(input) {
  if (
    input?.format !== STATION_FORMAT ||
    !Array.isArray(input.entries) ||
    !input.entries.length ||
    input.entries.length > 570
  )
    fail("ASTERA 정거장 변환 파일을 선택해주세요.");
  const entries = input.entries.map(validateStation);
  if (new Set(entries.map((e) => e.stationId)).size !== entries.length)
    fail("중복된 정거장 ID가 있어요.");
  return { format: STATION_FORMAT, entries };
}
export function validateTeacherNotes(value) {
  if (typeof value !== "string" || value.length > 18000)
    fail("교사용 메모는 18,000자까지 입력해주세요.");
  return value.trim();
}
export function validateSourcePublication(lesson) {
  if (!lesson.source) return;
  if (lesson.review_status !== "reviewed")
    fail("교사용 발문·검수 사항과 출처를 확인하고 검토 완료를 저장해주세요.");
  if (lesson.draft.access === "subscriber")
    fail(
      "이 원문은 비영리 이용 조건을 포함하므로 멤버십 전용으로 발행할 수 없어요.",
    );
}
