import Link from "next/link";
import { notFound } from "next/navigation";
import { learningContext, dbCheck } from "@/lib/learning/server";
export default async function SitePage({ params }) {
  const { slug } = await params;
  const ctx = await learningContext();
  if (!ctx.db) notFound();
  const page = dbCheck(
    await ctx.db
      .from("site_page_catalog")
      .select("*")
      .eq("id", slug)
      .maybeSingle(),
  );
  if (!page) notFound();
  return (
    <main className="learning-shell">
      <Link className="learning-back" href="/pages">
        ← ASTERA 안내
      </Link>
      <article className="learning-panel learning-cms">
        <p className="learning-kicker">ASTERA / GUIDE</p>
        <h1>{page.title}</h1>
        <p>{page.summary}</p>
        {page.sections.map((section, i) => (
          <section key={i}>
            <h2>{section.heading}</h2>
            <p className="learning-prose">{section.body}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
