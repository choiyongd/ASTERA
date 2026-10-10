"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LAB_STEPS } from "@/lib/lab/topics";
import { ADAPTATIONS, ANSWERS, BUDGET, INVESTIGATIONS, PLANETS, QUESTION, SOURCES, STORAGE_KEY, buildRecord, canComplete, freshMission, observationDetails, observationKey, observe, restoreMission, spentBudget, validateStep } from "@/lib/lab/science.mjs";
import { AnswerChoices, InvestigationIcon, LabField, PlanetArt } from "../components";
import { IconArrow, IconCheck } from "../../icons";

export default function ScienceLab() {
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
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mission));
      setSaveState("saved");
    } catch {
      setSaveState("unavailable");
    }
  }, [mission, loaded]);

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
    const problem = mission.step === 4 && !canComplete(mission) ? ([0, 1, 2, 3, 4].map((step) => validateStep(mission, step)).find(Boolean) || "이전 단계의 기록을 확인해주세요.") : validateStep(mission);
    if (problem) {
      setError(problem);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    if (mission.step === 4) {
      setMission((current) => ({ ...current, completed: true }));
      setMessage("탐구 기록이 완성되었어요. 처음 생각과 지금의 생각을 비교해보세요.");
      requestAnimationFrame(() => headingRef.current?.focus());
    } else goToStep(mission.step + 1);
  }
  function investigate(investigationId) {
    // Pure transition also protects against double clicks and over-budget purchases.
    setMission((current) => observe(current, current.selectedPlanet, investigationId).state);
    const detail = observationDetails(observationKey(mission.selectedPlanet, investigationId));
    setMessage(`${detail.planet.name} · ${detail.investigation.name}: ${detail.title}. 관찰 기록에 추가했어요.`);
    setError("");
  }
  function toggleEvidence(key) {
    setMission((current) => ({ ...current, evidence: current.evidence.includes(key) ? current.evidence.filter((value) => value !== key) : [...current.evidence, key], completed: false }));
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
    const record = buildRecord(mission);
    const lines = ["ASTERA LAB · SCIENCE 001 · LIFE FINDER", record.question, "", "처음의 생각", record.initial.answer, record.initial.reason, "", `탐사 기록 (${record.tokensUsed}/${BUDGET} 토큰 사용)`, ...record.observations.map((item) => `${item.planet} · ${item.investigation}: ${item.title}\n${item.detail}\n더 확인할 점: ${item.limit}`), "", `다음 탐사: ${record.priority.planet}`, record.priority.reason, `아직 모르는 점: ${record.priority.uncertainty}`, "", `상상한 생명의 특징: ${record.imaginedLife.feature}`, record.imaginedLife.reason, record.imaginedLife.note, "", "지금의 생각", record.final.answer, record.final.reason, `다음 질문: ${record.final.nextQuestion}`, "", record.dataNote];
    const url = URL.createObjectURL(new Blob(["\uFEFF", lines.join("\n")], { type: "text/plain;charset=utf-8" }));
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
  const observations = mission.observations.map(observationDetails).filter(Boolean);
  const balance = BUDGET - spentBudget(mission);
  const availableStep = [0, 1, 2, 3, 4].find((step) => !!validateStep(mission, step)) ?? 4;
  const record = buildRecord(mission);

  return (
    <main className="lab-page lab-mission-page">
      <div className="wrap lab-mission-wrap">
        <div className="lab-breadcrumb"><Link href="/lab">← 모든 LAB</Link><span>SCIENCE 001 / LIFE FINDER</span></div>
        <header className="lab-mission-header"><div><p className="lab-kicker">관찰에서 시작하는 생명 탐사</p><h1>{QUESTION}</h1><p>6개 탐사 토큰. 3개의 후보 행성. 어떤 단서부터 찾을까요?</p></div><div className="lab-mission-meta"><span>5–10분</span><span>초등 4–6학년</span><span>무료 체험</span></div></header>
        <div className="lab-mission-layout">
          <aside className="lab-progress-panel">
            <p className="lab-kicker">YOUR EXPLORATION</p>
            <nav aria-label="탐구 단계"><ol>{LAB_STEPS.map((step, index) => <li key={step.label}><button type="button" disabled={!loaded || index > availableStep} aria-current={mission.step === index ? "step" : undefined} onClick={() => goToStep(index)}><span className="lab-step-number">{index < availableStep ? <IconCheck width={15} height={15} /> : String(index + 1).padStart(2, "0")}</span><span><b>{step.label}</b><small>{step.hint}</small></span></button></li>)}</ol></nav>
            <div className="lab-storage-info"><span className={`lab-save-dot ${saveState}`} />{saveState === "loading" ? "기록 확인 중…" : saveState === "saved" ? "이 브라우저에 자동 저장" : "자동 저장을 사용할 수 없어요"}<p>이름 없이 탐구 내용만 남겨요. 공용 기기라면 활동 후 기록을 지워주세요.</p></div>
            <button type="button" className="lab-reset" ref={resetButtonRef} onClick={() => setResetOpen(true)} disabled={!loaded}>기록 지우고 다시 시작</button>
          </aside>

          <form className="lab-workspace" onSubmit={onNext}>
            <div className="lab-workspace-heading"><div><p className="lab-kicker">{String(mission.step + 1).padStart(2, "0")} / {mission.completed && mission.step === 4 ? "EXPLORATION RECORD" : LAB_STEPS[mission.step].label}</p><h2 ref={headingRef} tabIndex={-1}>{mission.completed && mission.step === 4 ? "나의 생명 탐사 기록" : LAB_STEPS[mission.step].title}</h2></div>{mission.step === 2 && <div className="lab-budget" aria-label={`탐사 토큰 ${BUDGET}개 중 ${balance}개 남음`}><small>남은 탐사 토큰</small><strong>{balance}<span> / {BUDGET}</span></strong><div aria-hidden="true">{Array.from({ length: BUDGET }, (_, index) => <i key={index} className={index < balance ? "available" : ""} />)}</div></div>}</div>
            <div className="lab-announcement" role="status">{message}</div>
            {saveState === "unavailable" && <p className="lab-warning">새로고침하면 기록이 사라질 수 있어요. 활동을 마치고 탐구 기록을 파일로 저장해주세요.</p>}
            {!loaded ? <p>탐구 기록을 준비하고 있어요…</p> : <div key={mission.step} className="lab-step-content">
              {mission.step === 0 && <>
                <div className="lab-question-scene"><img src="/images/hero-earth.webp" alt="큰 지구와 밤하늘을 바라보는 ASTERA 탐험가와 탐구 파트너" width={2000} height={770} /><div><span>START WITH A QUESTION</span><p>답을 서두르지 않아도 괜찮아요.<br />지금 떠오르는 생각에서 시작해요.</p></div></div>
                <AnswerChoices answers={ANSWERS} value={mission.initial} onChange={(value) => update("initial", value)} label="지금은 어떻게 생각하나요?" />
                <LabField id="initial-reason" label="왜 그렇게 생각하나요?" hint="알고 있는 사실, 경험, 궁금한 점 중 하나를 떠올려보세요." value={mission.initialReason} onChange={(value) => update("initialReason", value)} />
                <div className="lab-partner"><b>SCION의 질문</b><p>그 생각을 더 믿게 하거나 바꾸게 할 단서는 무엇일까요?</p></div>
              </>}

              {mission.step === 1 && <>
                <p className="lab-intro">지구에서 알려진 생명을 기준으로, 과학자는 <b>액체 물, 이용할 수 있는 에너지, 필요한 물질</b>을 살펴봐요. 그러나 이런 조건이 있다고 생명이 발견된 것은 아니에요.</p>
                <div className="lab-concept-grid">{[
                  { icon: "water", title: "액체 물", body: "지구 생명의 몸속에서는 물이 여러 반응을 도와요. 수증기나 얼음을 보았다고 액체 물까지 확인한 것은 아니에요." },
                  { icon: "energy", title: "이용할 수 있는 에너지", body: "빛뿐 아니라 화학 반응도 에너지원이 될 수 있어요. 지구의 깊은 바다에는 햇빛 없이 살아가는 생태계도 있어요." },
                  { icon: "chemistry", title: "필요한 물질과 환경", body: "탄소 등 몸을 만들 물질과 적절한 주변 조건을 함께 봐요. 온도 하나만으로 행성 전체를 판단하기는 어려워요." },
                ].map((item) => <article key={item.title}><InvestigationIcon name={item.icon} /><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
                <div className="lab-reading"><p className="lab-kicker">짧게 읽기 / 단서가 곧 발견일까?</p><h3>산소나 메탄을 찾았다면?</h3><p>지구에서는 생명이 이런 물질을 만들기도 해요. 하지만 빛이나 암석의 반응도 비슷한 흔적을 만들 수 있어요. 과학자는 같은 자료를 설명하는 다른 방법과 장비 오류를 함께 확인해요.</p><p><b>이 LAB의 세 행성과 모든 수치는 교육용 가상 자료예요.</b> 실제 외계행성에서 측정한 결과가 아니며, 생명체가 있을 확률을 계산하지 않아요.</p></div>
                <fieldset className="lab-concept-check"><legend>행성에서 물의 단서를 찾았어요. 무엇을 말할 수 있을까요?</legend>{[{ id: "proof", label: "생명이 있다는 것이 확실해요" }, { id: "clue", label: "생명이 살 조건을 더 조사할 이유가 생겼어요" }].map((option) => <label key={option.id}><input type="radio" name="concept" value={option.id} checked={mission.concept === option.id} onChange={() => update("concept", option.id)} /><span>{option.label}</span></label>)}{mission.concept && <p className={mission.concept === "clue" ? "lab-correct" : "lab-warning"} role="status">{mission.concept === "clue" ? "맞아요. 조건을 찾는 일과 생명의 존재를 확인하는 일은 구분해야 해요." : "물은 중요한 단서예요. 하지만 생명 없이도 물이 있는 곳이 있어요. 다른 설명을 다시 생각해보세요."}</p>}</fieldset>
              </>}

              {mission.step === 2 && <>
                <p className="lab-intro">가상 탐사선으로 조사할 행성과 항목을 골라보세요. 토큰을 전부 쓸 필요는 없어요. <b>단서를 2개 이상 조사하고, 다음 탐사 우선순위를 정해요.</b></p>
                <div className="lab-fiction-note">교육용 가상 행성 · 표면 평균 온도의 추정값 · 삽화는 실제 사진이 아니에요.</div>
                <div className="lab-planet-tabs" role="group" aria-label="조사할 행성">{PLANETS.map((item) => <button type="button" key={item.id} aria-pressed={planet.id === item.id} onClick={() => update("selectedPlanet", item.id)}><PlanetArt tone={item.tone} size={38} /><span><b>{item.letter} · {item.name}</b><small>{item.kind}</small></span><span className="lab-planet-tab-count">{mission.observations.filter((key) => observationDetails(key)?.planet.id === item.id).length}개 조사</span></button>)}</div>
                <div className="lab-exploration-grid"><div className="lab-control-room">
                  <div className="lab-planet-profile"><PlanetArt tone={planet.tone} size={115} /><div><p className="lab-kicker">PLANET {planet.letter}</p><h3>{planet.name}</h3><p>{planet.hint}</p><span>표면 평균 온도 추정 {planet.temperature}</span></div></div>
                  <div className="lab-investigation-grid">{INVESTIGATIONS.map((item) => {
                    const done = mission.observations.includes(observationKey(planet.id, item.id));
                    const disabled = done || item.cost > balance;
                    return <button type="button" key={item.id} className={`lab-investigate ${done ? "done" : ""}`} disabled={disabled} onClick={() => investigate(item.id)}><div><InvestigationIcon name={item.icon} /><span className="lab-cost">{done ? "조사 완료" : `${item.cost} 토큰`}</span></div><b>{item.name}</b><p>{item.question}</p><small>{done ? "오른쪽 기록에서 확인해요" : disabled ? "남은 토큰이 부족해요" : "조사하기 →"}</small></button>;
                  })}</div>
                </div><aside className="lab-observations"><div className="lab-notebook-heading"><h3>관찰 기록</h3><span>{observations.length}개 단서</span></div>{observations.length ? <ol>{observations.map((finding) => <li key={finding.key}><p className="lab-kicker">{finding.planet.name} · {finding.investigation.name}</p><h4>{finding.title}</h4><p>{finding.detail}</p><div><b>더 확인할 점</b><p>{finding.limit}</p></div></li>)}</ol> : <div className="lab-empty-notebook"><InvestigationIcon name="repeat" /><p>아직 조사한 단서가 없어요.</p><small>왼쪽에서 조사를 선택하면<br />이곳에 기록이 쌓여요.</small></div>}</aside></div>
                <div className="lab-partner"><b>SCION의 탐구 팁</b><p>얼음 아래도 살펴볼까요? 한 가지 신호를 다른 관찰과 비교해보세요. 남은 토큰으로 무엇을 더 확인할 수 있을까요?</p></div>
                <section className="lab-decision"><h3>다음에 더 탐사할 곳은?</h3><fieldset className="lab-priority-choices"><legend className="lab-sr-only">다음 탐사 우선순위</legend>{PLANETS.map((item) => <label key={item.id} className={mission.priority === item.id ? "selected" : ""}><input type="radio" name="priority" checked={mission.priority === item.id} onChange={() => update("priority", item.id)} /><span>{item.letter} · {item.name}</span></label>)}</fieldset>
                  {observations.length > 0 && <fieldset className="lab-evidence"><legend>내 판단을 뒷받침하는 관찰을 골라주세요.</legend>{observations.map((finding) => <label key={finding.key}><input type="checkbox" checked={mission.evidence.includes(finding.key)} onChange={() => toggleEvidence(finding.key)} /><span><b>{finding.planet.name} · {finding.title}</b><small>{finding.investigation.name}</small></span></label>)}</fieldset>}
                  <LabField id="priority-reason" label="이 행성을 더 탐사하려는 이유는?" hint="고른 관찰을 이유와 연결해보세요. 선택한 행성을 조사한 단서가 하나 이상 필요해요." value={mission.priorityReason} onChange={(value) => update("priorityReason", value)} />
                  <LabField id="uncertainty" label="아직 모르거나 더 확인해야 하는 것은?" hint="같은 단서를 설명하는 다른 가능성도 생각해보세요." value={mission.uncertainty} onChange={(value) => update("uncertainty", value)} rows={2} />
                </section>
              </>}

              {mission.step === 3 && <>
                <p className="lab-intro">만약 <b>{priorityPlanet?.name}</b>에 생명이 산다면 어떤 모습일까요? 지구 생명에서 배운 것을 바탕으로 상상해보세요. 사람처럼 생길 필요는 없어요.</p>
                <div className="lab-create-scene"><div className="lab-create-planet"><PlanetArt tone={priorityPlanet?.tone} size={110} /><b>{priorityPlanet?.name}의 환경에서</b><span>{priorityPlanet?.kind}</span></div><span className="lab-create-arrow" aria-hidden="true">→</span><div className={`lab-imagined-life ${mission.adaptation}`} aria-hidden="true"><span /><span /></div><p>상상한 생명체<br /><small>실제로 발견한 생명이 아니에요.</small></p></div>
                <fieldset className="lab-adaptations"><legend>환경과 연결할 몸의 특징을 골라보세요.</legend>{ADAPTATIONS.map((item) => <label key={item.id} className={mission.adaptation === item.id ? "selected" : ""}><input type="radio" name="adaptation" checked={mission.adaptation === item.id} onChange={() => update("adaptation", item.id)} /><span><b>{item.name}</b><small>{item.detail}</small></span></label>)}</fieldset>
                <LabField id="adaptation-reason" label="왜 이런 특징이 필요할까요?" hint="‘이 행성은 ___한 환경이라서, ___한 특징이 도움이 될 것 같아요.’처럼 연결해보세요. 불확실한 환경이라면 ‘만약’이라는 조건을 붙여도 좋아요." value={mission.adaptationReason} onChange={(value) => update("adaptationReason", value)} />
                <div className="lab-partner"><b>더 넓게 상상하기</b><p>그림이나 더 많은 특징은 워크북에 자유롭게 남겨보세요. 무엇을 관찰했고 무엇을 상상했는지 나누어 설명하면 좋아요.</p></div>
              </>}

              {mission.step === 4 && !mission.completed && <>
                <div className="lab-first-thought"><p className="lab-kicker">처음에 남긴 생각</p><b>{record.initial.answer}</b><p>{record.initial.reason}</p></div>
                <AnswerChoices answers={ANSWERS} value={mission.final} onChange={(value) => update("final", value)} label="다시 질문해요. 우주에 우리만 살고 있을까요?" />
                <LabField id="final-reason" label="지금은 왜 그렇게 생각하나요?" hint="관찰한 단서와 아직 모르는 점을 함께 써보세요. 생각이 그대로여도 이유가 더 깊어질 수 있어요." value={mission.finalReason} onChange={(value) => update("finalReason", value)} />
                <LabField id="next-question" label="다음에 탐구하고 싶은 질문은?" hint="예: 같은 신호가 계속 나와도 생명이라고 말하려면 무엇을 더 확인해야 할까?" value={mission.nextQuestion} onChange={(value) => update("nextQuestion", value)} rows={2} />
                <div className="lab-partner"><b>생각의 변화는 점수가 아니에요.</b><p>처음 생각을 바꾸어도, 유지해도 괜찮아요. 중요한 것은 어떤 단서를 살펴보았고 어떤 이유를 설명할 수 있는지예요.</p></div>
              </>}

              {mission.step === 4 && mission.completed && <section className="lab-result">
                <div className="lab-result-banner"><span><IconCheck width={22} height={22} /></span><div><h3>하나의 답에서, 더 좋은 질문으로.</h3><p>{observations.length}개 단서를 조사하고 {spentBudget(mission)}개 토큰을 사용했어요.</p></div></div>
                <div className="lab-thought-comparison"><article><p className="lab-kicker">BEFORE / 처음 생각</p><h3>{record.initial.answer}</h3><p>{record.initial.reason}</p></article><article><p className="lab-kicker">AFTER / 지금 생각</p><h3>{record.final.answer}</h3><p>{record.final.reason}</p></article></div>
                <div className="lab-result-section"><h3>다음 탐사 우선순위 · {priorityPlanet?.name}</h3><p>{mission.priorityReason}</p><h4>판단에 사용한 단서</h4><ul>{mission.evidence.map(observationDetails).filter(Boolean).map((finding) => <li key={finding.key}>{finding.planet.name} · {finding.title}</li>)}</ul><h4>아직 더 확인할 점</h4><p>{mission.uncertainty}</p></div>
                <div className="lab-result-section"><h3>내가 상상한 생명체</h3><p><b>{record.imaginedLife.feature}</b></p><p>{mission.adaptationReason}</p><small>{record.imaginedLife.note}</small></div>
                <div className="lab-next-question"><p className="lab-kicker">MY NEXT QUESTION</p><p>{mission.nextQuestion}</p></div>
                <details className="lab-result-observations"><summary>전체 관찰 기록 보기 · {observations.length}개</summary>{observations.map((finding) => <article key={finding.key}><h4>{finding.planet.name} · {finding.title}</h4><p>{finding.detail}</p><p><b>더 확인할 점:</b> {finding.limit}</p></article>)}</details>
                <div className="lab-result-actions"><button type="button" className="lab-button gold" onClick={downloadRecord}>탐구 기록 저장 (.txt)</button><button type="button" className="lab-button outline" onClick={() => window.print()}>기록 인쇄</button><Link className="lab-text-link" href="/lab">다른 유니버스 둘러보기 →</Link></div>
              </section>}
            </div>}
            <div ref={errorRef} tabIndex={-1} role={error ? "alert" : undefined} className={error ? "lab-error" : "lab-sr-only"}>{error}</div>
            {loaded && !(mission.step === 4 && mission.completed) && <footer className="lab-step-actions"><button type="button" className="lab-button outline" disabled={mission.step === 0} onClick={() => goToStep(mission.step - 1)}>← 이전</button><span>{mission.step + 1} / 5 단계</span><button type="submit" className="lab-button gold">{mission.step === 4 ? "탐구 기록 완성" : `${LAB_STEPS[mission.step + 1].label}으로 이동`} <IconArrow width={18} height={18} /></button></footer>}
          </form>
        </div>
        <footer className="lab-mission-footnote"><p>이 LAB의 행성과 관찰 결과는 교육용 가상 자료입니다. 생명 존재 여부를 자동 판정하지 않습니다.</p><details><summary>개념 자료의 출처와 교사 안내</summary><p>지구 생명을 기준으로 생명 탐색의 조건을 소개하며, 신호의 다른 설명을 함께 검토하는 NASA 자료를 참고했습니다. 학생의 결론보다 관찰·이유·불확실성에 초점을 맞춰 대화해주세요. 실제 외계행성 관측 수업으로 확장할 때는 별도의 실제 자료가 필요합니다.</p><ul>{SOURCES.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ul></details></footer>
      </div>
      <dialog ref={dialogRef} className="lab-reset-dialog" aria-labelledby="reset-title" onCancel={(event) => { event.preventDefault(); closeReset(); }}><h2 id="reset-title">탐구 기록을 지울까요?</h2><p>이 브라우저에 저장한 처음 생각, 조사 내용, 최종 기록을 지우고 새로 시작해요. 필요한 기록은 먼저 저장해주세요.</p><div><button type="button" className="lab-button outline" onClick={closeReset} autoFocus>기록 유지</button><button type="button" className="lab-button gold" onClick={resetMission}>지우고 시작</button></div></dialog>
    </main>
  );
}
