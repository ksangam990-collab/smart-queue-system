// frontend/src/pages/Home.jsx

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Radar,
  Bell,
  DoorOpen,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Logo from "../components/common/Logo";
import LiveBoard from "../components/home/LiveBoard";

const flow = [
  {
    icon: Calendar,
    step: "01",
    title: "Book a slot",
    desc: "Pick a department, a service, and a time — done in under a minute, no phone call required.",
  },
  {
    icon: Bell,
    step: "02",
    title: "Get your token",
    desc: "A queue number is issued the instant you book. No front-desk visit, no paper ticket.",
  },
  {
    icon: Radar,
    step: "03",
    title: "Track it live",
    desc: "Your position and estimated wait update in real time, right on your phone.",
  },
  {
    icon: DoorOpen,
    step: "04",
    title: "Walk in on time",
    desc: "Arrive exactly when you're about to be called — not thirty minutes early, not late.",
  },
];

const capabilities = [
  {
    icon: Users,
    title: "Built for every role",
    desc: "Purpose-built dashboards for admins, staff, and customers — each seeing only what they need.",
  },
  {
    icon: BarChart3,
    title: "Reporting that matters",
    desc: "Track completions, no-shows, and demand trends with exportable reports.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    desc: "JWT auth, encrypted passwords, and role-based access on every request.",
  },
  {
    icon: Smartphone,
    title: "Works everywhere",
    desc: "Feels native on a front-desk monitor and on a phone in someone's pocket.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-[#07070d] text-white overflow-x-hidden selection:bg-primary-500/30">
      {/* ── ambient atmosphere ───────────────────────────────── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-primary-600/[0.18] rounded-full blur-[120px] animate-[pulseSoft_9s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/[0.10] rounded-full blur-[120px] animate-[pulseSoft_11s_ease-in-out_infinite]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl bg-[#07070d]/70 border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-6 sm:px-10 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg tracking-tight">Slotly</span>
              <span className="text-[10px] font-medium text-white/35 tracking-widest uppercase">
                Smart Queue Booking
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 sm:px-10 pt-16 pb-24 sm:pt-20 sm:pb-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-10 items-center">
          {/* left: copy */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-xs font-semibold mb-7"
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live for hospitals, clinics & service centers
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-[2.75rem] leading-[1.05] sm:text-6xl sm:leading-[1.05] font-extrabold tracking-tight mb-6"
            >
              Your queue,
              <br />
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-emerald-300 bg-clip-text text-transparent">
                live on screen.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/50 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0"
            >
              Slotly turns any waiting room into a departure board. Book a
              slot, get a token, and watch your exact position count down —
              no more sitting around guessing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
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
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] w-full sm:w-auto rounded-2xl font-semibold border border-white/15 text-white/80 hover:bg-white/5 hover:border-white/25 transition-all"
              >
                I already have an account
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 mt-7 text-xs text-white/35"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> Free
                to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> No
                installation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> Works
                on any device
              </span>
            </motion.div>
          </div>

          {/* right: signature live board */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <LiveBoard />
          </motion.div>
        </div>
      </section>

      {/* ── Flow ─────────────────────────────────────────────── */}
      <section className="relative px-6 sm:px-10 py-20 sm:py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] text-primary-300 uppercase">
              How it works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-3">
              Four steps. Zero guessing.
            </h2>
            <p className="text-white/45">
              The same flow every time, whether you're booking a checkup or
              picking up a repair.
            </p>
          </div>

          <div className="relative">
            {/* connecting line */}
            <div className="hidden lg:block absolute top-[38px] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {flow.map(({ icon: Icon, step, title, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center lg:text-left"
                >
                  <div className="relative inline-flex items-center justify-center w-[76px] h-[76px] rounded-2xl bg-[#0f0f1a] border border-white/10 mb-5">
                    <Icon size={26} strokeWidth={1.75} className="text-primary-300" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-500 text-[10px] font-bold flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1.5">{title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">
                    {desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-20 sm:py-24 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Built to run the whole front desk
            </h2>
            <p className="text-white/45">
              One system to replace paper registers, phone bookings, and
              physical queue tickets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {capabilities.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-[#0f0f1a] p-6 rounded-3xl border border-white/[0.07] hover:border-white/15 transition-colors"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary-500/15 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary-300" strokeWidth={2.2} />
                </div>
                <h3 className="font-bold mb-1.5">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-6 py-24 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-12 sm:p-16"
        >
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -z-10" />
          <h2 className="relative text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Stop standing in line.
          </h2>
          <p className="relative text-white/50 mb-8 max-w-md mx-auto">
            Create your account in seconds and book your first appointment
            today.
          </p>
          <Link
            to="/register"
            className="relative inline-flex items-center gap-2 btn-primary px-7 py-3.5 text-[15px]"
          >
            Get started for free
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="px-6 py-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/35">
          <div className="flex items-center gap-2">
            <Logo size={22} />
            <span className="font-semibold text-white/60">Slotly</span>
            <span className="text-[10px] font-medium text-white/30 tracking-widest uppercase">
              Smart Queue Booking
            </span>
          </div>
          <span className="font-mono text-white/40">
            Developed by Sangam Kumar
          </span>
          <p>© 2026 Slotly. Built for hospitals, clinics, and service centers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
