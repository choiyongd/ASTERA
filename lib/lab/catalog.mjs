// Canonical topic-to-LAB mapping. Each visible lesson has its own activity.
export const FIRST_TOPICS = [
  { id: "science-001", slug: "alone-in-universe", code: "SCIENCE 001", universe: "SCIENCE", kr: "과학", title: "우주에 우리만 살고 있을까?", tool: "LIFE FINDER", activity: "탐사 예산을 나누고, 세 행성의 단서를 비교해요.", status: "ready", color: "#1F9D7A", order: 1, icon: "SCIENCE", goals: ["가능성과 증거 구분", "관찰 계획", "근거로 판단"] },
  { id: "tech-001", slug: "recommendation-taste", code: "TECH 001", universe: "TECH", kr: "기술", title: "추천 알고리즘이 내 취향을 만들까?", tool: "CHOICE LENS", activity: "추천 규칙을 바꾸며 익숙한 취향과 새로운 발견을 비교해요.", status: "ready", color: "#2D7FF9", order: 2, icon: "TECH", goals: ["추천 규칙", "노출 다양성", "디지털 선택"] },
  { id: "history-001", slug: "records-perspectives", code: "HISTORY 001", universe: "HISTORY", kr: "역사", title: "같은 과거를 왜 다르게 기록할까?", tool: "SOURCE DETECTIVE", activity: "같은 사건의 기록을 나란히 놓고 관점과 빠진 정보를 찾아요.", status: "ready", color: "#B87645", order: 3, icon: "HISTORY", goals: ["사료 비교", "관점과 목적", "근거 확인"] },
  { id: "economy-001", slug: "fair-resources", code: "ECONOMY 001", universe: "ECONOMY", kr: "경제", title: "제한된 자원을 어떻게 나누어야 공정할까?", tool: "FAIR CHOICE", activity: "같은 자원을 다른 기준으로 나누고, 누구에게 어떤 변화가 생기는지 살펴봐요.", status: "ready", color: "#D49A32", order: 4, icon: "ECONOMY", goals: ["한정된 자원", "분배 기준", "영향 비교"] },
  { id: "literature-001", slug: "other-worlds", code: "LITERATURE 001", universe: "LITERATURE", kr: "문학", title: "이야기는 다른 사람의 세계를 어떻게 보여줄까?", tool: "STORY LENS", activity: "한 장면을 다른 인물의 목소리로 다시 쓰며 새로운 세계를 만나요.", status: "ready", color: "#7C5CFC", order: 5, icon: "LITERATURE", goals: ["인물의 관점", "읽기와 재구성", "공감"] },
  { id: "art-001", slug: "art-and-era", code: "ART 001", universe: "ART", kr: "예술", title: "예술은 시대의 생각을 어떻게 보여줄까?", tool: "ART LENS", activity: "색과 구도, 시대의 단서를 연결하고 나만의 해석을 만들어요.", status: "ready", color: "#E05A88", order: 6, icon: "ART", goals: ["작품 요소", "시대와 맥락", "해석의 근거"] },
  { id: "human-001", slug: "living-together", code: "HUMAN 001", universe: "HUMAN", kr: "인간", title: "생각이 다른 사람과 어떻게 함께 살아갈까?", tool: "DIALOGUE BRIDGE", activity: "서로의 바람을 듣고, 함께 지킬 수 있는 선택을 찾아요.", status: "ready", color: "#E85D5D", order: 7, icon: "HUMAN", goals: ["관점과 필요", "경청", "공동 결정"] },
  { id: "engineering-001", slug: "design-for-all", code: "ENGINEERING 001", universe: "ENGINEERING", kr: "공학", title: "모두가 쓰기 쉬운 디자인은 무엇일까?", tool: "DESIGN FOR ALL", activity: "사용자 조건을 바꾸고, 누구에게나 쓰기 쉬운 설계를 시험해요.", status: "ready", color: "#F06B2E", order: 8, icon: "ENGINEERING", goals: ["사용자 이해", "조건과 제약", "시험과 개선"] },
];

