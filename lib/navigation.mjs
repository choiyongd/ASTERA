export const NAV_GROUPS = [
  {
    id: "explore",
    label: "탐구하기",
    items: [
      {
        href: "/#discover",
        label: "질문 둘러보기",
        hint: "궁금한 주제에서 시작해요",
      },
      {
        href: "/#universes",
        label: "8개 유니버스",
        hint: "분야를 넘나드는 질문",
      },
      {
        href: "/lab",
        label: "ASTERA LAB",
        hint: "직접 조작하고 탐구하는 웹앱",
      },
    ],
  },
  {
    id: "learn",
    label: "학습하기",
    items: [
      {
        href: "/learn",
        label: "20분 학습",
        hint: "자료와 질문으로 이어가는 과정",
      },
      {
        href: "/learn/records",
        label: "나의 학습 기록",
        hint: "저장한 답변과 이어 학습",
      },
      { href: "/#products", label: "학습도구", hint: "워크북과 탐구 도구" },
    ],
  },
  {
    id: "about",
    label: "ASTERA 안내",
    items: [
      { href: "/about", label: "ASTERA 소개" },
      { href: "/pages", label: "공지·이용 안내" },
      { href: "/#community", label: "커뮤니티" },
      { href: "/pricing", label: "멤버십·요금제" },
      { href: "/admin/login", label: "관리자 로그인", secondary: true },
    ],
  },
];
export function isCurrentLink(pathname, href) {
  if (href.includes("#")) return false;
  return href === "/learn"
    ? pathname === "/learn" ||
        (pathname.startsWith("/learn/") && pathname !== "/learn/records")
    : pathname === href || pathname.startsWith(href + "/");
}
