// frontend/src/pages/Privacy.jsx

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Eye, Database, Trash2, Mail, Globe } from 'lucide-react';
import Logo from '../components/common/Logo';
import AuthCenteredShell from '../components/auth/AuthCenteredShell';
import { useLenis } from '../hooks/useLenis';

const LAST_UPDATED = 'August 28, 2026';
const SUPPORT_EMAIL = 'support@slotly.app';

const Section = ({ icon: Icon, title, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="mb-10"
  >
    <div className="flex items-center gap-2.5 mb-3">
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10">
        <Icon size={16} className="text-primary-500" />
      </span>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h2>
    </div>
    <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-3 pl-10">
      {children}
    </div>
  </motion.section>
);

const Privacy = () => {
  useLenis();

  useEffect(() => {
    document.title = 'Privacy Policy — Slotly';
    return () => { document.title = 'Slotly'; };
  }, []);

  return (
    <AuthCenteredShell pageKey="privacy">
      <div className="min-h-screen px-4 py-12">
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto mb-10 text-center"
        >
          <div className="flex justify-center mb-5">
            <Logo size={40} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-medium mb-4">
            <Lock size={12} />
            Privacy & Data
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Last updated: {LAST_UPDATED}
          </p>
        </motion.div>

        {/* ── Content card ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.07] rounded-2xl shadow-sm p-8 mb-8"
        >
          {/* Intro */}
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-10 pb-8 border-b border-slate-100 dark:border-white/[0.06]">
            At <strong className="text-slate-800 dark:text-white">Slotly</strong>, your privacy
            matters. This Privacy Policy explains what data we collect, how we use it, and the
            choices you have. We keep this simple and transparent.
          </p>

          <Section icon={Database} title="1. Information We Collect">
            <p>We collect the following information when you use Slotly:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Account information</strong>
                {' '}— name, email address, phone number, and password (hashed)
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Appointment data</strong>
                {' '}— department, service, date, time slot, and booking status
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Usage data</strong>
                {' '}— pages visited, actions taken, and device/browser information
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Uploaded files</strong>
                {' '}— profile avatar images stored on Cloudinary
              </li>
            </ul>
            <p>
              We do <strong className="text-slate-700 dark:text-slate-300">not</strong> collect
              payment card information, government IDs, or sensitive medical records.
            </p>
          </Section>

          <Section icon={Eye} title="2. How We Use Your Information">
            <p>Your data is used to:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Create and manage your account securely</li>
              <li>Process and confirm your appointment bookings</li>
              <li>Send you booking confirmations, reminders, and queue alerts via email</li>
              <li>Show you your real-time queue position</li>
              <li>Improve the platform through anonymised usage analytics</li>
              <li>Respond to your support requests</li>
            </ul>
            <p>
              We do <strong className="text-slate-700 dark:text-slate-300">not</strong> sell your
              personal data to third parties, ever.
            </p>
          </Section>

          <Section icon={Globe} title="3. Third-Party Services">
            <p>We use trusted third-party services to operate Slotly:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                <strong className="text-slate-700 dark:text-slate-300">MongoDB Atlas</strong>
                {' '}— secure cloud database hosting
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Cloudinary</strong>
                {' '}— avatar image storage and delivery
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Resend</strong>
                {' '}— transactional email delivery
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Vercel / Render</strong>
                {' '}— hosting and infrastructure
              </li>
            </ul>
            <p>
              Each provider has their own privacy policy and handles data according to their
              respective terms. We only share the minimum data necessary for each service to
              function.
            </p>
          </Section>

          <Section icon={Lock} title="4. How We Protect Your Data">
            <p>We take security seriously:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Passwords are hashed using bcrypt — never stored in plain text</li>
              <li>Authentication uses HTTP-only cookies and JWT tokens</li>
              <li>All connections use HTTPS / TLS encryption</li>
              <li>Rate limiting protects login and password reset endpoints</li>
              <li>Role-based access ensures users only see their own data</li>
            </ul>
          </Section>

          <Section icon={Database} title="5. Cookies">
            <p>
              Slotly uses a single HTTP-only authentication cookie to keep you logged in. This
              cookie is essential for the service to work and cannot be disabled while you are
              signed in. We do not use advertising or tracking cookies.
            </p>
          </Section>

          <Section icon={Trash2} title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Access</strong>
                {' '}— view the data we hold about you via your profile
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Correct</strong>
                {' '}— update your name, email, phone, and avatar at any time
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Delete</strong>
                {' '}— request deletion of your account and associated data
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Export</strong>
                {' '}— request a copy of your personal data
              </li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                {SUPPORT_EMAIL}
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section icon={Database} title="7. Data Retention">
            <p>
              We retain your account data for as long as your account is active. Appointment
              history is retained for 12 months after the appointment date for record-keeping
              purposes. You may request earlier deletion at any time.
            </p>
          </Section>

          <Section icon={Mail} title="8. Changes & Contact">
            <p>
              We may update this Privacy Policy occasionally. We will notify you of significant
              changes via email. Continued use after changes means you accept the updated policy.
            </p>
            <p>
              Questions? Reach us at{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </Section>
        </motion.div>

        {/* ── Footer nav ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-primary-500 transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>© {new Date().getFullYear()} Slotly</span>
          </div>
        </motion.div>
      </div>
    </AuthCenteredShell>
  );
};

export default Privacy;
