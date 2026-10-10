import test from "node:test";
import assert from "node:assert/strict";
import { enterPage, installRouteTransitions, installScrollReveals, transitionDestination } from "../lib/site-motion.mjs";

function element({ top = 1200, href = "/about", attributes = {}, target = "", rel = "" } = {}) {
  const attrs = new Map(Object.entries(attributes)), styles = new Map(), listeners = new Map(), animations = [];
  return {
    href, target, rel, attrs, styles, listeners, animations,
    setAttribute: (key, value) => attrs.set(key, value), getAttribute: key => attrs.get(key) ?? null,
    removeAttribute: key => attrs.delete(key), hasAttribute: key => attrs.has(key),
    style: { setProperty: (key, value) => styles.set(key, value), removeProperty: key => styles.delete(key) },
    getBoundingClientRect: () => ({ top }),
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type),
    animate: (frames, options) => { const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; } }; animations.push(animation); return animation; },
  };
}
function node(options) {
  const result = element(options); result.contains = child => child === result; result.closest = () => result; return result;
}
function environment(reduced = false) {
  let now = 0, id = 0;
  const timers = new Map(), intersections = [], mutations = [];
  return {
    innerHeight: 800, location: { href: "https://astera-mu.vercel.app/" }, timers, intersections, mutations,
    matchMedia: () => ({ matches: reduced }),
    setTimeout: (fn, delay) => { const key = ++id; timers.set(key, { fn, at: now + delay }); return key; },
    clearTimeout: key => timers.delete(key),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; this.observed = new Set(); intersections.push(this); }
      observe(node) { this.observed.add(node); } unobserve(node) { this.observed.delete(node); }
      disconnect() { this.observed.clear(); this.disconnected = true; }
    },
    MutationObserver: class { constructor(callback) { this.callback = callback; mutations.push(this); } observe() {} disconnect() { this.disconnected = true; } },
    advance(ms) { const target = now + ms; while (true) { const due = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0]; if (!due) break; now = due[1].at; timers.delete(due[0]); due[1].fn(); } now = target; },
  };
}
function click(anchor, overrides = {}) { return { target: anchor, button: 0, prevented: false, preventDefault() { this.prevented = true; }, ...overrides }; }

test("ordinary internal page links animate while modifier keys, downloads, same-page anchors and external links remain native", () => {
  const current = "https://astera-mu.vercel.app/";
  assert.equal(transitionDestination(click(null), node({ href: "/lab/tech-001?source=home#question" }), current), "/lab/tech-001?source=home#question");
  for (const override of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) assert.equal(transitionDestination(click(null, override), node(), current), null);
  for (const options of [{ href: "/#discover" }, { href: "/?universe=TECH" }, { href: "https://example.com/about" }, { href: "mailto:astera@example.com" }, { target: "_blank" }, { attributes: { download: "" } }, { attributes: { "data-motion-skip": "" } }, { rel: "external" }, { href: "/workbook.pdf" }]) assert.equal(transitionDestination(click(null), node(options), current), null);
});

test("rapid navigation cancels the first exit; the latest destination runs once and cleanup restores the frame", () => {
  const view = environment(), frame = node(), destinations = [];
  const stop = installRouteTransitions(frame, destination => destinations.push(destination), view);
  const first = click(node({ href: "/about" })); frame.listeners.get("click")(first);
  assert.ok(first.prevented); view.advance(80);
  frame.listeners.get("click")(click(node({ href: "/lab" })));
  assert.ok(frame.animations[0].cancelled); view.advance(139); assert.deepEqual(destinations, []);
  view.advance(1); assert.deepEqual(destinations, ["/lab"]); assert.equal(frame.getAttribute("data-navigating"), "true");
  stop(); assert.equal(view.timers.size, 0); assert.ok(frame.animations[1].cancelled); assert.equal(frame.getAttribute("data-navigating"), null);
});

test("slow or failed route restores the old page; modified clicks do not start a timer", () => {
  for (const fails of [false, true]) {
    const view = environment(), frame = node();
    const stop = installRouteTransitions(frame, () => { if (fails) throw Error("unavailable"); }, view);
    frame.listeners.get("click")(click(node(), { ctrlKey: true })); assert.equal(view.timers.size, 0);
    frame.listeners.get("click")(click(node())); view.advance(1200);
    assert.equal(frame.getAttribute("data-navigating"), null); assert.ok(frame.animations[0].cancelled); assert.equal(view.timers.size, 0); stop();
  }
});

test("scroll reveal leaves above-fold content readable, reveals once, and includes newly filtered cards", () => {
  const view = environment(), root = node(), visible = node({ top: 100 }), lower = node();
  let cards = [visible, lower]; root.querySelectorAll = () => cards; root.contains = element => cards.includes(element);
  const stop = installScrollReveals(root, view), observer = view.intersections[0];
  assert.equal(visible.getAttribute("data-reveal-state"), null); assert.equal(lower.getAttribute("data-reveal-state"), "waiting");
  observer.callback([{ target: lower, isIntersecting: false }]); assert.equal(lower.getAttribute("data-reveal-state"), "waiting");
  observer.callback([{ target: lower, isIntersecting: true }]); assert.equal(lower.getAttribute("data-reveal-state"), "revealed"); assert.equal(observer.observed.has(lower), false);
  const extra = node(); cards.push(extra); view.mutations[0].callback(); assert.equal(extra.getAttribute("data-reveal-state"), "waiting");
  root.listeners.get("focusin")({ target: extra }); assert.equal(extra.getAttribute("data-reveal-state"), "revealed");
  stop(); assert.ok(observer.disconnected); assert.ok(view.mutations[0].disconnected); assert.equal(root.listeners.size, 0);
  for (const card of cards) { assert.equal(card.getAttribute("data-reveal-state"), null); assert.equal(card.styles.size, 0); }
});

test("reduced motion and unsupported observer leave content visible and route links native", () => {
  const frame = node(), reduced = environment(true); frame.querySelectorAll = () => { throw Error("must not hide content"); };
  enterPage(frame, reduced)(); installRouteTransitions(frame, () => {}, reduced)(); installScrollReveals(frame, reduced)();
  assert.equal(frame.animations.length, 0); assert.equal(frame.listeners.size, 0);
  const unsupported = environment(); delete unsupported.IntersectionObserver; installScrollReveals(frame, unsupported)();
  const stop = enterPage(frame, unsupported); assert.equal(frame.animations.length, 1); stop(); assert.ok(frame.animations[0].cancelled);
});
