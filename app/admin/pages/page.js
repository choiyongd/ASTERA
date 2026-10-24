import Link from "next/link";
import { learningContext, dbCheck } from "@/lib/learning/server";
import AdminGate from "../admin-gate";
export default async function PageManager() {
  const ctx = await learningContext();
  if (!ctx.admin) return <AdminGate {...ctx} />;
  const pages = dbCheck(
    await ctx.db
      .from("site_pages")
      .select("*")
      .order("updated_at", { ascending: false }),
  );
  return (
    <main className="learning-shell">
      <header className="learning-page-head">
        <div>
          <p className="learning-kicker">ASTERA STUDIO / PAGES</p>
          <h1>페이지 관리</h1>
          <p>공지·이용 가이드·교육 소개 페이지를 작성하고 발행하세요.</p>
        </div>
        <Link className="learning-button" href="/admin/pages/new">
          새 페이지 만들기 +
        </Link>
      </header>
      <section className="learning-panel">
        {pages.length ? (
          <div className="learning-table-wrap">
            <table className="learning-table">
              <thead>
                <tr>
                  <th>페이지</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>{p.draft.title}</b>
                      <small>/pages/{p.draft.slug || "주소 미설정"}</small>
                    </td>
                    <td>
                      <span className="learning-tag">
                        {p.published ? "발행됨" : "초안"}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="learning-text-link"
                        href={`/admin/pages/${p.id}`}
                      >
                        편집 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="learning-empty">
            <h2>첫 안내 페이지를 만들어보세요</h2>
            <p>발행한 페이지는 사이트 안내 목록에 나타나요.</p>
          </div>
        )}
      </section>
      <p className="learning-footnote">
        이 화면에서는 별도의 안내 페이지를 관리해요. 기존 홈페이지의 프로그램과
        레이아웃 수정은 개발 배포로 반영합니다.
      </p>
    </main>
  );
}
