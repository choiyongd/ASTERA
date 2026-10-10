import Link from "next/link";
import NavBar from "../nav-bar";
import BrandFooter from "../brand-footer";
import BrandReplayButton from "../brand-replay-button";
import { UniverseIcon } from "../universe-icons";
import { IconArrow } from "../icons";
import { LAB_TOPICS } from "@/lib/lab/topics";
import "./about.css";

export const metadata = {
  title: "ASTERA 소개 — 질문에서 세상이 시작됩니다",
  description: "ASTERA의 철학, 목표와 비전, 8개 유니버스와 질문·개념·탐색·응용·성찰의 학습 방식을 소개합니다. 웹에서 짧게 탐구하고 워크북으로 생각을 확장하는 배움의 방향을 만나보세요.",
};

const LEARNING_STEPS = [
  { title: "핵심 질문", action: "지금의 생각에서 출발합니다.", body: "주제를 관통하는 질문을 만나고, 시작하기 전 자신의 생각과 그 이유를 기록합니다. 이 기록은 탐구 후 생각의 변화를 살펴보는 출발점이 됩니다.", example: "SCIENCE 001: 우주에 다른 생명이 있다고 생각하나요? 그렇게 생각한 이유는 무엇인가요?" },
  { title: "개념 학습", action: "탐구에 필요한 지식을 배웁니다.", body: "짧은 읽기 자료와 관찰 예시로 주제에 필요한 교과 지식과 용어를 익힙니다. 어려운 개념은 학생이 이해할 수 있는 상황과 연결합니다.", example: "SCIENCE 001: 생명이 살 수 있는 조건과 생명이 존재한다는 증거를 구분합니다." },
  { title: "탐색하기", action: "스스로 조사하고 근거를 찾습니다.", body: "예측이나 가설을 세우고, 무엇을 비교하고 조사할지 선택합니다. 탐구 팁과 단계별 안내를 활용해 자료를 확인하며, 아직 모르는 내용도 함께 남깁니다.", example: "SCIENCE 001: 6개 탐사 토큰으로 세 행성에서 무엇부터 조사할지 결정합니다." },
  { title: "응용하기", action: "배운 것으로 새로운 가능성을 만듭니다.", body: "탐구한 개념을 다른 상황에 적용해 설계, 이야기, 작품이나 해결안을 만듭니다. 자신이 만든 결과물의 특징과 그 선택의 이유를 설명합니다.", example: "SCIENCE 001: 선택한 행성의 환경과 연결해 가상의 생명체를 설계합니다." },
  { title: "생각하기", action: "처음의 생각을 다시 만납니다.", body: "핵심 질문에 다시 답하고 관찰한 근거를 붙입니다. 처음 생각과 지금 생각을 비교한 뒤, 더 알아보고 싶은 후속 질문을 만들어 탐구를 이어갑니다.", example: "SCIENCE 001: 어떤 단서 때문에 생각이 달라졌나요? 다음에는 무엇을 확인하고 싶나요?" },
];

