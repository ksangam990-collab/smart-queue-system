// frontend/src/pages/auth/VerifyEmail.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../../services/api";
import Logo from "../../components/common/Logo";
import AuthCenteredShell from "../../components/auth/AuthCenteredShell";
import MagneticButton from "../../components/home/MagneticButton";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Invalid or expired verification link."
        );
      }
    };
    verify();
  }, [token]);

  return (
    <AuthCenteredShell pageKey="verify-email">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card-glass relative z-10 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
          <Logo size={56} className="text-white" />
        </div>

        <AnimatePresence mode="wait">
          {status === "verifying" && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Verifying your email...
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Email verified!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
              <MagneticButton className="w-full block" strength={0.15}>
                <Link
                  to="/login"
                  data-cursor="hover"
                  className="btn-primary w-full py-3 inline-flex"
                >
                  Go to login
                </Link>
              </MagneticButton>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <XCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Verification failed
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
              <MagneticButton className="w-full block" strength={0.15}>
                <Link
                  to="/login"
                  data-cursor="hover"
                  className="btn-primary w-full py-3 inline-flex"
                >
                  Back to login
                </Link>
              </MagneticButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthCenteredShell>
  );
};

export default VerifyEmail;
