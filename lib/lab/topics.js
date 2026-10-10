// Canonical first-eight LAB topics. Legacy explore lessons keep their own codes.
export const LAB_TOPICS = [
  { id: "science-001", code: "SCIENCE 001", universe: "SCIENCE", kr: "과학", title: "우주에 우리만 살고 있을까?", tool: "LIFE FINDER", activity: "탐사 예산을 나누고, 세 행성의 단서를 비교해요.", status: "ready", color: "#1F9D7A", order: 1, icon: "SCIENCE", goals: ["가능성과 증거 구분", "관찰 계획", "근거로 판단"] },
  { id: "tech-001", code: "TECH 001", universe: "TECH", kr: "기술", title: "추천 알고리즘이 내 취향을 만들까?", tool: "CHOICE LENS", activity: "추천 규칙을 바꾸며 익숙한 취향과 새로운 발견을 비교해요.", status: "planned", color: "#2D7FF9", order: 2, icon: "TECH", goals: ["추천 규칙", "노출 다양성", "디지털 선택"] },
  { id: "history-001", code: "HISTORY 001", universe: "HISTORY", kr: "역사", title: "같은 과거를 왜 다르게 기록할까?", tool: "SOURCE DETECTIVE", activity: "같은 사건의 기록을 나란히 놓고 관점과 빠진 정보를 찾아요.", status: "planned", color: "#B87645", order: 3, icon: "HISTORY", goals: ["사료 비교", "관점과 목적", "근거 확인"] },
  { id: "economy-001", code: "ECONOMY 001", universe: "ECONOMY", kr: "경제", title: "제한된 자원을 어떻게 나누어야 공정할까?", tool: "FAIR CHOICE", activity: "같은 자원을 다른 기준으로 나누고, 누구에게 어떤 변화가 생기는지 살펴봐요.", status: "planned", color: "#D49A32", order: 4, icon: "ECONOMY", goals: ["한정된 자원", "분배 기준", "영향 비교"] },
  { id: "literature-001", code: "LITERATURE 001", universe: "LITERATURE", kr: "문학", title: "이야기는 다른 사람의 세계를 어떻게 보여줄까?", tool: "STORY LENS", activity: "한 장면을 다른 인물의 목소리로 다시 쓰며 새로운 세계를 만나요.", status: "planned", color: "#7C5CFC", order: 5, icon: "LITERATURE", goals: ["인물의 관점", "읽기와 재구성", "공감"] },
  { id: "art-001", code: "ART 001", universe: "ART", kr: "예술", title: "예술은 시대의 생각을 어떻게 보여줄까?", tool: "ART LENS", activity: "색과 구도, 시대의 단서를 연결하고 나만의 해석을 만들어요.", status: "planned", color: "#E05A88", order: 6, icon: "ART", goals: ["작품 요소", "시대와 맥락", "해석의 근거"] },
  { id: "human-001", code: "HUMAN 001", universe: "HUMAN", kr: "인간", title: "생각이 다른 사람과 어떻게 함께 살아갈까?", tool: "DIALOGUE BRIDGE", activity: "서로의 바람을 듣고, 함께 지킬 수 있는 선택을 찾아요.", status: "planned", color: "#E85D5D", order: 7, icon: "HUMAN", goals: ["관점과 필요", "경청", "공동 결정"] },
  { id: "engineering-001", code: "ENGINEERING 001", universe: "ENGINEERING", kr: "공학", title: "모두가 쓰기 쉬운 디자인은 무엇일까?", tool: "DESIGN FOR ALL", activity: "사용자 조건을 바꾸고, 누구에게나 쓰기 쉬운 설계를 시험해요.", status: "planned", color: "#F06B2E", order: 8, icon: "ENGINEERING", goals: ["사용자 이해", "조건과 제약", "시험과 개선"] },
];

export const LAB_STEPS = [
  { label: "질문", title: "먼저, 나의 생각", hint: "지금 생각과 이유를 남겨요." },
  { label: "개념", title: "생명의 단서를 찾는 법", hint: "살 수 있는 조건과 증거를 구분해요." },
  { label: "탐색", title: "무엇부터 조사할까?", hint: "6개 토큰으로 나만의 탐사를 설계해요." },
  { label: "응용", title: "다른 환경, 다른 생명", hint: "행성의 환경과 몸의 특징을 연결해요." },
  { label: "성찰", title: "나의 생각은 어떻게 달라졌을까?", hint: "처음 생각과 지금의 근거를 비교해요." },
];
