// backend/middleware/rateLimiter.js

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// General limiter for all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                    // Max 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});

// Strict limiter for auth routes (login, register) — keyed by IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                     // Only 10 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

// ─── Email-keyed limiter factory ────────────────────────────────
//
// authLimiter above is keyed by IP, which does nothing to stop repeated
// requests for the SAME target email (e.g. mashing "forgot password" on
// one account) — that's exactly what happens during manual testing, and
// it's what gets a "Reset your password" / "confirm your email" template
// content-blocked by Gmail: several near-identical security emails to one
// inbox in a short window reads as a burst-spam pattern to their filters,
// independent of domain reputation. This factory caps attempts per target
// email instead, which is the signal that actually matters here.
const emailLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
      const email = req.body?.email?.toLowerCase().trim();
      // Fall back to IP (via the v8 helper, which normalizes IPv6 subnets
      // correctly) only if no email was provided, so a malformed request
      // never throws instead of just being rate-limited sensibly.
      return email || ipKeyGenerator(req, res);
    },
    message: { success: false, message },
  });

// Max 3 password-reset requests per email per 30 minutes.
export const passwordResetLimiter = emailLimiter({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message:
    'Too many password reset requests for this email. Please wait 30 minutes, and check your inbox (and spam folder) before requesting another.',
});

// Max 3 verification-resend requests per email per 30 minutes.
export const resendVerificationLimiter = emailLimiter({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message:
    'Too many verification emails requested for this address. Please wait 30 minutes, and check your inbox (and spam folder) before requesting another.',
});
