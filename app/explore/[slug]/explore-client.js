"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconBookmark, IconShare, IconCheck } from "../../icons";
import { UniverseIcon } from "../../universe-icons";
import { EXPLORE_ITEMS, JOURNEY_STEPS, LAB_TOOLS } from "@/lib/content";

const TABS = ["소개", "미리보기", "학습 목표", "교사용 자료", "관련 콘텐츠"];

function loadBookmarks() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("astera_bookmarks") || "[]");
  } catch {
    return [];
  }
}

export default function ExploreClient({ item }) {
  const [tab, setTab] = useState("소개");
  const [bookmarked, setBookmarked] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    setBookmarked(loadBookmarks().includes(item.slug));
  }, [item.slug]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  function toggleBookmark() {
    const list = loadBookmarks();
    const next = list.includes(item.slug) ? list.filter((s) => s !== item.slug) : [...list, item.slug];
    window.localStorage.setItem("astera_bookmarks", JSON.stringify(next));
    setBookmarked(next.includes(item.slug));
    showToast(next.includes(item.slug) ? "찜 목록에 추가했어요" : "찜 목록에서 제거했어요");
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text: item.subtitle, url });
      } catch {
        // 사용자가 공유를 취소한 경우는 무시합니다.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("링크를 복사했어요");
    } catch {
      showToast("링크 복사에 실패했어요");
    }
  }

  const related = EXPLORE_ITEMS.filter((i) => i.slug !== item.slug && i.universe === item.universe).slice(0, 3);
  const relatedFallback = related.length ? related : EXPLORE_ITEMS.filter((i) => i.slug !== item.slug).slice(0, 3);

  return (
    <div className="wrap" style={{ paddingTop: 28, paddingBottom: 90 }}>
      <div className="explore-layout">
        <aside className="journey-side">
          {JOURNEY_STEPS.map((step, i) => (
            <div key={step} className={`j-item${i === 0 ? " active" : ""}`}>
              <span className="n">{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </aside>

        <div>
          <div className="explore-hero">
            <span className="code">ASTERA {item.code}</span>
            <h1>{item.title}</h1>
            <p>{item.subtitle}</p>
            <div className="explore-tags">
              {item.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
              <span>{item.ageGroup}</span>
            </div>
            <div className="explore-actions">
              <button
                className="primary"
                onClick={() => {
                  document.getElementById("steps")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                학습 시작하기
              </button>
              <button className={`icon-pill${bookmarked ? " active" : ""}`} onClick={toggleBookmark}>
                <IconBookmark width={16} height={16} /> {bookmarked ? "찜 완료" : "찜하기"}
              </button>
              <button className="icon-pill" onClick={handleShare}>
                <IconShare width={16} height={16} /> 공유하기
              </button>
            </div>
          </div>

          <div className="explore-tabs">
            {TABS.map((t) => (
              <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          <div className="explore-panel">
            {tab === "소개" && <p>{item.intro}</p>}
            {tab === "미리보기" && <p>{item.preview}</p>}
            {tab === "학습 목표" && (
              <ul>
                {item.goals.map((g) => (
                  <li key={g}>
                    <IconCheck width={13} height={13} style={{ display: "inline", marginRight: 6, verticalAlign: "-1px" }} />
                    {g}
                  </li>
                ))}
              </ul>
            )}
            {tab === "교사용 자료" && <p>{item.teacher}</p>}
            {tab === "관련 콘텐츠" && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {relatedFallback.map((r) => (
                  <li key={r.slug} style={{ marginBottom: 10 }}>
                    <Link href={`/explore/${r.slug}`} style={{ fontWeight: 700, textDecoration: "underline" }}>
                      {r.title}
                    </Link>
                    <span style={{ color: "var(--muted)" }}> · {r.universeKr} · {r.ageGroup}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div id="steps" className="step-grid">
            {item.steps.map((s) => (
              <div key={s.n} className={`step-card tint-${item.universe.toLowerCase()} cv-${s.n % 4}`}>
                <div className="step-figure">
                  <span className="step-n">{String(s.n).padStart(2, "0")}</span>
                  <UniverseIcon name={item.universe} size={92} className="step-glyph" />
                </div>
                <div className="sc-body">
                  <div className="sc-label">{s.n}. {s.label}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lab-banner">
            <div className="lab-banner-top">
              <div>
                <h3>ASTERA LAB</h3>
                <p>직접 해보는 인터랙티브 탐구 공간</p>
              </div>
              <button className="icon-pill active" onClick={() => showToast("ASTERA LAB은 다음 업데이트에서 열릴 예정이에요")}>
                LAB 시작하기 →
              </button>
            </div>
            <div className="lab-tools">
              {LAB_TOOLS.map((tool) => (
                <button key={tool.name} className="lab-tool" onClick={() => showToast(`${tool.name}은 준비 중이에요`)}>
                  <b>{tool.name}</b>
                  <span>{tool.kr}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
