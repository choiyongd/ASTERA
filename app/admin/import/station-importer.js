"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  validateStationPack,
  STATION_FORMAT,
} from "@/lib/learning/stations.mjs";
import { learningRequest } from "@/lib/learning/client";
export default function StationImporter() {
  const [pack, setPack] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [results, setResults] = useState([]),
    [cursor, setCursor] = useState(0);
  const stop = useRef(false);
  async function choose(event) {
    const file = event.target.files?.[0];
    setError("");
    setPack(null);
    setCursor(0);
    setResults([]);
    if (!file) return;
    try {
      if (file.size > 20 * 1024 * 1024)
        throw Error("20MB 이하의 변환 JSON 파일을 선택해주세요.");
      setPack(validateStationPack(JSON.parse(await file.text())));
    } catch (e) {
      setError(e.message);
    }
  }
  async function start() {
    setBusy(true);
    setError("");
    stop.current = false;
    try {
      for (let i = cursor; i < pack.entries.length; i += 5) {
        if (stop.current) break;
        const result = await learningRequest("/api/admin/stations", {
          format: STATION_FORMAT,
          entries: pack.entries.slice(i, i + 5),
        });
        setResults((old) => [...old, ...result.results]);
        setCursor(Math.min(i + 5, pack.entries.length));
      }
    } catch (e) {
      setError(e.message + " 다시 누르면 마지막 확인 지점부터 이어갑니다.");
    } finally {
      setBusy(false);
    }
  }
  const counts = results.reduce(
      (o, r) => ((o[r.status] = (o[r.status] || 0) + 1), o),
      {},
    ),
    categories = pack
      ? Object.entries(
          pack.entries.reduce(
            (o, e) => ((o[e.category] = (o[e.category] || 0) + 1), o),
            {},
          ),
        )
      : [];
  return (
    <main className="learning-shell">
      <Link className="learning-back" href="/admin">
        ← 학습자료 관리
      </Link>
      <header className="learning-page-head">
        <div>
          <p className="learning-kicker">ASTERA STUDIO / IMPORT</p>
          <h1>교양 정거장 가져오기</h1>
          <p>자료집의 질문을, 수정할 수 있는 온라인 수업으로.</p>
        </div>
      </header>
      <section className="learning-panel">
        <h2>01. 변환 자료 확인</h2>
        <p className="learning-hint">
          교양 정거장 v0.2 전용 변환 파일을 불러옵니다. 원본 PDF 파일 업로드와
          별도로 진행해요.
        </p>
        <label className="learning-upload">
          정거장 변환 JSON 선택
          <input
            type="file"
            accept=".json,application/json"
            onChange={choose}
            disabled={busy}
          />
          <small>최대 570개 주제 · 20MB</small>
        </label>
        {error && (
          <p role="alert" className="learning-error">
            {error}
          </p>
        )}
        {pack && (
          <>
            <p>
              <b>
                {pack.entries.length}개 정거장 · {categories.length}개 원문 분야
              </b>
            </p>
            <div className="learning-meta">
              {categories.map(([name, count]) => (
                <span key={name}>
                  {name} {count}
                </span>
              ))}
            </div>
            <details>
              <summary>등록 예정 주제 확인</summary>
              <ol className="learning-import-preview">
                {pack.entries.map((e) => (
                  <li key={e.stationId}>
                    {e.stationId} · {e.draft.title}
                  </li>
                ))}
              </ol>
            </details>
          </>
        )}
      </section>
      <section className="learning-panel">
        <h2>02. 관리자 비공개 초안으로 등록</h2>
        <p>
          학생용 읽기·활동·질문은 5단계 편집기에, 교사용 발문·예상 답·검수
          사항은 관리자 전용 메모에 저장해요. 원문 40분 활동을 바탕으로 20분
          핵심 흐름과 추가 활동을 구성했어요.
        </p>
        <p className="learning-note">
          기존 주제와 관리자 수정본은 덮어쓰지 않아요. 같은 자료를 다시 가져와도
          중복되지 않습니다. 각 주제를 검토하고 직접 발행해야 학습자에게
          공개돼요.
        </p>
        <div className="learning-actions">
          <button
            className="learning-button"
            disabled={!pack || busy || cursor === pack?.entries.length}
            onClick={start}
          >
            {busy ? "등록 중…" : cursor ? "등록 이어가기" : "비공개 초안 등록"}
          </button>
          {busy && (
            <button
              className="learning-button secondary"
              onClick={() => {
                stop.current = true;
              }}
            >
              현재 묶음 후 멈추기
            </button>
          )}
          <Link href="/admin" className="learning-text-link">
            등록된 주제 관리 →
          </Link>
        </div>
        {pack && (
          <>
            <progress
              className="learning-import-progress"
              value={cursor}
              max={pack.entries.length}
              aria-label="정거장 등록 진행률"
            />
            <p role="status">
              {cursor} / {pack.entries.length}개 확인 · 새 등록{" "}
              {counts.created || 0} · 기존 자료 유지 {counts.skipped || 0} ·
              충돌 {counts.conflict || 0}
              {cursor === pack.entries.length ? " · 등록 확인 완료" : ""}
            </p>
          </>
        )}
        {!!counts.conflict && (
          <div role="alert">
            <p>
              같은 ID의 다른 자료가 있어 유지했어요. 해당 주제를 개별
              확인해주세요.
            </p>
            <ul>
              {results
                .filter((r) => r.status === "conflict")
                .map((r) => (
                  <li key={r.stationId}>{r.stationId}</li>
                ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
