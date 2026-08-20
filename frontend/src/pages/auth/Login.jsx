// frontend/src/pages/auth/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../components/common/Logo";
import AuthBrandPanel from "../../components/auth/AuthBrandPanel";
import AuthThemeToggle from "../../components/auth/AuthThemeToggle";
import CustomCursor from "../../components/home/CustomCursor";
import MagneticButton from "../../components/home/MagneticButton";
import { useLenis } from "../../hooks/useLenis";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  customer: "/dashboard",
};

const Login = () => {
  useLenis();
  const { login, loading } = useAuth();
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
      navigate(ROLE_HOME[result.role] || "/dashboard");
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
        className="auth-cinematic min-h-screen flex bg-white dark:bg-slate-950"
      >
        <CustomCursor />

        {/* ── Left panel: branding ─────────────────────────────────── */}
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
          <AuthThemeToggle />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="auth-card-glass w-full max-w-sm"
          >
            {/* Mobile logo */}
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
                <label className="form-label">Email address</label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
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
                  <label className="form-label mb-0">Password</label>
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

            {/* Demo credentials */}
            <div className="mt-8 p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2.5">
                Demo credentials
              </p>
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Admin</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    admin@slotly.com / admin123
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Staff</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    staff@slotly.com / staff123
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    user@slotly.com / user123
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Login;
