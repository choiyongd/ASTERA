"use client";
import { useState } from "react";
const names = {
  SCIENCE: "과학",
  TECH: "기술",
  HISTORY: "역사",
  ECONOMY: "경제",
  LITERATURE: "문학",
  ART: "예술",
  HUMAN: "인간",
  ENGINEERING: "공학",
};
export default function LearningCharts({ analytics }) {
  const [view, setView] = useState("universe");
  return (
    <section className="learning-dashboard-charts">
      <div
        className="learning-chart-tabs"
        role="tablist"
        aria-label="학습 그래프 종류"
      >
        {[
          ["universe", "유니버스별 학습"],
          ["competency", "역량 변화"],
          ["history", "학습 흐름"],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            id={`chart-tab-${id}`}
            aria-selected={view === id}
            aria-controls={`chart-panel-${id}`}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`chart-panel-${view}`}
        aria-labelledby={`chart-tab-${view}`}
        className="learning-panel"
      >
        {view === "universe" ? (
          <>
            <h2>여덟 개의 렌즈, 나의 탐구 정도</h2>
            <p className="learning-hint">
              현재 발행된 과정 중 완료한 비율이에요. 새 발행본은 다시 학습할 수
              있어요.
            </p>
            <div className="learning-universe-chart">
              {analytics.universes.map((u) => (
                <div key={u.universe}>
                  <div>
                    <b>{names[u.universe]}</b>
                    <span>
                      {u.completed}/{u.total}개{" "}
                      {u.total ? `· ${u.percent}%` : "· 준비 중"}
                    </span>
                  </div>
                  <div
                    className="learning-bar-track"
                    role="meter"
                    aria-label={`${names[u.universe]} 학습 완료율`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={u.percent}
                  >
                    <span style={{ width: `${u.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : view === "competency" ? (
          <>
            <h2>학습 전후, 나의 자신감 변화</h2>
            <p className="learning-hint">
              완료한 {analytics.assessedCount}개 주제의 최신 자기평가
              평균이에요. 1~5점 척도이며 객관적인 시험 성적이나 진단 결과를
              뜻하지 않아요.
            </p>
            {!analytics.assessedCount ? (
              <div className="learning-chart-empty">
                학습 전후 자기평가를 마친 주제가 생기면 변화가 나타나요.
              </div>
            ) : (
              <>
                <div className="learning-chart-legend">
                  <span className="pre">학습 전</span>
                  <span className="post">학습 후</span>
                </div>
                <div className="learning-competency-chart">
                  {analytics.competencies.map((c) => (
                    <div key={c.id}>
                      <div>
                        <b>{c.label}</b>
                        <span>
                          {c.pre.toFixed(1)} → {c.post.toFixed(1)}{" "}
                          <em>
                            {c.change > 0 ? "+" : ""}
                            {c.change.toFixed(1)}
                          </em>
                        </span>
                      </div>
                      <div className="learning-bar-track pre">
                        <span style={{ width: `${(c.pre / 5) * 100}%` }} />
                      </div>
                      <div className="learning-bar-track post">
                        <span style={{ width: `${(c.post / 5) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h2>질문이 쌓여온 시간</h2>
            <p className="learning-hint">
              주제별 최신 완료 기록으로 살펴본 누적 학습 수예요.
            </p>
            {!analytics.timeline.length ? (
              <div className="learning-chart-empty">
                첫 주제를 완료하면 학습 흐름이 시작돼요.
              </div>
            ) : (
              <>
                <svg
                  viewBox="0 0 640 220"
                  role="img"
                  aria-label={`총 ${analytics.totalCompleted}개 주제 완료 기록`}
                >
                  <line x1="40" y1="180" x2="610" y2="180" stroke="#dbe3ed" />
                  <line x1="40" y1="25" x2="40" y2="180" stroke="#dbe3ed" />
                  <polyline
                    fill="none"
                    stroke="#294d75"
                    strokeWidth="3"
                    points={analytics.timeline
                      .map(
                        (p, i) =>
                          `${40 + (analytics.timeline.length === 1 ? 285 : (i / (analytics.timeline.length - 1)) * 560)},${180 - (p.total / Math.max(analytics.totalCompleted, 1)) * 140}`,
                      )
                      .join(" ")}
                  />
                  {analytics.timeline.map((p, i) => (
                    <g key={p.date}>
                      <circle
                        cx={
                          40 +
                          (analytics.timeline.length === 1
                            ? 285
                            : (i / (analytics.timeline.length - 1)) * 560)
                        }
                        cy={
                          180 -
                          (p.total / Math.max(analytics.totalCompleted, 1)) *
                            140
                        }
                        r="5"
                        fill="#d9a441"
                      >
                        <title>
                          {p.date}: {p.total}개
                        </title>
                      </circle>
                    </g>
                  ))}
                  <text x="45" y="210" fontSize="12" fill="#687b92">
                    {analytics.timeline[0].date}
                  </text>
                  <text
                    x="600"
                    y="210"
                    textAnchor="end"
                    fontSize="12"
                    fill="#687b92"
                  >
                    {analytics.timeline.at(-1).date}
                  </text>
                </svg>
                <details>
                  <summary>날짜별 학습 수 보기</summary>
                  <ul>
                    {analytics.timeline.map((p) => (
                      <li key={p.date}>
                        {p.date} · 누적 {p.total}개
                      </li>
                    ))}
                  </ul>
                </details>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
