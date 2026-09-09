"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import NavBar from "./nav-bar";
import RadarChart from "./radar-chart";
import { IconArrow, IconClose, IconPlay, IconPencil, IconChat, IconToolbox, IconSearch, IconHeart, IconEye } from "./icons";
import { EXPLORE_ITEMS, AGE_GROUPS } from "@/lib/content";

const CARDS = [
  { type: "think", tag: "THINK · TECH", title: ["AI도 친구가", "될 수 있을까?"], desc: "친구의 조건, 감정, 인공지능을 하나의 질문으로 연결합니다.", meta: "8–13세 · 20분", accent: "accent-blue", slug: "ai-friend",
    modal: { title: "AI도 친구가 될 수 있을까?", tag: "THINK · TECH", desc: "AI가 사람처럼 대화해도 정말 친구라고 부를 수 있을까요? 친구의 조건부터 생각해 봅니다." } },
  { type: "know", tag: "KNOW · MONEY", title: ["돈은 왜", "가치가 있을까?"], desc: "화폐, 신뢰, 교환과 경제의 기본 원리를 어린이 눈높이로.", meta: "10–14세 · 15분", accent: "accent-yellow", slug: "money-value",
    modal: { title: "돈은 왜 가치가 있을까?", tag: "KNOW · MONEY", desc: "종이 한 장과 숫자에 사람들이 왜 가치를 부여할까요? 돈과 신뢰의 관계를 탐색합니다." } },
  { type: "make", tag: "MAKE · ENGINEERING", title: ["가장 튼튼한 다리는", "어떻게 만들까?"], desc: "구조·압축력·인장력을 배우고 직접 다리를 설계하고 시험합니다.", meta: "9–14세 · 35분", accent: "accent-green", slug: "bridge-design",
    modal: { title: "가장 튼튼한 다리는 어떻게 만들 수 있을까?", tag: "MAKE · ENGINEERING", desc: "삼각형 구조와 트러스, 힘의 분산 원리를 배우고 직접 다리를 설계하며 개선합니다." } },
  { type: "check", tag: "CHECK · MEDIA", title: ["이 뉴스,", "진짜일까?"], desc: "AI 시대에 꼭 필요한 어린이 미디어 리터러시 미션.", meta: "10–15세 · 15분", accent: "accent-pink", slug: "fake-news",
    modal: { title: "이 뉴스, 진짜일까?", tag: "CHECK · MEDIA", desc: "제목만 보고 믿지 않고 출처·날짜·근거·다른 보도를 확인하는 방법을 연습합니다." } },
  { type: "think", tag: "THINK · HUMAN", title: ["친구를 위해", "거짓말해도 될까?"], desc: "정답보다 이유를 말하는 연습. 찬성과 반대를 모두 경험합니다.", meta: "8–12세 · 20분", accent: "accent-pink", slug: "white-lie",
    modal: { title: "친구를 위해 거짓말해도 될까?", tag: "THINK · HUMAN", desc: "착한 거짓말도 거짓말일까요? 결과와 의도 중 무엇이 더 중요한지 토론합니다." } },
  { type: "know", tag: "KNOW · EARTH", title: ["도시는 왜", "더 더울까?"], desc: "열섬현상과 기후적응을 생활 속 사례로 이해합니다.", meta: "9–14세 · 18분", accent: "accent-blue", slug: "urban-heat",
    modal: { title: "도시는 왜 더 더울까?", tag: "KNOW · EARTH", desc: "도시의 콘크리트와 아스팔트가 열을 머금는 이유를 알아보고 더 시원한 도시를 상상합니다." } },
];

const NEWS = [
  { kicker: "TECH × ART", title: "AI가 만든 그림에도 저작권이 있을까?", desc: "기술과 예술이 만날 때 생기는 새로운 질문.",
    modal: { title: "AI가 만든 그림에도 저작권이 있을까?", tag: "NOW · TECH × ART", desc: "AI 창작물의 주인과 창작자의 의미를 어린이 수준에서 생각합니다." } },
  { kicker: "EARTH", title: "왜 세계 곳곳이 더 뜨거워질까?", desc: "날씨와 기후는 무엇이 다를까요?",
    modal: { title: "왜 세계 곳곳이 더 뜨거워질까?", tag: "NOW · EARTH", desc: "폭염을 기후, 도시, 에너지 문제와 연결해서 이해합니다." } },
  { kicker: "FUTURE", title: "로봇이 일을 대신하면 우리는 무엇을 하게 될까?", desc: "미래 직업보다 더 중요한 '일의 의미' 이야기.",
    modal: { title: "로봇이 일을 대신하면 우리는 무엇을 하게 될까?", tag: "NOW · FUTURE", desc: "자동화 이후 사람의 일과 배움은 어떻게 달라질지 생각합니다." } },
];

