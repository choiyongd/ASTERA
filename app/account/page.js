import { redirect } from "next/navigation";
import Link from "next/link";
import NavBar from "../nav-bar";
import LogoutButton from "./logout-button";
import { learningContext, dbCheck, catalogState } from "@/lib/learning/server";
import { learningAnalytics } from "@/lib/learning/analytics.mjs";
import LearningCharts from "./components/learning-charts";
import "../learn/learning.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "마이페이지 | ASTERA" };
export default async function AccountPage() {
  const ctx = await learningContext();
  if (!ctx.user) redirect("/login?next=/account");
  const [{ items: catalog }, result] = await Promise.all([
    catalogState(ctx),
    ctx.db
      .from("learning_progress")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("updated_at", { ascending: false }),
  ]);
  const records = dbCheck(result) || [],
    analytics = learningAnalytics(catalog, records),
    profile = ctx.profile;
  const isMember =
    profile?.is_member && Number(profile.membership_expires_at) > Date.now();
  return (
    <>
      <NavBar />
      <main className="learning-shell">
        <header className="learning-page-head">
          <div>
            <p className="learning-kicker">MY ASTERA</p>
            <h1>나의 배움이 쌓이는 곳</h1>
            <p>
              {ctx.user.email} ·{" "}
              {ctx.user.emailVerified
                ? "이메일 인증 완료"
                : "이메일 인증을 완료해주세요"}
            </p>
          </div>
          <div className="learning-actions">
            <Link className="learning-button" href="/learn">
              새로운 질문 찾기
            </Link>
            <LogoutButton />
          </div>
        </header>
        <div className="learning-stats">
          <article>
            <span>완료한 주제</span>
            <b>
              {analytics.totalCompleted}
              <small>개</small>
            </b>
          </article>
          <article>
            <span>진행 중인 학습</span>
            <b>
              {analytics.inProgress}
              <small>개</small>
            </b>
          </article>
          <article>
            <span>자기평가를 마친 주제</span>
            <b>
              {analytics.assessedCount}
              <small>개</small>
            </b>
          </article>
          <article>
            <span>멤버십</span>
            <b className="learning-stat-text">
              {isMember ? "이용 중" : "무료 회원"}
            </b>
            {isMember && (
              <small>
                {new Date(profile.membership_expires_at).toLocaleDateString(
                  "ko-KR",
                  { timeZone: "Asia/Seoul" },
                )}
                까지
              </small>
            )}
          </article>
        </div>
        <LearningCharts analytics={analytics} />
        <section className="learning-panel">
          <div className="learning-toolbar">
            <h2>최근 학습</h2>
            <Link href="/learn/records">전체 학습 이력 →</Link>
          </div>
          {records.length ? (
            <div className="learning-recent-list">
              {records.slice(0, 6).map((r) => {
                const course = catalog.find(
                  (c) => c.release_id === r.release_id,
                );
                return (
                  <article key={r.release_id}>
                    <div>
                      <span className="learning-tag">
                        {r.completed ? "완료" : `${r.step + 1}/5단계`}
                      </span>
                      <h3>{course?.title || r.title || "이전 발행본 학습"}</h3>
                      <small>
                        {new Date(r.updated_at).toLocaleDateString("ko-KR", {
                          timeZone: "Asia/Seoul",
                        })}
                      </small>
                    </div>
                    <Link
                      className="learning-text-link"
                      href={course ? `/learn/${course.slug}` : "/learn/records"}
                    >
                      {course
                        ? r.completed
                          ? "다시 보기"
                          : "이어서 학습"
                        : "기록 보기"}{" "}
                      →
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="learning-empty">
              <h3>아직 남긴 학습 기록이 없어요</h3>
              <p>궁금한 주제를 고르고 첫 번째 생각을 남겨보세요.</p>
              <Link className="learning-button" href="/learn?access=public">
                무료 학습 찾기
              </Link>
            </div>
          )}
        </section>
        {ctx.admin && (
          <aside className="learning-catalog-note">
            <b>ASTERA 관리자</b>
            <p>
              학습자료와 페이지를 관리하고 회원의 학습 현황을 확인할 수 있어요.
            </p>
            <Link href="/admin">관리자 페이지 열기 →</Link>
          </aside>
        )}
      </main>
    </>
  );
}
