"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import NavBar from "./nav-bar";
import RadarChart from "./radar-chart";
import ContentTile from "./content-tile";
import { UNIVERSES, UniverseIcon } from "./universe-icons";
import { IconArrow, IconClose, IconPlay, IconPencil, IconChat, IconToolbox, IconSearch, IconBookmark, IconCheck } from "./icons";
import { EXPLORE_ITEMS, AGE_GROUPS, TYPES } from "@/lib/content";

const NEWS = [
  {
    kicker: "TECH × ART",
    title: "AI가 만든 그림에도 저작권이 있을까?",
    desc: "기술과 예술이 만날 때 생기는 새로운 질문.",
    modal: { title: "AI가 만든 그림에도 저작권이 있을까?", tag: "NOW · TECH × ART", desc: "AI 창작물의 주인과 창작자의 의미를 어린이 수준에서 생각합니다." },
  },
  {
    kicker: "EARTH",
    title: "왜 세계 곳곳이 더 뜨거워질까?",
    desc: "날씨와 기후는 무엇이 다를까요?",
    modal: { title: "왜 세계 곳곳이 더 뜨거워질까?", tag: "NOW · EARTH", desc: "폭염을 기후, 도시, 에너지 문제와 연결해서 이해합니다." },
  },
  {
    kicker: "FUTURE",
    title: "로봇이 일을 대신하면 우리는 무엇을 하게 될까?",
    desc: "미래 직업보다 더 중요한 '일의 의미' 이야기.",
    modal: { title: "로봇이 일을 대신하면 우리는 무엇을 하게 될까?", tag: "NOW · FUTURE", desc: "자동화 이후 사람의 일과 배움은 어떻게 달라질지 생각합니다." },
  },
];

const GUIDES = [
  {
    title: "이번 주, 아이와 나눌 질문 3가지",
    desc: "식탁에서 5분이면 충분한 대화 카드",
    icon: IconChat,
    modal: { title: "이번 주, 아이와 나눌 질문 3가지", tag: "GUIDE", desc: "정답을 찾기보다 서로의 생각을 듣는 대화를 연습해보세요. 매주 새로운 질문 카드가 올라옵니다." },
  },
  {
    title: "탐구 습관을 키우는 대화법",
    desc: "질문을 되돌려주는 다섯 문장",
    icon: IconPencil,
    modal: { title: "탐구 습관을 키우는 대화법", tag: "GUIDE", desc: "\"왜 그렇게 생각해?\" 한 마디가 아이의 사고를 넓힙니다. 실제로 써먹을 수 있는 문장을 모았습니다." },
  },
  {
    title: "연령별 학습 활용 가이드",
    desc: "Explorer · Discoverer · Thinker",
    icon: IconCheck,
    modal: { title: "연령별 학습 활용 가이드", tag: "GUIDE", desc: "같은 콘텐츠도 연령에 따라 다르게 다가갑니다. 단계별로 무엇을 기대할 수 있는지 정리했습니다." },
  },
  {
    title: "디지털 시대에 필요한 5가지 역량",
    desc: "미디어 리터러시부터 AI 이해까지",
    icon: IconToolbox,
    modal: { title: "디지털 시대에 필요한 5가지 역량", tag: "GUIDE", desc: "정보를 찾는 능력보다 판단하는 능력이 중요해진 시대. 아이에게 필요한 역량을 소개합니다." },
  },
];

