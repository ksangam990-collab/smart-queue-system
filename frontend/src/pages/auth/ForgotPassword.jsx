// frontend/src/pages/auth/ForgotPassword.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Logo from "../../components/common/Logo";
import AuthCenteredShell from "../../components/auth/AuthCenteredShell";
import MagneticButton from "../../components/home/MagneticButton";

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCenteredShell pageKey="forgot-password">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card-glass relative z-10"
      >
        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size={56} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Forgot password?
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Enter your email and we'll send a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="fp-email" className="form-label">Email address</label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="you@example.com"
                    data-cursor="hover"
                    className={`form-input pl-11 ${errors.email ? "border-red-400" : ""}`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                    })}
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <MagneticButton className="w-full block" strength={0.15}>
                <button
                  type="submit"
                  disabled={loading}
                  data-cursor="hover"
                  className="btn-primary w-full py-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </MagneticButton>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Check your inbox
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              If that email exists in our system, a reset link has been sent.
              Check your spam folder too.
            </p>
          </motion.div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            data-cursor="hover"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </motion.div>
    </AuthCenteredShell>
  );
};

export default ForgotPassword;
