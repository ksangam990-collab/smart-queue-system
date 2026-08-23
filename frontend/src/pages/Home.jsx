// frontend/src/pages/Home.jsx

import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
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
  Sun,
  Moon,
  ChevronDown,
  Code2,
} from "lucide-react";
import Logo from "../components/common/Logo";
import LiveBoard from "../components/home/LiveBoard";
import MagneticButton from "../components/home/MagneticButton";
import Spotlight from "../components/home/Spotlight";
import Preloader from "../components/home/Preloader";
import CustomCursor from "../components/home/CustomCursor";
import { useTheme } from "../contexts/ThemeContext";
import { useLenis } from "../hooks/useLenis";

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

const marqueeItems = [
  "Live queue tracking",
  "Instant tokens",
  "Role-based dashboards",
  "Real-time updates",
  "Secure authentication",
  "Exportable reports",
];

const blurReveal = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const headingContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const wordReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const Home = () => {
  const { isDark, toggleTheme } = useTheme();
  useLenis();

  // ── intro preloader ─────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // ── scroll-linked nav background ──────────────────────────
  const { scrollY } = useScroll();
  const navBgOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  // ── parallax ambient blobs ─────────────────────────────────
  const blobY1 = useTransform(scrollY, [0, 900], [0, 160]);
  const blobY2 = useTransform(scrollY, [0, 900], [0, -120]);

  // ── hero: mouse-follow spotlight + scroll-exit depth ───────
  const heroRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.94]);

  // ── LiveBoard: 3D tilt tied to cursor position ──────────────
  const boardRotateX = useMotionValue(0);
  const boardRotateY = useMotionValue(0);
  const springRotateX = useSpring(boardRotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(boardRotateY, { stiffness: 150, damping: 20 });
  const handleBoardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    boardRotateY.set(px * 14);
    boardRotateX.set(-py * 14);
  };
  const handleBoardMouseLeave = () => {
    boardRotateX.set(0);
    boardRotateY.set(0);
  };

  // ── scroll-linked "flow" connector line ────────────────────
  const flowRef = useRef(null);
  const { scrollYProgress: flowProgress } = useScroll({
    target: flowRef,
    offset: ["start 75%", "end 55%"],
  });

  return (
    <>
      <AnimatePresence>{loading && <Preloader />}</AnimatePresence>
      <CustomCursor />

      <div className="home-cinematic min-h-screen bg-[#f7f7fb] dark:bg-[#05050b] text-slate-900 dark:text-white overflow-x-hidden selection:bg-primary-500/30 transition-colors duration-500">
        {/* ── ambient atmosphere ───────────────────────────────── */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            style={{ y: blobY1 }}
            className="absolute top-[-10%] left-[8%] w-[600px] h-[600px] bg-primary-400/10 dark:bg-primary-600/20 rounded-full blur-[120px] will-change-transform"
          />
          <motion.div
            style={{ y: blobY2 }}
            className="absolute top-[18%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/[0.08] dark:bg-emerald-500/[0.12] rounded-full blur-[120px] will-change-transform"
          />
          <div
            className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* ── Nav ──────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-30">
          <motion.div
            style={{ opacity: navBgOpacity }}
            className="absolute inset-0 backdrop-blur-xl bg-white/80 dark:bg-[#05050b]/75 border-b border-slate-200/70 dark:border-white/[0.06]"
          />
          <div className="relative flex items-center justify-between px-4 sm:px-10 py-3 sm:py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <Logo size={32} />
              <div className="flex flex-col leading-none min-w-0">
                <span className="font-bold text-base sm:text-lg tracking-tight">Slotly</span>
                <span className="hidden sm:block text-[10px] font-medium text-slate-400 dark:text-white/35 tracking-widest uppercase">
                  Smart Queue Booking
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                data-cursor="hover"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors overflow-hidden flex-shrink-0"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isDark ? "moon" : "sun"}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.25 }}
                    className="flex"
                  >
                    {isDark ? <Moon size={16} /> : <Sun size={16} />}
                  </motion.span>
                </AnimatePresence>
              </button>
              <Link
                to="/login"
                data-cursor="hover"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Sign in
              </Link>
              <MagneticButton strength={0.25}>
                <Link
                  to="/register"
                  data-cursor="hover"
                  className="btn-primary text-xs sm:text-sm px-3.5 py-2 sm:px-5 sm:py-2.5 whitespace-nowrap flex-shrink-0"
                >
                  Get started
                </Link>
              </MagneticButton>
            </div>
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          className="relative px-5 sm:px-10 pt-10 pb-12 sm:pt-20 sm:pb-24 max-w-7xl mx-auto"
        >
          <Spotlight
            mouseX={mouseX}
            mouseY={mouseY}
            intensity={isDark ? 0.18 : 0.07}
          />

          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-10 items-center"
          >
            {/* left: copy */}
            <div className="text-center lg:text-left">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={blurReveal}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 text-xs font-semibold mb-7 shadow-sm dark:shadow-none"
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
                Live for hospitals, clinics & service centers
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                variants={headingContainer}
                className="text-[2rem] leading-[1.15] sm:text-6xl sm:leading-[1.05] font-extrabold tracking-tight mb-5 sm:mb-6"
              >
                <span className="block overflow-hidden pb-1">
                  {["Your", "queue,"].map((word, i) => (
                    <motion.span
                      key={i}
                      variants={wordReveal}
                      className="inline-block mr-3"
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
                <span className="block overflow-hidden pb-1 bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 dark:from-primary-300 dark:via-primary-400 dark:to-emerald-300 bg-clip-text text-transparent">
                  {["live", "on", "screen."].map((word, i) => (
                    <motion.span
                      key={i}
                      variants={wordReveal}
                      className="inline-block mr-3"
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={blurReveal}
                transition={{ ...blurReveal.visible.transition, delay: 0.28 }}
                className="text-base sm:text-lg text-slate-500 dark:text-white/50 leading-relaxed mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0"
              >
                Slotly turns any waiting room into a departure board. Book a
                slot, get a token, and watch your exact position count down —
                no more sitting around guessing.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={blurReveal}
                transition={{ ...blurReveal.visible.transition, delay: 0.36 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
              >
                <MagneticButton className="w-full sm:w-auto">
                  <Link
                    to="/register"
                    data-cursor="hover"
                    className="btn-primary px-6 py-3 text-sm sm:px-7 sm:py-3.5 sm:text-[15px] w-full sm:w-auto group"
                  >
                    Book your first appointment
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </MagneticButton>
                <Link
                  to="/login"
                  data-cursor="hover"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:px-7 sm:py-3.5 sm:text-[15px] w-full sm:w-auto rounded-2xl font-semibold border border-slate-200 dark:border-white/15 text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/25 transition-all"
                >
                  I already have an account
                </Link>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={blurReveal}
                transition={{ ...blurReveal.visible.transition, delay: 0.44 }}
                className="flex flex-col sm:flex-row items-center sm:justify-center lg:justify-start gap-2 sm:gap-x-5 sm:gap-y-2 mt-6 sm:mt-7 text-xs text-slate-400 dark:text-white/35"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  Free to use
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  No installation
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  Works on any device
                </span>
              </motion.div>
            </div>

            {/* right: signature live board — floats + tilts with cursor */}
            <motion.div
              onMouseMove={handleBoardMouseMove}
              onMouseLeave={handleBoardMouseLeave}
              initial={{ opacity: 0, y: 24, scale: 0.97, filter: "blur(10px)" }}
              animate={{
                opacity: 1,
                y: [0, -10, 0],
                scale: 1,
                filter: "blur(0px)",
              }}
              style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformPerspective: 800,
              }}
              transition={{
                opacity: { duration: 0.7, delay: 0.2 },
                scale: { duration: 0.7, delay: 0.2 },
                filter: { duration: 0.7, delay: 0.2 },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 },
              }}
            >
              <LiveBoard />
            </motion.div>
          </motion.div>

          {/* scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="hidden sm:flex justify-center mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-slate-300 dark:text-white/20"
            >
              <ChevronDown size={22} />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Marquee ──────────────────────────────────────────── */}
        <div className="relative border-y border-slate-200/70 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] py-4 overflow-hidden">
          <div className="flex w-max animate-marquee">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map(
              (item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-3 mx-6 text-sm font-medium text-slate-400 dark:text-white/30 whitespace-nowrap"
                >
                  {item}
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                </span>
              ),
            )}
          </div>
        </div>

        {/* ── Flow ─────────────────────────────────────────────── */}
        <section id="how-it-works" ref={flowRef} className="relative px-6 sm:px-10 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={blurReveal}
              className="text-center max-w-xl mx-auto mb-16"
            >
              <span className="text-xs font-semibold tracking-[0.2em] text-primary-600 dark:text-primary-300 uppercase">
                How it works
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-3">
                Four steps. Zero guessing.
              </h2>
              <p className="text-slate-500 dark:text-white/45">
                The same flow every time, whether you're booking a checkup or
                picking up a repair.
              </p>
            </motion.div>

            <div className="relative">
              <div className="hidden lg:block absolute top-[38px] left-[12%] right-[12%] h-px bg-slate-200 dark:bg-white/10 overflow-hidden">
                <motion.div
                  style={{ scaleX: flowProgress, transformOrigin: "left" }}
                  className="h-full w-full bg-gradient-to-r from-primary-500 to-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                {flow.map(({ icon: Icon, step, title, desc }, i) => (
                  <motion.div
                    key={step}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={blurReveal}
                    transition={{ ...blurReveal.visible.transition, delay: i * 0.12 }}
                    className="relative text-center lg:text-left"
                  >
                    <div className="relative inline-flex items-center justify-center w-[76px] h-[76px] rounded-2xl bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none mb-5">
                      <Icon size={26} strokeWidth={1.75} className="text-primary-500 dark:text-primary-300" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {step}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1.5">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-white/45 leading-relaxed">
                      {desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Capabilities ─────────────────────────────────────── */}
        <section id="capabilities" className="px-6 sm:px-10 py-20 sm:py-24 bg-white/70 dark:bg-white/[0.02] border-y border-slate-200/70 dark:border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={blurReveal}
              className="text-center max-w-xl mx-auto mb-14"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-3">
                Built to run the whole front desk
              </h2>
              <p className="text-slate-500 dark:text-white/45">
                One system to replace paper registers, phone bookings, and
                physical queue tickets.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {capabilities.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  variants={blurReveal}
                  transition={{ ...blurReveal.visible.transition, delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  data-cursor="hover"
                  className="bg-white dark:bg-[#0f0f1a] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.07] hover:border-primary-200 dark:hover:border-white/15 shadow-sm dark:shadow-none transition-colors"
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-primary-500/15 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-primary-500 dark:text-primary-300" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-bold mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-white/45 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="px-6 py-24 sm:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={blurReveal}
            className="max-w-3xl mx-auto text-center relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-b dark:from-white/[0.04] dark:to-transparent shadow-xl shadow-slate-200/50 dark:shadow-none p-12 sm:p-16"
          >
            <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-400/15 dark:bg-primary-500/20 rounded-full blur-3xl -z-10" />
            <h2 className="relative text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Stop standing in line.
            </h2>
            <p className="relative text-slate-500 dark:text-white/50 mb-8 max-w-md mx-auto">
              Create your account in seconds and book your first appointment
              today.
            </p>
            <MagneticButton>
              <Link
                to="/register"
                data-cursor="hover"
                className="relative inline-flex items-center gap-2 btn-primary px-7 py-3.5 text-[15px]"
              >
                Get started for free
                <ArrowRight size={16} />
              </Link>
            </MagneticButton>
          </motion.div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="relative px-6 sm:px-10 pt-16 pb-8 border-t border-slate-200/70 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.02]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-8 pb-12">
              {/* brand column */}
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <Logo size={32} />
                  <span className="font-bold text-lg tracking-tight">Slotly</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed max-w-[220px]">
                  Live queue tracking and appointment booking for hospitals,
                  clinics, and service centers.
                </p>
              </div>

              {/* product */}
              <div>
                <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-white/30 mb-4">
                  Product
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#how-it-works" data-cursor="hover" className="text-slate-600 dark:text-white/55 hover:text-slate-900 dark:hover:text-white transition-colors">
                      How it works
                    </a>
                  </li>
                  <li>
                    <a href="#capabilities" data-cursor="hover" className="text-slate-600 dark:text-white/55 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Capabilities
                    </a>
                  </li>
                  <li>
                    <Link to="/register" data-cursor="hover" className="text-slate-600 dark:text-white/55 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Get started
                    </Link>
                  </li>
                </ul>
              </div>

              {/* account */}
              <div>
                <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-white/30 mb-4">
                  Account
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link to="/login" data-cursor="hover" className="text-slate-600 dark:text-white/55 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" data-cursor="hover" className="text-slate-600 dark:text-white/55 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Create account
                    </Link>
                  </li>
                  <li>
                    <Link to="/forgot-password" data-cursor="hover" className="text-slate-600 dark:text-white/55 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Forgot password
                    </Link>
                  </li>
                </ul>
              </div>

              {/* connect */}
              <div>
                <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-white/30 mb-4">
                  Connect
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="https://github.com/ksangam990-collab/smart-queue-system"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className="flex items-center gap-1.5 text-slate-600 dark:text-white/55 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Code2 size={14} /> GitHub
                    </a>
                  </li>
                  <li className="text-slate-500 dark:text-white/40">
                    Developed by :- Sangam Kumar
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200/70 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-white/30">
              <p>© 2026 Slotly. Built for hospitals, clinics, and service centers.</p>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