const UNIVERSES = [
  { name: "ECONOMY", kr: "경제", desc: "화폐 · 금융 · 소비", q: "가격은 누가 정할까?",
    icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
  { name: "LITERATURE", kr: "문학", desc: "이야기 · 시 · 글쓰기", q: "왜 사람은 이야기를 만들까?",
    icon: <><path d="M12 6.5C10.5 5 8 4.5 4 4.5v13.7c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2V4.5c-4 0-6.5.5-8 2Z" /><path d="M12 6.5v13.7" /></> },
  { name: "ART", kr: "예술", desc: "미술 · 음악 · 디자인", q: "무엇이 예술일까?",
    icon: <><path d="M12 2a9 9 0 1 0 0 18c1 0 1.5-.6 1.5-1.4 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.6-1.4 1.4-1.4h1.6A4.9 4.9 0 0 0 20.6 10 8 8 0 0 0 12 2Z" /><circle cx="7.5" cy="10.5" r="1" /><circle cx="10.5" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /><circle cx="17" cy="11" r="1" /></> },
  { name: "HISTORY", kr: "역사", desc: "문명 · 사회 · 사건", q: "역사는 승자의 기록일까?",
    icon: <path d="M4 21h16M5 21V8M9 21V8M15 21V8M19 21V8M3 8l9-5 9 5" /> },
  { name: "TECH", kr: "기술", desc: "AI · 컴퓨터 · 미래기술", q: "AI는 생각할까?",
    icon: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></> },
  { name: "ENGINEERING", kr: "공학", desc: "구조 · 기계 · 로봇", q: "기계는 어떻게 움직일까?",
    icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></> },
  { name: "SCIENCE", kr: "과학", desc: "탐구 · 실험 · 자연", q: "우주에 우리만 살고 있을까?",
    icon: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="9" ry="3.6" /><path d="M12 3v18" /></> },
  { name: "HUMAN", kr: "인간", desc: "철학 · 심리 · 관계", q: "나는 왜 나일까?",
    icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></> },
];

const GUIDES = [
  { title: "이번 주, 우리 아이와 나눌 질문 3가지", desc: "매주 업데이트되는 부모님용 대화 카드",
    modal: { title: "이번 주, 우리 아이와 나눌 질문 3가지", tag: "GUIDE", desc: "식탁에서 5분이면 충분해요. 정답을 찾기보다 서로의 생각을 듣는 대화를 연습해보세요." } },
  { title: "아이의 탐구 습관을 키우는 대화법", desc: "질문을 되돌려주는 대화 기술",
    modal: { title: "아이의 탐구 습관을 키우는 대화법", tag: "GUIDE", desc: "\"왜 그렇게 생각해?\" 한 마디가 아이의 사고를 넓힙니다. 실천 가능한 대화 예시를 모았습니다." } },
  { title: "연령별 학습 활용 가이드", desc: "Explorer · Discoverer · Thinker 단계별 안내",
    modal: { title: "연령별 학습 활용 가이드", tag: "GUIDE", desc: "같은 콘텐츠도 연령에 따라 다르게 다가갑니다. 단계별로 무엇을 기대할 수 있는지 정리했습니다." } },
  { title: "디지털 시대, 꼭 필요한 5가지 역량", desc: "미디어 리터러시부터 AI 이해까지",
    modal: { title: "디지털 시대, 꼭 필요한 5가지 역량", tag: "GUIDE", desc: "정보를 찾는 능력보다 판단하는 능력이 중요해진 시대. 아이에게 필요한 역량을 소개합니다." } },
];

const RADAR_BASE = { ECONOMY: 0.45, LITERATURE: 0.3, ART: 0.4, HISTORY: 0.35, TECH: 0.55, ENGINEERING: 0.5, SCIENCE: 0.65, HUMAN: 0.5 };

const POLL = {
  question: "우주에 생명체가 있을까?",
  options: [
    { id: "yes", label: "있을 것 같다", base: 139 },
    { id: "no", label: "없을 것 같다", base: 27 },
    { id: "unsure", label: "아직 모르겠다", base: 82 },
  ],
};

function loadJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function HomePage() {
  const [filter, setFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("전체");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState("idle"); // idle | loading | done | error
  const [query, setQuery] = useState("");
  const [likedSlugs, setLikedSlugs] = useState([]);
  const [pollVote, setPollVote] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    setLikedSlugs(loadJSON("astera_liked", []));
    setPollVote(loadJSON("astera_poll_vote", null));
  }, []);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setModal(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function handleSubscribe(e) {
    e.preventDefault();
    setSubState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("failed");
      setSubState("done");
      showToast("ASTERA 베타 구독 신청이 완료되었습니다 ✓");
      setEmail("");
    } catch {
      setSubState("error");
      showToast("구독 신청에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  function handleHeroSearch(e) {
    e.preventDefault();
    document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleLike(slug) {
    setLikedSlugs((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      window.localStorage.setItem("astera_liked", JSON.stringify(next));
      return next;
    });
  }

  function vote(optionId) {
    if (pollVote) return;
    setPollVote(optionId);
    window.localStorage.setItem("astera_poll_vote", JSON.stringify(optionId));
  }

  const visibleCards = filter === "all" ? CARDS : CARDS.filter((c) => c.type === filter);

  const searchResults = query.trim()
    ? EXPLORE_ITEMS.filter((i) => `${i.title} ${i.subtitle} ${i.tags.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))
    : null;
  const trendingItems = searchResults ?? EXPLORE_ITEMS.slice().sort((a, b) => b.views - a.views).slice(0, 4);

  const ageItems = ageFilter === "전체" ? EXPLORE_ITEMS : EXPLORE_ITEMS.filter((i) => i.ageGroup === ageFilter);

  const radarValues = useMemo(
    () =>
      UNIVERSES.map((u) => {
        const likedCount = EXPLORE_ITEMS.filter((i) => i.universe === u.name && likedSlugs.includes(i.slug)).length;
        return Math.min(1, (RADAR_BASE[u.name] ?? 0.4) + likedCount * 0.15);
      }),
    [likedSlugs]
  );

  const pollCounts = useMemo(() => {
    const extra = pollVote ? 1 : 0;
    const total = POLL.options.reduce((sum, o) => sum + o.base, 0) + extra;
    return POLL.options.map((o) => ({
      ...o,
      count: o.base + (pollVote === o.id ? 1 : 0),
      pct: Math.round(((o.base + (pollVote === o.id ? 1 : 0)) / total) * 100),
    }));
  }, [pollVote]);

  return (
    <>
      <NavBar />
      <main id="top">
        <div className="betastrip">ASTERA BETA · 대표 콘텐츠와 서비스 구조를 테스트 중입니다</div>

        <section className="hero">
          <img
            className="hero-banner-img"
            src="/images/hero-earth.webp"
            alt="등대와 노을 진 해안 도시 너머로 떠 있는 지구를 로봇 친구와 함께 바라보는 ASTERA 탐험가"
          />
          <div className="hero-banner-scrim" aria-hidden="true" />
          <div className="wrap hero-banner-content">
            <span className="eyebrow">
              <span className="dot" /> 7–17세를 위한 세상 탐구 플랫폼 · Beta
            </span>
            <h1>
              질문에서
              <br />
              세상이 시작됩니다.
            </h1>
            <p>
              <b>호기심이 지식이 되고, 지식이 더 나은 미래를 만듭니다.</b>
              <br />
              철학부터 AI, 경제, 예술, 공학, 오늘의 뉴스까지. ASTERA와 함께 세상을 탐구하는 여정을 시작하세요.
            </p>
            <form className="hero-search" onSubmit={handleHeroSearch}>
              <IconSearch width={18} height={18} />
              <input
                id="hero-search"
                type="text"
                placeholder="무엇이 궁금한가요?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" aria-label="검색">
                <IconArrow />
              </button>
            </form>
            <div className="hero-actions">
              <a className="primary" href="#discover">
                오늘의 질문 보기 →
              </a>
              <button
                className="secondary"
                onClick={() =>
                  setModal({
                    title: "가장 튼튼한 다리는 어떻게 만들 수 있을까?",
                    tag: "BETA SAMPLE · ENGINEERING",
                    desc: "왜 어떤 다리는 더 튼튼할까요? 삼각형 구조, 힘의 분산, 트러스의 원리를 배우고 직접 설계하는 ASTERA 대표 베타 콘텐츠입니다.",
                  })
                }
              >
                대표 콘텐츠 체험
              </button>
            </div>
          </div>
        </section>

        <section className="wrap">
          <div className="quicknav">
            {UNIVERSES.map((u, i) => (
              <a href="#universes" key={u.name} className={`u-color-${i}`}>
                <span className="qicon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {u.icon}
                  </svg>
                </span>
                <b>{u.name}</b>
                <span>{u.kr}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="trending" className="wrap section" style={{ paddingTop: 18 }}>
          <div className="split">
            <div>
              <div className="section-head">
                <div>
                  <h2>{searchResults ? `"${query}" 검색 결과` : "지금, 가장 많은 친구들이 탐구하고 있어요 🔥"}</h2>
                </div>
                {!searchResults && <p>다른 탐험가들이 지금 가장 많이 보고 있는 질문들이에요.</p>}
              </div>
              {trendingItems.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>검색 결과가 없어요. 다른 단어로 찾아보세요.</p>
              ) : (
                <div className="trend-grid">
                  {trendingItems.map((item) => {
                    const liked = likedSlugs.includes(item.slug);
                    return (
                      <div key={item.slug} className="trend-card">
                        <Link href={`/explore/${item.slug}`} className="thumb">
                          <span className="tag">{item.universeKr}</span>
                          <img src={item.image} alt="" />
                        </Link>
                        <div className="trend-body">
                          <Link href={`/explore/${item.slug}`}>
                            <h4>{item.title}</h4>
                          </Link>
                          <div className="trend-meta">
                            <span>
                              <IconEye width={14} height={14} /> {item.views.toLocaleString("ko-KR")}
                            </span>
                            <button
                              className={`like-btn${liked ? " liked" : ""}`}
                              onClick={() => toggleLike(item.slug)}
                              aria-pressed={liked}
                            >
                              <IconHeart width={14} height={14} /> {(item.likes + (liked ? 1 : 0)).toLocaleString("ko-KR")}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="map-card">
              <h3>나의 탐구 지도</h3>
              <p className="sub">관심있는 콘텐츠에 좋아요를 누르면 지도가 채워져요.</p>
              <RadarChart labels={UNIVERSES.map((u) => u.kr)} values={radarValues} />
              <button
                className="cta-line"
                onClick={() => {
                  document.getElementById("age-content")?.scrollIntoView({ behavior: "smooth" });
                  showToast("나의 관심사에 맞는 질문을 추천해드려요");
                }}
              >
                추천 질문 보기 →
              </button>
            </div>
          </div>
        </section>

        <section id="age-content" className="wrap section" style={{ paddingTop: 8 }}>
          <div className="split">
            <div>
              <div className="section-head">
                <div>
                  <h2>연령별 추천 콘텐츠</h2>
                </div>
                <p>같은 질문도 연령에 따라 이야기·개념·토론의 깊이가 달라집니다.</p>
              </div>
              <div className="tabs">
                {AGE_GROUPS.map((a) => (
                  <button key={a} className={`tab${ageFilter === a ? " active" : ""}`} onClick={() => setAgeFilter(a)}>
                    {a}
                  </button>
                ))}
              </div>
              <div className="trend-grid">
                {ageItems.map((item) => (
                  <div key={item.slug} className="trend-card">
                    <Link href={`/explore/${item.slug}`} className="thumb">
                      <span className="tag">{item.ageGroup}</span>
                      <img src={item.image} alt="" />
                    </Link>
                    <div className="trend-body">
                      <Link href={`/explore/${item.slug}`}>
                        <h4>{item.title}</h4>
                      </Link>
                      <div className="trend-meta">
                        <span>{item.universeKr}</span>
                        <span>{item.tags[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="guide-card">
              <h3>부모님을 위한 가이드</h3>
              {GUIDES.map((g) => (
                <button key={g.title} className="guide-item" onClick={() => setModal(g.modal)}>
                  <span className="gi">
                    <IconChat width={16} height={16} />
                  </span>
                  <span>
                    <b>{g.title}</b>
                    <span>{g.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="community" className="wrap section" style={{ paddingTop: 8 }}>
          <div className="split even">
            <div className="poll-card">
              <div className="section-head" style={{ marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 20 }}>다른 탐험가들의 생각</h2>
                </div>
              </div>
              <p className="q">Q. {POLL.question}</p>
              {pollCounts.map((o) => (
                <button
                  key={o.id}
                  className={`poll-opt${pollVote ? " voted" : ""}${pollVote === o.id ? " chosen" : ""}`}
                  onClick={() => vote(o.id)}
                  disabled={!!pollVote}
                >
                  {pollVote && <span className="fill" style={{ width: `${o.pct}%` }} />}
                  <span className="poll-opt-row">
                    <span>{o.label}</span>
                    {pollVote && <span>{o.pct}%</span>}
                  </span>
                </button>
              ))}
              <p className="poll-note">{pollVote ? "투표해주셔서 고마워요! 다른 친구들의 생각도 확인해보세요." : "투표하면 다른 친구들의 결과도 볼 수 있어요."}</p>
            </div>

            <div className="mini-cta">
              <div>
                <h3>작은 질문이 큰 가능성을 만듭니다.</h3>
                <p>더 많은 질문, 더 깊은 탐구를 위해 지금 ASTERA와 함께하세요.</p>
              </div>
              <div>
                <Link className="pill" href="/signup" style={{ display: "inline-flex" }}>
                  지금 시작하기 →
                </Link>
                <div className="tagline">A brighter you. A wider world.</div>
              </div>
            </div>
          </div>
        </section>

        <section id="discover" className="wrap section">
          <div className="section-head">
            <div>
              <h2>오늘, 무엇을 궁금해할까?</h2>
            </div>
            <p>하나의 주제를 읽기·토론·창작으로 확장합니다. 버튼을 눌러 콘텐츠 분야를 바꿔보세요.</p>
          </div>
          <div className="tabs">
            {["all", "know", "think", "make", "check"].map((f) => (
              <button key={f} className={`tab${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "전체" : f.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="grid">
            {visibleCards.map((c, i) => (
              <article key={i} className={`card ${c.accent}`} onClick={() => setModal(c.modal)}>
                <span className="tag">{c.tag}</span>
                <h3>
                  {c.title[0]}
                  <br />
                  {c.title[1]}
                </h3>
                <p>{c.desc}</p>
                <div className="meta">
                  <span>{c.meta}</span>
                  <span className="arrow">
                    <IconArrow />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="now" className="now">
          <div className="wrap section">
            <div className="section-head">
              <div>
                <h2>ASTERA NOW</h2>
              </div>
              <p>속보를 쫓지 않습니다. 아이가 꼭 알아야 할 현재의 사건을 하루 뒤, 더 정확하고 더 쉽게 설명합니다.</p>
            </div>
            <div className="headline">
              <div className="feature">
                <div className="label">THIS WEEK · TECH × WORLD</div>
                <h3>왜 나라들은 작은 반도체를 두고 경쟁할까?</h3>
                <p>AI, 자동차, 스마트폰에 꼭 필요한 반도체. 단순한 기술 뉴스가 아니라 국가·경제·공급망의 문제로 연결해 봅니다.</p>
                <div className="steps">
                  <div className="step"><b>WHAT</b><span>무슨 일이 있었나요?</span></div>
                  <div className="step"><b>WHY</b><span>왜 중요한가요?</span></div>
                  <div className="step"><b>VIEW</b><span>서로 다른 입장은?</span></div>
                  <div className="step"><b>THINK</b><span>나는 어떻게 생각하나요?</span></div>
                </div>
                <div className="hero-actions">
                  <button
                    className="secondary"
                    style={{ background: "rgba(255,255,255,.08)", color: "#f2f0e6", borderColor: "rgba(255,255,255,.18)" }}
                    onClick={() =>
                      setModal({
                        title: "왜 나라들은 반도체를 두고 경쟁할까?",
                        tag: "ASTERA NOW",
                        desc: "반도체는 단순한 부품이 아니라 산업·국가안보·세계 공급망을 연결하는 핵심 기술입니다.",
                      })
                    }
                  >
                    어린이 해설 읽기
                  </button>
                </div>
              </div>
              <div className="news-list">
                {NEWS.map((n, i) => (
                  <button key={i} className="news" onClick={() => setModal(n.modal)}>
                    <div className="kicker">{n.kicker}</div>
                    <h4>{n.title}</h4>
                    <p>{n.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="universes" className="wrap section">
          <div className="section-head">
            <div>
              <h2>8개의 Universe</h2>
            </div>
            <p>교과목으로 나누지 않습니다. 아이가 세상을 바라보는 여덟 개의 렌즈입니다.</p>
          </div>
          <div className="universe">
            {UNIVERSES.map((u) => (
              <div className="u" key={u.name}>
                <i>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {u.icon}
                  </svg>
                </i>
                <b>
                  {u.name} <span style={{ color: "var(--muted)", fontWeight: 500 }}>· {u.kr}</span>
                </b>
                <p>
                  {u.desc}
                  <br />
                  &quot;{u.q}&quot;
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="wrap section">
          <div className="section-head">
            <div>
              <h2>하나의 질문, 하나의 배움 패키지</h2>
            </div>
            <p>Shorts로 발견하고, 메인 배움영상으로 이해하고, 워크북·워크시트로 생각하고, 가이드와 프로젝트로 확장합니다.</p>
          </div>
          <div className="product-grid">
            <div className="product">
              <div className="iconbox i1"><IconPlay /></div>
              <h3>ASTERA Shorts</h3>
              <p>30~60초 애니메이션과 2~4분 메인 영상. 질문과 핵심 개념을 여는 콘텐츠.</p>
              <div className="price">Free</div>
            </div>
            <div className="product">
              <div className="iconbox i2"><IconPencil /></div>
              <h3>Workbook + Worksheet</h3>
              <p>읽기·생각·토론·쓰기·설계를 한 번에. 짧은 워크시트도 함께 제공합니다.</p>
              <div className="price">
                <Link href="/workbook" style={{ textDecoration: "underline" }}>
                  월 9,900원 · 지금 보기 →
                </Link>
              </div>
            </div>
            <div className="product">
              <div className="iconbox i3"><IconChat /></div>
              <h3>Guide</h3>
              <p>부모·교사가 바로 활용할 수 있는 발문, 운영 흐름, 평가·확장 아이디어.</p>
              <div className="price">Included</div>
            </div>
            <div className="product">
              <div className="iconbox i4"><IconToolbox /></div>
              <h3>ASTERA MAKE</h3>
              <p>공학·예술·과학을 손으로 완성하는 프로젝트 키트.</p>
              <div className="price">Coming soon</div>
            </div>
          </div>
        </section>

        <section id="join" className="wrap section">
          <div className="cta">
            <div>
              <h2>이번 주, 아이와 어떤 질문을 나눌까요?</h2>
              <p>매주 하나의 큰 질문과 어린이 읽기자료를 무료로 받아보세요.</p>
            </div>
            <form className="signup" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="parent@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={subState === "loading"}>
                {subState === "loading" ? "신청 중…" : "무료 구독"}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footerline">
          <div className="footer-brand">
            <img src="/images/astera-mark.png" alt="" aria-hidden="true" width={22} height={22} />
            <span>
              <b>ASTERA</b> <span className="footer-tagline">Where questions open worlds.</span>
            </span>
          </div>
          <div>Beta · 2026</div>
        </div>
      </footer>

      {toast && <div className="toast">{toast}</div>}

      {modal && (
        <div
          className="modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="modal-box">
            <div className="modal-top">
              <div>
                <div className="eyebrow">{modal.tag}</div>
                <h2 className="modal-title">{modal.title}</h2>
              </div>
              <button className="x" onClick={() => setModal(null)} aria-label="닫기">
                <IconClose />
              </button>
            </div>
            <p className="modal-desc">{modal.desc}</p>
            <div className="worksheet">
              <b>미니 워크시트 체험</b>
              <ol>
                <li>이 주제를 이해하기 위해 꼭 알아야 할 사실은 무엇일까요?</li>
                <li>찬성하는 사람은 어떤 이유를 말할까요?</li>
                <li>반대하는 사람은 어떤 이유를 말할까요?</li>
                <li>나는 어떤 생각인가요? 이유를 한 문장으로 적어보세요.</li>
              </ol>
            </div>
            <div className="hero-actions">
              <Link className="primary" href="/workbook">
                워크북 전체 이용하기
              </Link>
              <button className="secondary" onClick={() => showToast("교사용 수업 패키지 미리보기를 신청했습니다 ✓")}>
                교사용 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
