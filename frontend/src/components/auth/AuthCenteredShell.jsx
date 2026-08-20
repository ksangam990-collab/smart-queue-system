// frontend/src/components/auth/AuthCenteredShell.jsx
//
// Shared shell for the single-step auth utility pages (Forgot password,
// Reset password, Verify email). Keeps their existing simple centered
// layout, but adds the same cinematic touches as Login/Register: a
// cursor-tracked spotlight, a faint grid, the custom cursor, and a
// blur-fade entrance — at a lighter intensity, since these are quick,
// single-purpose screens rather than primary landing surfaces.

import { useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import Spotlight from "../home/Spotlight";
import CustomCursor from "../home/CustomCursor";
import AuthThemeToggle from "./AuthThemeToggle";
import { useLenis } from "../../hooks/useLenis";

const AuthCenteredShell = ({ children, pageKey }) => {
  useLenis();
  const wrapRef = useRef(null);
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  const handleMouseMove = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        ref={wrapRef}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(8px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="auth-cinematic auth-container relative overflow-hidden"
      >
        <CustomCursor />
        <AuthThemeToggle />

        {/* Cursor-tracked glow, subtler than the split-panel pages */}
        <Spotlight mouseX={mouseX} mouseY={mouseY} size={380} color="91,95,245" intensity={0.08} />

        {/* Faint grid, matching the brand panel's texture */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthCenteredShell;
