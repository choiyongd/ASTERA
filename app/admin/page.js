import Link from "next/link";
import { learningContext, dbCheck } from "@/lib/learning/server";
import { ACCESS } from "@/lib/learning/domain.mjs";
import AdminGate from "./admin-gate";
export const metadata = { title: "학습자료 관리 | ASTERA" };
export default async function AdminPage() {
  let ctx;
  try {
    ctx = await learningContext();
  } catch {
    return <AdminGate configured user unavailable />;
  }
  if (!ctx.admin) return <AdminGate {...ctx} />;
  let lessons, catalog;
  try {
    [lessons, catalog] = await Promise.all([
      ctx.db
        .from("learning_lessons")
        .select("id,draft,revision,updated_at")
        .order("updated_at", { ascending: false }),
      ctx.db.from("learning_catalog").select("*"),
    ]);
    dbCheck(lessons);
    dbCheck(catalog);
  } catch {
    return <AdminGate {...ctx} unavailable />;
  }
  return (
    <main className="learning-shell">
      <header className="learning-page-head">
        <div>
          <p className="learning-kicker">ASTERA STUDIO / MATERIALS</p>
          <h1>학습자료 관리</h1>
          <p>자료를 연결하고, 한 주제의 배움으로 엮으세요.</p>
        </div>
        <Link className="learning-button" href="/admin/lessons/new">
          새 주제 만들기 +
        </Link>
      </header>
      <div className="learning-toolbar">
        <span>
          {lessons.data.length}개 주제 · {catalog.data.length}개 발행
        </span>
        <Link href="/learn">학습 사이트 보기 ↗</Link>
      </div>
      <div className="learning-panel">
        {!lessons.data.length ? (
          <div className="learning-empty">
            <h2>첫 번째 20분 학습을 만들어보세요</h2>
            <p>
              PDF나 웹앱을 연결하고 5단계 안내를 작성한 뒤 발행하면 학습 목록에
              나타나요.
            </p>
            <Link className="learning-button" href="/admin/lessons/new">
              첫 주제 등록
            </Link>
          </div>
        ) : (
          <div className="learning-table-wrap">
            <table className="learning-table">
              <thead>
                <tr>
                  <th>학습 주제</th>
                  <th>공개 범위</th>
                  <th>발행 상태</th>
                  <th>최근 변경</th>
                  <th>
                    <span className="learning-sr">관리</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lessons.data.map((lesson) => {
                  const pub = catalog.data.find(
                    (c) => c.lesson_id === lesson.id,
                  );
                  return (
                    <tr key={lesson.id}>
                      <td>
                        <b>{lesson.draft.title}</b>
                        <small>{lesson.draft.universe} · 20분</small>
                      </td>
                      <td>{ACCESS[lesson.draft.access]}</td>
                      <td>
                        <span
                          className={`learning-tag ${pub ? "published" : ""}`}
                        >
                          {pub ? `발행 v${pub.version}` : "초안"}
                        </span>
                      </td>
                      <td>
                        {new Intl.DateTimeFormat("ko-KR", {
                          timeZone: "Asia/Seoul",
                          month: "short",
                          day: "numeric",
                        }).format(new Date(lesson.updated_at))}
                      </td>
                      <td>
                        <Link
                          href={`/admin/lessons/${lesson.id}`}
                          className="learning-text-link"
                        >
                          편집 →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="learning-footnote">
        초안 수정은 학습자에게 보이지 않아요. 저장 후 발행해야 사이트에
        반영돼요.
      </p>
    </main>
  );
}
