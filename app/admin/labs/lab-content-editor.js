"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  defaultLabContent,
  LAB_FIELD_STAGES,
  validateLabContent,
} from "@/lib/lab/content.mjs";
import { learningRequest } from "@/lib/learning/client";
export default function LabContentEditor({ topic, initial, correctOption }) {
  const router = useRouter();
  const [content, setContent] = useState(initial.content),
    [revision, setRevision] = useState(initial.revision),
    [published, setPublished] = useState(initial.publication?.revision || 0);
  const [step, setStep] = useState(0),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(change) {
    setContent((current) => change(structuredClone(current)));
    setDirty(true);
    setMessage("");
    setError("");
  }
  function value(label, text, onChange, rows = 3) {
    return (
      <label>
        {label}
        <textarea
          value={text}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }
  async function run(action) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const valid = validateLabContent(content, topic.id);
      const result = await learningRequest("/api/admin/labs/" + topic.id, {
        action,
        content: valid,
        revision,
      });
      setContent(result.content);
      setRevision(result.revision);
      setDirty(false);
      if (result.published) setPublished(result.revision);
      setMessage(
        result.published
          ? "LAB에 발행했어요. 새로 여는 LAB에서 질문과 발문을 확인할 수 있어요."
          : "초안을 저장했어요. 저장본을 미리 본 뒤 발행해주세요.",
      );
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  const current = content.steps[step];
  return (
    <main className="learning-shell">
      <Link className="learning-back" href="/admin/labs">
        ← LAB 질문·발문 관리
      </Link>
      <header className="learning-page-head">
        <div>
          <p className="learning-kicker">ASTERA STUDIO / {topic.code}</p>
          <h1>질문과 발문 편집</h1>
          <p>
            {topic.tool} ·{" "}
            {published ? "발행본 있음 · v" + published : "기본 발문 사용 중"}
            {dirty ? " · 저장하지 않은 변경" : ""}
          </p>
        </div>
        <div className="learning-actions">
          <button
            className="learning-button secondary"
            disabled={busy}
            onClick={() => run("save")}
          >
            초안 저장
          </button>
          {revision > 0 && (
            <Link
              className="learning-button secondary"
              href={"/admin/labs/" + topic.id + "/preview"}
              target="_blank"
            >
              저장본 미리보기 ↗
            </Link>
          )}
          <button
            className="learning-button"
            disabled={busy}
            onClick={() => run("publish")}
          >
            {busy ? "처리 중…" : "LAB에 발행"}
          </button>
        </div>
      </header>
      <p className="learning-hint">
        핵심 질문·단계 안내·발문·개념 문항을 편집합니다. 실험의 조건·계산
        규칙·정답 연결은 유지됩니다. 선택지의 뜻을 바꿀 때 정답 문구와 피드백을
        함께 확인해주세요.
      </p>
      <div role="status" className="learning-status">
        {message}
      </div>
      {error && (
        <p role="alert" className="learning-error">
          {error}{" "}
          <button
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(content, null, 2)], {
                  type: "application/json",
                }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = topic.id + "-발문초안.json";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            현재 초안 내려받기
          </button>
        </p>
      )}
      <fieldset disabled={busy} className="learning-editor-fields">
        <section className="learning-panel">
          <h2>핵심 질문과 소개</h2>
          {value(
            "LAB 핵심 질문",
            content.question,
            (text) => update((c) => ({ ...c, question: text })),
            2,
          )}
          {value(
            "LAB 소개",
            content.intro,
            (text) => update((c) => ({ ...c, intro: text })),
            2,
          )}
        </section>
        <nav
          className="learning-stage-editor-nav"
          aria-label="편집할 학습 단계"
        >
          {content.steps.map((s, index) => (
            <button
              type="button"
              className={
                "learning-button " + (step === index ? "" : "secondary")
              }
              key={s.label}
              aria-pressed={step === index}
              onClick={() => setStep(index)}
            >
              {index + 1}. {s.label}
            </button>
          ))}
        </nav>
        <section className="learning-panel">
          <h2>
            {step + 1}. {current.label} 단계
          </h2>
          {value(
            "단계 제목",
            current.title,
            (text) =>
              update((c) => {
                c.steps[step].title = text;
                return c;
              }),
            2,
          )}
          {value(
            "단계 요약",
            current.hint,
            (text) =>
              update((c) => {
                c.steps[step].hint = text;
                return c;
              }),
            2,
          )}
          {value("단계 학습 안내", current.guide, (text) =>
            update((c) => {
              c.steps[step].guide = text;
              return c;
            }),
          )}
          {value("생각을 돕는 추가 질문", current.partner, (text) =>
            update((c) => {
              c.steps[step].partner = text;
              return c;
            }),
          )}
          {Object.entries(content.fields)
            .filter(([key]) => LAB_FIELD_STAGES[key] === step)
            .map(([key, field]) => (
              <section className="lab-editor-prompt" key={key}>
                <h3>답변을 유도하는 발문</h3>
                {value(
                  "질문·발문",
                  field.label,
                  (text) =>
                    update((c) => {
                      c.fields[key].label = text;
                      return c;
                    }),
                  2,
                )}
                {value(
                  "답변 도움말",
                  field.hint,
                  (text) =>
                    update((c) => {
                      c.fields[key].hint = text;
                      return c;
                    }),
                  2,
                )}
              </section>
            ))}
          {step === 0 &&
            topic.id !== "science-001" &&
            value("탐구 상황", content.scene, (text) =>
              update((c) => ({ ...c, scene: text })),
            )}
          {step === 1 && (
            <>
              <h3>개념 설명</h3>
              {content.concepts.map((concept, index) => (
                <section className="lab-editor-prompt" key={index}>
                  {value(
                    "개념 " + (index + 1) + " 제목",
                    concept.title,
                    (text) =>
                      update((c) => {
                        c.concepts[index].title = text;
                        return c;
                      }),
                    2,
                  )}
                  {value("개념 설명", concept.body, (text) =>
                    update((c) => {
                      c.concepts[index].body = text;
                      return c;
                    }),
                  )}
                </section>
              ))}
              {value(
                "짧게 읽기",
                content.reading,
                (text) => update((c) => ({ ...c, reading: text })),
                6,
              )}
              <h3>개념 확인 문항</h3>
              {value("확인 질문", content.check.question, (text) =>
                update((c) => {
                  c.check.question = text;
                  return c;
                }),
              )}
              {content.check.options.map((option, index) => (
                <div key={option.id}>
                  {value(
                    "선택지 " +
                      (index + 1) +
                      (option.id === correctOption ? " · 정답 연결" : ""),
                    option.label,
                    (text) =>
                      update((c) => {
                        c.check.options[index].label = text;
                        return c;
                      }),
                    2,
                  )}
                </div>
              ))}
              {value("정답 피드백", content.check.feedback, (text) =>
                update((c) => {
                  c.check.feedback = text;
                  return c;
                }),
              )}
              {value(
                "다시 생각하기 피드백",
                content.check.wrongFeedback,
                (text) =>
                  update((c) => {
                    c.check.wrongFeedback = text;
                    return c;
                  }),
              )}
            </>
          )}
        </section>
        <div className="learning-actions">
          <button
            type="button"
            className="learning-button secondary"
            onClick={() => {
              setContent(defaultLabContent(topic.id));
              setDirty(true);
              setMessage(
                "기본 발문을 초안에 불러왔어요. 확인하고 발행하면 반영돼요.",
              );
              setError("");
            }}
          >
            기본 발문을 초안에 불러오기
          </button>
          <Link
            className="learning-text-link"
            href={"/lab/" + topic.id}
            target="_blank"
          >
            현재 공개 LAB 보기 ↗
          </Link>
        </div>
      </fieldset>
    </main>
  );
}
