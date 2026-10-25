"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  newDraft,
  ACCESS,
  UNIVERSES,
  STAGES,
  validateDraft,
  BUCKET,
} from "@/lib/learning/domain.mjs";
import { ALL_LAB_TOPICS } from "@/lib/lab/catalog.mjs";
import { learningRequest } from "@/lib/learning/client";
import { uploadLearningFile } from "@/lib/firebase/client";

export default function LessonEditor({
  initialLesson,
  initialAssets,
  releases,
  publication,
  fileUploadsEnabled = false,
  initialDraft = null,
  prefillNotice = "",
  linkedLabId = null,
}) {
  const router = useRouter();
  const [lesson, setLesson] = useState(initialLesson),
    [draft, setDraft] = useState(
      initialLesson?.draft || initialDraft || newDraft(),
    );
  const [teacherNotes, setTeacherNotes] = useState(
    initialLesson?.teacher_notes || "",
  );
  const [sourceReviewed, setSourceReviewed] = useState(
    initialLesson?.review_status === "reviewed",
  );
  const [assets, setAssets] = useState(initialAssets),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [url, setUrl] = useState("");
  const [scope, setScope] = useState(publication),
    [confirm, setConfirm] = useState(null);
  const [stage, setStage] = useState(2),
    [restoreVersion, setRestoreVersion] = useState("");
  const fileRef = useRef(null),
    errorRef = useRef(null),
    dialogRef = useRef(null);
  useEffect(() => {
    function warn(e) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (confirm) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [confirm]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  function update(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
    setError("");
    setMessage("");
  }
  function updateStage(index, key, value) {
    update(
      "stages",
      draft.stages.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    );
  }
  async function run(action) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    const valid = validateDraft(draft);
    const result = await learningRequest(
      lesson ? `/api/admin/lessons/${lesson.id}` : "/api/admin/lessons",
      {
        draft: valid,
        ...(lesson?.source ? { teacherNotes, sourceReviewed } : {}),
        revision: lesson?.revision,
        labId: lesson ? undefined : linkedLabId,
      },
      lesson ? "PATCH" : "POST",
    );
    setLesson(result.lesson);
    if (result.assets) setAssets(result.assets);
    setDraft(result.lesson.draft);
    setDirty(false);
    setMessage("초안을 저장했어요. 발행하면 학습 사이트에 반영돼요.");
    if (!lesson) router.replace(`/admin/lessons/${result.lesson.id}`);
    return result.lesson;
  }
  async function publish(action) {
    setConfirm(null);
    await run(async () => {
      const saved = dirty ? await save() : lesson;
      if (action === "publish") validateDraft(saved.draft, true);
      const result = await learningRequest(
        `/api/admin/lessons/${saved.id}`,
        { action, revision: saved.revision },
        "PATCH",
      );
      setLesson({ ...saved, revision: result.revision });
      setScope(result.catalog || null);
      setMessage(
        action === "publish"
          ? "발행했어요. 학습 사이트에서 확인할 수 있어요."
          : "공개를 중단했어요. 초안과 이전 버전은 보관돼요.",
      );
      router.refresh();
    });
  }
  function attach(asset) {
    setAssets((old) =>
      old.some((a) => a.id === asset.id) ? old : [...old, asset],
    );
    update("materials", [
      ...draft.materials,
      { id: asset.id, label: asset.original_name, stage },
    ]);
  }
  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const kind = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "html";
    await run(async () => {
      const signed = await learningRequest("/api/admin/uploads", {
        lessonId: lesson.id,
        kind,
        name: file.name,
        size: file.size,
      });
      await uploadLearningFile(signed.path, file, (percent) =>
        setMessage(`파일 업로드 ${percent}%`),
      );
      const { asset } = await learningRequest(
        `/api/admin/uploads/${signed.id}`,
        {},
      );
      attach(asset);
      setMessage("업로드했어요. 초안을 저장한 뒤 발행해주세요.");
    });
    if (fileRef.current) fileRef.current.value = "";
  }
  function downloadDraft() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "ASTERA-학습초안.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
  return (
    <main className="learning-shell">
      <Link className="learning-back" href="/admin">
        ← 학습자료 관리
      </Link>
      <header className="learning-page-head">
        <div>
          <p className="learning-kicker">ASTERA STUDIO / EDITOR</p>
          <h1>{lesson ? "학습 주제 편집" : "새로운 20분 학습"}</h1>
          <p>
            {scope
              ? `발행 v${scope.version} · ${dirty ? "저장하지 않은 변경" : "초안 편집"}`
              : "초안 · 발행 전까지 관리자만 볼 수 있어요"}
          </p>
        </div>
        <div className="learning-actions">
          <button
            className="learning-button secondary"
            disabled={busy}
            onClick={() => run(save)}
          >
            {busy ? "처리 중…" : "초안 저장"}
          </button>
          {lesson && (
            <Link
              className="learning-button secondary"
              href={`/admin/lessons/${lesson.id}/preview`}
              target="_blank"
            >
              저장본 미리보기 ↗
            </Link>
          )}
          <button
            className="learning-button"
            disabled={busy || !lesson}
            onClick={() => setConfirm("publish")}
          >
            사이트에 발행
          </button>
        </div>
      </header>
      {prefillNotice && <p className="learning-hint">{prefillNotice}</p>}
      <div role="status" className="learning-status">
        {message || (dirty ? "저장하지 않은 변경이 있어요." : "")}
      </div>
      {error && (
        <div
          className="learning-error"
          role="alert"
          tabIndex={-1}
          ref={errorRef}
        >
          {error}{" "}
          <button type="button" onClick={downloadDraft}>
            현재 초안 보관
          </button>
        </div>
      )}
      <fieldset disabled={busy} className="learning-editor-fields">
        <div className="learning-editor-layout">
          <div>
            <section className="learning-panel">
              <h2>01. 주제 소개</h2>
              <label>
                학습 주제
                <input
                  maxLength={150}
                  value={draft.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="하나의 질문으로 시작하세요"
                />
              </label>
              <label>
                학습 주소 <small>발행 후에는 주소를 바꿀 수 없어요.</small>
                <div className="learning-slug">
                  <span>/learn/</span>
                  <input
                    maxLength={80}
                    value={draft.slug}
                    onChange={(e) => update("slug", e.target.value)}
                    spellCheck={false}
                    placeholder="my-first-question"
                  />
                </div>
              </label>
              <label>
                짧은 소개
                <textarea
                  rows={3}
                  maxLength={500}
                  value={draft.summary}
                  onChange={(e) => update("summary", e.target.value)}
                />
              </label>
              <div className="learning-field-row">
                <label>
                  분야
                  <select
                    value={draft.universe}
                    onChange={(e) => update("universe", e.target.value)}
                  >
                    {UNIVERSES.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </label>
                <label>
                  권장 연령
                  <input
                    maxLength={40}
                    value={draft.ageGroup}
                    onChange={(e) => update("ageGroup", e.target.value)}
                  />
                </label>
              </div>
              <label>
                학습 목표 <small>한 줄에 하나씩, 최대 8개</small>
                <textarea
                  rows={3}
                  value={draft.goals.join("\n")}
                  onChange={(e) => update("goals", e.target.value.split("\n"))}
                />
              </label>
            </section>
            {lesson?.source && (
              <section className="learning-panel">
                <p className="learning-kicker">
                  SOURCE / {lesson.source.station_id}
                </p>
                <h2>교사용 발문·예상 답·검수 사항</h2>
                <p>
                  {lesson.source.category} · {lesson.source.volume}권 · PDF{" "}
                  {lesson.source.pages.join(", ")}쪽
                </p>
                <p className="learning-note">
                  원문 40분 활동을 20분 핵심 탐구와 추가 활동으로 옮긴
                  초안이에요. 아래 교사판은 관리자만 볼 수 있으며 학습자에게
                  발행되지 않아요.
                </p>
                <label>
                  교사용 해설·발문 편집
                  <textarea
                    rows={16}
                    maxLength={18000}
                    value={teacherNotes}
                    onChange={(e) => {
                      setTeacherNotes(e.target.value);
                      setDirty(true);
                    }}
                  />
                </label>
                <details>
                  <summary>학생판 추출 원문 대조</summary>
                  <p className="learning-prose">
                    {lesson.source.original_student}
                  </p>
                </details>
                <p className="learning-hint">
                  {lesson.source.license} · 출처와 비영리 이용 조건을
                  유지해주세요. 학습 안내와 질문은 아래에서 수정할 수 있어요.
                </p>
                <label className="learning-review-check">
                  <input
                    type="checkbox"
                    checked={sourceReviewed}
                    onChange={(e) => {
                      setSourceReviewed(e.target.checked);
                      setDirty(true);
                    }}
                  />{" "}
                  학생용 내용·교사용 검수 사항과 출처·이용 조건을 확인했어요.
                </label>
              </section>
            )}
            <section className="learning-panel">
              <h2>02. 20분 학습 흐름</h2>
              <p className="learning-hint">
                단계별 읽기·활동 안내와 답할 질문을 적어주세요. 시간은 강제
                제한이 아닌 권장 시간이에요.
              </p>
              {draft.stages.map((s, i) => (
                <details
                  className="learning-stage-editor"
                  key={s.id}
                  open={i === 0 ? true : undefined}
                >
                  <summary>
                    <b>
                      0{i + 1}. {s.label}
                    </b>
                    <span>{s.minutes}분</span>
                  </summary>
                  <label>
                    단계 제목
                    <input
                      maxLength={150}
                      value={s.title}
                      onChange={(e) => updateStage(i, "title", e.target.value)}
                    />
                  </label>
                  <label>
                    읽기·활동 안내
                    <textarea
                      rows={6}
                      maxLength={6000}
                      value={s.body}
                      onChange={(e) => updateStage(i, "body", e.target.value)}
                      placeholder="학습자가 할 일을 구체적으로 안내해주세요."
                    />
                  </label>
                  <label>
                    기록할 질문
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={s.prompt}
                      onChange={(e) => updateStage(i, "prompt", e.target.value)}
                    />
                  </label>
                </details>
              ))}
            </section>
          </div>
          <aside>
            <section className="learning-panel">
              <h2>03. 학습자료 연결</h2>
              <label>
                자료를 사용할 단계
                <select
                  value={stage}
                  onChange={(e) => setStage(Number(e.target.value))}
                >
                  {STAGES.map((s, i) => (
                    <option key={s.id} value={i}>
                      {s.label} · {s.minutes}분
                    </option>
                  ))}
                </select>
              </label>
              {!lesson ? (
                <p className="learning-note">
                  주제명을 입력하고 초안을 먼저 저장해주세요. 저장 후 학습자료를
                  연결할 수 있어요.
                </p>
              ) : (
                <>
                  {fileUploadsEnabled ? (
                    <label className="learning-upload">
                      PDF 또는 웹앱 업로드
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.html"
                        onChange={uploadFile}
                      />
                      <small>PDF 25MB · 단일 HTML 2MB까지</small>
                    </label>
                  ) : (
                    <p className="learning-note">
                      파일 업로드는 현재 보류 중이에요. 아래에서 기존 LAB이나
                      외부 웹앱 주소를 연결할 수 있어요.
                    </p>
                  )}
                  <details>
                    <summary>HTML 웹앱 준비 방법</summary>
                    <p>
                      CSS와 JavaScript를 파일 안에 포함한 .html 파일을
                      올려주세요. 외부 스크립트·서버 통신·로그인이 필요한 앱은
                      아래 HTTPS 주소로 연결해주세요.
                    </p>
                  </details>
                  <label>
                    기존 ASTERA LAB
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) return;
                        run(async () => {
                          const { asset } = await learningRequest(
                            "/api/admin/uploads",
                            { lessonId: lesson.id, kind: "lab", url: value },
                          );
                          asset.original_name =
                            ALL_LAB_TOPICS.find((t) => `/lab/${t.id}` === value)
                              ?.title || "ASTERA LAB";
                          attach(asset);
                        });
                        e.target.value = "";
                      }}
                    >
                      <option value="">LAB 선택</option>
                      {ALL_LAB_TOPICS.map((t) => (
                        <option key={t.id} value={`/lab/${t.id}`}>
                          {t.code} · {t.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    외부 웹앱 주소
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </label>
                  <button
                    className="learning-button secondary"
                    type="button"
                    disabled={!url}
                    onClick={() =>
                      run(async () => {
                        const { asset } = await learningRequest(
                          "/api/admin/uploads",
                          { lessonId: lesson.id, kind: "link", url },
                        );
                        attach(asset);
                        setUrl("");
                      })
                    }
                  >
                    주소 연결
                  </button>
                </>
              )}
              <div className="learning-attached">
                {draft.materials.map((m, index) => {
                  const a = assets.find((asset) => asset.id === m.id);
                  return (
                    <article key={m.id}>
                      <div className="learning-material-type">
                        {a?.kind === "pdf"
                          ? "PDF"
                          : a?.kind === "html"
                            ? "HTML 웹앱"
                            : a?.kind === "lab"
                              ? "ASTERA LAB"
                              : "외부 웹앱"}
                        <button
                          type="button"
                          aria-label={`${m.label} 연결 해제`}
                          onClick={() =>
                            update(
                              "materials",
                              draft.materials.filter((x) => x.id !== m.id),
                            )
                          }
                        >
                          연결 해제
                        </button>
                      </div>
                      <label>
                        자료 이름
                        <input
                          maxLength={150}
                          value={m.label}
                          onChange={(e) =>
                            update(
                              "materials",
                              draft.materials.map((x, j) =>
                                j === index
                                  ? { ...x, label: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        단계
                        <select
                          value={m.stage}
                          onChange={(e) =>
                            update(
                              "materials",
                              draft.materials.map((x, j) =>
                                j === index
                                  ? { ...x, stage: Number(e.target.value) }
                                  : x,
                              ),
                            )
                          }
                        >
                          {STAGES.map((s, i) => (
                            <option key={s.id} value={i}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </article>
                  );
                })}
              </div>
              {lesson &&
                assets.some(
                  (a) => !draft.materials.some((m) => m.id === a.id),
                ) && (
                  <label>
                    이전에 올린 자료 다시 연결
                    <select
                      value=""
                      onChange={(e) => {
                        const asset = assets.find(
                          (a) => a.id === e.target.value,
                        );
                        if (asset) attach(asset);
                      }}
                    >
                      <option value="">보관된 자료 선택</option>
                      {assets
                        .filter(
                          (a) => !draft.materials.some((m) => m.id === a.id),
                        )
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.original_name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
            </section>
            <section className="learning-panel">
              <h2>04. 공개 범위</h2>
              {Object.entries(ACCESS).map(([value, label]) => (
                <label className="learning-radio" key={value}>
                  <input
                    type="radio"
                    name="access"
                    value={value}
                    checked={draft.access === value}
                    onChange={() => update("access", value)}
                  />
                  <span>
                    <b>{label}</b>
                    <small>
                      {value === "public"
                        ? "비회원도 전체 과정과 연결 자료 이용"
                        : value === "member"
                          ? "로그인한 회원이 이용"
                          : "유효한 멤버십 회원이 이용"}
                    </small>
                  </span>
                </label>
              ))}
              <p className="learning-hint">
                소개와 제목은 누구나 볼 수 있어요. 본문과 자료에는 선택한 범위를
                적용해요.
              </p>
            </section>
            {releases.length > 0 && (
              <section className="learning-panel">
                <h2>이전 발행본</h2>
                <label>
                  복구할 버전
                  <select
                    value={restoreVersion}
                    onChange={(e) => setRestoreVersion(e.target.value)}
                  >
                    <option value="">버전 선택</option>
                    {releases.map((r) => (
                      <option key={r.id} value={r.id}>
                        v{r.version} ·{" "}
                        {new Date(r.created_at).toLocaleDateString("ko-KR", {
                          timeZone: "Asia/Seoul",
                        })}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="learning-button secondary"
                  disabled={!restoreVersion}
                  onClick={() => setConfirm("restore")}
                >
                  이 버전을 초안으로 복구
                </button>
                <p className="learning-hint">
                  복구 후 다시 저장·발행해야 사이트에 반영돼요.
                </p>
              </section>
            )}
            {scope && (
              <section className="learning-panel">
                <Link
                  className="learning-text-link"
                  href={`/learn/${scope.slug}`}
                  target="_blank"
                >
                  현재 발행본 보기 ↗
                </Link>
                <button
                  className="learning-unpublish"
                  type="button"
                  onClick={() => setConfirm("unpublish")}
                >
                  공개 중단
                </button>
              </section>
            )}
          </aside>
        </div>
      </fieldset>
      <dialog
        ref={dialogRef}
        className="learning-dialog"
        onCancel={() => setConfirm(null)}
        aria-labelledby="editor-confirm-title"
      >
        <h2 id="editor-confirm-title">
          {confirm === "restore"
            ? "이전 버전을 초안으로 가져올까요?"
            : confirm === "unpublish"
              ? "이 주제의 공개를 중단할까요?"
              : "학습 사이트에 발행할까요?"}
        </h2>
        <p>
          {confirm === "restore"
            ? "현재 편집 중인 초안이 선택한 발행본으로 바뀌어요. 필요하면 먼저 초안을 보관해주세요."
            : confirm === "unpublish"
              ? "학습 목록에서 내려가고 연결 자료의 접근이 중단돼요. 기존 학습 기록과 파일은 보관돼요."
              : `${ACCESS[draft.access]} 범위로 현재 저장본을 공개해요. 수정 중인 내용이 있으면 함께 저장하고 발행해요.`}
        </p>
        <div className="learning-actions">
          <button
            className="learning-button secondary"
            onClick={() => setConfirm(null)}
          >
            계속 편집
          </button>
          <button
            className="learning-button"
            onClick={() => {
              if (confirm === "restore") {
                const release = releases.find((r) => r.id === restoreVersion);
                if (release) {
                  setDraft(release.content);
                  setDirty(true);
                  setMessage(
                    "이전 발행본을 초안으로 가져왔어요. 확인 후 저장해주세요.",
                  );
                }
                setConfirm(null);
              } else publish(confirm);
            }}
          >
            {confirm === "restore"
              ? "초안으로 복구"
              : confirm === "unpublish"
                ? "공개 중단"
                : "저장하고 발행"}
          </button>
        </div>
      </dialog>
    </main>
  );
}
