// frontend/src/components/home/CustomCursor.jsx
//
// A small dot + a smoothly-trailing ring that replaces the system cursor
// on precise-pointer (desktop/mouse) devices only. Everything here runs
// on Framer Motion's motion values, not React state — so mouse movement
// never triggers a re-render, keeping it (and the rest of the page) fast.

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";

const isFinePointer =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches;

const CustomCursor = () => {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const opacity = useMotionValue(0);
  const scale = useMotionValue(1);

  const ringX = useSpring(dotX, { stiffness: 600, damping: 45, mass: 0.15 });
  const ringY = useSpring(dotY, { stiffness: 600, damping: 45, mass: 0.15 });
  const ringScale = useSpring(scale, { stiffness: 300, damping: 25 });

  useEffect(() => {
    if (!isFinePointer) return;

    let rafId = null;
    let lastEvent = null;

    const applyMove = () => {
      if (lastEvent) {
        dotX.set(lastEvent.clientX);
        dotY.set(lastEvent.clientY);
        opacity.set(1);
        const target = lastEvent.target.closest?.("[data-cursor='hover']");
        scale.set(target ? 2.2 : 1);
      }
      rafId = null;
    };

    const handleMove = (e) => {
      lastEvent = e;
      if (rafId === null) rafId = requestAnimationFrame(applyMove);
    };
    const handleLeave = () => opacity.set(0);

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isFinePointer) return null;

  // Rendered via portal straight into <body>. This matters: any ancestor
  // with an active CSS `filter` (e.g. the blur-fade page transitions used
  // on the auth pages) becomes a new containing block for `position: fixed`
  // descendants per the CSS spec — which would silently re-anchor this
  // cursor to that ancestor's box instead of the real viewport. Portaling
  // to document.body sidesteps that regardless of where this is mounted.
  return createPortal(
    <>
      <motion.div
        style={{ x: dotX, y: dotY, opacity }}
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-primary-400 pointer-events-none z-[90] mix-blend-difference"
      />
      <motion.div
        style={{ x: ringX, y: ringY, opacity, scale: ringScale }}
        className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border border-white/40 pointer-events-none z-[90] mix-blend-difference"
      />
    </>,
    document.body
  );
};

export default CustomCursor;
