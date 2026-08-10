// frontend/src/pages/auth/VerifyEmail.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../../services/api";
import Logo from "../../components/common/Logo";

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
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="auth-card text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
          <Logo size={56} className="text-white" />
        </div>

        {status === "verifying" && (
          <>
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Email verified!
            </h1>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <Link to="/login" className="btn-primary w-full py-3 inline-block">
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Verification failed
            </h1>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <Link to="/login" className="btn-primary w-full py-3 inline-block">
              Back to login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
