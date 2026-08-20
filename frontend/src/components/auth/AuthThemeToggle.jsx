// frontend/src/components/auth/AuthThemeToggle.jsx
//
// Theme toggle used across auth pages. Wrapped in MagneticButton for a
// touch of the same tactile interactivity as the Home page CTAs, with an
// animated icon swap instead of a hard cut between sun/moon.

import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import MagneticButton from "../home/MagneticButton";
import { useTheme } from "../../contexts/ThemeContext";

const AuthThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <MagneticButton className={`absolute top-6 right-6 z-20 ${className}`} strength={0.4}>
      <button
        onClick={toggleTheme}
        data-cursor="hover"
        aria-label="Toggle theme"
        className="relative p-3 rounded-full bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="block"
            >
              <Sun size={20} className="text-yellow-400" />
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="block"
            >
              <Moon size={20} className="text-slate-700" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </MagneticButton>
  );
};

export default AuthThemeToggle;
