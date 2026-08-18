// frontend/src/components/home/Preloader.jsx
//
// A brief branded intro that sits over the page while the hero animates
// in underneath it, then dissolves away — a "curtain lifts" moment that
// makes the first load feel considered rather than abrupt.

import { motion } from "framer-motion";
import Logo from "../common/Logo";

const Preloader = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: "blur(24px)" }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05050b]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Logo size={52} />
        </motion.div>
        <span className="font-bold text-white text-xl tracking-tight">
          Slotly
        </span>
      </motion.div>

      <div className="absolute bottom-16 w-40 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
          style={{ transformOrigin: "left" }}
          className="h-full w-full bg-gradient-to-r from-primary-400 to-emerald-400"
        />
      </div>
    </motion.div>
  );
};

export default Preloader;
