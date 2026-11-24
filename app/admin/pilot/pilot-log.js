"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { learningRequest } from "@/lib/learning/client";
import { PILOT_BANDS, PILOT_BLOCKERS, PILOT_OUTCOMES } from "@/lib/learning/pilot.mjs";

function Options({ choices }) {
  return Object.entries(choices).map(([value, label]) => <option value={value} key={value}>{label}</option>);
}

export default function PilotLog({ item }) {
  const [entries, setEntries] = useState(item.observations);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const pending = useRef(null);

  async function save(event) {
    event.preventDefault();
    if (pending.current?.inFlight) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const payload = { ...values, minutes: Number(values.minutes), revision: item.revision };
    const signature = JSON.stringify(payload);
    const observationId = pending.current?.signature === signature ? pending.current.id : crypto.randomUUID();
    pending.current = { signature, id: observationId, inFlight: true };
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const result = await learningRequest(`/api/admin/pilot/${item.id}`, { ...payload, observationId });
      setEntries(result.observations);
      pending.current = null;
      form.reset();
      setStatus("검수 관찰을 기록했어요.");
    } catch (e) {
      pending.current.inFlight = false;
      setError(e.message);
    } finally { setSaving(false); }
  }

  return (
    <section className="learning-panel">
      <p className="learning-kicker">{item.focus}</p>
      <h2>{item.title}</h2>
      <p><strong>적용 기준</strong> {item.criterion}</p>
      <div className="learning-actions">
        <Link className="learning-button" href={`/admin/lessons/${item.id}/preview?revision=${item.revision}`} target="_blank" rel="noreferrer">학생 화면 미리보기 ↗</Link>
        <Link className="learning-button secondary" href={`/admin/lessons/${item.id}`}>초안 검토</Link>
      </div>
      <details className="learning-stage-editor">
        <summary><b>관찰 기록 남기기</b><span>초안 {item.revision}판</span></summary>
        <form onSubmit={save}>
          <fieldset disabled={saving}>
            <legend>학생 관찰</legend>
            <label>학년군<select name="band" required defaultValue=""><option value="" disabled>선택</option><Options choices={PILOT_BANDS} /></select></label>
            <label>소요 시간(분)<input name="minutes" type="number" min="1" max="90" step="1" required /></label>
            <label>가장 막힌 단계<select name="blocker" required defaultValue=""><option value="" disabled>선택</option><Options choices={PILOT_BLOCKERS} /></select></label>
            <label>적용 결과<select name="outcome" required defaultValue=""><option value="" disabled>선택</option><Options choices={PILOT_OUTCOMES} /></select></label>
            <button className="learning-button" type="submit">{saving ? "저장 중…" : "관찰 저장"}</button>
          </fieldset>
          {status && <p role="status">{status}</p>}
          {error && <p role="alert">{error}</p>}
        </form>
      </details>
      <details className="learning-stage-editor">
        <summary><b>학년군별 결과</b><span>{entries.length}건</span></summary>
        {Object.entries(PILOT_BANDS).map(([band, label]) => {
          const records = entries.filter((e) => e.band === band);
          const independent = records.filter((r) => r.outcome === "independent").length;
          const observed = records.filter((r) => r.outcome !== "not_observed").length;
          return <section key={band}>
            <h3>{label}</h3>
            {records.length ? <><p>평균 {Math.round(records.reduce((sum, r) => sum + r.minutes, 0) / records.length)}분 · 스스로 적용 {independent}/{observed}건</p><ul>{[...records].reverse().map((r) => <li key={r.id}>
              초안 {r.revision}판 · {r.minutes}분 · {PILOT_BLOCKERS[r.blocker]} · {PILOT_OUTCOMES[r.outcome]}
            </li>)}</ul></> : <p className="learning-hint">관찰을 기록하면 여기에 나타나요.</p>}
          </section>;
        })}
      </details>
    </section>
  );
}
