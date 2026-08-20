// frontend/src/components/auth/AuthBrandPanel.jsx
//
// The cinematic left-hand panel shared by the split-layout auth pages
// (Login, Register). Tracks the cursor for a soft spotlight glow, drifts
// two gradient orbs slowly in the background, and lays a faint grid over
// everything — the same visual vocabulary as the Home hero, scaled down
// for a form context.

import { useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import Logo from "../common/Logo";
import Spotlight from "../home/Spotlight";
import { CheckCircle2 } from "lucide-react";

const AuthBrandPanel = ({ eyebrow, title, description, bullets = [] }) => {
  const panelRef = useRef(null);
  const mouseX = useMotionValue(300);
  const mouseY = useMotionValue(300);

  const handleMouseMove = (e) => {
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700"
    >
      {/* Cursor-tracked glow */}
      <Spotlight mouseX={mouseX} mouseY={mouseY} size={420} color="255,255,255" intensity={0.14} />

      {/* Faint grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Drifting gradient orbs */}
      <motion.div
        className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[-10%] w-96 h-96 bg-accent-400/20 rounded-full blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Logo size={56} />
          <span className="text-white font-bold text-lg tracking-tight">Slotly</span>
          <p className="text-primary-100 text-xs tracking-[0.25em] uppercase">
            Smart Queue Booking
          </p>
        </motion.div>

        {/* Middle content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm"
        >
          {eyebrow && (
            <span className="inline-block text-accent-200 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              {eyebrow}
            </span>
          )}
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-primary-100 text-base leading-relaxed">{description}</p>

          {bullets.length > 0 && (
            <div className="mt-8 space-y-3">
              {bullets.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-2.5 text-primary-50 text-sm"
                >
                  <CheckCircle2 size={16} className="text-accent-300 flex-shrink-0" />
                  {item}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bottom footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-primary-200 text-xs"
        >
          © 2026 Slotly. Built for hospitals, clinics, and service centers.
        </motion.div>
      </div>
    </div>
  );
};

export default AuthBrandPanel;
