"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    else setPhase("playing");
  }, [finish]);
  const prepare = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
    setPhase("waiting");
    if (logoRef.current?.complete && logoRef.current?.naturalWidth > 0) start();
    else readyTimer.current = window.setTimeout(() => {
      setImageFailed(!logoRef.current?.naturalWidth);
      start();
    }, 1200);
  }, [finish, start]);
  const skip = useCallback(() => {
    finish();
    requestAnimationFrame(() => contentRef.current?.focus({ preventScroll: true }));
  }, [finish]);

  useEffect(() => {
    // Every full page load plays; client-side navigation keeps this root mounted.
    prepare();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => { if (media.matches) finish(); };
    window.addEventListener("astera:replay-intro", prepare);
    media.addEventListener("change", onPreference);
    return () => {
      window.clearTimeout(readyTimer.current);
      window.removeEventListener("astera:replay-intro", prepare);
      media.removeEventListener("change", onPreference);
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
        <p className="brand-intro-tagline"><span>질문에서,</span><br /><span>세상이 시작됩니다.</span></p>
      </div>
      <button className="brand-intro-skip" type="button" onClick={skip}>건너뛰기 <span aria-hidden="true">→</span></button>
    </div>
    <div ref={contentRef} className="site-content" tabIndex={-1} inert={blocking || undefined}>{children}</div>
  </>;
}
