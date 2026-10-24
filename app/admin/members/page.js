import { learningContext, dbCheck } from "@/lib/learning/server";
import AdminGate from "../admin-gate";
export default async function MembersPage() {
  const ctx = await learningContext();
  if (!ctx.admin) return <AdminGate {...ctx} />;
  const [users, progress] = await Promise.all([
    ctx.db
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),
    ctx.db.from("learning_progress").select("*"),
  ]);
  const members = dbCheck(users),
    records = dbCheck(progress);
  return (
    <main className="learning-shell">
      <p className="learning-kicker">ASTERA STUDIO / MEMBERS</p>
      <h1>회원과 학습 현황</h1>
      <p className="learning-hint">
        가입한 회원의 학습 수와 최근 활동을 확인하세요. 학습 답변과 자기평가는
        개인의 기록으로 보관해요.
      </p>
      <div className="learning-stats">
        <article>
          <span>전체 회원</span>
          <b>
            {members.length}
            <small>명</small>
          </b>
        </article>
        <article>
          <span>완료한 학습 기록</span>
          <b>
            {records.filter((r) => r.completed).length}
            <small>건</small>
          </b>
        </article>
      </div>
      <section className="learning-panel">
        <div className="learning-table-wrap">
          <table className="learning-table">
            <thead>
              <tr>
                <th>회원</th>
                <th>가입일</th>
                <th>학습 중</th>
                <th>완료</th>
                <th>최근 기록</th>
              </tr>
            </thead>
            <tbody>
              {members.map((user) => {
                const history = records
                  .filter((p) => p.user_id === user.id)
                  .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
                return (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.created_at?.slice(0, 10) || "—"}</td>
                    <td>{history.filter((r) => !r.completed).length}개</td>
                    <td>{history.filter((r) => r.completed).length}개</td>
                    <td>
                      {history[0]?.updated_at.slice(0, 10) || "기록 없음"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!members.length && (
            <p className="learning-empty">아직 가입한 회원이 없어요.</p>
          )}
        </div>
      </section>
    </main>
  );
}
