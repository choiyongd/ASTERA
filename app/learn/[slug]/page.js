import Link from "next/link";
import { notFound } from "next/navigation";
import {
  learningContext,
  dbCheck,
  releaseMaterials,
} from "@/lib/learning/server";
import { ACCESS, canAccess } from "@/lib/learning/domain.mjs";
import LearningPlayer from "../learning-player";
export default async function LearningDetailPage({ params }) {
  const { slug } = await params;
  let ctx;
  try {
    ctx = await learningContext();
  } catch {
    return (
      <main className="learning-shell">
        <section className="learning-panel learning-empty">
          <h1>연결을 확인하고 있어요</h1>
          <p>잠시 후 다시 시도해주세요.</p>
          <Link href="/learn">학습 목록으로</Link>
        </section>
      </main>
    );
  }
  if (!ctx.db)
    return (
      <main className="learning-shell">
        <section className="learning-panel learning-empty">
          <h1>학습을 준비하고 있어요</h1>
          <Link href="/learn">학습 목록으로</Link>
        </section>
      </main>
    );
  const catalog = dbCheck(
    await ctx.db
      .from("learning_catalog")
      .select("*")
      .eq("slug", slug)
      .maybeSingle(),
  );
  if (!catalog) notFound();
  const permitted =
    ctx.admin || canAccess(catalog.access, ctx.user, ctx.profile);
  if (!permitted)
    return (
      <main className="learning-shell">
        <Link className="learning-back" href="/learn">
          ← 모든 학습
        </Link>
        <section className="learning-panel learning-lock">
          <p className="learning-kicker">
            {catalog.universe} / {ACCESS[catalog.access]}
          </p>
          <h1>{catalog.title}</h1>
          <p>{catalog.summary}</p>
          <span className="learning-tag">{catalog.age_group} · 약 20분</span>
          <hr />
          <h2>
            {!ctx.user
              ? "로그인하고 탐구를 이어가세요"
              : "멤버십으로 이용하는 학습이에요"}
          </h2>
          <p>
            {!ctx.user
              ? "학습 본문과 연결 자료를 이용하려면 로그인해주세요."
              : "현재 유효한 멤버십이 필요해요. 무료 체험 주제도 둘러볼 수 있어요."}
          </p>
          <div className="learning-actions">
            <Link
              className="learning-button"
              href={
                !ctx.user
                  ? `/login?next=${encodeURIComponent(`/learn/${catalog.slug}`)}`
                  : "/pricing"
              }
            >
              {!ctx.user ? "로그인" : "멤버십 알아보기"}
            </Link>
            <Link
              className="learning-button secondary"
              href="/learn?access=public"
            >
              무료 체험 보기
            </Link>
          </div>
        </section>
      </main>
    );
  const release = dbCheck(
    await ctx.db
      .from("learning_releases")
      .select("id,content,version")
      .eq("id", catalog.release_id)
      .maybeSingle(),
  );
  if (!release) notFound();
  const [materials, progress] = await Promise.all([
    releaseMaterials(ctx.db, release.content),
    ctx.user
      ? ctx.db
          .from("learning_progress")
          .select("*")
          .eq("release_id", release.id)
          .eq("user_id", ctx.user.id)
          .maybeSingle()
          .then(dbCheck)
      : null,
  ]);
  return (
    <LearningPlayer
      key={release.id}
      content={release.content}
      releaseId={release.id}
      version={release.version}
      materials={materials}
      initialProgress={progress}
      authenticated={Boolean(ctx.user)}
    />
  );
}
