"use client";
import { useState } from "react";
import Link from "next/link";
import { ACCESS } from "@/lib/learning/domain.mjs";
export default function LessonList({ items }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(0);
  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const filtered = items.filter(
    (i) =>
      (!category || i.category === category) &&
      (!status || (status === "published" ? i.version : !i.version)) &&
      `${i.title} ${i.stationId || ""}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 30)),
    current = Math.min(page, pages - 1),
    rows = filtered.slice(current * 30, (current + 1) * 30);
  function filter(setter, value) {
    setter(value);
    setPage(0);
  }
  return (
    <>
      <div className="learning-field-row learning-list-filters">
        <label>
          주제·정거장 ID 검색
          <input
            type="search"
            value={query}
            onChange={(e) => filter(setQuery, e.target.value)}
            placeholder="예: 돈키호테, TEC-30"
          />
        </label>
        <label>
          원문 분야
          <select
            value={category}
            onChange={(e) => filter(setCategory, e.target.value)}
          >
            <option value="">전체 분야</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          발행 상태
          <select
            value={status}
            onChange={(e) => filter(setStatus, e.target.value)}
          >
            <option value="">전체</option>
            <option value="draft">비공개 초안</option>
            <option value="published">발행</option>
          </select>
        </label>
      </div>
      <p role="status" className="learning-hint">
        {filtered.length}개 주제 · {current + 1} / {pages}쪽
      </p>
      <div className="learning-table-wrap">
        <table className="learning-table">
          <thead>
            <tr>
              <th>학습 주제</th>
              <th>공개 범위</th>
              <th>검토·발행 상태</th>
              <th>최근 변경</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id}>
                <td>
                  <b>{i.title}</b>
                  <small>
                    {i.stationId && `${i.stationId} · `}
                    {i.category || i.universe} · 20분
                  </small>
                </td>
                <td>{ACCESS[i.access]}</td>
                <td>
                  <span
                    className={`learning-tag ${i.version ? "published" : ""}`}
                  >
                    {i.version ? `발행 v${i.version}` : "비공개 초안"}
                  </span>
                  {i.source && (
                    <small>{i.reviewed ? "검토 완료" : "검토 대기"}</small>
                  )}
                </td>
                <td>
                  {new Intl.DateTimeFormat("ko-KR", {
                    timeZone: "Asia/Seoul",
                    month: "short",
                    day: "numeric",
                  }).format(new Date(i.updatedAt))}
                </td>
                <td>
                  <Link
                    className="learning-text-link"
                    href={`/admin/lessons/${i.id}`}
                  >
                    편집 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="learning-empty">조건에 맞는 주제가 없어요.</p>
        )}
      </div>
      <div className="learning-actions">
        <button
          className="learning-button secondary"
          disabled={current === 0}
          onClick={() => setPage(current - 1)}
        >
          ← 이전
        </button>
        <span>
          {current + 1} / {pages}
        </span>
        <button
          className="learning-button secondary"
          disabled={current + 1 >= pages}
          onClick={() => setPage(current + 1)}
        >
          다음 →
        </button>
      </div>
    </>
  );
}
