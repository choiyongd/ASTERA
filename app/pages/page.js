import Link from "next/link";
import { learningContext, dbCheck } from "@/lib/learning/server";
export default async function SitePages() {
  const ctx = await learningContext();
  const pages = ctx.db
    ? dbCheck(
        await ctx.db
          .from("site_page_catalog")
          .select("*")
          .order("published_at", { ascending: false }),
      )
    : [];
  return (
    <main className="learning-shell">
      <p className="learning-kicker">ASTERA / GUIDES & UPDATES</p>
      <h1>ASTERA 안내</h1>
      <p>배움을 돕는 가이드와 새로운 소식을 확인하세요.</p>
      {pages.length ? (
        <div className="learning-record-list">
          {pages.map((p) => (
            <article className="learning-panel" key={p.id}>
              <h2>{p.title}</h2>
              <p>{p.summary}</p>
              <Link className="learning-text-link" href={`/pages/${p.slug}`}>
                자세히 보기 →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <section className="learning-panel learning-empty">
          <h2>새로운 안내를 준비하고 있어요</h2>
          <Link className="learning-button" href="/learn">
            학습 둘러보기
          </Link>
        </section>
      )}
    </main>
  );
}
