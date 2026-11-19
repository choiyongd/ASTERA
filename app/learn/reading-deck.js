"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { UniverseIcon } from "../universe-icons";
import { createVocabulary } from "../../lib/learning/vocabulary.mjs";

const labels = {
  concept: "쉽게 읽기",
  compare: "자료 비교",
  sequence: "순서로 살펴보기",
  apply: "배운 내용 써 보기",
};

function VocabularyWord({ term, meaning, active, setActive }) {
  const id = useId();
  const anchor = useRef(null);
  const state = active?.id === id ? active : null;

  useEffect(() => {
    if (!state) return;
    function dismiss(event) {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && anchor.current?.contains(event.target)) return;
      setActive((current) => current?.id === id ? null : current);
    }
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [id, state, setActive]);

  function show(mode) {
    const rect = anchor.current?.getBoundingClientRect?.();
    const viewport = window.innerWidth || 640;
    const width = Math.min(240, viewport - 32);
    const left = rect ? Math.min(Math.max(16, rect.left), viewport - width - 16) - rect.left : 0;
    const above = rect && window.innerHeight - rect.bottom < 150 && rect.top > 150;
    setActive({ id, mode, left, above });
  }

  function hideUnless(keep) {
    setActive((current) => current?.id === id && !keep(current) ? null : current);
  }

  return (
    <span ref={anchor} className="reading-word"
      onPointerEnter={(event) => { if (event.pointerType !== "touch" && !state) show("hover"); }}
      onPointerLeave={() => hideUnless((current) => current.mode === "pinned" || current.mode === "focus")}
    >
      <button type="button" className="reading-word-button" aria-describedby={id}
        onFocus={(event) => { if (event.currentTarget.matches?.(":focus-visible")) show("focus"); }}
        onBlur={() => hideUnless((current) => current.mode === "pinned" || anchor.current?.matches?.(":hover"))}
        onClick={() => state?.mode === "pinned" ? setActive(null) : show("pinned")}
      >{term}</button>
      <span className="reading-word-tooltip" id={id} role="tooltip" hidden={!state}
        data-side={state?.above ? "above" : "below"} style={{ insetInlineStart: state?.left }}
      ><strong>{term}</strong><span>{meaning}</span></span>
    </span>
  );
}

