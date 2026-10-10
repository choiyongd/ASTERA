"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SESSION_KEY = "astera:brand-intro:v1";

export default function BrandIntro({ children }) {
  const [visible, setVisible] = useState(true);
  const [blocking, setBlocking] = useState(false);
  const introRef = useRef(null);
  const contentRef = useRef(null);
  const shouldPlayRef = useRef(null);

  const finish = useCallback(() => {
    setVisible(false);
    setBlocking(false);
  }, []);

  const skip = useCallback(() => {
    finish();
    // Return keyboard users to the page rather than to a removed skip button.
    requestAnimationFrame(() => contentRef.current?.focus({ preventScroll: true }));
  }, [finish]);

  useEffect(() => {
    // Cache this mount's decision so React's development effect replay is safe.
    if (shouldPlayRef.current === null) {
      let seen = false;
      try {
        seen = window.sessionStorage.getItem(SESSION_KEY) === "seen";
        window.sessionStorage.setItem(SESSION_KEY, "seen");
      } catch {
        // The root layout still prevents repeats during navigation without storage.
      }
      shouldPlayRef.current = !seen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    if (!shouldPlayRef.current) {
      finish();
      return;
    }

    // Slow hydration must not block a page after its CSS intro has already ended.
    const overlay = introRef.current;
    if (!overlay || window.getComputedStyle(overlay).visibility === "hidden") {
      finish();
      return;
    }
    const animation = overlay.getAnimations?.().find((item) => item.animationName === "brand-intro-exit");
    const elapsed = typeof animation?.currentTime === "number" ? animation.currentTime : 0;

    setBlocking(true);
    // CSS also ends the overlay at two seconds, including before hydration.
    const timer = window.setTimeout(finish, Math.max(0, 2000 - elapsed));
    return () => window.clearTimeout(timer);
  }, [finish]);

  useEffect(() => {
    if (!blocking) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [blocking, skip]);

  return (
    <>
      {visible && (
        <div ref={introRef} className="brand-intro" onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === "brand-intro-exit") finish();
        }}>
          <div className="brand-intro-center" role="status" aria-live="off">
            <img className="brand-intro-logo" src="/brand/astera_logo_reversed_transparent.png" alt="ASTERA · Where Questions Open Worlds" width={800} height={180} fetchPriority="high" />
            <p className="brand-intro-tagline"><span>질문에서,</span><br /><span>세상이 시작됩니다.</span></p>
          </div>
          <button className="brand-intro-skip" type="button" onClick={skip}>건너뛰기 <span aria-hidden="true">→</span></button>
        </div>
      )}
      <div ref={contentRef} className="site-content" tabIndex={-1} inert={blocking || undefined}>{children}</div>
    </>
  );
}
