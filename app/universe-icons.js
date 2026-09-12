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

export const UNIVERSE_ICONS = {
  ECONOMY: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  LITERATURE: (
    <>
      <path d="M12 6.5C10.5 5 8 4.5 4 4.5v13.7c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2V4.5c-4 0-6.5.5-8 2Z" />
      <path d="M12 6.5v13.7" />
    </>
  ),
  ART: (
    <>
      <path d="M12 2a9 9 0 1 0 0 18c1 0 1.5-.6 1.5-1.4 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.6-1.4 1.4-1.4h1.6A4.9 4.9 0 0 0 20.6 10 8 8 0 0 0 12 2Z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="10.5" cy="7" r="1" />
      <circle cx="15" cy="7.5" r="1" />
      <circle cx="17" cy="11" r="1" />
    </>
  ),
  HISTORY: <path d="M4 21h16M5 21V8M9 21V8M15 21V8M19 21V8M3 8l9-5 9 5" />,
  TECH: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
  ENGINEERING: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  SCIENCE: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <path d="M12 3v18" />
    </>
  ),
  HUMAN: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </>
  ),
};

export function UniverseIcon({ name, size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {UNIVERSE_ICONS[name] ?? UNIVERSE_ICONS.SCIENCE}
    </svg>
  );
}