export default function ReadingDeck({ deck, universe }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const [audio, setAudio] = useState("");
  const [activeWord, setActiveWord] = useState(null);
  const speech = useRef(null);
  const heading = useRef(null);
  const transitioning = useRef(false);
  const card = deck.cards[index];
  const matchVocabulary = useMemo(() => createVocabulary(deck.glossary), [deck.glossary]);
  const seen = new Set();
  const title = matchVocabulary(card.title, seen);
  const body = matchVocabulary(card.body, seen);
  const panelTexts = card.panels.slice(0, revealed).map((panel) => ({
    label: matchVocabulary(panel.label, seen),
    text: matchVocabulary(panel.text, seen),
  }));
  const markers = card.body.match(/[①②③④]/) ? "①②③④" : card.body.match(/[㉠㉡㉢㉣]/) ? "㉠㉡㉢㉣" : card.kind === "sequence" ? "1234" : "ABCD";

  useEffect(() => {
    const engine = window.speechSynthesis;
    engine?.getVoices();
    return () => {
      if (speech.current) engine?.cancel();
    };
  }, []);
  useEffect(() => {
    if (transitioning.current) heading.current?.focus();
  }, [index]);

  function stop() {
    const active = speech.current;
    speech.current = null;
    if (active) window.speechSynthesis?.cancel();
    setAudio("");
  }

  function move(next) {
    stop();
    setActiveWord(null);
    transitioning.current = true;
    setRevealed(1);
    setIndex(next);
  }

  function listen() {
    stop();
    const engine = window.speechSynthesis;
    const korean = engine?.getVoices().find((voice) => voice.localService && /^ko(?:[-_]|$)/i.test(voice.lang));
    if (!korean || typeof SpeechSynthesisUtterance === "undefined") {
      setAudio("이 브라우저에서 기기 내 한국어 음성을 찾지 못했어요. 카드 글을 읽거나 기기의 한국어 읽어주기 설정을 확인해주세요.");
      return;
    }
    const lines = [card.title, card.body, ...card.panels.slice(0, revealed).map((p) => p.label + ". " + p.text)];
    const reading = new SpeechSynthesisUtterance(lines.join("\n"));
    reading.voice = korean;
    reading.lang = "ko-KR";
    reading.rate = 0.9;
    reading.onend = () => {
      if (speech.current !== reading) return;
      speech.current = null;
      setAudio("읽어주기를 마쳤어요.");
    };
    reading.onerror = () => {
      if (speech.current !== reading) return;
      speech.current = null;
      setAudio("지금은 음성을 재생할 수 없어요. 카드 글을 읽어주세요.");
    };
    speech.current = reading;
    setAudio("읽어주는 중이에요.");
    engine.speak(reading);
  }

  function words(parts) {
    return parts.map((part) => typeof part === "string" ? part : (
      <VocabularyWord key={part.term} {...part} active={activeWord} setActive={setActiveWord} />
    ));
  }

  return (
    <section className="reading-deck" aria-label="그림과 함께 읽는 학습 카드">
      <article className="reading-slide" data-kind={card.kind}>
        <header className="reading-slide-heading">
          <div>
            <p>{labels[card.kind]}</p>
            <h3 tabIndex={-1} ref={heading}>{words(title)}</h3>
          </div>
          <div className="reading-universe" aria-hidden="true"><UniverseIcon name={universe} size={54} /></div>
        </header>
        <div className="reading-slide-content">
          {seen.size > 0 && <p className="reading-vocabulary-hint">점선이 있는 낱말에 마우스를 올리거나 눌러 뜻을 볼 수 있어요.</p>}
          <p className="learning-prose reading-card-prose">{words(body)}</p>
        {card.panels.length > 0 && (
          <ol className="reading-diagram" aria-label={labels[card.kind]}>
            {card.panels.map((panel, i) => {
              const marker = markers[i];
              return <li key={i} className={i < revealed ? "" : "reading-diagram-hidden"}>
                <span className="reading-diagram-symbol">{marker}</span>
                {i < revealed ? (
                  <div>
                    <strong>{words(panelTexts[i].label)}</strong>
                    {panel.visual && <div className="reading-illustration" data-visual={panel.visual} aria-hidden="true"><span /></div>}
                    <p>{words(panelTexts[i].text)}</p>
                  </div>
                ) : (
                  <button type="button" className="learning-button secondary" onClick={() => setRevealed(Math.max(revealed, i + 1))}>
                    {marker} {card.kind === "sequence" ? "장면 열기" : "자료 열기"}
                  </button>
                )}
              </li>;
            })}
          </ol>
        )}
        <div className="reading-listen">
          <button type="button" className="learning-button secondary" onClick={listen}>읽어주기</button>
          {speech.current && <button type="button" className="learning-button secondary" onClick={stop}>듣기 멈춤</button>}
          <span role="status">{audio}</span>
        </div>
        </div>
      </article>
      <nav className="reading-deck-nav" aria-label="읽기 카드 넘기기">
        <button type="button" className="learning-button secondary" disabled={index === 0} onClick={() => move(index - 1)}>← 이전 카드</button>
        <span className="reading-deck-progress" aria-label={`총 ${deck.cards.length}장 중 ${index + 1}번째`}>
          <span>{index + 1} / {deck.cards.length}</span>
          <span aria-hidden="true" className="reading-deck-progress-track">
            {deck.cards.map((_, i) => <span key={i} data-active={i <= index} />)}
          </span>
        </span>
        <button type="button" className="learning-button" disabled={index === deck.cards.length - 1} onClick={() => move(index + 1)}>다음 카드 →</button>
      </nav>
      <aside className="reading-sources">
        <p><strong>ASTERA 재구성</strong></p>
        {deck.references.length > 0 && <details>
          <summary>출처 링크와 참고 문헌</summary>
          <ul>{deck.references.map((source, i) => (
            <li key={i}>
              {/^OpenStax,/.test(source.title) && <strong>추가 참고 · </strong>}
              {source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a> : source.title}
              {source.license && <span> · {source.license}</span>}
            </li>
          ))}</ul>
        </details>}
      </aside>
    </section>
  );
}
