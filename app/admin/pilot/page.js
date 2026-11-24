import Link from "next/link";
import { dbCheck, learningContext } from "@/lib/learning/server";
import { PILOT_TOPICS } from "@/lib/learning/pilot.mjs";
import AdminGate from "../admin-gate";
import PilotLog from "./pilot-log";

export const metadata = { title: "학생 검수 | ASTERA" };

export default async function PilotPage() {
  let ctx;
  try { ctx = await learningContext(); }
  catch { return <AdminGate configured user unavailable />; }
  if (!ctx.admin) return <AdminGate {...ctx} />;

  let drafts;
  try {
    drafts = dbCheck(await ctx.db.from("learning_lessons")
      .select("id,draft,revision,pilot_observations").in("id", PILOT_TOPICS.map(({ id }) => id)));
  } catch { return <AdminGate {...ctx} unavailable />; }
  const byId = new Map(drafts.map((row) => [row.id, row]));
  return (
    <main className="learning-shell">
      <Link className="learning-back" href="/admin">← 학습자료 관리</Link>
      <header className="learning-page-head">
        <div><p className="learning-kicker">ASTERA STUDIO</p><h1>학생 검수</h1><p>두 학년군이 같은 주제를 풀 때 어디서 막히고, 배운 내용을 어떻게 쓰는지 살펴봐요.</p></div>
      </header>
      <section className="learning-panel" aria-labelledby="pilot-guide">
        <h2 id="pilot-guide">한 사람당 약 20분</h2>
        <ol>
          <li>표본 주제 하나를 골라 관리자 계정으로 미리보기를 열어 주세요.</li>
          <li>학생이 스스로 읽고 풀도록 지켜봐 주세요. 힌트를 줬다면 적용 결과에 표시해 주세요.</li>
          <li>소요 시간과 가장 막힌 단계, 아래에 적힌 적용 기준을 충족했는지 기록해 주세요.</li>
        </ol>
        <p className="learning-hint">관찰표에는 학년군만 남겨요. 학생 이름, 학교, 연락처, 답안은 수집하지 않아요.</p>
      </section>
      {PILOT_TOPICS.map((topic) => {
        const item = byId.get(topic.id);
        return item && <PilotLog key={item.id} item={{ ...topic, title: item.draft.title, revision: item.revision, observations: item.pilot_observations ?? [] }} />;
      })}
      {!drafts.length && <p className="learning-hint">표본 주제의 초안이 등록되면 여기에 나타나요.</p>}
    </main>
  );
}
