"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { defaultLabContent } from "@/lib/lab/content.mjs";
import { LAB_STEPS } from "@/lib/lab/topics";
import {
  ADAPTATIONS,
  ANSWERS,
  BUDGET,
  INVESTIGATIONS,
  PLANETS,
  QUESTION,
  SOURCES,
  STORAGE_KEY,
  buildRecord,
  canComplete,
  freshMission,
  observationDetails,
  observationKey,
  observe,
  restoreMission,
  spentBudget,
  validateStep,
} from "@/lib/lab/science.mjs";
import {
  AnswerChoices,
  InvestigationIcon,
  LabField,
  PlanetArt,
} from "../components";
import { IconArrow, IconCheck } from "../../icons";

export default function ScienceLab({
  content = defaultLabContent("science-001"),
  preview = false,
}) {
  const steps = content.steps;
  const [mission, setMission] = useState(freshMission);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const headingRef = useRef(null);
  const errorRef = useRef(null);
  const dialogRef = useRef(null);
  const resetButtonRef = useRef(null);
  const lastStep = useRef(0);

  useEffect(() => {
    if (preview) {
      setLoaded(true);
      setSaveState("preview");
      return;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setMission(restoreMission(JSON.parse(raw)));
        setMessage("이 브라우저에 남긴 탐구 기록을 불러왔어요.");
      }
      setSaveState("saved");
    } catch {
      setSaveState("unavailable");
      setMessage("이전 기록을 불러오지 못했어요. 새 탐구를 시작할 수 있어요.");
    }
    setLoaded(true);
  }, [preview]);

  useEffect(() => {
    if (!loaded || preview) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mission));
      setSaveState("saved");
    } catch {
      setSaveState("unavailable");
    }
  }, [mission, loaded, preview]);

  useEffect(() => {
    if (lastStep.current !== mission.step) {
      lastStep.current = mission.step;
      headingRef.current?.focus();
    }
  }, [mission.step]);

  useEffect(() => {
    if (resetOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [resetOpen]);

  function update(key, value) {
    setMission((current) => ({ ...current, [key]: value, completed: false }));
    setError("");
  }
  function goToStep(step) {
    setError("");
    setMessage("");
    setMission((current) => ({ ...current, step }));
  }
  function onNext(event) {
    event.preventDefault();
    const problem =
      mission.step === 4 && !canComplete(mission)
        ? [0, 1, 2, 3, 4]
            .map((step) => validateStep(mission, step))
            .find(Boolean) || "이전 단계의 기록을 확인해주세요."
        : validateStep(mission);
    if (problem) {
      setError(problem);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    if (mission.step === 4) {
      setMission((current) => ({ ...current, completed: true }));
      setMessage(
        "탐구 기록이 완성되었어요. 처음 생각과 지금의 생각을 비교해보세요.",
      );
      requestAnimationFrame(() => headingRef.current?.focus());
    } else goToStep(mission.step + 1);
  }
  function investigate(investigationId) {
    // Pure transition also protects against double clicks and over-budget purchases.
    setMission(
      (current) =>
        observe(current, current.selectedPlanet, investigationId).state,
    );
    const detail = observationDetails(
      observationKey(mission.selectedPlanet, investigationId),
    );
    setMessage(
      `${detail.planet.name} · ${detail.investigation.name}: ${detail.title}. 관찰 기록에 추가했어요.`,
    );
    setError("");
  }
  function toggleEvidence(key) {
    setMission((current) => ({
      ...current,
      evidence: current.evidence.includes(key)
        ? current.evidence.filter((value) => value !== key)
        : [...current.evidence, key],
      completed: false,
    }));
    setError("");
  }
  function closeReset() {
    setResetOpen(false);
    resetButtonRef.current?.focus();
  }
  function resetMission() {
    setMission(freshMission());
    setError("");
    setMessage("새 탐사를 시작했어요. 탐사 토큰 6개를 사용할 수 있어요.");
    closeReset();
  }
  function downloadRecord() {
    const record = { ...buildRecord(mission), question: content.question };
    const lines = [
      "ASTERA LAB · SCIENCE 001 · LIFE FINDER",
      record.question,
      "",
      "처음의 생각",
      record.initial.answer,
      record.initial.reason,
      "",
      `탐사 기록 (${record.tokensUsed}/${BUDGET} 토큰 사용)`,
      ...record.observations.map(
        (item) =>
          `${item.planet} · ${item.investigation}: ${item.title}\n${item.detail}\n더 확인할 점: ${item.limit}`,
      ),
      "",
      `다음 탐사: ${record.priority.planet}`,
      record.priority.reason,
      `아직 모르는 점: ${record.priority.uncertainty}`,
      "",
      `상상한 생명의 특징: ${record.imaginedLife.feature}`,
      record.imaginedLife.reason,
      record.imaginedLife.note,
      "",
      "지금의 생각",
      record.final.answer,
      record.final.reason,
      `다음 질문: ${record.final.nextQuestion}`,
      "",
      record.dataNote,
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", lines.join("\n")], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ASTERA_SCIENCE_001_탐구기록.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("탐구 기록을 텍스트 파일로 저장했어요.");
  }

  const planet = PLANETS.find((item) => item.id === mission.selectedPlanet);
  const priorityPlanet = PLANETS.find((item) => item.id === mission.priority);
  const observations = mission.observations
    .map(observationDetails)
    .filter(Boolean);
  const balance = BUDGET - spentBudget(mission);
  const availableStep =
    [0, 1, 2, 3, 4].find((step) => !!validateStep(mission, step)) ?? 4;
  const record = { ...buildRecord(mission), question: content.question };

  return (
    <main className="lab-page lab-mission-page">
      <div className="wrap lab-mission-wrap">
        <div className="lab-breadcrumb">
          <Link href="/lab">← 모든 LAB</Link>
          <span>SCIENCE 001 / LIFE FINDER</span>
        </div>
        <header className="lab-mission-header">
          <div>
            <p className="lab-kicker">관찰에서 시작하는 생명 탐사</p>
            <h1>{content.question}</h1>
            <p>{content.intro}</p>
          </div>
          <div className="lab-mission-meta">
            <span>5–10분</span>
            <span>초등 4–6학년</span>
            <span>무료 체험</span>
          </div>
        </header>
        <div className="lab-mission-layout">
          <aside className="lab-progress-panel">
            <p className="lab-kicker">YOUR EXPLORATION</p>
            <nav aria-label="탐구 단계">
              <ol>
                {steps.map((step, index) => (
                  <li key={step.label}>
                    <button
                      type="button"
                      disabled={!loaded || index > availableStep}
                      aria-current={mission.step === index ? "step" : undefined}
                      onClick={() => goToStep(index)}
                    >
                      <span className="lab-step-number">
                        {index < availableStep ? (
                          <IconCheck width={15} height={15} />
                        ) : (
                          String(index + 1).padStart(2, "0")
                        )}
                      </span>
                      <span>
                        <b>{step.label}</b>
                        <small>{step.hint}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="lab-storage-info">
              <span className={`lab-save-dot ${saveState}`} />
              {preview
                ? "미리보기 · 기록을 저장하지 않아요"
                : saveState === "loading"
                  ? "기록 확인 중…"
                  : saveState === "saved"
                    ? "이 브라우저에 자동 저장"
                    : "자동 저장을 사용할 수 없어요"}
              <p>
                이름 없이 탐구 내용만 남겨요. 공용 기기라면 활동 후 기록을
                지워주세요.
              </p>
            </div>
            <button
              type="button"
              className="lab-reset"
              ref={resetButtonRef}
              onClick={() => setResetOpen(true)}
              disabled={!loaded}
            >
              기록 지우고 다시 시작
            </button>
          </aside>

          <form className="lab-workspace" onSubmit={onNext}>
            <div className="lab-workspace-heading">
              <div>
                <p className="lab-kicker">
                  {String(mission.step + 1).padStart(2, "0")} /{" "}
                  {mission.completed && mission.step === 4
                    ? "EXPLORATION RECORD"
                    : steps[mission.step].label}
                </p>
                <h2 ref={headingRef} tabIndex={-1}>
                  {mission.completed && mission.step === 4
                    ? "나의 생명 탐사 기록"
                    : steps[mission.step].title}
                </h2>
              </div>
              {mission.step === 2 && (
                <div
                  className="lab-budget"
                  aria-label={`탐사 토큰 ${BUDGET}개 중 ${balance}개 남음`}
                >
                  <small>남은 탐사 토큰</small>
                  <strong>
                    {balance}
                    <span> / {BUDGET}</span>
                  </strong>
                  <div aria-hidden="true">
                    {Array.from({ length: BUDGET }, (_, index) => (
                      <i
                        key={index}
                        className={index < balance ? "available" : ""}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="lab-announcement" role="status">
              {message}
            </div>
            {saveState === "unavailable" && (
              <p className="lab-warning">
                새로고침하면 기록이 사라질 수 있어요. 활동을 마치고 탐구 기록을
                파일로 저장해주세요.
              </p>
            )}
            {!loaded ? (
              <p>탐구 기록을 준비하고 있어요…</p>
            ) : (
              <div key={mission.step} className="lab-step-content">
                {mission.step === 0 && (
                  <>
                    <div className="lab-question-scene">
                      <img
                        src="/images/hero-earth.webp"
                        alt="큰 지구와 밤하늘을 바라보는 ASTERA 탐험가와 탐구 파트너"
                        width={2000}
                        height={770}
                      />
                      <div>
                        <span>START WITH A QUESTION</span>
                        <p>{steps[0].guide}</p>
                      </div>
                    </div>
                    <AnswerChoices
                      answers={ANSWERS}
                      value={mission.initial}
                      onChange={(value) => update("initial", value)}
                      label={content.fields.initial.label}
                    />
                    {content.fields.initial.hint && (
                      <p className="lab-model-note">
                        {content.fields.initial.hint}
                      </p>
                    )}
                    <LabField
                      id="initial-reason"
                      label={content.fields.initialReason.label}
                      hint={content.fields.initialReason.hint}
                      value={mission.initialReason}
                      onChange={(value) => update("initialReason", value)}
                    />
                    <div className="lab-partner">
                      <b>SCION의 질문</b>
                      <p>{steps[0].partner}</p>
                    </div>
                  </>
                )}

                {mission.step === 1 && (
                  <>
                    <p className="lab-intro lab-authored-copy">
                      {steps[1].guide}
                    </p>
                    <div className="lab-concept-grid">
                      {content.concepts.map((item, index) => (
                        <article key={item.title}>
                          <InvestigationIcon
                            name={["water", "energy", "chemistry"][index]}
                          />
                          <h3>{item.title}</h3>
                          <p>{item.body}</p>
                        </article>
                      ))}
                    </div>
                    <div className="lab-reading">
                      <p className="lab-kicker">
                        짧게 읽기 / 단서가 곧 발견일까?
                      </p>
                      <p className="lab-authored-copy">{content.reading}</p>
                      <p>
                        <b>
                          이 LAB의 세 행성과 모든 수치는 교육용 가상 자료예요.
                        </b>{" "}
                        실제 외계행성에서 측정한 결과가 아니며, 생명체가 있을
                        확률을 계산하지 않아요.
                      </p>
                    </div>
                    <fieldset className="lab-concept-check">
                      <legend>{content.check.question}</legend>
                      {content.check.options.map((option) => (
                        <label key={option.id}>
                          <input
                            type="radio"
                            name="concept"
                            value={option.id}
                            checked={mission.concept === option.id}
                            onChange={() => update("concept", option.id)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                      {mission.concept && (
                        <p
                          className={
                            mission.concept === "clue"
                              ? "lab-correct"
                              : "lab-warning"
                          }
                          role="status"
                        >
                          {mission.concept === "clue"
                            ? content.check.feedback
                            : content.check.wrongFeedback}
                        </p>
                      )}
                    </fieldset>
                  </>
                )}

                {mission.step === 2 && (
                  <>
                    <p className="lab-intro lab-authored-copy">
                      {steps[2].guide}
                    </p>
                    <div className="lab-fiction-note">
                      교육용 가상 행성 · 표면 평균 온도의 추정값 · 삽화는 실제
                      사진이 아니에요.
                    </div>
                    <div
                      className="lab-planet-tabs"
                      role="group"
                      aria-label="조사할 행성"
                    >
                      {PLANETS.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          aria-pressed={planet.id === item.id}
                          onClick={() => update("selectedPlanet", item.id)}
                        >
                          <PlanetArt tone={item.tone} size={38} />
                          <span>
                            <b>
                              {item.letter} · {item.name}
                            </b>
                            <small>{item.kind}</small>
                          </span>
                          <span className="lab-planet-tab-count">
                            {
                              mission.observations.filter(
                                (key) =>
                                  observationDetails(key)?.planet.id ===
                                  item.id,
                              ).length
                            }
                            개 조사
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="lab-exploration-grid">
                      <div className="lab-control-room">
                        <div className="lab-planet-profile">
                          <PlanetArt tone={planet.tone} size={115} />
                          <div>
                            <p className="lab-kicker">PLANET {planet.letter}</p>
                            <h3>{planet.name}</h3>
                            <p>{planet.hint}</p>
                            <span>
                              표면 평균 온도 추정 {planet.temperature}
                            </span>
                          </div>
                        </div>
                        <div className="lab-investigation-grid">
                          {INVESTIGATIONS.map((item) => {
                            const done = mission.observations.includes(
                              observationKey(planet.id, item.id),
                            );
                            const disabled = done || item.cost > balance;
                            return (
                              <button
                                type="button"
                                key={item.id}
                                className={`lab-investigate ${done ? "done" : ""}`}
                                disabled={disabled}
                                onClick={() => investigate(item.id)}
                              >
                                <div>
                                  <InvestigationIcon name={item.icon} />
                                  <span className="lab-cost">
                                    {done ? "조사 완료" : `${item.cost} 토큰`}
                                  </span>
                                </div>
                                <b>{item.name}</b>
                                <p>{item.question}</p>
                                <small>
                                  {done
                                    ? "오른쪽 기록에서 확인해요"
                                    : disabled
                                      ? "남은 토큰이 부족해요"
                                      : "조사하기 →"}
                                </small>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <aside className="lab-observations">
                        <div className="lab-notebook-heading">
                          <h3>관찰 기록</h3>
                          <span>{observations.length}개 단서</span>
                        </div>
                        {observations.length ? (
                          <ol>
                            {observations.map((finding) => (
                              <li key={finding.key}>
                                <p className="lab-kicker">
                                  {finding.planet.name} ·{" "}
                                  {finding.investigation.name}
                                </p>
                                <h4>{finding.title}</h4>
                                <p>{finding.detail}</p>
                                <div>
                                  <b>더 확인할 점</b>
                                  <p>{finding.limit}</p>
                                </div>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <div className="lab-empty-notebook">
                            <InvestigationIcon name="repeat" />
                            <p>아직 조사한 단서가 없어요.</p>
                            <small>
                              왼쪽에서 조사를 선택하면
                              <br />
                              이곳에 기록이 쌓여요.
                            </small>
                          </div>
                        )}
                      </aside>
                    </div>
                    <div className="lab-partner">
                      <b>SCION의 탐구 팁</b>
                      <p>{steps[2].partner}</p>
                    </div>
                    <section className="lab-decision">
                      <h3>{content.fields.priority.label}</h3>
                      {content.fields.priority.hint && (
                        <p className="lab-model-note">
                          {content.fields.priority.hint}
                        </p>
                      )}
                      <fieldset className="lab-priority-choices">
                        <legend className="lab-sr-only">
                          다음 탐사 우선순위
                        </legend>
                        {PLANETS.map((item) => (
                          <label
                            key={item.id}
                            className={
                              mission.priority === item.id ? "selected" : ""
                            }
                          >
                            <input
                              type="radio"
                              name="priority"
                              checked={mission.priority === item.id}
                              onChange={() => update("priority", item.id)}
                            />
                            <span>
                              {item.letter} · {item.name}
                            </span>
                          </label>
                        ))}
                      </fieldset>
                      {observations.length > 0 && (
                        <fieldset className="lab-evidence">
                          <legend>{content.fields.evidence.label}</legend>
                          {content.fields.evidence.hint && (
                            <p className="lab-model-note">
                              {content.fields.evidence.hint}
                            </p>
                          )}
                          {observations.map((finding) => (
                            <label key={finding.key}>
                              <input
                                type="checkbox"
                                checked={mission.evidence.includes(finding.key)}
                                onChange={() => toggleEvidence(finding.key)}
                              />
                              <span>
                                <b>
                                  {finding.planet.name} · {finding.title}
                                </b>
                                <small>{finding.investigation.name}</small>
                              </span>
                            </label>
                          ))}
                        </fieldset>
                      )}
                      <LabField
                        id="priority-reason"
                        label={content.fields.priorityReason.label}
                        hint={content.fields.priorityReason.hint}
                        value={mission.priorityReason}
                        onChange={(value) => update("priorityReason", value)}
                      />
                      <LabField
                        id="uncertainty"
                        label={content.fields.uncertainty.label}
                        hint={content.fields.uncertainty.hint}
                        value={mission.uncertainty}
                        onChange={(value) => update("uncertainty", value)}
                        rows={2}
                      />
                    </section>
                  </>
                )}

                {mission.step === 3 && (
                  <>
                    <p className="lab-intro lab-authored-copy">
                      {steps[3].guide}
                    </p>
                    <div className="lab-create-scene">
                      <div className="lab-create-planet">
                        <PlanetArt tone={priorityPlanet?.tone} size={110} />
                        <b>{priorityPlanet?.name}의 환경에서</b>
                        <span>{priorityPlanet?.kind}</span>
                      </div>
                      <span className="lab-create-arrow" aria-hidden="true">
                        →
                      </span>
                      <div
                        className={`lab-imagined-life ${mission.adaptation}`}
                        aria-hidden="true"
                      >
                        <span />
                        <span />
                      </div>
                      <p>
                        상상한 생명체
                        <br />
                        <small>실제로 발견한 생명이 아니에요.</small>
                      </p>
                    </div>
                    <fieldset className="lab-adaptations">
                      <legend>{content.fields.adaptation.label}</legend>
                      {content.fields.adaptation.hint && (
                        <p className="lab-model-note">
                          {content.fields.adaptation.hint}
                        </p>
                      )}
                      {ADAPTATIONS.map((item) => (
                        <label
                          key={item.id}
                          className={
                            mission.adaptation === item.id ? "selected" : ""
                          }
                        >
                          <input
                            type="radio"
                            name="adaptation"
                            checked={mission.adaptation === item.id}
                            onChange={() => update("adaptation", item.id)}
                          />
                          <span>
                            <b>{item.name}</b>
                            <small>{item.detail}</small>
                          </span>
                        </label>
                      ))}
                    </fieldset>
                    <LabField
                      id="adaptation-reason"
                      label={content.fields.adaptationReason.label}
                      hint={content.fields.adaptationReason.hint}
                      value={mission.adaptationReason}
                      onChange={(value) => update("adaptationReason", value)}
                    />
                    <div className="lab-partner">
                      <b>더 넓게 상상하기</b>
                      <p>{steps[3].partner}</p>
                    </div>
                  </>
                )}

                {mission.step === 4 && !mission.completed && (
                  <>
                    <p className="lab-intro lab-authored-copy">
                      {steps[4].guide}
                    </p>
                    <div className="lab-first-thought">
                      <p className="lab-kicker">처음에 남긴 생각</p>
                      <b>{record.initial.answer}</b>
                      <p>{record.initial.reason}</p>
                    </div>
                    <AnswerChoices
                      answers={ANSWERS}
                      value={mission.final}
                      onChange={(value) => update("final", value)}
                      label={content.fields.final.label}
                    />
                    {content.fields.final.hint && (
                      <p className="lab-model-note">
                        {content.fields.final.hint}
                      </p>
                    )}
                    <LabField
                      id="final-reason"
                      label={content.fields.finalReason.label}
                      hint={content.fields.finalReason.hint}
                      value={mission.finalReason}
                      onChange={(value) => update("finalReason", value)}
                    />
                    <LabField
                      id="next-question"
                      label={content.fields.nextQuestion.label}
                      hint={content.fields.nextQuestion.hint}
                      value={mission.nextQuestion}
                      onChange={(value) => update("nextQuestion", value)}
                      rows={2}
                    />
                    <div className="lab-partner">
                      <b>생각의 변화는 점수가 아니에요.</b>
                      <p>{steps[4].partner}</p>
                    </div>
                  </>
                )}

                {mission.step === 4 && mission.completed && (
                  <section className="lab-result">
                    <div className="lab-result-banner">
                      <span>
                        <IconCheck width={22} height={22} />
                      </span>
                      <div>
                        <h3>하나의 답에서, 더 좋은 질문으로.</h3>
                        <p>
                          {observations.length}개 단서를 조사하고{" "}
                          {spentBudget(mission)}개 토큰을 사용했어요.
                        </p>
                      </div>
                    </div>
                    <div className="lab-thought-comparison">
                      <article>
                        <p className="lab-kicker">BEFORE / 처음 생각</p>
                        <h3>{record.initial.answer}</h3>
                        <p>{record.initial.reason}</p>
                      </article>
                      <article>
                        <p className="lab-kicker">AFTER / 지금 생각</p>
                        <h3>{record.final.answer}</h3>
                        <p>{record.final.reason}</p>
                      </article>
                    </div>
                    <div className="lab-result-section">
                      <h3>다음 탐사 우선순위 · {priorityPlanet?.name}</h3>
                      <p>{mission.priorityReason}</p>
                      <h4>판단에 사용한 단서</h4>
                      <ul>
                        {mission.evidence
                          .map(observationDetails)
                          .filter(Boolean)
                          .map((finding) => (
                            <li key={finding.key}>
                              {finding.planet.name} · {finding.title}
                            </li>
                          ))}
                      </ul>
                      <h4>아직 더 확인할 점</h4>
                      <p>{mission.uncertainty}</p>
                    </div>
                    <div className="lab-result-section">
                      <h3>내가 상상한 생명체</h3>
                      <p>
                        <b>{record.imaginedLife.feature}</b>
                      </p>
                      <p>{mission.adaptationReason}</p>
                      <small>{record.imaginedLife.note}</small>
                    </div>
                    <div className="lab-next-question">
                      <p className="lab-kicker">MY NEXT QUESTION</p>
                      <p>{mission.nextQuestion}</p>
                    </div>
                    <details className="lab-result-observations">
                      <summary>
                        전체 관찰 기록 보기 · {observations.length}개
                      </summary>
                      {observations.map((finding) => (
                        <article key={finding.key}>
                          <h4>
                            {finding.planet.name} · {finding.title}
                          </h4>
                          <p>{finding.detail}</p>
                          <p>
                            <b>더 확인할 점:</b> {finding.limit}
                          </p>
                        </article>
                      ))}
                    </details>
                    <div className="lab-result-actions">
                      <button
                        type="button"
                        className="lab-button gold"
                        onClick={downloadRecord}
                      >
                        탐구 기록 저장 (.txt)
                      </button>
                      <button
                        type="button"
                        className="lab-button outline"
                        onClick={() => window.print()}
                      >
                        기록 인쇄
                      </button>
                      <Link className="lab-text-link" href="/lab">
                        다른 유니버스 둘러보기 →
                      </Link>
                    </div>
                  </section>
                )}
              </div>
            )}
            <div
              ref={errorRef}
              tabIndex={-1}
              role={error ? "alert" : undefined}
              className={error ? "lab-error" : "lab-sr-only"}
            >
              {error}
            </div>
            {loaded && !(mission.step === 4 && mission.completed) && (
              <footer className="lab-step-actions">
                <button
                  type="button"
                  className="lab-button outline"
                  disabled={mission.step === 0}
                  onClick={() => goToStep(mission.step - 1)}
                >
                  ← 이전
                </button>
                <span>{mission.step + 1} / 5 단계</span>
                <button type="submit" className="lab-button gold">
                  {mission.step === 4
                    ? "탐구 기록 완성"
                    : `${LAB_STEPS[mission.step + 1].label}으로 이동`}{" "}
                  <IconArrow width={18} height={18} />
                </button>
              </footer>
            )}
          </form>
        </div>
        <footer className="lab-mission-footnote">
          <p>
            이 LAB의 행성과 관찰 결과는 교육용 가상 자료입니다. 생명 존재 여부를
            자동 판정하지 않습니다.
          </p>
          <details>
            <summary>개념 자료의 출처와 교사 안내</summary>
            <p>
              지구 생명을 기준으로 생명 탐색의 조건을 소개하며, 신호의 다른
              설명을 함께 검토하는 NASA 자료를 참고했습니다. 학생의 결론보다
              관찰·이유·불확실성에 초점을 맞춰 대화해주세요. 실제 외계행성 관측
              수업으로 확장할 때는 별도의 실제 자료가 필요합니다.
            </p>
            <ul>
              {SOURCES.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </footer>
      </div>
      <dialog
        ref={dialogRef}
        className="lab-reset-dialog"
        aria-labelledby="reset-title"
        onCancel={(event) => {
          event.preventDefault();
          closeReset();
        }}
      >
        <h2 id="reset-title">탐구 기록을 지울까요?</h2>
        <p>
          이 브라우저에 저장한 처음 생각, 조사 내용, 최종 기록을 지우고 새로
          시작해요. 필요한 기록은 먼저 저장해주세요.
        </p>
        <div>
          <button
            type="button"
            className="lab-button outline"
            onClick={closeReset}
            autoFocus
          >
            기록 유지
          </button>
          <button
            type="button"
            className="lab-button gold"
            onClick={resetMission}
          >
            지우고 시작
          </button>
        </div>
      </dialog>
    </main>
  );
}
