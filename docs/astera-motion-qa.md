# ASTERA motion verification

## Regression coverage

The actual BrandIntro component is rendered in React with a controlled clock: the overlay blocks input for 2000 ms, waits for a slow logo, has a capped image wait and error fallback, responds to skip/Escape/reduced motion, and does not replay on internal navigation. A stale session marker cannot suppress a full-load opening. Character typography exposes one complete accessible tagline.

The actual SiteMotion shell is rendered under Strict Mode: it starts only when BrandIntro publishes readiness, stops for replay and reduced motion, cleans observers/listeners, and does not remount a persistent child or restart animations while typing.

DOM controller tests cover normal and modified link clicks, downloads, same-page anchors, external links, rapid successive navigation, slow/failed destination recovery, initial viewport readability, one-time below-fold reveal, dynamically filtered cards, keyboard focus, cleanup, reduced motion and unavailable IntersectionObserver.

All existing LAB model and UI completion tests are included. The 16 CourseLab activities complete through the actual controls and preserve recorded experiment predictions; SCIENCE 001's evidence/budget/storage rules remain covered. The production build checks every route, including the SCIENCE component.

## Release checks

- Confirm the production alias points to the Git main release after merging the tested feature branch.
- Verify the actual public production page with the cloud browser: opening/replay, ordinary navigation, page entrance, scroll reveal and a LAB step transition.
- Inspect layout, computed animation timings and browser console on that deployment. Do not weaken Vercel preview protection for testing.
