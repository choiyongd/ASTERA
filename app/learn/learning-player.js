"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  STAGES,
  ACCESS,
  COMPETENCIES,
  normalizeProgress,
} from "@/lib/learning/domain.mjs";
import { learningRequest } from "@/lib/learning/client";
function freshProgress() {
  return {
    answers: Object.fromEntries(STAGES.map((s) => [s.id, ""])),
    assessment: { pre: [0, 0, 0, 0], post: [0, 0, 0, 0] },
    step: 0,
    completed: false,
  };
}
export default function LearningPlayer({
  content,
  releaseId,
  version,
  materials,
  initialProgress,
  authenticated,
  preview = false,
}) {
  const [record, setRecord] = useState(
    initialProgress ? normalizeProgress(initialProgress) : freshProgress(),
  );
  const [loaded, setLoaded] = useState(authenticated || preview),
    [saveStatus, setSaveStatus] = useState(""),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const revision = useRef(initialProgress?.revision || 0),
    queued = useRef(null),
    flight = useRef(null),
    blocked = useRef(false),
    saved = useRef(
      JSON.stringify(
        initialProgress ? normalizeProgress(initialProgress) : freshProgress(),
      ),
    );
  const heading = useRef(null),
    errorRef = useRef(null),
    lastStep = useRef(0),
    latest = useRef(record),
    autosaveTimer = useRef(null);
  const storageKey = `astera:learn:${releaseId}:v2`;
  latest.current = record;
  useEffect(() => {
    if (authenticated || preview) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const restored = normalizeProgress(JSON.parse(raw));
        setRecord(restored);
        saved.current = JSON.stringify(restored);
        setSaveStatus("이 브라우저의 기록을 불러왔어요.");
      }
    } catch {
      setSaveStatus(
        "이 브라우저에서 기록을 불러오지 못했어요. 새 탐구를 시작할 수 있어요.",
      );
    }
    setLoaded(true);
  }, [storageKey, authenticated, preview]);
  useEffect(() => {
    if (lastStep.current !== record.step) {
      lastStep.current = record.step;
      heading.current?.focus();
    }
  }, [record.step]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  useEffect(() => {
    function warn(e) {
      if (!preview && JSON.stringify(latest.current) !== saved.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [preview]);
  async function persist(value) {
    if (preview) return;
    if (blocked.current)
      throw new Error(
        "다른 화면에서 저장한 기록이 있어요. 현재 기록을 내려받아 보관한 뒤 새로고침해주세요.",
      );
    if (JSON.stringify(value) === saved.current && !flight.current) return;
    queued.current = value;
    if (flight.current) return flight.current;
    flight.current = Promise.resolve().then(async () => {
      setSaving(true);
      try {
        while (queued.current) {
          const next = queued.current;
          queued.current = null;
          if (JSON.stringify(next) === saved.current) continue;
          const valid = normalizeProgress(next);
          if (authenticated) {
            const result = await learningRequest("/api/learning/progress", {
              ...valid,
              releaseId,
              revision: revision.current,
            });
            revision.current = result.progress.revision;
            setSaveStatus("내 계정에 학습 기록을 저장했어요.");
          } else {
            try {
              localStorage.setItem(storageKey, JSON.stringify(valid));
              setSaveStatus("이 브라우저에 저장했어요.");
            } catch {
              setSaveStatus(
                "자동 저장을 사용할 수 없어요. 기록을 내려받아 보관해주세요.",
              );
              return;
            }
          }
          saved.current = JSON.stringify(next);
        }
      } catch (e) {
        queued.current = null;
        if (e.status === 409) blocked.current = true;
        throw e;
      } finally {
        setSaving(false);
        flight.current = null;
      }
    });
    return flight.current;
  }
  useEffect(() => {
    if (!loaded || preview) return;
    autosaveTimer.current = setTimeout(() => {
      persist(latest.current).catch((e) => setError(e.message));
    }, 1000);
    return () => clearTimeout(autosaveTimer.current);
  }, [record, loaded, preview]);
  function updateAnswer(value) {
    setRecord((r) => ({
      ...r,
      answers: { ...r.answers, [STAGES[r.step].id]: value },
      completed: false,
    }));
    setError("");
    setSaveStatus("저장 대기 중…");
  }
  async function next(event) {
    event.preventDefault();
    clearTimeout(autosaveTimer.current);
    setError("");
    try {
      const nextRecord = normalizeProgress({
        ...record,
        step: Math.min(4, record.step + 1),
        completed: record.step === 4,
      });
      await persist(nextRecord);
      setRecord(nextRecord);
    } catch (e) {
      setError(e.message);
    }
  }
  function download() {
    const lines = [
      "ASTERA 탐구 기록",
      content.title,
      `발행 버전: ${preview ? "미리보기" : version}`,
      "",
      ...STAGES.flatMap((s) => [
        s.label,
        record.answers[s.id] || "(아직 기록하지 않음)",
        "",
      ]),
    ];
    const href = URL.createObjectURL(
      new Blob(["\uFEFF", lines.join("\n")], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = href;
    a.download = `ASTERA_${content.slug || "preview"}_학습기록.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
  const current = content.stages[record.step],
    first = STAGES.findIndex(
      (s) => (record.answers[s.id] || "").trim().length < 6,
    ),
    available = first < 0 ? 4 : first;
  return (
    <main className="learning-shell learning-player">
      {preview && (
        <div className="learning-preview-banner">
          관리자 미리보기 · 저장한 초안이며 학습 기록은 저장하지 않아요.
          <Link href={`/admin/lessons/${releaseId}`}>편집으로 돌아가기 →</Link>
        </div>
      )}
      <Link
        className="learning-back"
        href={preview ? `/admin/lessons/${releaseId}` : "/learn"}
      >
        ← {preview ? "자료 편집" : "모든 학습"}
      </Link>
      <header className="learning-course-head">
        <p className="learning-kicker">
          {content.universe} / {ACCESS[content.access]}
        </p>
        <h1>{content.title || "학습 주제"}</h1>
        <p>{content.summary}</p>
        <div className="learning-meta">
          <span>약 20분</span>
          <span>{content.ageGroup}</span>
          <span>5단계 탐구</span>
        </div>
      </header>
      <div className="learning-player-layout">
        <aside className="learning-progress">
          <p className="learning-kicker">YOUR EXPLORATION</p>
          <nav aria-label="20분 학습 단계">
            <ol>
              {content.stages.map((s, i) => (
                <li key={s.id}>
                  <button
                    disabled={!loaded || saving || i > available}
                    aria-current={i === record.step ? "step" : undefined}
                    onClick={() => setRecord((r) => ({ ...r, step: i }))}
                  >
                    <span className="learning-step-number">
                      {i < available ? "✓" : `0${i + 1}`}
                    </span>
                    <span>
                      <b>{s.label}</b>
                      <small>{s.minutes}분</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="learning-progress-note">
            <b>
              {authenticated
                ? "내 계정에 자동 저장"
                : preview
                  ? "저장하지 않는 미리보기"
                  : "이 브라우저에서 체험 중"}
            </b>
            <p>
              {authenticated
                ? "같은 계정으로 로그인하면 다른 기기에서도 이어갈 수 있어요."
                : "기록에는 이름을 적지 않아도 괜찮아요. 공용 기기에서는 활동 후 기록을 지워주세요."}
            </p>
            {!authenticated && !preview && (
              <Link
                href={`/login?next=${encodeURIComponent(`/learn/${content.slug}`)}`}
              >
                다음 학습부터 계정에 저장하기 →
              </Link>
            )}
          </div>
          <details>
            <summary>오늘의 학습 목표</summary>
            <ul>
              {content.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </details>
        </aside>
        <section className="learning-workspace">
          {!loaded ? (
            <p>학습 기록을 불러오고 있어요…</p>
          ) : (
            <>
              <div className="learning-workspace-head">
                <span className="learning-kicker">
                  STEP 0{record.step + 1} / {current.label}
                </span>
                <span className="learning-tag">권장 {current.minutes}분</span>
              </div>
              <h2 tabIndex={-1} ref={heading}>
                {record.completed ? "나의 탐구 기록" : current.title}
              </h2>
              <div className="learning-status" role="status">
                {saving ? "학습 기록 저장 중…" : saveStatus}
              </div>
              {error && (
                <div
                  className="learning-error"
                  role="alert"
                  ref={errorRef}
                  tabIndex={-1}
                >
                  {error}
                  <div className="learning-actions">
                    <button type="button" onClick={download}>
                      현재 기록 내려받기
                    </button>
                    {blocked.current ? (
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                      >
                        서버 기록 다시 불러오기
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          persist(record)
                            .then(() => setError(""))
                            .catch((e) => setError(e.message))
                        }
                      >
                        다시 저장
                      </button>
                    )}
                  </div>
                </div>
              )}
              {record.completed ? (
                <>
                  <div className="learning-complete">
                    <span>✓</span>
                    <div>
                      <h3>나의 근거로 탐구를 마쳤어요.</h3>
                      <p>
                        정답 점수보다 중요한 건, 스스로 설명할 수 있는
                        생각이에요.
                      </p>
                    </div>
                  </div>
                  {STAGES.map((s) => (
                    <section className="learning-result" key={s.id}>
                      <p className="learning-kicker">{s.label}</p>
                      <p className="learning-prose">{record.answers[s.id]}</p>
                    </section>
                  ))}
                  <div className="learning-actions">
                    <button
                      className="learning-button"
                      type="button"
                      onClick={download}
                    >
                      기록 내려받기
                    </button>
                    <button
                      className="learning-button secondary"
                      type="button"
                      onClick={() => window.print()}
                    >
                      인쇄 / PDF 저장
                    </button>
                    <button
                      className="learning-button secondary"
                      type="button"
                      onClick={() =>
                        setRecord((r) => ({ ...r, completed: false, step: 0 }))
                      }
                    >
                      생각 더 다듬기
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={next}>
                  <div className="learning-prose learning-reading">
                    {current.body || "이 단계의 학습 안내를 작성해주세요."}
                  </div>
                  <div className="learning-materials">
                    {materials
                      .filter((m) => m.stage === record.step)
                      .map((material) => (
                        <LearningMaterial
                          key={material.id}
                          material={material}
                        />
                      ))}
                  </div>
                  {(record.step === 0 || record.step === 4) && (
                    <CompetencyAssessment
                      phase={record.step === 0 ? "pre" : "post"}
                      values={
                        record.assessment[record.step === 0 ? "pre" : "post"]
                      }
                      onChange={(index, value) => {
                        const phase = record.step === 0 ? "pre" : "post";
                        setRecord((r) => ({
                          ...r,
                          completed: false,
                          assessment: {
                            ...r.assessment,
                            [phase]: r.assessment[phase].map((v, i) =>
                              i === index ? value : v,
                            ),
                          },
                        }));
                        setError("");
                      }}
                    />
                  )}
                  <label
                    className="learning-answer"
                    htmlFor={`answer-${current.id}`}
                  >
                    <b>{current.prompt}</b>
                    <span>
                      내 생각과 근거를 한 문장 이상 남겨주세요. (6자 이상)
                    </span>
                    <textarea
                      id={`answer-${current.id}`}
                      rows={6}
                      maxLength={4000}
                      value={record.answers[current.id]}
                      onChange={(e) => updateAnswer(e.target.value)}
                    />
                  </label>
                  {record.step === 4 && (
                    <details className="learning-initial-thought">
                      <summary>처음에 남긴 생각 다시 보기</summary>
                      <p className="learning-prose">
                        {record.answers.question}
                      </p>
                    </details>
                  )}
                  <div className="learning-step-actions">
                    {record.step > 0 ? (
                      <button
                        className="learning-button secondary"
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          setRecord((r) => ({ ...r, step: r.step - 1 }))
                        }
                      >
                        ← 이전 단계
                      </button>
                    ) : (
                      <span className="learning-hint">
                        생각할 시간을 충분히 가져도 괜찮아요.
                      </span>
                    )}
                    <button
                      className="learning-button"
                      type="submit"
                      disabled={saving}
                    >
                      {record.step === 4 ? "탐구 기록 완성하기" : "다음 단계 →"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </div>
      <footer className="learning-footnote">
        20분은 권장 시간이에요. 탐구 속도에 맞춰 천천히 이어가세요.
        {!authenticated && !preview && (
          <>
            <br />
            로그인 전 기록은 현재 브라우저에만 남으며, 로그인 시 자동으로
            옮겨지지 않아요.{" "}
            <button type="button" onClick={download}>
              기록 내려받기
            </button>{" "}
            ·{" "}
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "이 브라우저에 남긴 이 주제의 학습 기록을 지울까요?",
                  )
                ) {
                  try {
                    localStorage.removeItem(storageKey);
                  } catch {
                    setError(
                      "브라우저의 기록을 지우지 못했어요. 브라우저 설정에서 사이트 데이터를 지워주세요.",
                    );
                    return;
                  }
                  saved.current = JSON.stringify(freshProgress());
                  setRecord(freshProgress());
                  setSaveStatus("이 주제의 기록을 지웠어요.");
                }
              }}
            >
              이 기기의 체험 기록 지우기
            </button>
          </>
        )}
      </footer>
    </main>
  );
}
function LearningMaterial({ material }) {
  const [open, setOpen] = useState(false);
  if (material.kind === 'reading') return (
    <article className="learning-material">
      <p className="learning-kicker">READ / SOURCES</p>
      <details><summary>{material.label}</summary><p className="learning-prose">{material.body_text}</p></details>
    </article>
  );
  const href =
    material.kind === "link" || material.kind === "lab"
      ? material.external_url
      : `/api/learning/assets/${material.id}`;
  return (
    <article className="learning-material">
      <div className="learning-material-head">
        <div>
          <p className="learning-kicker">
            {material.kind === "pdf" ? "READ / PDF" : "EXPLORE / WEB APP"}
          </p>
          <h3>{material.label}</h3>
        </div>
        {material.kind === "pdf" && (
          <a
            className="learning-text-link"
            href={href + "?download=1"}
            download
          >
            PDF 내려받기 ↓
          </a>
        )}
        <button
          type="button"
          className="learning-button secondary"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "자료 접기" : "자료 열기"}
        </button>
      </div>
      {open && (
        <>
          <iframe
            title={material.label}
            src={href}
            className={`learning-embed ${material.kind === "pdf" ? "pdf" : ""}`}
            sandbox={material.kind === "lab" ? undefined : "allow-scripts"}
            referrerPolicy="no-referrer"
            allow="camera 'none'; microphone 'none'; geolocation 'none'"
          />
          <p className="learning-hint">
            {material.kind === "link"
              ? "외부 서비스에서 제공하는 웹앱이에요. 화면이 열리지 않으면 새 창에서 이용해주세요."
              : material.kind === "html"
                ? "업로드한 웹앱은 별도의 탐구 공간에서 실행돼요."
                : "화면이 작으면 새 창에서 크게 볼 수 있어요."}{" "}
            <a href={href} target="_blank" rel="noopener noreferrer">
              새 창으로 열기 ↗
            </a>
          </p>
        </>
      )}
    </article>
  );
}

function CompetencyAssessment({ phase, values, onChange }) {
  return (
    <section className="learning-assessment">
      <h3>
        {phase === "pre"
          ? "시작하기 전, 나의 자신감"
          : "학습을 마친 지금, 나의 자신감"}
      </h3>
      <p className="learning-hint">
        정답 점수가 아닌 자기평가예요. 1은 ‘아직 어려워요’, 5는 ‘스스로 할 수
        있어요’예요. 이전 평가와의 변화는 마이페이지에서 볼 수 있어요.
      </p>
      {COMPETENCIES.map((c, index) => (
        <fieldset key={c.id}>
          <legend>
            {c.label}
            <small>{c.description}</small>
          </legend>
          <div>
            {[1, 2, 3, 4, 5].map((v) => (
              <label key={v}>
                <input
                  type="radio"
                  name={phase + c.id}
                  value={v}
                  checked={values[index] === v}
                  onChange={() => onChange(index, v)}
                />
                <span>{v}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </section>
  );
}
