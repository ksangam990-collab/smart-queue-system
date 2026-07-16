// frontend/src/pages/auth/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Logo from "../../components/common/Logo";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  customer: "/dashboard",
};

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate(ROLE_HOME[result.role] || "/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* ── Left panel: branding / illustration ─────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Logo size={56} />
            <span className="text-white font-bold text-lg tracking-tight">
              Slotly
            </span>
            <p className="text-primary-100 text-xs tracking-[0.25em] uppercase">
              Smart Queue Booking
            </p>
          </motion.div>

          {/* Middle content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-sm"
          >
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
              Skip the wait.
              <br />
              Own your time.
            </h1>
            <p className="text-primary-100 text-base leading-relaxed">
              Book appointments, track your live queue position, and never waste
              a minute standing in line again.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Real-time queue tracking",
                "Instant appointment confirmation",
                "Smart scheduling across departments",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 text-primary-50 text-sm"
                >
                  <CheckCircle2
                    size={16}
                    className="text-accent-300 flex-shrink-0"
                  />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom quote / footer */}
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

      {/* ── Right panel: form ────────────────────────────────────── */}
      <div className="relative flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-full bg-slate-200 dark:bg-slate-800 shadow-md hover:scale-110 transition duration-200"
        >
          {isDark ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-slate-700" />
          )}
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo (shown only on small screens) */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <Logo size={56} />
              <span className="font-bold text-3xl text-slate-900 dark:text-white tracking-tight">
                Slotly
              </span>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              New here?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Create an account
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="form-label">Email address</label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  placeholder="you@example.com"
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
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link
                  to="/forgot-password"
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
            <button
              type="submit"
              disabled={loading}
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
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-2.5">
              Demo credentials
            </p>
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Admin</span>
                <span className="font-mono text-slate-700">
                  admin@slotly.com / admin123
                </span>
              </div>
              <div className="flex justify-between">
                <span>Staff</span>
                <span className="font-mono text-slate-700">
                  staff@slotly.com / staff123
                </span>
              </div>
              <div className="flex justify-between">
                <span>Customer</span>
                <span className="font-mono text-slate-700">
                  user@slotly.com / user123
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
