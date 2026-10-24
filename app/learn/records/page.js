import Link from "next/link";
import { redirect } from "next/navigation";
import { learningContext, dbCheck } from "@/lib/learning/server";
import { STAGES } from "@/lib/learning/domain.mjs";
export const metadata = { title: "나의 학습 기록 | ASTERA" };
export default async function RecordsPage() {
  let ctx;
  try {
    ctx = await learningContext();
  } catch {
    return (
      <main className="learning-shell">
        <h1>기록을 불러오지 못했어요</h1>
        <p>잠시 후 다시 접속해주세요.</p>
      </main>
    );
  }
  if (!ctx.configured)
    return (
      <main className="learning-shell">
        <h1>학습 기록을 준비하고 있어요</h1>
        <Link href="/learn">학습 목록으로</Link>
      </main>
    );
  if (!ctx.user) redirect("/login?next=/learn/records");
  let progress, catalog;
  try {
    [progress, catalog] = await Promise.all([
      ctx.db
        .from("learning_progress")
        .select("*")
        .eq("user_id", ctx.user.id)
        .order("updated_at", { ascending: false }),
      ctx.db.from("learning_catalog").select("*"),
    ]);
    dbCheck(progress);
    dbCheck(catalog);
  } catch {
    return (
      <main className="learning-shell">
        <h1>학습 기록을 준비하고 있어요</h1>
        <p>저장소 연결이 완료되면 내 기록을 확인할 수 있어요.</p>
        <Link href="/learn">학습 목록으로</Link>
      </main>
    );
  }
  return (
    <main className="learning-shell">
      <Link className="learning-back" href="/learn">
        ← 모든 학습
      </Link>
      <header className="learning-page-head">
        <div>
          <p className="learning-kicker">MY EXPLORATION</p>
          <h1>나의 학습 기록</h1>
          <p>질문에서 시작한 생각이 이렇게 쌓였어요.</p>
        </div>
      </header>
      {!progress.data.length ? (
        <section className="learning-panel learning-empty">
          <h2>아직 학습 기록이 없어요</h2>
          <p>관심 있는 주제를 골라 첫 번째 생각을 남겨보세요.</p>
          <Link className="learning-button" href="/learn">
            학습 시작하기
          </Link>
        </section>
      ) : (
        <div className="learning-record-list">
          {progress.data.map((p) => {
            const item = catalog.data.find(
              (c) => c.release_id === p.release_id,
            );
            return (
              <article className="learning-panel" key={p.release_id}>
                <div className="learning-toolbar">
                  <span
                    className={`learning-tag ${p.completed ? "published" : ""}`}
                  >
                    {p.completed ? "학습 완료" : `${p.step + 1}/5단계 학습 중`}
                  </span>
                  <small>
                    {new Date(p.updated_at).toLocaleDateString("ko-KR", {
                      timeZone: "Asia/Seoul",
                    })}
                  </small>
                </div>
                <h2>{item?.title || p.title || "이전 발행본의 학습 기록"}</h2>
                {item ? (
                  <Link
                    className="learning-text-link"
                    href={`/learn/${item.slug}`}
                  >
                    {p.completed ? "학습 다시 살펴보기" : "이어서 학습하기"} →
                  </Link>
                ) : (
                  <p className="learning-hint">
                    학습자료가 새 버전으로 바뀌었거나 공개가 중단됐어요. 이전에
                    남긴 내 답변은 보관돼요.
                  </p>
                )}
                <details>
                  <summary>내가 남긴 생각 보기</summary>
                  {STAGES.map((s) => (
                    <section key={s.id}>
                      <h3>{s.label}</h3>
                      <p className="learning-prose">
                        {p.answers[s.id] || "아직 남긴 생각이 없어요."}
                      </p>
                    </section>
                  ))}
                </details>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
