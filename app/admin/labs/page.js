import Link from "next/link";
import { learningContext, dbCheck } from "@/lib/learning/server";
import { ALL_LAB_TOPICS } from "@/lib/lab/catalog.mjs";
import AdminGate from "../admin-gate";
export const metadata = { title: "LAB 질문·발문 관리 | ASTERA" };
export default async function LabContentList() {
  const ctx = await learningContext();
  if (!ctx.admin) return <AdminGate {...ctx} />;
  const results = await Promise.all([
    ctx.db.from("lab_content_drafts").select("id,revision,updated_at"),
    ctx.db.from("lab_content_publications").select("id,revision"),
    ctx.db.from("learning_lessons").select("id,draft"),
    ctx.db.from("learning_assets").select("id,external_url,lesson_id,kind"),
  ]);
  const [drafts, publications, lessons, assets] = results.map(dbCheck);
  return (
    <main className="learning-shell">
      <header className="learning-page-head">
        <div>
          <p className="learning-kicker">ASTERA STUDIO / LAB CONTENT</p>
          <h1>LAB 질문·발문</h1>
          <p>기존 웹앱의 질문을 읽고, 수업에 맞게 다듬으세요.</p>
        </div>
        <Link className="learning-button secondary" href="/lab">
          공개 LAB 보기 ↗
        </Link>
      </header>
      <section className="learning-panel lab-management-guide">
        <h2>LAB와 자료·20분 학습은 이렇게 연결돼요</h2>
        <ol>
          <li>
            <b>LAB 질문 편집</b>에서 기존 웹앱의 발문과 개념 문항을
            확인·수정하고 발행해요.
          </li>
          <li>
            <b>20분 과정 만들기</b>로 이 LAB에 질문·개념·탐색·응용·성찰 과정을
            연결해요.
          </li>
          <li>
            과정 편집에서 자료를 연결하고 <b>사이트에 발행</b>하면 이용자에게
            공개돼요.
          </li>
        </ol>
        <p>
          LAB 단독 체험 기록은 해당 브라우저에 저장돼요. 회원 학습 이력과
          자기평가 그래프는 20분 학습의 저장 기록을 사용해요.
        </p>
        <p>
          파일 업로드는 현재 보류 중이에요. 기존 LAB·외부 웹앱 주소는 연결할 수
          있어요. 파일 저장소 활성화 후에는 발행한 자료를 공개 범위에 맞춰
          열람·다운로드해요.
        </p>
      </section>
      <div className="learning-table-wrap learning-panel">
        <table className="learning-table">
          <thead>
            <tr>
              <th>LAB 주제</th>
              <th>발문 상태</th>
              <th>질문·발문</th>
              <th>연결된 20분 과정·자료</th>
            </tr>
          </thead>
          <tbody>
            {ALL_LAB_TOPICS.map((topic) => {
              const draft = drafts.find((row) => row.id === topic.id),
                live = publications.find((row) => row.id === topic.id);
              const ids = new Set(
                assets
                  .filter(
                    (asset) =>
                      asset.kind === "lab" &&
                      asset.external_url === "/lab/" + topic.id,
                  )
                  .map((asset) => asset.id),
              );
              const linked = lessons.filter((lesson) =>
                lesson.draft.materials?.some((material) =>
                  ids.has(material.id),
                ),
              );
              return (
                <tr key={topic.id}>
                  <td>
                    <small>
                      {topic.code} · {topic.tool}
                    </small>
                    <b>{topic.title}</b>
                    <Link
                      className="learning-text-link"
                      href={"/lab/" + topic.id}
                      target="_blank"
                    >
                      LAB 열기 ↗
                    </Link>
                  </td>
                  <td>
                    {live ? "발행 v" + live.revision : "기본 발문"}
                    {draft && draft.revision !== (live?.revision || 0) && (
                      <small>수정 초안 있음</small>
                    )}
                  </td>
                  <td>
                    <Link
                      className="learning-button secondary"
                      href={"/admin/labs/" + topic.id}
                    >
                      질문·발문 편집
                    </Link>
                  </td>
                  <td>
                    <div className="lab-related-lessons">
                      {linked.map((lesson) => (
                        <Link
                          key={lesson.id}
                          className="learning-text-link"
                          href={"/admin/lessons/" + lesson.id}
                        >
                          {lesson.draft.title} →
                        </Link>
                      ))}
                      <Link
                        className="learning-text-link"
                        href={"/admin/lessons/new?lab=" + topic.id}
                      >
                        {linked.length
                          ? "같은 LAB로 새 과정 만들기 +"
                          : "20분 과정 만들기 +"}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
