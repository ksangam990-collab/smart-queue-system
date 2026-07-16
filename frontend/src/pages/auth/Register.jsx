// frontend/src/pages/auth/Register.jsx

import Logo from "../../components/common/Logo";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Sun,
  Moon,
  CheckCircle2,
} from "lucide-react";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  customer: "/dashboard",
};

const Register = () => {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { isDark, toggleTheme } = useTheme();
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

      console.log("Register result:", result); // debug

      if (result && result.success) {
        const destination = ROLE_HOME[result.role] || "/dashboard";
        console.log("Navigating to:", destination); // debug
        window.location.href = destination; // use this instead of navigate
      }
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo size={42} />

            <div>
              <h2 className="text-white text-2xl font-bold">Slotly</h2>

              <p className="text-primary-100 text-xs tracking-[0.25em] uppercase">
                Smart Queue Booking
              </p>
            </div>
          </div>

          {/* Middle */}
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Create your
              <br />
              account.
            </h1>

            <p className="mt-6 text-primary-100">
              Join thousands of users who book appointments, skip long queues
              and manage visits with Slotly.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 size={18} />
                Secure account
              </div>

              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 size={18} />
                Instant appointment booking
              </div>

              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 size={18} />
                Live queue tracking
              </div>
            </div>
          </div>

          <p className="text-primary-200 text-sm">
            © 2026 Slotly. Built for hospitals, clinics, and service centers.
          </p>
        </div>
      </div>
      <div className="relative flex-1 flex items-center justify-center px-6 py-10">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-full bg-slate-200 dark:bg-slate-800 shadow hover:scale-110 transition"
        >
          {isDark ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-slate-700" />
          )}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="auth-card"
        >
          {/* Logo */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <Logo size={56} />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create account
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Join Slotly and skip the wait
              </p>
            </div>
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
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
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
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
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
                  className={`form-input pl-11 ${errors.confirmPassword ? "border-red-400 focus:ring-red-400" : ""}`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      val === password || "Passwords do not match",
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
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
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
