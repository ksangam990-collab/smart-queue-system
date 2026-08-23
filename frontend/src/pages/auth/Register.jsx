// frontend/src/pages/auth/Register.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../components/common/Logo";
import AuthBrandPanel from "../../components/auth/AuthBrandPanel";
import CustomCursor from "../../components/home/CustomCursor";
import MagneticButton from "../../components/home/MagneticButton";
import { useLenis } from "../../hooks/useLenis";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Sun, Moon } from "lucide-react";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  customer: "/dashboard",
};

const Register = () => {
  useLenis();
  const { register: registerUser, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      if (result && result.success) {
        const destination = ROLE_HOME[result.role] || "/dashboard";
        window.location.href = destination;
      }
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="register"
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
          eyebrow="Get started"
          title={
            <>
              Create your
              <br />
              account.
            </>
          }
          description="Join thousands of users who book appointments, skip long queues and manage visits with Slotly."
          bullets={[
            "Secure account",
            "Instant appointment booking",
            "Live queue tracking",
          ]}
        />

        {/* ── Right panel: form ────────────────────────────────────── */}
        <div className="relative flex-1 flex items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="auth-card-glass"
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create account
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Join Slotly and skip the wait
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="form-label">Full name</label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="John Doe"
                    data-cursor="hover"
                    className={`form-input pl-11 ${errors.name ? "border-red-400 focus:ring-red-400" : ""}`}
                    {...register("name", {
                      required: "Full name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                  />
                </div>
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="form-label">Email address</label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    data-cursor="hover"
                    className={`form-input pl-11 ${errors.email ? "border-red-400 focus:ring-red-400" : ""}`}
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

              {/* Phone */}
              <div>
                <label className="form-label">
                  Phone number{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    data-cursor="hover"
                    className="form-input pl-11"
                    {...register("phone")}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    data-cursor="hover"
                    className={`form-input pl-11 pr-11 ${errors.password ? "border-red-400 focus:ring-red-400" : ""}`}
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="form-label">Confirm password</label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    data-cursor="hover"
                    className={`form-input pl-11 ${errors.confirmPassword ? "border-red-400 focus:ring-red-400" : ""}`}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (val) => val === password || "Passwords do not match",
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit */}
              <MagneticButton className="w-full block" strength={0.15}>
                <button
                  type="submit"
                  disabled={loading}
                  data-cursor="hover"
                  className="btn-primary w-full py-3 text-base mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
              </MagneticButton>
            </form>

            {/* Login link */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                data-cursor="hover"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Register;
