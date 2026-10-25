"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TAGLINE = ["질문에서,", "세상이 시작됩니다."];

export default function BrandIntro({ children }) {
  const [phase, setPhase] = useState("fallback");
  const [imageFailed, setImageFailed] = useState(false);
  const phaseRef = useRef(phase);
  const logoRef = useRef(null);
  const contentRef = useRef(null);
  const readyTimer = useRef(null);
  phaseRef.current = phase;

  const finish = useCallback(() => {
    window.clearTimeout(readyTimer.current);
    setPhase("done");
  }, []);
  const start = useCallback(() => {
    window.clearTimeout(readyTimer.current);
    setPhase("playing");
  }, []);
  const prepare = useCallback(() => {
    setPhase("waiting");
    if (logoRef.current?.complete && logoRef.current?.naturalWidth > 0) start();
    else readyTimer.current = window.setTimeout(() => {
      setImageFailed(!logoRef.current?.naturalWidth);
      start();
    }, 1200);
  }, [start]);
  const skip = useCallback(() => {
    finish();
    requestAnimationFrame(() => contentRef.current?.focus({ preventScroll: true }));
  }, [finish]);

  useEffect(() => {
    // Every full page load plays; client-side navigation keeps this root mounted.
    prepare();
    window.addEventListener("astera:replay-intro", prepare);
    return () => {
      window.clearTimeout(readyTimer.current);
      window.removeEventListener("astera:replay-intro", prepare);
    };
  }, [prepare, finish]);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setTimeout(finish, 2000);
    return () => window.clearTimeout(timer);
  }, [phase, finish]);

  const blocking = phase === "waiting" || phase === "playing";
  useEffect(() => {
    if (!blocking) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => { if (event.key === "Escape") { event.preventDefault(); skip(); } };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [blocking, skip]);

  return <>
    <div className="brand-intro" data-phase={phase} aria-hidden={phase === "done" ? "true" : undefined} onAnimationEnd={(event) => {
      if (event.target === event.currentTarget && event.animationName === "brand-intro-exit") finish();
    }}>
      <div className="brand-intro-center" role="status" aria-live="off">
        <img ref={logoRef} className="brand-intro-logo" src="/brand/astera_logo_reversed_transparent.png" alt="ASTERA · Where Questions Open Worlds" width={800} height={180} fetchPriority="high" style={imageFailed ? { display: "none" } : undefined} onLoad={() => { setImageFailed(false); if (phaseRef.current === "waiting") start(); }} onError={() => { setImageFailed(true); if (phaseRef.current === "waiting") start(); }} />
        {imageFailed && <div className="brand-intro-wordmark">ASTERA</div>}
        <p className="brand-intro-tagline" aria-label="질문에서, 세상이 시작됩니다.">
          {TAGLINE.map((line, lineIndex) => <span className="brand-intro-line" aria-hidden="true" key={line}>
            {[...line].map((letter, index) => <span className="brand-intro-letter" key={index} style={{ "--letter-delay": `${450 + lineIndex * 260 + index * 45}ms` }}>{letter}</span>)}
          </span>)}
        </p>
        <div className="brand-intro-trace" aria-hidden="true"><span /></div>
      </div>
      <button className="brand-intro-skip" type="button" onClick={skip}>건너뛰기 <span aria-hidden="true">→</span></button>
    </div>
    <div ref={contentRef} className="site-content" data-ready={phase === "done" ? "true" : "false"} tabIndex={-1} inert={blocking || undefined}>{children}</div>
  </>;
}
