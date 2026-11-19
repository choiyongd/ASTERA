"use client";

import { useEffect, useRef, useState } from "react";
import { UniverseIcon } from "../universe-icons";

const labels = {
  concept: "쉽게 읽기",
  compare: "자료 비교",
  sequence: "순서로 살펴보기",
  apply: "배운 내용 써 보기",
};

export default function ReadingDeck({ deck, universe }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const [audio, setAudio] = useState("");
  const speech = useRef(null);
  const heading = useRef(null);
  const transitioning = useRef(false);
  const card = deck.cards[index];

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

  return (
    <section className="reading-deck" aria-label="그림과 함께 읽는 학습 카드">
      <article className="reading-slide" data-kind={card.kind}>
        <header className="reading-slide-heading">
          <UniverseIcon name={universe} size={50} />
          <div>
            <p>{labels[card.kind]} · {index + 1}/{deck.cards.length}</p>
            <h3 tabIndex={-1} ref={heading}>{card.title}</h3>
          </div>
        </header>
        <p className="learning-prose">{card.body}</p>
        {card.panels.length > 0 && (
          <ol className="reading-diagram" aria-label={labels[card.kind]}>
            {card.panels.map((panel, i) => {
              const markers = card.body.match(/[①②③④]/) ? "①②③④" : card.body.match(/[㉠㉡㉢㉣]/) ? "㉠㉡㉢㉣" : card.kind === "sequence" ? "1234" : "ABCD";
              const marker = markers[i];
              return <li key={i} className={i < revealed ? "" : "reading-diagram-hidden"}>
                <span className="reading-diagram-symbol">{marker}</span>
                {i < revealed ? (
                  <div>
                    <strong>{panel.label}</strong>
                    {panel.visual && <div className="reading-illustration" data-visual={panel.visual} aria-hidden="true"><span /></div>}
                    <p>{panel.text}</p>
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
      </article>
      <nav className="reading-deck-nav" aria-label="읽기 카드 넘기기">
        <button type="button" className="learning-button secondary" disabled={index === 0} onClick={() => move(index - 1)}>← 이전 카드</button>
        <span>{index + 1} / {deck.cards.length}</span>
        <button type="button" className="learning-button" disabled={index === deck.cards.length - 1} onClick={() => move(index + 1)}>다음 카드 →</button>
      </nav>
      <aside className="reading-sources">
        <p><strong>출처</strong> {deck.source} · ASTERA 재구성</p>
        {deck.references.length > 0 && <details>
          <summary>참고 문헌과 이용 조건</summary>
          <ul>{deck.references.map((source, i) => (
            <li key={i}>
              {source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a> : source.title}
              {source.license && <span> · {source.license}</span>}
            </li>
          ))}</ul>
        </details>}
      </aside>
    </section>
  );
}
