// frontend/src/pages/auth/ResetPassword.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Logo from "../../components/common/Logo";
import AuthCenteredShell from "../../components/auth/AuthCenteredShell";
import MagneticButton from "../../components/home/MagneticButton";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, {
        password: data.password,
      });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCenteredShell pageKey="reset-password">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card-glass relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
            <Logo size={56} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Set new password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Choose a strong password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="form-label">New password</label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                data-cursor="hover"
                className={`form-input pl-11 pr-11 ${errors.password ? "border-red-400" : ""}`}
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <div>
            <label className="form-label">Confirm new password</label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat new password"
                data-cursor="hover"
                className={`form-input pl-11 ${errors.confirmPassword ? "border-red-400" : ""}`}
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
                  Resetting...
                </span>
              ) : (
                "Reset password"
              )}
            </button>
          </MagneticButton>
        </form>
      </motion.div>
    </AuthCenteredShell>
  );
};

export default ResetPassword;
