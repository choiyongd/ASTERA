import Link from "next/link";
import { learningContext, catalogState } from "@/lib/learning/server";
import { ACCESS } from "@/lib/learning/domain.mjs";
import { UniverseIcon } from "../universe-icons";
export const metadata = {
  title: "20분 학습 | ASTERA",
  description: "PDF와 웹앱으로 질문하고 탐구하는 ASTERA의 20분 학습.",
};
export default async function LearningPage({ searchParams }) {
  let ctx;
  try {
    ctx = await learningContext();
  } catch {
    ctx = { configured: false };
  }
  const { items, setup } = await catalogState(ctx);
  const { q = "", access = "all" } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 100) : "";
  const filtered = items.filter(
    (i) =>
      (access === "all" || i.access === access) &&
      `${i.title} ${i.summary} ${i.universe}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  return (
    <main className="learning-shell">
      <header className="learning-page-head">
        <div>
          <p className="learning-kicker">ASTERA / LEARNING</p>
          <h1>하나의 질문, 20분의 탐구</h1>
          <p>읽고, 직접 해보고, 나의 생각을 남겨보세요.</p>
        </div>
        <div className="learning-actions">
          <Link className="learning-button secondary" href="/learn/records">
            나의 학습 기록
          </Link>
          {ctx.admin && (
            <Link className="learning-button" href="/admin">
              자료 관리
            </Link>
          )}
        </div>
      </header>
      <form className="learning-search" action="/learn">
        <label>
          <span className="learning-sr">주제 검색</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="궁금한 질문이나 분야를 검색하세요"
            maxLength={100}
          />
        </label>
        <label>
          <span className="learning-sr">공개 범위</span>
          <select
            name="access"
            defaultValue={Object.hasOwn(ACCESS, access) ? access : "all"}
          >
            <option value="all">모든 학습</option>
            {Object.entries(ACCESS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="learning-button">찾기</button>
      </form>
      <p className="learning-count">
        {filtered.length}개 학습 · 주제당 약 20분
      </p>
      {filtered.length ? (
        <div className="learning-catalog">
          {filtered.map((item) => (
            <Link
              className="learning-course-card"
              href={`/learn/${item.slug}`}
              key={item.lesson_id}
            >
              <div className="learning-card-art">
                <span>{item.universe}</span>
                <UniverseIcon name={item.universe} size={80} />
                <small>{ACCESS[item.access]}</small>
              </div>
              <div className="learning-card-copy">
                <p className="learning-hint">{item.age_group} · 약 20분</p>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <span className="learning-text-link">학습 살펴보기 →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <section className="learning-panel learning-empty">
          <h2>
            {setup
              ? "새로운 학습을 준비하고 있어요"
              : items.length
                ? "검색 결과가 없어요"
                : "첫 번째 학습을 준비하고 있어요"}
          </h2>
          <p>
            {items.length
              ? "검색어나 공개 범위를 바꾸어보세요."
              : "지금은 무료 ASTERA LAB에서 직접 탐구해볼 수 있어요."}
          </p>
          <Link
            className="learning-button"
            href={items.length ? "/learn" : "/lab"}
          >
            {items.length ? "모든 학습 보기" : "무료 LAB 둘러보기"}
          </Link>
        </section>
      )}
      <aside className="learning-catalog-note">
        <b>무료로 먼저 경험해보세요.</b>
        <p>
          ‘무료 체험’ 주제는 로그인 없이 이용할 수 있어요. 회원은 학습 기록을
          저장하고 다른 기기에서도 이어갈 수 있어요.
        </p>
        <Link href="/lab">기존 무료 LAB 탐험하기 ↗</Link>
      </aside>
    </main>
  );
}
