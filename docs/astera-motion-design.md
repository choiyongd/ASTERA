# ASTERA motion direction

The user requests a visible two-second brand opening on every full page load, scroll reveals, and animated screen transitions. The official compass/book logo, navy #071A3D, ivory #F7F2E8, gold #D9A441 and existing serif typography remain the primary visual reference. Refero's motion and craft guides informed timing, progressive enhancement, focus and reduced-motion behavior; its live style lookup returned NO_SUBSCRIPTION, so no external style was substituted.

- Opening: reveal the official bitmap from left to right over 900 ms; stagger the Korean tagline by character. A thin gold line marks the brief opening. Fade the overlay during the final 300 ms of the 2000 ms timeline. Start after the logo loads; cap image waiting at 1200 ms with a wordmark fallback. No session marker suppresses subsequent full loads.
- Landing and routes: 320 ms opacity/12 px entrance; internal same-origin page links first exit over 140 ms. Preserve modified clicks, downloads, external links, same-page anchors and browser history. Cancel an interrupted exit, and restore content if a destination is slow.
- Scroll: 360 ms, 16 px, at most 120 ms group stagger; reveal below-fold headings and cards once. Leave above-fold content readable. Never change scroll position or animate content continuously.
- Learning: 220 ms entrance only when changing a LAB step or topic overview tab. Do not remount a workspace on typing or alter the saved mission.
- Native CSS and Web Animations API, with IntersectionObserver: no new runtime dependency. Respect reduced-motion changes immediately, reveal keyboard-focused content, release observers and timers, and show everything when printing. Without JavaScript or observer support the page stays available.

Release verification must identify the actual production alias and commit. The previous preview-only implementation did not update astera-mu.vercel.app; the tested feature branch must be merged into main and its production deployment verified.
