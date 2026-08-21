// frontend/src/hooks/useLenis.js
//
// Buttery inertia scrolling. Scoped to whichever component calls it —
// Lenis starts on mount and is fully destroyed on unmount, so navigating
// away restores normal native scrolling untouched.
//
// By default it binds to the window (right for full-page routes like Home
// and the auth pages). Pass a wrapperRef when the actual scrolling happens
// inside a nested container instead — e.g. the dashboard, whose scroll
// container is DashboardLayout's <main>, not the window.

import { useEffect } from "react";
import Lenis from "lenis";

export const useLenis = (wrapperRef) => {
  useEffect(() => {
    const wrapper = wrapperRef?.current;
    // If a wrapperRef was passed but isn't attached yet, skip this run —
    // the effect re-fires once the ref resolves on the next render.
    if (wrapperRef && !wrapper) return;

    const lenis = new Lenis({
      ...(wrapper ? { wrapper, content: wrapper.firstElementChild || wrapper } : {}),
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [wrapperRef]);
};
