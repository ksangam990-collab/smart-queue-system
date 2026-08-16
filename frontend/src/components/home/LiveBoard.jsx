// frontend/src/components/home/LiveBoard.jsx
//
// The hero's signature element: an animated split-flap "departure board"
// that mirrors what a real Slotly queue screen looks like. Characters spin
// through a sequence before settling, then the whole token quietly
// increments every few seconds — an orchestrated page-load moment that
// doubles as a live product demo.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-".split("");
const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

const FlipChar = ({ char }) => (
  <span className="relative inline-block w-[0.62em] h-[1.15em] overflow-hidden align-top">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={char}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: 90, opacity: 0 }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-0 flex items-center justify-center"
        style={{ transformOrigin: "center", backfaceVisibility: "hidden" }}
      >
        {char}
      </motion.span>
    </AnimatePresence>
  </span>
);

const useSpinToValue = (target, { minSpins = 5, speed = 55 } = {}) => {
  const [display, setDisplay] = useState(() => target.split(""));
  const timeouts = useRef([]);

  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    const chars = target.split("");

    chars.forEach((finalChar, i) => {
      let tick = 0;
      const totalTicks = minSpins + i * 2; // settle left → right, staggered
      const step = () => {
        tick += 1;
        setDisplay((prev) => {
          const next = [...prev];
          next[i] = tick >= totalTicks ? finalChar : randomChar();
          return next;
        });
        if (tick < totalTicks) {
          timeouts.current.push(setTimeout(step, speed));
        }
      };
      timeouts.current.push(setTimeout(step, speed));
    });

    return () => timeouts.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
};

const TOKEN_SEQUENCE = ["A-041", "A-042", "A-043", "A-044", "A-045", "A-046"];
const STATS_SEQUENCE = [
  { ahead: "5", wait: "18m" },
  { ahead: "4", wait: "15m" },
  { ahead: "4", wait: "14m" },
  { ahead: "3", wait: "11m" },
  { ahead: "2", wait: "8m" },
  { ahead: "1", wait: "4m" },
];

const LiveBoard = () => {
  const [index, setIndex] = useState(0);
  const display = useSpinToValue(TOKEN_SEQUENCE[index]);
  const stats = STATS_SEQUENCE[index];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TOKEN_SEQUENCE.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* ambient glow behind the board */}
      <div className="absolute -inset-8 bg-primary-500/25 blur-3xl rounded-[3rem] -z-10" />
      <div className="absolute -inset-4 bg-emerald-400/10 blur-2xl rounded-[3rem] -z-10" />

      <div className="rounded-[1.75rem] border border-white/10 bg-[#0b0b16] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65)] overflow-hidden">
        {/* header strip */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.03]">
          <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.15em] text-emerald-400 uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            Now serving
          </span>
          <span className="text-[11px] font-mono text-white/30">
            Cardiology · Counter 2
          </span>
        </div>

        {/* the flip board */}
        <div className="px-6 sm:px-8 py-9 sm:py-11 text-center">
          <div
            className="inline-flex gap-1 sm:gap-1.5 text-4xl sm:text-6xl font-bold tracking-tight"
            style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              perspective: "600px",
            }}
          >
            {display.map((c, i) => (
              <span
                key={i}
                className="bg-white/[0.05] rounded-lg sm:rounded-xl px-1.5 sm:px-2 text-amber-300"
              >
                <FlipChar char={c} />
              </span>
            ))}
          </div>
        </div>

        {/* footer stats strip */}
        <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-white/[0.02]">
          <div className="px-3 py-4 text-center">
            <p className="text-sm sm:text-base font-bold text-white/90 tabular-nums">
              {stats.ahead}
            </p>
            <p className="text-[10px] sm:text-[11px] text-white/35 mt-0.5 uppercase tracking-wide">
              Ahead of you
            </p>
          </div>
          <div className="px-3 py-4 text-center">
            <p className="text-sm sm:text-base font-bold text-white/90 tabular-nums">
              {stats.wait}
            </p>
            <p className="text-[10px] sm:text-[11px] text-white/35 mt-0.5 uppercase tracking-wide">
              Est. wait
            </p>
          </div>
          <div className="px-3 py-4 text-center">
            <p className="text-sm sm:text-base font-bold text-emerald-400">
              On time
            </p>
            <p className="text-[10px] sm:text-[11px] text-white/35 mt-0.5 uppercase tracking-wide">
              Status
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBoard;
