"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { learningRequest } from "@/lib/learning/client";
import { validateSitePage } from "@/lib/learning/site-pages.mjs";
export default function PageEditor({ initial }) {
  const [page, setPage] = useState(initial),
    [draft, setDraft] = useState(
      initial?.draft || {
        title: "",
        slug: "",
        summary: "",
        sections: [{ heading: "", body: "" }],
      },
    ),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [preview, setPreview] = useState(false),
    [action, setAction] = useState(null);
  const router = useRouter(),
    dialog = useRef(null);
  useEffect(() => {
    if (action) dialog.current?.showModal();
    else dialog.current?.close();
  }, [action]);
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
    setError("");
    setMessage("");
  }
  async function save() {
    validateSitePage(draft);
    const result = await learningRequest(
      page ? `/api/admin/pages/${page.id}` : "/api/admin/pages",
      { draft, revision: page?.revision },
      page ? "PATCH" : "POST",
    );
    setPage(result.page);
    setDraft(result.page.draft);
    setDirty(false);
    setMessage("초안을 저장했어요.");
    if (!page) router.replace(`/admin/pages/${result.page.id}`);
    return result.page;
  }
  async function run(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    const chosen = action;
    setAction(null);
    await run(async () => {
      const saved = dirty ? await save() : page;
      const result = await learningRequest(
        `/api/admin/pages/${saved.id}`,
        { action: chosen, revision: saved.revision },
        "PATCH",
      );
      setPage(result.page);
      setMessage(
        chosen === "publish"
          ? "페이지를 발행했어요. 사이트 안내에서 확인할 수 있어요."
          : "페이지 공개를 중단했어요.",
      );
      router.refresh();
    });
  }
  return (
    <main className="learning-shell">
      <Link className="learning-back" href="/admin/pages">
        ← 페이지 관리
      </Link>
      <header className="learning-page-head">
        <div>
          <p className="learning-kicker">ASTERA STUDIO / PAGE EDITOR</p>
          <h1>{page ? "페이지 편집" : "새 안내 페이지"}</h1>
          <p>
            {dirty
              ? "저장하지 않은 변경이 있어요."
              : page?.published
                ? "현재 발행 중이에요."
                : "초안은 관리자만 볼 수 있어요."}
          </p>
        </div>
        <div className="learning-actions">
          <button
            className="learning-button secondary"
            disabled={busy}
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? "편집으로" : "미리보기"}
          </button>
          <button
            className="learning-button secondary"
            disabled={busy}
            onClick={() => run(save)}
          >
            초안 저장
          </button>
          <button
            className="learning-button"
            disabled={busy || !page}
            onClick={() => setAction("publish")}
          >
            사이트에 발행
          </button>
        </div>
      </header>
      <div className="learning-status" role="status">
        {message}
      </div>
      {error && (
        <p className="learning-error" role="alert">
          {error}
        </p>
      )}
      {preview ? (
        <article className="learning-panel learning-cms">
          <p className="learning-kicker">미리보기 / 아직 발행하지 않은 내용</p>
          <h1>{draft.title}</h1>
          <p>{draft.summary}</p>
          {draft.sections.map((s, i) => (
            <section key={i}>
              <h2>{s.heading}</h2>
              <p className="learning-prose">{s.body}</p>
            </section>
          ))}
        </article>
      ) : (
        <fieldset disabled={busy} className="learning-editor-fields">
          <section className="learning-panel">
            <label>
              페이지 제목
              <input
                maxLength={150}
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </label>
            <label>
              페이지 주소 <small>/pages/ 뒤에 사용할 영문 주소</small>
              <input
                maxLength={80}
                value={draft.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="learning-guide"
                spellCheck={false}
              />
            </label>
            <label>
              소개
              <textarea
                rows={3}
                maxLength={500}
                value={draft.summary}
                onChange={(e) => update("summary", e.target.value)}
              />
            </label>
          </section>
          {draft.sections.map((section, i) => (
            <section className="learning-panel" key={i}>
              <div className="learning-toolbar">
                <h2>본문 섹션 {i + 1}</h2>
                {draft.sections.length > 1 && (
                  <button
                    className="learning-unpublish"
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "이 섹션을 초안에서 뺄까요? 저장 전에는 새로고침으로 복구할 수 있어요.",
                        )
                      )
                        update(
                          "sections",
                          draft.sections.filter((_, index) => index !== i),
                        );
                    }}
                  >
                    섹션 빼기
                  </button>
                )}
              </div>
              <label>
                섹션 제목
                <input
                  maxLength={150}
                  value={section.heading}
                  onChange={(e) =>
                    update(
                      "sections",
                      draft.sections.map((s, index) =>
                        index === i ? { ...s, heading: e.target.value } : s,
                      ),
                    )
                  }
                />
              </label>
              <label>
                본문
                <textarea
                  rows={10}
                  maxLength={10000}
                  value={section.body}
                  onChange={(e) =>
                    update(
                      "sections",
                      draft.sections.map((s, index) =>
                        index === i ? { ...s, body: e.target.value } : s,
                      ),
                    )
                  }
                />
              </label>
            </section>
          ))}
          <button
            className="learning-button secondary"
            disabled={draft.sections.length >= 15}
            onClick={() =>
              update("sections", [...draft.sections, { heading: "", body: "" }])
            }
          >
            본문 섹션 추가 +
          </button>
        </fieldset>
      )}
      {page?.published && (
        <div className="learning-actions" style={{ marginTop: 25 }}>
          <Link
            className="learning-button secondary"
            href={`/pages/${page.published_slug}`}
            target="_blank"
          >
            발행본 보기 ↗
          </Link>
          <button
            className="learning-unpublish"
            disabled={busy}
            onClick={() => setAction("unpublish")}
          >
            공개 중단
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        className="learning-dialog"
        onCancel={() => setAction(null)}
        aria-labelledby="page-action-title"
      >
        <h2 id="page-action-title">
          {action === "unpublish"
            ? "페이지 공개를 중단할까요?"
            : "페이지를 발행할까요?"}
        </h2>
        <p>
          {action === "unpublish"
            ? "사이트 안내에서 내려가며 초안은 보관돼요."
            : "현재 내용을 저장하고 누구나 볼 수 있도록 사이트 안내에 공개해요."}
        </p>
        <div className="learning-actions">
          <button
            className="learning-button secondary"
            onClick={() => setAction(null)}
          >
            계속 편집
          </button>
          <button className="learning-button" onClick={publish}>
            {action === "unpublish" ? "공개 중단" : "저장하고 발행"}
          </button>
        </div>
      </dialog>
    </main>
  );
}
