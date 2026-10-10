// 8개 Universe 아이콘. 홈 화면의 카테고리 내비게이션, 유니버스 그리드,
// 콘텐츠 썸네일 타일이 같은 아이콘을 공유합니다.
export const UNIVERSES = [
  { name: "ECONOMY", kr: "경제", desc: "화폐 · 금융 · 소비", q: "가격은 누가 정할까?" },
  { name: "LITERATURE", kr: "문학", desc: "이야기 · 시 · 글쓰기", q: "왜 사람은 이야기를 만들까?" },
  { name: "ART", kr: "예술", desc: "미술 · 음악 · 디자인", q: "무엇이 예술일까?" },
  { name: "HISTORY", kr: "역사", desc: "문명 · 사회 · 사건", q: "역사는 승자의 기록일까?" },
  { name: "TECH", kr: "기술", desc: "AI · 컴퓨터 · 미래기술", q: "AI는 생각할까?" },
  { name: "ENGINEERING", kr: "공학", desc: "구조 · 기계 · 로봇", q: "기계는 어떻게 움직일까?" },
  { name: "SCIENCE", kr: "과학", desc: "탐구 · 실험 · 자연", q: "우주에 우리만 살고 있을까?" },
  { name: "HUMAN", kr: "인간", desc: "철학 · 심리 · 관계", q: "나는 왜 나일까?" },
];

// The official v3 symbols are shared by every universe surface.
export const UNIVERSE_LOGOS = Object.fromEntries(
  UNIVERSES.map(({ name }) => [name, `/brand/ASTERA_${name}_symbol_v3.webp`])
);

export function UniverseIcon({ name, size = 40, className = "", ...props }) {
  return (
    <img
      src={UNIVERSE_LOGOS[name] ?? UNIVERSE_LOGOS.SCIENCE}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={`universe-symbol ${className}`.trim()}
      {...props}
    />
  );
}
