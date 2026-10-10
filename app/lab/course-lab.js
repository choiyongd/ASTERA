"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COURSE_STEPS, canCompleteCourse, courseRecord, courseStorageKey, freshCourse, recordExperiment, restoreCourse, validateCourseStep } from "@/lib/lab/course.mjs";
import { normalizeInputs, snapshot } from "@/lib/lab/models.mjs";
import { LabField } from "./components";
import ActivityWorkbench, { CreativeCanvas } from "./activity-workbench";
import { UniverseIcon } from "../universe-icons";
import { IconArrow, IconCheck } from "../icons";

export default function CourseLab({ topic, activity }) {
  const [mission, setMission] = useState(() => freshCourse(topic, activity));
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const headingRef = useRef(null), errorRef = useRef(null), dialogRef = useRef(null), resetRef = useRef(null), recordRef = useRef(null), lastStep = useRef(0);
  const storageKey = courseStorageKey(topic.id);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) { setMission(restoreCourse(JSON.parse(raw), topic, activity)); setMessage("이 브라우저에 남긴 이 주제의 탐구 기록을 불러왔어요."); }
      setSaveState("saved");
    } catch { setSaveState("unavailable"); setMessage("이전 기록을 불러오지 못했어요. 새 탐구를 시작할 수 있어요."); }
    setLoaded(true);
  }, [storageKey, topic, activity]);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(storageKey, JSON.stringify(mission)); setSaveState("saved"); }
    catch { setSaveState("unavailable"); }
  }, [mission, loaded, storageKey]);
  useEffect(() => { if (lastStep.current !== mission.step) { lastStep.current = mission.step; headingRef.current?.focus(); } }, [mission.step]);
  useEffect(() => { if (resetOpen) dialogRef.current?.showModal(); else dialogRef.current?.close(); }, [resetOpen]);

  function update(key, value) { setMission(current => ({ ...current, [key]: value, completed: false })); setError(""); }
  function changeCondition(key, value) {
    setMission(current => ({ ...current, inputs: normalizeInputs(activity.mode, key === "preset" ? { ...current.inputs, ...value } : { ...current.inputs, [key]: key === "budget" ? Number(value) : value }), completed: false }));
    setError(""); setMessage("");
  }
  function goToStep(step) { setMission(current => ({ ...current, step })); setError(""); setMessage(""); }
  function onNext(event) {
    event.preventDefault();
    const problem = mission.step === 4 ? COURSE_STEPS.map((_, i) => validateCourseStep(mission, activity, i)).find(Boolean) : validateCourseStep(mission, activity);
    if (problem) { setError(problem); requestAnimationFrame(() => errorRef.current?.focus()); return; }
    if (mission.step < 4) goToStep(mission.step + 1);
    else { setMission(current => ({ ...current, completed: canCompleteCourse(current, activity) })); setMessage("탐구 기록이 완성되었어요. 처음 생각과 지금의 생각을 비교해보세요."); requestAnimationFrame(() => headingRef.current?.focus()); }
  }
  function testConditions() {
    const result = recordExperiment(mission, activity);
    // Repeat-click safety belongs to the pure transition, not the rendered button.
    setMission(current => recordExperiment(current, activity).state);
    setMessage(result.error ? "" : result.message); setError(result.error ? result.message : "");
    if (result.error) requestAnimationFrame(() => errorRef.current?.focus());
  }
  function toggleEvidence(key) { setMission(current => ({ ...current, evidence: current.evidence.includes(key) ? current.evidence.filter(k => k !== key) : [...current.evidence, key], completed: false })); setError(""); }
  function closeReset() { setResetOpen(false); resetRef.current?.focus(); }
  function reset() { setMission(freshCourse(topic, activity)); setError(""); setMessage("이 주제의 새 탐구를 시작했어요."); closeReset(); }
  function printRecord() {
    const recordDetails = recordRef.current;
    const previouslyOpen = recordDetails?.open;
    if (recordDetails) recordDetails.open = true;
    window.addEventListener("afterprint", () => { if (recordDetails) recordDetails.open = previouslyOpen; }, { once: true });
    window.print();
  }
  function downloadRecord() {
    const r = courseRecord(mission, topic, activity);
    const lines = [`ASTERA LAB · ${topic.code} · ${topic.tool}`, r.question, `상태: ${r.complete ? "탐구 완료" : "작성 중"}`, "", "처음 생각", r.initial, r.initialReason, "", "비교 실험", ...r.runs.map((run, i) => `${i + 1}. ${run.label}\n실험 전 예측: ${run.predictionAtRun}\n조건: ${JSON.stringify(run.inputs)}\n${run.observations.join("\n")}\n확인할 점: ${run.limit}`), "", `선택한 근거: ${r.evidence.join(" / ")}`, r.interpretation, `아직 모르는 점: ${r.uncertainty}`, "", "나의 창작·설계", r.creation, r.creationReason, ...(["art", "art-context"].includes(activity.mode) ? [`창작 도형: 색 ${r.artPalette} · 중심 ${r.artFocus}`] : []), "", "지금 생각", r.final, r.finalReason, `다음 질문: ${r.nextQuestion}`, "", "활동 자료의 범위", activity.scene, ...activity.sources.map(source => `${source.title}: ${source.url}`)];
    const url = URL.createObjectURL(new Blob(["\uFEFF", lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `ASTERA_${topic.code.replaceAll(" ", "_")}_탐구기록.txt`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("탐구 기록을 텍스트 파일로 내려받았어요.");
  }
  const firstIncomplete = COURSE_STEPS.findIndex((_, i) => !!validateCourseStep(mission, activity, i));
  const availableStep = firstIncomplete < 0 ? 4 : firstIncomplete;
  const tested = mission.runs.some(run => run.key === snapshot(activity.mode, mission.inputs).key);
  const field = (key, label, hint, rows = 3) => <LabField id={`course-${key}`} label={label} hint={hint} value={mission[key]} onChange={v => update(key, v)} rows={rows} />;
  const artMode = ["art", "art-context"].includes(activity.mode);

  function comparisonRecords(readOnly = false) {
    return <div className="lab-course-records">{mission.runs.length === 0 ? <p className="lab-model-note">아직 비교 기록이 없어요. 예측을 쓰고 첫 조건을 시험해보세요.</p> : mission.runs.map((run, index) => <article key={run.key} className="lab-course-run"><p className="lab-kicker">COMPARISON {String(index + 1).padStart(2, "0")}</p><h3>{run.label}</h3><p className="lab-run-prediction">실험 전 예측: {run.predictionAtRun}</p><ul>{run.observations.map(text => <li key={text}>{text}</li>)}</ul><p className="lab-model-note">더 확인할 점: {run.limit}</p>{readOnly ? mission.evidence.includes(run.key) && <p className="lab-correct">내 설명에 사용한 근거</p> : <label className="lab-run-evidence"><input type="checkbox" checked={mission.evidence.includes(run.key)} onChange={() => toggleEvidence(run.key)} /><span>이 기록을 내 설명의 근거로 사용</span></label>}</article>)}</div>;
  }

  return <main className="lab-page lab-mission-page" style={{ "--universe-accent": topic.color }}><div className="wrap lab-mission-wrap">
    <div className="lab-breadcrumb"><Link href="/lab">← 모든 LAB</Link><span>{topic.code} / {topic.tool}</span></div>
    <header className="lab-mission-header"><div><p className="lab-kicker">{topic.kr}의 질문을 직접 탐구하는 시간</p><h1>{topic.title}</h1><p>{topic.activity}</p></div><div className="lab-mission-meta"><span>핵심 탐구 5–10분</span><span>{topic.ageGroup || "10–12세 중심"}</span><span>무료 체험</span></div></header>
    <div className="lab-mission-layout"><aside className="lab-progress-panel"><p className="lab-kicker">YOUR EXPLORATION</p><nav aria-label="탐구 단계"><ol>{COURSE_STEPS.map((step, index) => <li key={step.label}><button type="button" disabled={!loaded || index > availableStep} aria-current={mission.step === index ? "step" : undefined} onClick={() => goToStep(index)}><span className="lab-step-number">{index < availableStep ? <IconCheck width={15} height={15} /> : String(index + 1).padStart(2, "0")}</span><span><b>{step.label}</b><small>{step.hint}</small></span></button></li>)}</ol></nav><div className="lab-storage-info"><span className={`lab-save-dot ${saveState}`} />{saveState === "loading" ? "기록 확인 중…" : saveState === "saved" ? "이 주제의 기록 자동 저장" : "자동 저장을 사용할 수 없어요"}<p>이름 없이 탐구 내용만 남겨요. 공용 기기라면 활동 후 기록을 지워주세요.</p></div><button type="button" className="lab-reset" ref={resetRef} onClick={() => setResetOpen(true)} disabled={!loaded}>기록 지우고 다시 시작</button><Link className="lab-topic-back" href={`/explore/${topic.slug}`}>이 주제 소개 보기 →</Link></aside>
    <form className="lab-workspace" onSubmit={onNext}><div className="lab-workspace-heading"><div><p className="lab-kicker">{String(mission.step + 1).padStart(2, "0")} / {mission.completed && mission.step === 4 ? "EXPLORATION RECORD" : COURSE_STEPS[mission.step].label}</p><h2 ref={headingRef} tabIndex={-1}>{mission.completed && mission.step === 4 ? "나의 탐구 기록" : COURSE_STEPS[mission.step].title}</h2></div><UniverseIcon name={topic.universe} size={48} /></div><div className="lab-announcement" role="status">{message}</div>{saveState === "unavailable" && <p className="lab-warning">새로고침 전에 기록을 내려받아주세요. 이 브라우저에서는 자동 저장이 어려울 수 있어요.</p>}
    {!loaded ? <p>탐구 기록을 준비하고 있어요…</p> : <>
    {mission.step === 0 && <><div className="lab-course-scene"><UniverseIcon name={topic.universe} size={76} /><div><p className="lab-kicker">START WITH A QUESTION</p><h3>{topic.title}</h3><p>{activity.scene}</p></div></div>{field("initial", "지금은 어떻게 생각하나요?", "맞고 틀림을 서두르지 않아도 괜찮아요. 나의 생각을 한 문장으로 남겨요.")}{field("initialReason", "왜 그렇게 생각하나요?", "내 경험이나 알고 있는 사실을 떠올려보세요.")}<div className="lab-partner"><b>다음 탐구의 단서</b><p>무엇을 확인하면 내 생각을 더 믿거나 바꿀 수 있을까요?</p></div></>}
    {mission.step === 1 && <><div className="lab-concept-grid lab-course-concepts">{activity.concepts.map((concept, i) => <article key={concept.title}><span className="lab-concept-number">0{i + 1}</span><h3>{concept.title}</h3><p>{concept.body}</p></article>)}</div><div className="lab-reading"><p className="lab-kicker">짧게 읽기 / {topic.tool}</p><p>{activity.reading}</p></div><fieldset className="lab-concept-check"><legend>{activity.check.question}</legend>{activity.check.options.map(option => <label key={option.id}><input type="radio" name="course-concept" value={option.id} checked={mission.concept === option.id} onChange={() => update("concept", option.id)} /><span>{option.label}</span></label>)}{mission.concept && <p role="status" className={mission.concept === activity.check.answer ? "lab-correct" : "lab-warning"}>{mission.concept === activity.check.answer ? activity.check.feedback : `자료를 다시 살펴봐요. ${activity.check.feedback}`}</p>}</fieldset></>}
    {mission.step === 2 && <><p className="lab-intro">예측을 남기고 <b>서로 다른 조건을 2개 이상</b> 시험해보세요. 비교 기록을 읽고 내 설명에 사용할 근거를 골라요.</p>{field("prediction", "시험하기 전, 무엇이 달라질까요?", activity.predictionHint, 2)}<ActivityWorkbench mode={activity.mode} inputs={mission.inputs} onChange={changeCondition} tested={tested} /><button type="button" className="lab-button gold lab-run-button" onClick={testConditions}>이 조건으로 시험하고 기록 <IconArrow width={18} height={18} /></button><h3 className="lab-comparison-title">나의 비교 기록 <span>{mission.runs.length}/12</span></h3>{comparisonRecords()}{field("interpretation", "비교한 기록은 무엇을 보여주나요?", "선택한 근거의 차이를 구체적으로 설명해보세요.")}{field("uncertainty", "아직 모르는 점과 더 확인할 것은?", "이 자료가 설명하지 못한 조건이나 다른 해석도 생각해보세요.")}</>}
    {mission.step === 3 && <><p className="lab-intro">{activity.creationHint}</p>{artMode && <CreativeCanvas palette={mission.artPalette} focus={mission.artFocus} onChange={update} />}<div className="lab-creation-brief"><p className="lab-kicker">나의 설계 재료</p><p>선택한 근거: {mission.runs.filter(run => mission.evidence.includes(run.key)).map(run => run.label).join(" / ") || "탐색 단계에서 근거를 골라주세요."}</p><p>더 확인할 점: {mission.uncertainty}</p></div>{field("creation", activity.creationTitle, activity.creationHint, 5)}{field("creationReason", "왜 이렇게 만들거나 제안했나요?", "관찰한 근거와 새롭게 상상한 부분을 나누어 설명해보세요.")}</>}
    {mission.step === 4 && <><div className="lab-thought-comparison"><article><p className="lab-kicker">처음의 생각</p><h3>{mission.initial}</h3><p>{mission.initialReason}</p></article><article><p className="lab-kicker">다시 만난 질문</p><h3>{topic.title}</h3><p>생각이 달라졌거나 그대로여도 괜찮아요. 어떤 근거가 내 판단을 도왔나요?</p></article></div>{mission.completed ? <><div className="lab-result-banner"><span><IconCheck width={20} height={20} /></span><div><h3>나의 근거로 탐구를 마쳤어요.</h3><p>정답 점수 대신, 관찰과 해석·새로운 질문을 남겼어요.</p></div></div><section className="lab-result-section"><h3>지금의 생각</h3><p>{mission.final}</p><p>{mission.finalReason}</p></section><section className="lab-result-section"><h3>근거를 비교한 설명</h3><p>{mission.interpretation}</p><p>아직 모르는 점: {mission.uncertainty}</p></section><section className="lab-result-section"><h3>{activity.creationTitle}</h3>{artMode && <CreativeCanvas palette={mission.artPalette} focus={mission.artFocus} readOnly />}<p>{mission.creation}</p><p>{mission.creationReason}</p></section><div className="lab-next-question"><p className="lab-kicker">NEXT QUESTION</p><p>{mission.nextQuestion}</p></div><details className="lab-record-details" ref={recordRef}><summary>실험 당시의 예측과 모든 비교 기록 보기</summary>{comparisonRecords(true)}</details><div className="lab-result-actions"><button type="button" className="lab-button gold" onClick={downloadRecord}>탐구 기록 내려받기</button><button type="button" className="lab-button secondary" onClick={printRecord}>기록 인쇄 / PDF 저장</button><button type="button" className="lab-button secondary" onClick={() => update("completed", false)}>생각 더 다듬기</button><Link className="lab-button secondary" href="/lab">다른 LAB 탐구하기 →</Link></div></> : <>{field("final", "지금 이 질문에 어떻게 답하겠어요?", topic.title)}{field("finalReason", "처음 생각과 무엇이 같거나 달라졌나요? 왜 그런가요?", "관찰한 근거를 연결해 설명해보세요.")}{field("nextQuestion", "다음에 더 탐구하고 싶은 질문은?", "누가 빠졌을까? 조건을 더 바꾸면? 다른 상황에서도 같을까?", 2)}</>}</>}
    {error && <p className="lab-error" role="alert" ref={errorRef} tabIndex={-1}>{error}</p>}
    {!(mission.completed && mission.step === 4) && <div className="lab-step-actions">{mission.step > 0 ? <button type="button" className="lab-button secondary" onClick={() => goToStep(mission.step - 1)}>← 이전 단계</button> : <span>지금의 생각부터 시작해요.</span>}<button type="submit" className="lab-button gold">{mission.step === 4 ? "탐구 기록 완성하기" : "다음 단계"}<IconArrow width={18} height={18} /></button></div>}
    </>}</form></div><footer className="lab-mission-footnote"><p>핵심 비교는 5–10분, 읽기·창작·성찰까지는 학습 속도에 맞게 이어가세요. 예측과 관점을 평가 점수로 환산하지 않아요.</p><details><summary>자료와 출처</summary><p>{activity.scene}</p>{activity.sources.length ? <ul>{activity.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ul> : <p>읽기·사례·도형은 ASTERA 교육용으로 창작한 자료예요. 실제 사건이나 측정값과 구분해 사용해요.</p>}</details></footer>
    <dialog className="lab-reset-dialog" ref={dialogRef} onCancel={e => { e.preventDefault(); closeReset(); }} aria-labelledby="course-reset-title"><p className="lab-kicker">NEW EXPLORATION</p><h2 id="course-reset-title">이 주제의 기록을 지울까요?</h2><p>이 LAB의 생각과 비교 기록이 지워져요. 필요한 기록은 먼저 내려받아주세요.</p><div><button type="button" className="lab-button secondary" onClick={closeReset}>계속 탐구하기</button><button type="button" className="lab-button gold" onClick={reset}>지우고 새로 시작</button></div></dialog>
  </div></main>;
}
