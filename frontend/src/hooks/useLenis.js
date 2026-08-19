// frontend/src/hooks/useLenis.js
//
// Buttery inertia scrolling for the landing page. Scoped to whichever
// component calls it — Lenis starts on mount and is fully destroyed on
// unmount, so navigating to any other route (dashboard, login, etc.)
// restores normal native scrolling there, untouched.

import { useEffect } from "react";
import Lenis from "lenis";

export const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({
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
  }, []);
};
