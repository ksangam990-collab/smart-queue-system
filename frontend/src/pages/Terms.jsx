// frontend/src/pages/Terms.jsx

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, AlertCircle, Mail } from 'lucide-react';
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

const Terms = () => {
  useLenis();

  useEffect(() => {
    document.title = 'Terms of Service — Slotly';
    return () => { document.title = 'Slotly'; };
  }, []);

  return (
    <AuthCenteredShell pageKey="terms">
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
            <FileText size={12} />
            Legal Document
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Terms of Service
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
            Welcome to <strong className="text-slate-800 dark:text-white">Slotly</strong> — a smart
            queue and appointment booking system. By accessing or using our platform, you agree to
            be bound by these Terms of Service. Please read them carefully.
          </p>

          <Section icon={FileText} title="1. Acceptance of Terms">
            <p>
              By creating an account or using Slotly in any way, you confirm that you are at least
              13 years old and agree to these Terms. If you are using Slotly on behalf of an
              organisation, you represent that you have authority to bind that organisation.
            </p>
          </Section>

          <Section icon={Shield} title="2. Use of the Service">
            <p>Slotly is provided for the purpose of booking and managing appointments. You agree to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>Provide accurate information when registering and booking</li>
              <li>Not misuse the platform to book appointments you do not intend to attend</li>
              <li>Not attempt to disrupt, reverse-engineer, or exploit the service</li>
              <li>Keep your login credentials confidential and not share them with others</li>
              <li>Notify us immediately if you suspect unauthorised access to your account</li>
            </ul>
          </Section>

          <Section icon={AlertCircle} title="3. Appointments & Cancellations">
            <p>
              Appointments booked through Slotly are subject to availability and confirmation by
              the relevant department or service provider. We reserve the right to cancel or
              reschedule appointments in exceptional circumstances.
            </p>
            <p>
              You may cancel an appointment through your dashboard at any time before the
              scheduled slot. Repeated no-shows may result in restrictions on future bookings.
            </p>
          </Section>

          <Section icon={Shield} title="4. Accounts & Roles">
            <p>
              Slotly offers three roles: <strong className="text-slate-700 dark:text-slate-300">Customer</strong>,{' '}
              <strong className="text-slate-700 dark:text-slate-300">Staff</strong>, and{' '}
              <strong className="text-slate-700 dark:text-slate-300">Admin</strong>. Staff and Admin
              accounts are created and managed by administrators. Customers may self-register.
            </p>
            <p>
              We reserve the right to suspend or terminate any account that violates these Terms,
              engages in abusive behaviour, or misuses the platform.
            </p>
          </Section>

          <Section icon={AlertCircle} title="5. Limitation of Liability">
            <p>
              Slotly is provided "as is" without warranties of any kind. We do not guarantee
              uninterrupted availability and are not liable for any indirect, incidental, or
              consequential damages arising from your use of the service.
            </p>
            <p>
              We are not responsible for actions taken by healthcare providers, service staff, or
              other third parties you interact with through our platform.
            </p>
          </Section>

          <Section icon={FileText} title="6. Intellectual Property">
            <p>
              All content, design, and code on Slotly is the property of its creators. You may
              not reproduce, distribute, or create derivative works without explicit written
              permission.
            </p>
          </Section>

          <Section icon={FileText} title="7. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Continued use of Slotly after changes
              are posted constitutes your acceptance of the new Terms. We will notify registered
              users of significant changes via email.
            </p>
          </Section>

          <Section icon={Mail} title="8. Contact Us">
            <p>
              If you have any questions about these Terms, please contact us at{' '}
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
            <Link to="/privacy" className="hover:text-primary-500 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>© {new Date().getFullYear()} Slotly</span>
          </div>
        </motion.div>
      </div>
    </AuthCenteredShell>
  );
};

export default Terms;
