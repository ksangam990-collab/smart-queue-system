// frontend/src/pages/auth/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../components/common/Logo";
import AuthBrandPanel from "../../components/auth/AuthBrandPanel";
import CustomCursor from "../../components/home/CustomCursor";
import MagneticButton from "../../components/home/MagneticButton";
import { useLenis } from "../../hooks/useLenis";
import { useTheme } from "../../contexts/ThemeContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  customer: "/dashboard",
};

const Login = () => {
  useLenis();
  const { login, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate(ROLE_HOME[result.role] || '/dashboard');
    } else if (result.code === 'EMAIL_NOT_VERIFIED') {
      // Redirect to dedicated page so user can resend verification email
      navigate('/verify-pending', { state: { email: result.email || data.email } });
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="login"
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(8px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="auth-cinematic min-h-screen flex flex-col bg-white dark:bg-slate-950"
      >
        <CustomCursor />

        {/* ── Nav ──────────────────────────────────────────────── */}
        <nav className="lg:hidden sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/70 dark:border-white/[0.06]">
          <div className="flex items-center justify-between px-6 sm:px-10 py-4 max-w-7xl mx-auto">
            <Link to="/" data-cursor="hover" className="flex items-center gap-2.5">
              <Logo size={34} />
              <div className="flex flex-col leading-none">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  Slotly
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-white/35 tracking-widest uppercase">
                  Smart Queue Booking
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                data-cursor="hover"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors overflow-hidden"
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
                    {isDark ? <Moon size={17} /> : <Sun size={17} />}
                  </motion.span>
                </AnimatePresence>
              </button>
              <Link
                to="/"
                data-cursor="hover"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                <ArrowLeft size={15} /> Back to home
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Left panel: branding ─────────────────────────────────── */}
        <div className="flex-1 flex">
        <AuthBrandPanel
          eyebrow="Welcome back"
          title={
            <>
              Skip the wait.
              <br />
              Own your time.
            </>
          }
          description="Book appointments, track your live queue position, and never waste a minute standing in line again."
          bullets={[
            "Real-time queue tracking",
            "Instant appointment confirmation",
            "Smart scheduling across departments",
          ]}
        />

        {/* ── Right panel: form ────────────────────────────────────── */}
        <div className="relative flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="auth-card-glass w-full max-w-sm"
          >
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-5">
                <Logo size={44} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                Welcome back
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                New here?{" "}
                <Link
                  to="/register"
                  data-cursor="hover"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="form-label">Email address</label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    data-cursor="hover"
                    className={`form-input pl-10 ${errors.email ? "!border-danger-400 !ring-danger-100" : ""}`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="form-label mb-0">Password</label>
                  <Link
                    to="/forgot-password"
                    data-cursor="hover"
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    data-cursor="hover"
                    className={`form-input pl-10 pr-10 ${errors.password ? "!border-danger-400 !ring-danger-100" : ""}`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    data-cursor="hover"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <MagneticButton className="w-full block" strength={0.15}>
                <button
                  type="submit"
                  disabled={loading}
                  data-cursor="hover"
                  className="btn-primary w-full py-3 text-[15px] mt-2 group"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </MagneticButton>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                <Link to="/terms" className="hover:text-primary-500 transition-colors">
                  Terms
                </Link>
                <span className="mx-2">·</span>
                <Link to="/privacy" className="hover:text-primary-500 transition-colors">
                  Privacy
                </Link>
                <span className="mx-2">·</span>
                © {new Date().getFullYear()} Slotly
              </p>
            </div>
          </motion.div>
        </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Login;
