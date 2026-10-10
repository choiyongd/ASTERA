import Link from "next/link";
import { LAB_TOPICS } from "@/lib/lab/topics";
import { EXTRA_TOPICS } from "@/lib/lab/catalog.mjs";
import { IconArrow } from "../icons";
import { UniverseIcon } from "../universe-icons";

export const metadata = { title: "ASTERA LAB — 질문을 직접 탐구하는 8개의 실험실", description: "8개 유니버스의 첫 주제와 확장 주제를 탐구하는 학습 웹앱. 조건과 관점을 비교하고 근거와 새로운 질문을 남겨보세요." };

export default function LabPage() {
  return (
    <main className="lab-page">
      <section className="lab-catalog-hero">
        <div className="wrap lab-catalog-head">
          <div>
            <p className="lab-kicker">ASTERA LAB / SMALL QUESTIONS, BIG WORLDS</p>
            <h1>읽던 질문을,<br />직접 탐구하는 시간.</h1>
            <p className="lab-lead">선택하고, 관찰하고, 생각을 바꿔보세요.<br />5–10분의 탐구가 새로운 질문으로 이어집니다.</p>
            <div className="lab-tags"><span>초등 4–6학년 중심</span><span>로그인 없이 체험</span><span>근거를 남기는 학습</span></div>
          </div>
          <div className="lab-catalog-preview" aria-hidden="true"><img src="/images/earth.webp" alt="" width={1400} height={538} /><span className="lab-orbit-label">FIRST MISSION<br /><b>SCIENCE 001</b></span></div>
        </div>
      </section>
      <div className="wrap lab-catalog-body">
        <section className="lab-featured" aria-labelledby="featured-title">
          <div className="lab-featured-number" aria-hidden="true">01</div>
          <div className="lab-featured-copy"><p className="lab-kicker">첫 번째 탐구 / LIFE FINDER</p><h2 id="featured-title">우주에 우리만 살고 있을까?</h2><p>6개 탐사 토큰으로 무엇을 조사할지 정하고,<br className="lab-desktop-break" /> 생명을 찾는 단서와 아직 모르는 것을 구분해보세요.</p></div>
          <Link className="lab-button gold" href="/lab/science-001">생명 탐사 시작 <IconArrow width={18} height={18} /></Link>
        </section>
        <section className="lab-catalog-section" aria-labelledby="universes-title">
          <div className="lab-section-heading"><div><p className="lab-kicker">8 UNIVERSES / 8 QUESTIONS</p><h2 id="universes-title">여덟 개의 질문, 여덟 가지 탐구</h2></div><p>첫 8개 주제를 모두 체험할 수 있어요.</p></div>
          <div className="lab-topic-grid">
            {LAB_TOPICS.map((topic) => <article id={topic.id} className={`lab-topic ${topic.status === "ready" ? "ready" : ""}`} key={topic.id} style={{ "--universe-accent": topic.color }}>
              <div className="lab-topic-top"><UniverseIcon name={topic.universe} size={58} loading="lazy" /><span className={`lab-status ${topic.status}`}>{topic.status === "ready" ? "체험 가능" : `개발 순서 ${topic.order}`}</span></div>
              <p className="lab-topic-code">{topic.code} · {topic.kr}</p><h3>{topic.title}</h3><p className="lab-topic-desc">{topic.activity}</p>
              <div className="lab-topic-goals">{topic.goals.map((goal) => <span key={goal}>{goal}</span>)}</div>
              <div className="lab-topic-bottom"><span>{topic.tool}</span>{topic.status === "ready" ? <Link href={`/lab/${topic.id}`} aria-label={`${topic.code} ${topic.tool} 시작`}>탐구하기 <IconArrow width={16} height={16} /></Link> : <span className="lab-planned-label">준비 중</span>}</div>
            </article>)}
          </div>
        </section>
        <section className="lab-catalog-section" aria-labelledby="more-labs-title"><div className="lab-section-heading"><div><p className="lab-kicker">MORE QUESTIONS</p><h2 id="more-labs-title">기존 질문에서도 이어지는 탐구</h2></div><p>주제의 질문에 맞는 도구를 만나보세요.</p></div><div className="lab-topic-grid">{EXTRA_TOPICS.map(topic => <article key={topic.id} className="lab-topic ready" style={{ "--universe-accent": topic.color }}><div className="lab-topic-top"><UniverseIcon name={topic.universe} size={48} loading="lazy" /><span className="lab-status ready">체험 가능</span></div><p className="lab-topic-code">{topic.code} · {topic.ageGroup}</p><h3>{topic.title}</h3><p className="lab-topic-desc">{topic.activity}</p><div className="lab-topic-bottom"><span>{topic.tool}</span><Link href={`/lab/${topic.id}`} aria-label={`${topic.code} ${topic.tool} 시작`}>탐구하기 <IconArrow width={16} height={16} /></Link></div></article>)}</div></section>
        <section className="lab-teacher-note"><p className="lab-kicker">FOR TEACHERS & FAMILIES</p><h2>웹에서 탐구하고, 종이에서 더 깊게.</h2><p>LAB의 시작 생각과 탐사 기록을 워크북의 핵심 질문과 연결해보세요. 학생이 어떤 결론을 골랐는지보다, 무엇을 관찰했고 왜 그렇게 판단했는지 함께 이야기해보세요.</p><Link href="/explore/alone-in-universe">SCIENCE 001 주제 소개 보기 →</Link></section>
      </div>
    </main>
  );
}
