// frontend/src/pages/Home.jsx

import Logo from "../components/common/Logo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  BarChart3,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const features = [
  {
    icon: Calendar,
    title: "Effortless booking",
    desc: "Reserve a slot in under a minute with a guided, four-step flow — no phone calls, no front-desk queues.",
  },
  {
    icon: Clock,
    title: "Live queue tracking",
    desc: "Watch your position update in real time and know exactly when to arrive, down to the minute.",
  },
  {
    icon: Users,
    title: "Built for every role",
    desc: "Purpose-built dashboards for admins, staff, and customers — each seeing only what they need.",
  },
  {
    icon: BarChart3,
    title: "Reporting that matters",
    desc: "Track completions, no-shows, and demand trends with exportable, presentation-ready reports.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    desc: "JWT authentication, encrypted passwords, and role-based access control on every request.",
  },
  {
    icon: Smartphone,
    title: "Works everywhere",
    desc: "A responsive interface that feels native whether you're on a front-desk monitor or a phone.",
  },
];

const Home = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f1a] overflow-x-hidden transition-colors duration-300">
      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg text-slate-900 dark:text-slate-50 tracking-tight">
              Slotly
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide uppercase">
              Smart Queue Booking
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" className="btn-secondary text-sm">
            Sign in
          </Link>
          <Link
            to="/register"
            className="btn-primary text-sm hidden sm:inline-flex"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-500/[0.06] dark:bg-primary-500/[0.15] rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 right-[10%] w-[400px] h-[400px] bg-accent-500/[0.04] dark:bg-accent-500/[0.12] rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/20 border border-primary-100 dark:border-primary-400/30 text-primary-700 dark:text-primary-200 text-xs font-semibold mb-6 shadow-sm dark:shadow-none"
          >
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse-soft" />
            Slotly is live for hospitals, clinics & service centers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-[1.08] mb-6"
          >
            Waiting rooms,
            <br />
            <span className="text-primary-500">reimagined.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Book appointments, get an instant queue token, and track your exact
            position — all from your phone. No more sitting around guessing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/register"
              className="btn-primary px-7 py-3.5 text-[15px] w-full sm:w-auto group"
            >
              Book your first appointment
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              to="/login"
              className="btn-secondary px-7 py-3.5 text-[15px] w-full sm:w-auto"
            >
              I already have an account
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-center gap-5 mt-6 text-xs text-slate-400 dark:text-slate-500"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-accent-500" /> Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-accent-500" /> No
              installation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-accent-500" /> Works on
              any device
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-4xl mx-auto mt-20 px-4"
        >
          <div className="bg-white dark:bg-[#1a1a2e] p-2 rounded-3xl border border-slate-100 dark:border-[#2a2a42] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.06)]">
            <div className="bg-slate-50 dark:bg-[#14141f] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                    Your queue token
                  </p>
                  <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">
                    B-014
                  </p>
                </div>
                <span className="badge badge-info">Confirmed</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Now serving", value: "B-009" },
                  { label: "Ahead of you", value: "5" },
                  { label: "Est. wait", value: "18m" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white dark:bg-[#1a1a2e] rounded-xl p-3.5 text-center border border-slate-100 dark:border-[#2a2a42]"
                  >
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-slate-50 dark:bg-[#14141f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-3">
              Everything a front desk needs
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              One system to replace paper registers, phone bookings, and
              physical queue tickets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#1a1a2e] p-6 rounded-3xl border border-slate-100 dark:border-[#2a2a42] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.06)]"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-primary-500/15 flex items-center justify-center mb-4">
                  <Icon
                    size={20}
                    className="text-primary-600 dark:text-primary-400"
                    strokeWidth={2.2}
                  />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary-600 to-primary-700 rounded-4xl p-12 sm:p-16 relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Stop standing in line.
          </h2>
          <p className="relative text-primary-100 mb-8 max-w-md mx-auto">
            Create your account in seconds and book your first appointment
            today.
          </p>
          <Link
            to="/register"
            className="relative inline-flex items-center gap-2 bg-[#ffffff] text-[#3b32cc] font-semibold rounded-2xl px-7 py-3.5 text-[15px] hover:bg-[#f0f1ff] transition-all"
          >
            Get started for free
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="px-6 py-10 border-t border-slate-100 dark:border-[#2a2a42]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Slotly
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide uppercase">
              Smart Queue Booking
            </span>
          </div>
          <div className="flex justify-between">
            <span>Developed By : - </span>
            <span className="font-mono text-slate-700">Sangam Kumar</span>
          </div>
          <p>
            © 2026 Slotly. Built for hospitals, clinics, and service centers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
