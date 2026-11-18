import Link from "next/link";
import { FIRST_TOPICS } from "@/lib/lab/catalog.mjs";
import { UniverseIcon } from "../universe-icons";

export default function LabStarters() {
  return (
    <section className="learning-starters" aria-labelledby="lab-starters-title">
      <div className="learning-toolbar">
        <div>
          <h2 id="lab-starters-title">지금 시작할 수 있는 무료 탐구</h2>
          <p>로그인 없이 5–10분 동안 직접 해 보세요. 기록은 이용 중인 브라우저에 저장돼요.</p>
        </div>
        <Link href="/lab">모든 LAB 보기 →</Link>
      </div>
      <div className="learning-starter-grid">
        {FIRST_TOPICS.filter((t) => t.status === "ready").slice(0, 6).map((topic) => (
          <Link className="learning-starter-card" href={`/lab/${topic.id}`} key={topic.id}>
            <UniverseIcon name={topic.universe} size={42} />
            <span>{topic.kr} · 무료 LAB · 5–10분</span>
            <h3>{topic.title}</h3>
            <p>{topic.activity}</p>
            <b>탐구 시작 →</b>
          </Link>
        ))}
      </div>
    </section>
  );
}