const POLL = {
  question: "우주에 생명체가 있을까?",
  options: [
    { id: "yes", label: "있을 것 같다" },
    { id: "no", label: "없을 것 같다" },
    { id: "unsure", label: "아직 모르겠다" },
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
  const [typeFilter, setTypeFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("전체");
  const [universeFilter, setUniverseFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState("idle"); // idle | loading | done | error
  const [saved, setSaved] = useState([]);
  const [pollVote, setPollVote] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    setSaved(loadJSON("astera_bookmarks", []));
    setPollVote(loadJSON("astera_poll_vote", null));
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setModal(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  function goToLibrary() {
    document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
  }

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
      showToast("구독 신청이 완료되었습니다");
      setEmail("");
    } catch {
      setSubState("error");
      showToast("구독 신청에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  function toggleSave(slug) {
    setSaved((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      window.localStorage.setItem("astera_bookmarks", JSON.stringify(next));
      return next;
    });
  }

  function vote(optionId) {
    if (pollVote) return;
    setPollVote(optionId);
    window.localStorage.setItem("astera_poll_vote", JSON.stringify(optionId));
  }

  const featured = EXPLORE_ITEMS.slice(0, 4);

  const libraryItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXPLORE_ITEMS.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (ageFilter !== "전체" && item.ageGroup !== ageFilter) return false;
      if (universeFilter && item.universe !== universeFilter) return false;
      if (q && !`${item.title} ${item.summary} ${item.tags.join(" ")} ${item.universeKr}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [typeFilter, ageFilter, universeFilter, query]);

  const radarValues = useMemo(() => {
    const counts = UNIVERSES.map((u) => EXPLORE_ITEMS.filter((i) => i.universe === u.name && saved.includes(i.slug)).length);
    const max = Math.max(2, ...counts);
    return counts.map((c) => c / max);
  }, [saved]);

  const hasSaved = saved.length > 0;
  const filtersActive = typeFilter !== "all" || ageFilter !== "전체" || universeFilter || query.trim();
  // 필터가 없을 때는 그리드가 꽉 찬 줄로 끝나도록 8개만 먼저 보여줍니다.
  const visibleItems = filtersActive || showAll ? libraryItems : libraryItems.slice(0, 8);

  return (
    <>
      <NavBar />
      <main id="top">
        <div className="betastrip">ASTERA BETA · 대표 콘텐츠와 서비스 구조를 테스트하고 있습니다</div>

        <section className="hero">
          <img
            className="hero-banner-img"
            src="/images/hero-shootingstar.webp"
            alt="유성과 보름달이 뜬 밤하늘을 가리키며 로봇 친구와 천문대 담벼락에 앉아 있는 ASTERA 탐험가"
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
            <form
              className="hero-search"
              onSubmit={(e) => {
                e.preventDefault();
                goToLibrary();
              }}
            >
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
              <button className="primary" onClick={goToLibrary}>
                오늘의 질문 보기 →
              </button>
              <Link className="secondary" href={`/explore/${EXPLORE_ITEMS[0].slug}`}>
                대표 콘텐츠 체험
              </Link>
            </div>
          </div>
        </section>

        <section className="wrap quicknav-wrap">
          <div className="quicknav">
            {UNIVERSES.map((u, i) => (
              <button
                key={u.name}
                className={`quicknav-item u-color-${i}${universeFilter === u.name ? " active" : ""}`}
                onClick={() => {
                  setUniverseFilter(universeFilter === u.name ? null : u.name);
                  goToLibrary();
                }}
              >
                <span className="qicon">
                  <UniverseIcon name={u.name} size={18} />
                </span>
                <b>{u.name}</b>
                <span>{u.kr}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="wrap section">
          <div className="split">
            <div>
              <div className="section-head">
                <div>
                  <h2>이번 주 추천 질문</h2>
                  <p>에디터가 고른 네 개의 질문으로 시작해보세요.</p>
                </div>
                <button className="head-link" onClick={goToLibrary}>
                  전체 보기 →
                </button>
              </div>
              <ol className="rank-list">
                {featured.map((item, i) => (
                  <li key={item.slug}>
                    <Link href={`/explore/${item.slug}`} className="rank-row">
                      <span className="rank-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="rank-body">
                        <b>{item.title}</b>
                        <span className="rank-meta">
                          {item.universeKr} · {item.ageGroup} · {item.duration}
                        </span>
                      </span>
                      <span className="rank-arrow">
                        <IconArrow />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="side-card map-card">
              <div>
                <h3>나의 탐구 지도</h3>
                <p className="sub">저장한 질문이 여덟 개의 유니버스에 어떻게 쌓이는지 보여줍니다.</p>
              </div>
              <RadarChart labels={UNIVERSES.map((u) => u.kr)} values={radarValues} dimmed={!hasSaved} />
              <p className="map-note">
                {hasSaved ? `지금까지 ${saved.length}개의 질문을 저장했어요.` : "아직 비어 있어요. 관심 있는 질문의 저장 버튼을 눌러보세요."}
              </p>
            </div>
          </div>
        </section>

        <section id="discover" className="wrap section">
          <div className="section-head">
            <div>
              <h2>탐구 라이브러리</h2>
              <p>하나의 질문을 읽기 · 토론 · 창작으로 확장합니다. 분야와 연령으로 걸러보세요.</p>
            </div>
          </div>

          <div className="lib-toolbar">
            <div className="filter-row">
              <span className="filter-label">분야</span>
              {TYPES.map((t) => (
                <button key={t.id} className={`tab${typeFilter === t.id ? " active" : ""}`} onClick={() => setTypeFilter(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="filter-row">
              <span className="filter-label">연령</span>
              {AGE_GROUPS.map((a) => (
                <button key={a} className={`tab${ageFilter === a ? " active" : ""}`} onClick={() => setAgeFilter(a)}>
                  {a}
                </button>
              ))}
            </div>
            {(universeFilter || query.trim()) && (
              <div className="filter-row">
                {universeFilter && (
                  <button className="chip-clear" onClick={() => setUniverseFilter(null)}>
                    {UNIVERSES.find((u) => u.name === universeFilter)?.kr} <IconClose width={12} height={12} />
                  </button>
                )}
                {query.trim() && (
                  <button className="chip-clear" onClick={() => setQuery("")}>
                    “{query.trim()}” <IconClose width={12} height={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          {libraryItems.length === 0 ? (
            <div className="lib-empty">
              <p>조건에 맞는 질문이 아직 없어요.</p>
              <button
                className="secondary dark"
                onClick={() => {
                  setTypeFilter("all");
                  setAgeFilter("전체");
                  setUniverseFilter(null);
                  setQuery("");
                }}
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="lib-grid">
              {visibleItems.map((item) => {
                const isSaved = saved.includes(item.slug);
                return (
                  <article key={item.slug} className="lib-card">
                    <Link href={`/explore/${item.slug}`} className="lib-thumb">
                      <ContentTile item={item} />
                    </Link>
                    <div className="lib-body">
                      <Link href={`/explore/${item.slug}`}>
                        <h3>{item.title}</h3>
                      </Link>
                      <p>{item.summary}</p>
                      <div className="lib-meta">
                        <span>
                          {item.ageGroup} · {item.duration}
                        </span>
                        <button
                          className={`save-btn${isSaved ? " on" : ""}`}
                          onClick={() => toggleSave(item.slug)}
                          aria-pressed={isSaved}
                          aria-label={isSaved ? "저장 해제" : "저장"}
                        >
                          <IconBookmark width={15} height={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {filtersActive && libraryItems.length > 0 && <p className="lib-count">{libraryItems.length}개의 질문</p>}

          {!filtersActive && !showAll && libraryItems.length > visibleItems.length && (
            <div className="lib-more">
              <button className="secondary dark" onClick={() => setShowAll(true)}>
                질문 {libraryItems.length}개 모두 보기
              </button>
            </div>
          )}
        </section>

        <section id="now" className="now">
          <div className="wrap section">
            <div className="section-head">
              <div>
                <h2>ASTERA NOW</h2>
                <p>속보를 쫓지 않습니다. 아이가 꼭 알아야 할 사건을 하루 뒤, 더 정확하고 더 쉽게 설명합니다.</p>
              </div>
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
                {NEWS.map((n) => (
                  <button key={n.title} className="news" onClick={() => setModal(n.modal)}>
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
              <p>교과목으로 나누지 않습니다. 아이가 세상을 바라보는 여덟 개의 렌즈입니다.</p>
            </div>
          </div>
          <div className="universe">
            {UNIVERSES.map((u, i) => (
              <button
                key={u.name}
                className={`u u-color-${i}`}
                onClick={() => {
                  setUniverseFilter(u.name);
                  goToLibrary();
                }}
              >
                <i>
                  <UniverseIcon name={u.name} size={18} />
                </i>
                <b>
                  {u.name} <span>· {u.kr}</span>
                </b>
                <p>{u.desc}</p>
                <q>{u.q}</q>
              </button>
            ))}
          </div>
        </section>

        <section id="community" className="wrap section">
          <div className="split even">
            <div className="side-card guide-card">
              <div className="section-head compact">
                <div>
                  <h2>부모님을 위한 가이드</h2>
                  <p>집에서 바로 써먹는 대화와 운영 팁.</p>
                </div>
              </div>
              <div className="guide-list">
                {GUIDES.map((g) => {
                  const Icon = g.icon;
                  return (
                    <button key={g.title} className="guide-item" onClick={() => setModal(g.modal)}>
                      <span className="gi">
                        <Icon width={16} height={16} />
                      </span>
                      <span className="gt">
                        <b>{g.title}</b>
                        <span>{g.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="side-card poll-card">
              <div className="section-head compact">
                <div>
                  <h2>다른 탐험가들의 생각</h2>
                  <p>정답이 없는 질문에 내 생각을 남겨보세요.</p>
                </div>
              </div>
              <p className="poll-q">Q. {POLL.question}</p>
              <div className="poll-options">
                {POLL.options.map((o) => (
                  <button
                    key={o.id}
                    className={`poll-opt${pollVote === o.id ? " chosen" : ""}`}
                    onClick={() => vote(o.id)}
                    disabled={!!pollVote}
                  >
                    <span>{o.label}</span>
                    {pollVote === o.id && <IconCheck width={15} height={15} />}
                  </button>
                ))}
              </div>
              <p className="poll-note">
                {pollVote
                  ? "생각을 남겨주셔서 고마워요. 베타 기간에는 결과를 모으고 있어요."
                  : "베타 기간에는 답변을 모으는 중이라 결과는 아직 공개하지 않아요."}
              </p>
            </div>
          </div>
        </section>

        <section id="products" className="wrap section">
          <div className="section-head">
            <div>
              <h2>하나의 질문, 하나의 배움 패키지</h2>
              <p>Shorts로 발견하고, 워크북으로 생각하고, 가이드와 프로젝트로 확장합니다.</p>
            </div>
          </div>
          <div className="product-grid">
            <div className="product">
              <div className="iconbox i1"><IconPlay /></div>
              <h3>ASTERA Shorts</h3>
              <p>30~60초 애니메이션과 2~4분 메인 영상. 질문과 핵심 개념을 여는 콘텐츠.</p>
              <div className="price">무료</div>
            </div>
            <div className="product">
              <div className="iconbox i2"><IconPencil /></div>
              <h3>Workbook + Worksheet</h3>
              <p>읽기·생각·토론·쓰기·설계를 한 번에. 짧은 워크시트도 함께 제공합니다.</p>
              <div className="price">
                <Link href="/pricing">월 9,900원 · 자세히 →</Link>
              </div>
            </div>
            <div className="product">
              <div className="iconbox i3"><IconChat /></div>
              <h3>Guide</h3>
              <p>부모·교사가 바로 활용할 수 있는 발문, 운영 흐름, 평가·확장 아이디어.</p>
              <div className="price">멤버십 포함</div>
            </div>
            <div className="product">
              <div className="iconbox i4"><IconToolbox /></div>
              <h3>ASTERA MAKE</h3>
              <p>공학·예술·과학을 손으로 완성하는 프로젝트 키트.</p>
              <div className="price muted">준비 중</div>
            </div>
          </div>
        </section>

        <section id="join" className="wrap section">
          <div className="cta">
            <div>
              <h2>작은 질문이 큰 가능성을 만듭니다.</h2>
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
                <div className="eyebrow dark">{modal.tag}</div>
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
                워크북 이용하기
              </Link>
              <button className="secondary dark" onClick={() => setModal(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
