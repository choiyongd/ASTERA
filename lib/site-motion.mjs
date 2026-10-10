export const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const REVEAL_SELECTOR = [".section-head", ".section > .heading", ".home-lab-entry", ".lib-card", ".quicknav", ".universe > *", ".u", ".product", ".lab-featured", ".lab-topic", ".lab-section-heading", ".lab-teacher-note", ".about-section-heading", ".about-purpose-grid > article", ".about-learning-list > li", ".about-world", ".about-direction-grid > article", ".about-symbol-content", ".about-final .wrap", ".step-grid > *"].join(",");
export const ENTER_OPTIONS = { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" };

// Only intercept ordinary same-origin page navigation. Browser link semantics survive.
export function transitionDestination(event, anchor, currentHref) {
  if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (anchor.hasAttribute("download") || anchor.hasAttribute("data-motion-skip") || (anchor.target && anchor.target !== "_self") || anchor.rel?.split(/\s+/).includes("external")) return null;
  let destination, current;
  try { current = new URL(currentHref); destination = new URL(anchor.href, current); } catch { return null; }
  if (destination.origin !== current.origin || !/^https?:$/.test(destination.protocol) || destination.pathname === current.pathname || /\.[a-z0-9]{2,6}$/i.test(destination.pathname)) return null;
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function enterPage(frame, view = window) {
  if (view.matchMedia(MOTION_QUERY).matches || !frame.animate) return () => {};
  const animation = frame.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], ENTER_OPTIONS);
  return () => animation.cancel();
}

export function installScrollReveals(root, view = window) {
  if (!view.IntersectionObserver || view.matchMedia(MOTION_QUERY).matches) return () => {};
  const elements = new Set();
  const show = element => {
    if (element.getAttribute("data-reveal-state") !== "waiting") return;
    element.setAttribute("data-reveal-state", "revealed");
    observer.unobserve(element);
  };
  const observer = new view.IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) show(entry.target);
  }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
  const collect = () => {
    for (const element of elements) if (!root.contains(element)) { observer.unobserve(element); elements.delete(element); }
    root.querySelectorAll(REVEAL_SELECTOR).forEach((element, index) => {
      if (elements.has(element)) return;
      elements.add(element);
      if (element.getBoundingClientRect().top < view.innerHeight - 24) return;
      element.setAttribute("data-reveal-state", "waiting");
      element.style.setProperty("--reveal-delay", `${(index % 4) * 40}ms`);
      observer.observe(element);
    });
  };
  const focus = event => {
    for (const element of elements) if (element.contains(event.target)) show(element);
  };
  collect(); root.addEventListener("focusin", focus);
  const mutations = view.MutationObserver ? new view.MutationObserver(collect) : null;
  mutations?.observe(root, { childList: true, subtree: true });
  return () => {
    observer.disconnect(); mutations?.disconnect(); root.removeEventListener("focusin", focus);
    for (const element of elements) { element.removeAttribute("data-reveal-state"); element.style.removeProperty("--reveal-delay"); }
  };
}

export function installRouteTransitions(frame, navigate, view = window) {
  if (!frame.animate || view.matchMedia(MOTION_QUERY).matches) return () => {};
  let navigationTimer, recoveryTimer, exit;
  const clear = () => {
    view.clearTimeout(navigationTimer); view.clearTimeout(recoveryTimer); exit?.cancel(); exit = null;
    frame.removeAttribute("data-navigating");
  };
  const click = event => {
    const anchor = event.target?.closest?.("a[href]");
    const destination = transitionDestination(event, anchor, view.location.href);
    if (!destination) return;
    event.preventDefault(); clear(); frame.setAttribute("data-navigating", "true");
    exit = frame.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-8px)" }], { duration: 140, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
    navigationTimer = view.setTimeout(() => { try { navigate(destination); } catch { clear(); } }, 140);
    recoveryTimer = view.setTimeout(clear, 1200);
  };
  frame.addEventListener("click", click, true);
  return () => { clear(); frame.removeEventListener("click", click, true); };
}
