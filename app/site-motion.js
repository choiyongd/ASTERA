"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { enterPage, installRouteTransitions, installScrollReveals, MOTION_QUERY } from "../lib/site-motion.mjs";

export default function SiteMotion({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const frameRef = useRef(null);

  useEffect(() => {
    const frame = frameRef.current;
    const content = frame.closest(".site-content");
    const preference = window.matchMedia(MOTION_QUERY);
    let dispose = () => {};
    let ready = false;
    const connect = () => {
      dispose();
      if (content?.dataset.ready !== "true" || preference.matches) return;
      const leaveEntrance = enterPage(frame);
      const leaveScroll = installScrollReveals(frame);
      const leaveNavigation = installRouteTransitions(frame, href => router.push(href));
      dispose = () => { leaveEntrance(); leaveScroll(); leaveNavigation(); };
    };
    const observeReadiness = () => {
      const nextReady = content?.dataset.ready === "true";
      if (nextReady !== ready) { ready = nextReady; connect(); }
    };
    const observer = new MutationObserver(observeReadiness);
    if (content) observer.observe(content, { attributes: true, attributeFilter: ["data-ready"] });
    observeReadiness();
    preference.addEventListener("change", connect);
    return () => { dispose(); observer.disconnect(); preference.removeEventListener("change", connect); };
  }, [pathname, router]);

  return <div ref={frameRef} className="site-route-frame">{children}</div>;
}