export const EXTRA_TOPICS = [
 { id:"tech-002",slug:"ai-friend",code:"TECH 002",universe:"TECH",kr:"기술",title:"AI도 친구가 될 수 있을까?",tool:"FRIEND LENS",activity:"AI의 대화 사례와 친구 관계의 조건을 비교해요.",color:"#2D7FF9",ageGroup:"7-9세",goals:["대화와 감정 구분","친구의 조건","정보 확인"] },
 { id:"economy-003",slug:"money-value",code:"ECONOMY 003",universe:"ECONOMY",kr:"경제",title:"돈은 왜 가치가 있을까?",tool:"EXCHANGE LAB",activity:"물물교환과 교환 토큰의 약속을 비교해요.",color:"#D49A32",ageGroup:"13-17세",goals:["교환의 조건","신뢰와 약속","교환 방식 비교"] },
 { id:"engineering-004",slug:"bridge-design",code:"ENGINEERING 004",universe:"ENGINEERING",kr:"공학",title:"가장 튼튼한 다리는 어떻게 만들까?",tool:"BRIDGE BUILDER",activity:"구조와 길이, 하중 조건을 바꾸어 규칙 모형을 시험해요.",color:"#F06B2E",ageGroup:"10-12세",goals:["힘과 구조","제약 조건","설계 개선"] },
 { id:"tech-005",slug:"fake-news",code:"TECH 005",universe:"TECH",kr:"기술",title:"이 뉴스, 진짜일까?",tool:"EVIDENCE CHECK",activity:"창작 뉴스의 원자료·날짜·주장을 대조해요.",color:"#2D7FF9",ageGroup:"13-17세",goals:["출처 확인","주장과 근거","판단 보류"] },
 { id:"human-006",slug:"white-lie",code:"HUMAN 006",universe:"HUMAN",kr:"인간",title:"친구를 위해 거짓말해도 될까?",tool:"CARE & TRUTH",activity:"배려와 사실 전달의 선택을 상황별로 비교해요.",color:"#E85D5D",ageGroup:"7-9세",goals:["의도와 영향","관점 비교","대화 만들기"] },
 { id:"science-007",slug:"urban-heat",code:"SCIENCE 007",universe:"SCIENCE",kr:"과학",title:"도시는 왜 더 더울까?",tool:"COOL CITY",activity:"녹지·그늘·교통 조건을 바꾸며 가상 지표를 비교해요.",color:"#1F9D7A",ageGroup:"10-12세",goals:["조건 통제","도시 환경","모형의 한계"] },
 { id:"art-008",slug:"art-definition",code:"ART 008",universe:"ART",kr:"예술",title:"무엇이 예술일까?",tool:"ART CONTEXT",activity:"작품 요소와 전시 맥락을 바꾸며 나의 기준을 살펴봐요.",color:"#E05A88",ageGroup:"13-17세",goals:["작품의 요소","맥락과 해석","판단 기준"] },
 { id:"literature-009",slug:"story-why",code:"LITERATURE 009",universe:"LITERATURE",kr:"문학",title:"왜 사람은 이야기를 만들까?",tool:"STORY MAKER",activity:"같은 장면을 다른 화자로 읽고 새로운 이야기를 만들어요.",color:"#7C5CFC",ageGroup:"7-9세",goals:["화자의 역할","경험과 이야기","장면 재구성"] },
 { id:"history-010",slug:"history-winner",code:"HISTORY 010",universe:"HISTORY",kr:"역사",title:"역사는 승자의 기록일까?",tool:"MISSING VOICES",activity:"가상 마을의 기록에서 남은 목소리와 빠진 관점을 찾아요.",color:"#B87645",ageGroup:"13-17세",goals:["기록의 주체","누락된 관점","사료 비교"] }
].map(topic=>({...topic,status:"ready"}));
export const ALL_LAB_TOPICS = [...FIRST_TOPICS, ...EXTRA_TOPICS];
export function getLabTopic(id) { return ALL_LAB_TOPICS.find(topic=>topic.id===id) ?? null; }
export function getLabForSlug(slug) { return ALL_LAB_TOPICS.find(topic=>topic.slug===slug) ?? null; }
