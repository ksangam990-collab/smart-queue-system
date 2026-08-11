// frontend/src/components/common/VerifyEmailBanner.jsx

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const VerifyEmailBanner = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.role !== "customer" || user.isVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post("/auth/resend-verification", { email: user.email });
      setSent(true);
      toast.success("Verification email sent — check your inbox!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not resend email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
        <AlertTriangle size={16} className="flex-shrink-0" />
        <span>
          Verify your email to book appointments.
        </span>
      </div>
      <button
        onClick={handleResend}
        disabled={sending || sent}
        className="text-amber-800 dark:text-amber-300 font-semibold hover:underline whitespace-nowrap disabled:opacity-50"
      >
        {sent ? "Email sent" : sending ? "Sending..." : "Resend email"}
      </button>
    </div>
  );
};

export default VerifyEmailBanner;
