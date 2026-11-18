"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_LAB_TOPICS } from "@/lib/lab/catalog.mjs";
import { courseStorageKey, restoreCourse } from "@/lib/lab/course.mjs";
import { STORAGE_KEY, restoreMission } from "@/lib/lab/science.mjs";
import { ACTIVITIES } from "@/lib/lab/activities.mjs";

export default function LocalLabRecords() {
  const [records, setRecords] = useState([]);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const found = [];
    for (const topic of ALL_LAB_TOPICS) {
      try {
        const science = topic.id === "science-001";
        const raw = localStorage.getItem(science ? STORAGE_KEY : courseStorageKey(topic.id));
        if (!raw) continue;
        const saved = JSON.parse(raw);
        const record = science ? restoreMission(saved) : restoreCourse(saved, topic, ACTIVITIES[topic.id]);
        const started = record.initial || record.initialReason;
        if (record.step > 0 || started) found.push({ ...topic, step: record.step, completed: record.completed });
      } catch {
        setUnavailable(true);
      }
    }
    setRecords(found);
  }, []);
  return (
    <section className="learning-panel">
      <div className="learning-toolbar"><h2>이 기기에 남긴 LAB 탐구</h2><Link href="/lab">LAB 둘러보기 →</Link></div>
      <p className="learning-hint">LAB 기록은 이 브라우저에 저장돼요. 다른 기기에서 로그인하면 계정의 20분 학습 기록을 볼 수 있어요.</p>
      {records.length ? <div className="learning-recent-list">{records.map((r) => (
        <article key={r.id}><div><span className="learning-tag">{r.completed ? "탐구 완료" : `${r.step + 1}/5단계`}</span><h3>{r.title}</h3></div>
          <Link className="learning-text-link" href={`/lab/${r.id}`}>{r.completed ? "내 탐구 보기" : "이어서 하기"} →</Link>
        </article>
      ))}</div> : <p>{unavailable ? "이 브라우저에서 LAB 기록을 불러오지 못했어요." : "첫 무료 탐구를 시작하고 이 기기에서 이어 해 보세요."}</p>}
    </section>
  );
}