const EXTENSIONS = {
  SCIENCE: "다음 탐구: 관찰 도구의 한계, 환경에 따른 생명의 특징, 지구 생태계로 연결합니다.",
  TECH: "다음 탐구: 정보의 신뢰성, AI의 판단 기준, 내가 정하는 디지털 이용 습관으로 연결합니다.",
  HISTORY: "다음 탐구: 다른 시대의 사료, 지역의 기억, 오늘의 기록이 미래에 남기는 의미로 연결합니다.",
  ECONOMY: "다음 탐구: 공동 예산, 소비의 선택, 사람과 환경에 미치는 영향으로 연결합니다.",
  LITERATURE: "다음 탐구: 세계 문학 속 인물의 선택, 다른 화자의 이야기, 나의 경험을 담은 글쓰기로 연결합니다.",
  ART: "다음 탐구: 미술 사조, 작품의 시대적 맥락, 자신의 생각을 표현하는 창작으로 연결합니다.",
  HUMAN: "다음 탐구: 감정과 필요의 이해, 공동체의 규칙, 서로 다른 관점을 존중하는 대화로 연결합니다.",
  ENGINEERING: "다음 탐구: 접근 가능한 도구, 구조와 재료, 사용자 피드백을 반영한 설계 개선으로 연결합니다.",
};

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <main className="about-page">
        <section className="about-hero" aria-labelledby="about-title">
          <img className="about-hero-image" src="/images/wide.webp" alt="" aria-hidden="true" width={1400} height={538} fetchPriority="high" />
          <div className="about-hero-shade" />
          <div className="wrap about-hero-content">
            <p className="about-kicker">ABOUT ASTERA</p>
            <h1 id="about-title">질문에서,<br />세상이 시작됩니다.</h1>
            <p className="about-hero-lead">하나의 질문을 따라 지식을 만나고,<br />직접 탐구하며 자신의 생각을 넓히는 배움.</p>
            <p className="about-hero-sub">ASTERA는 세상을 이해하고 새로운 가능성을 만드는<br className="about-desktop-break" /> 어린이와 청소년의 탐구를 함께합니다.</p>
            <div className="about-actions"><Link className="about-button light" href="#learning">탐구 방식 알아보기 <IconArrow width={17} height={17} /></Link><Link className="about-text-link" href="/lab">LAB 만나보기 <span aria-hidden="true">→</span></Link></div>
          </div>
        </section>

        <nav className="about-section-nav wrap" aria-label="소개 페이지 구성">
          <a href="#philosophy">브랜드 철학</a><a href="#purpose">목표와 비전</a><a href="#learning">탐구 방식</a><a href="#worlds">8개 유니버스</a><a href="#direction">앞으로의 방향</a>
        </nav>

        <section className="wrap about-section about-philosophy" id="philosophy" aria-labelledby="philosophy-title">
          <div className="about-section-heading"><p className="about-kicker">01 / OUR PHILOSOPHY</p><h2 id="philosophy-title">궁금한 마음이<br />스스로 생각하는 힘으로.</h2></div>
          <div className="about-prose"><p>“왜 그럴까?”라는 질문은 세상을 자세히 바라보게 합니다. 익숙한 현상을 다시 보고, 다른 사람의 생각을 듣고, 자신의 설명을 확인하는 과정에서 배움이 시작됩니다.</p><p>ASTERA는 그 궁금함이 탐구로 이어지도록 길을 설계합니다. 질문에 필요한 지식을 익히고, 자료를 비교하고, 직접 선택하며, 배운 내용을 새로운 상황에 적용합니다. 학생은 그 과정에서 자신의 언어로 생각을 설명하고 수정할 기회를 갖습니다.</p><p>교과 지식과 일상의 문제를 연결하는 것도 ASTERA가 지향하는 배움입니다. 추천 영상에 대한 질문은 기술과 인간의 선택으로, 자원을 나누는 질문은 경제와 공동체의 문제로 이어집니다. 하나의 주제에서 여러 세계를 만나며 사고의 폭을 넓힙니다.</p></div>
        </section>

        <section className="about-purpose" id="purpose" aria-labelledby="purpose-title">
          <div className="wrap about-section"><div className="about-section-heading"><p className="about-kicker">02 / OUR PURPOSE</p><h2 id="purpose-title">ASTERA가 만들고 싶은 변화</h2><p className="about-section-lead">질문을 발견하고, 근거를 살피고, 새로운 가능성을 만드는 탐구자로 성장하도록 돕습니다.</p></div>
            <div className="about-purpose-grid">
              <article><span className="about-small-label">MISSION · 우리의 역할</span><h3>질문에서 탐구와 창작까지,<br />누구나 시작할 수 있도록.</h3><p>짧은 웹 활동과 이해하기 쉬운 안내로 탐구의 첫걸음을 돕습니다. 학생이 직접 선택하고 결과를 살펴보는 경험을 마련하고, 교사와 보호자가 대화를 이어갈 수 있는 학습 자료로 확장합니다.</p></article>
              <article><span className="about-small-label">VISION · 우리가 바라보는 미래</span><h3>세상을 이해하고,<br />더 나은 내일을 만드는 사람.</h3><p>자신의 판단에 근거를 붙이고 다른 관점을 살피는 경험을 쌓도록 합니다. 일상과 사회의 문제를 함께 이해하며, 배운 것으로 새로운 해결안과 표현을 만드는 성장을 지향합니다.</p></article>
              <article><span className="about-small-label">PROMISE · 학습자와의 약속</span><h3>학생이 스스로 생각하고<br />설명할 수 있는 길을 설계합니다.</h3><p>개념 자료, 비교할 대상, 탐구 팁과 후속 질문을 제공합니다. 무엇을 선택했고 왜 그렇게 판단했는지 남길 수 있도록 하고, 아직 모르는 것과 확인한 것을 구분하는 태도를 존중합니다.</p></article>
            </div>
            <div className="about-age-note"><b>성장을 함께하는 범위</b><p>ASTERA의 장기적인 대상은 7–17세 어린이와 청소년입니다. 현재 Beta의 001 LAB은 초등 4–6학년을 중심으로 설계하며, 읽기 수준과 탐구 경험에 맞게 질문과 활동의 깊이를 조절해갈 계획입니다.</p></div>
          </div>
        </section>

        <section className="wrap about-section" id="learning" aria-labelledby="learning-title">
          <div className="about-section-heading"><p className="about-kicker">03 / HOW WE LEARN</p><h2 id="learning-title">질문이 생각의 변화로 이어지는<br />다섯 단계의 탐구</h2><p className="about-section-lead">워크북과 LAB은 같은 핵심 질문을 중심으로 연결됩니다. SCIENCE 001을 예로, 학생이 무엇을 하는지 살펴보세요.</p></div>
          <ol className="about-learning-list">{LEARNING_STEPS.map((step, i) => <li key={step.title}><span className="about-step-number" aria-hidden="true">0{i + 1}</span><h3>{step.title}</h3><div><h4>{step.action}</h4><p>{step.body}</p><p className="about-learning-example">{step.example}</p></div></li>)}</ol>
          <div className="about-learning-note"><h3>한 번의 활동이 다음 질문으로.</h3><p>질문하고, 알아보고, 연결하고, 시험하고, 만들고, 나누고, 돌아보는 순환을 지향합니다. 결과물과 함께 관찰한 내용·선택의 이유·생각의 변화를 남기고, 이를 새로운 탐구의 출발점으로 사용합니다.</p></div>
        </section>

        <section className="about-worlds" id="worlds" aria-labelledby="worlds-title"><div className="wrap about-section">
          <div className="about-section-heading"><p className="about-kicker">04 / EIGHT UNIVERSES</p><h2 id="worlds-title">세상을 바라보는 여덟 개의 창</h2><p className="about-section-lead">과학·기술·역사·경제·문학·예술·인간·공학을 고루 탐구합니다. 각 주제는 고유한 탐구 활동을 갖고, 다른 유니버스의 질문으로도 이어집니다.</p></div>
          <div className="about-world-grid">{LAB_TOPICS.map((topic) => <article className="about-world" key={topic.id} style={{ "--world-color": topic.color }}><div className="about-world-header"><UniverseIcon name={topic.universe} size={64} loading="lazy" /><div><p className="about-world-name">{topic.universe} <span>· {topic.kr}</span></p><p className="about-world-code">{topic.code}</p></div><span className={`about-world-status ${topic.status === "ready" ? "ready" : ""}`}>{topic.status === "ready" ? "체험 가능" : "준비 중"}</span></div><h3>{topic.title}</h3><p>{topic.activity}</p><p className="about-world-extension">{EXTENSIONS[topic.universe]}</p><Link className="about-world-link" href={topic.status === "ready" ? `/lab/${topic.id}` : `/lab#${topic.id}`}>{topic.status === "ready" ? "이 주제 탐구하기" : "개발 예정 주제 보기"} <IconArrow width={16} height={16} /></Link></article>)}</div>
          <p className="about-world-note">8개 유니버스의 첫 001 LAB을 모두 체험할 수 있습니다. 미래·환경·사회 문제는 여러 유니버스가 함께 탐구하는 교차 주제로 확장합니다.</p>
        </div></section>

        <section className="wrap about-section" id="direction" aria-labelledby="direction-title">
          <div className="about-section-heading"><p className="about-kicker">05 / WHERE WE GO</p><h2 id="direction-title">웹에서 짧게 탐구하고,<br />교실과 일상에서 깊게 이어가도록.</h2><p className="about-section-lead">학생의 선택과 생각이 이어지는 경험을 중심으로 콘텐츠와 도구를 개발합니다.</p></div>
          <div className="about-direction-grid"><article><span className="about-small-label">ASTERA LAB</span><h3>5–10분, 직접 선택하는 웹 탐구</h3><p>관찰 대상을 고르고, 규칙을 바꾸고, 자료를 비교하는 등 주제에 맞는 학습 웹앱을 개발합니다. 8개 001 LAB과 기존 확장 주제는 로그인 없이 체험하며, 비교 기록과 생각을 주제별로 사용 중인 기기에 저장합니다.</p><Link className="about-world-link" href="/lab">현재 LAB 둘러보기 <IconArrow width={16} height={16} /></Link></article><article><span className="about-small-label">WORKBOOK & GUIDE · 확장 계획</span><h3>화면의 발견을 종이 위의 생각으로</h3><p>웹 탐구의 선택과 관찰을 워크북의 기록·그리기·토론 활동으로 연결하고, 교사와 보호자를 위한 질문 가이드를 제공합니다. 워크북과 가이드는 주제별 준비가 완료되면 PDF 다운로드로 연결할 계획입니다.</p></article><article><span className="about-small-label">QUEST · TEACHER · FAMILY · 확장 방향</span><h3>한 주제의 탐구를 배움의 일상으로</h3><p>질문에서 성찰까지 이어지는 주제별 학습 경험, 교사의 수업 설계와 학생의 탐구 기록, 가정에서 함께 나누는 대화를 지원하는 방향으로 확장합니다. 연령별 활동과 후속 질문도 함께 다듬어갑니다.</p></article></div>
          <div className="about-principles"><h3>주제를 개발할 때 지키는 기준</h3><ul><li><b>탐구할 수 있는 질문</b><span>학생의 생활이나 세상의 현상과 연결하고, 자료를 살피며 생각을 발전시킬 수 있는 질문을 고릅니다.</span></li><li><b>선택에 따라 달라지는 활동</b><span>무엇을 비교하고 어떻게 시도할지 학생이 결정하며, 결과에서 새로운 단서를 찾도록 합니다.</span></li><li><b>지식과 표현의 연결</b><span>필요한 개념을 익힌 뒤, 설명·창작·설계 등으로 적용하며 선택의 근거를 함께 남깁니다.</span></li><li><b>확인한 것과 아직 모르는 것</b><span>학습용 가상 자료와 실제 정보를 구분하고, 근거의 한계와 더 확인할 내용을 표현하도록 합니다.</span></li></ul></div>
        </section>

        <section className="about-symbol-section" aria-labelledby="symbol-title"><div className="wrap about-symbol-content"><img src="/brand/astera_logo_primary_transparent.png" alt="ASTERA · Where Questions Open Worlds" width={400} height={90} loading="lazy" /><div><p className="about-kicker">THE ASTERA SYMBOL</p><h2 id="symbol-title">별과 나침반, 그리고 펼쳐진 책</h2><p>별은 아직 발견하지 못한 가능성, 나침반은 탐구의 방향, 펼쳐진 책은 배움의 시작을 뜻합니다. 그 중심에는 질문하는 사람이 있습니다. ASTERA의 로고에는 지식을 만나 자신만의 길을 찾아가는 탐구의 철학이 담겨 있습니다.</p><BrandReplayButton /></div></div></section>

        <section className="about-final"><div className="wrap"><p className="about-kicker">YOUR FIRST QUESTION</p><h2>첫 질문에서 시작해볼까요?</h2><p>우주에 우리만 살고 있을까?<br />나의 생각을 남기고, 생명의 단서를 직접 탐사해보세요.</p><div className="about-actions"><Link className="about-button gold" href="/lab/science-001">SCIENCE 001 체험하기 <IconArrow width={18} height={18} /></Link><Link className="about-text-link" href="/lab">8개 주제 살펴보기 <span aria-hidden="true">→</span></Link></div></div></section>
      </main>
      <BrandFooter />
    </>
  );
}
