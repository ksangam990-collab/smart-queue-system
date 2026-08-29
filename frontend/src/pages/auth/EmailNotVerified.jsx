// frontend/src/pages/auth/EmailNotVerified.jsx

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle2, ArrowLeft, AlertTriangle, Inbox } from 'lucide-react';
import api from '../../services/api';
import Logo from '../../components/common/Logo';
import AuthCenteredShell from '../../components/auth/AuthCenteredShell';
import MagneticButton from '../../components/home/MagneticButton';

const RESEND_COOLDOWN = 60; // seconds before user can resend again

const EmailNotVerified = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const email     = location.state?.email || '';

  const [status,    setStatus]    = useState('idle');   // idle | sending | sent | error
  const [countdown, setCountdown] = useState(0);

  // If someone lands here directly with no email, send them back to login
  useEffect(() => {
    if (!email) navigate('/login', { replace: true });
  }, [email, navigate]);

  // Countdown timer after sending
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = async () => {
    if (status === 'sending' || countdown > 0) return;
    setStatus('sending');
    try {
      await api.post('/auth/resend-verification', { email });
      setStatus('sent');
      setCountdown(RESEND_COOLDOWN);
    } catch (err) {
      setStatus('error');
    }
  };

  const tips = [
    { icon: Inbox,         text: 'Check your Spam or Junk folder' },
    { icon: Mail,          text: `Make sure you signed up with ${email}` },
    { icon: RefreshCw,     text: 'Wait a minute and check again — emails can be delayed' },
  ];

  return (
    <AuthCenteredShell pageKey="verify-pending">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card-glass relative z-10 w-full max-w-sm text-center"
      >
        {/* ── Logo ───────────────────────────────────────────────── */}
        <div className="flex justify-center mb-6">
          <Logo size={44} />
        </div>

        {/* ── Icon ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-5"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Mail size={36} className="text-amber-500" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white">
              <AlertTriangle size={13} />
            </span>
          </div>
        </motion.div>

        {/* ── Heading ────────────────────────────────────────────── */}
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Verify your email
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
          We sent a verification link to:
        </p>
        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-6 break-all">
          {email}
        </p>

        {/* ── Resend button ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {status !== 'sent' ? (
            <motion.div key="resend" exit={{ opacity: 0, y: -8 }}>
              <MagneticButton className="w-full block mb-4" strength={0.15}>
                <button
                  onClick={handleResend}
                  disabled={status === 'sending' || countdown > 0}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <RefreshCw size={15} />
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />
                      {status === 'error' ? 'Try again' : 'Resend verification email'}
                    </>
                  )}
                </button>
              </MagneticButton>

              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs mb-4"
                >
                  Failed to send. Please try again in a moment.
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5 justify-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-4 py-3 mb-4"
            >
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
              <span className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                Email sent! Check your inbox.
                {countdown > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-500 font-normal ml-1">
                    (resend in {countdown}s)
                  </span>
                )}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tips ────────────────────────────────────────────────── */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left space-y-2.5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Can't find the email?
          </p>
          {tips.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-2.5">
              <Icon size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-600 dark:text-slate-400">{text}</span>
            </div>
          ))}
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft size={12} />
            Back to login
          </Link>
          <Link
            to="/register"
            className="hover:text-primary-500 transition-colors"
          >
            Wrong email? Re-register
          </Link>
        </div>
      </motion.div>
    </AuthCenteredShell>
  );
};

export default EmailNotVerified;
