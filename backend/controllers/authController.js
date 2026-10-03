// backend/controllers/authController.js

import User, { hashToken } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { validatePassword } from '../utils/passwordPolicy.js';
import { generateToken } from '../utils/generateToken.js';
import {
  sendEmail,
  getVerificationEmailHTML,
  getVerificationEmailText,
  getPasswordResetEmailHTML,
  getPasswordResetEmailText,
} from '../utils/sendEmail.js';
import { safeMessage } from '../utils/safeError.js';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
// Pre-computed bcrypt hash (cost 12) used only to equalise login timing
const DUMMY_HASH = '$2b$12$MKmniC9j4zxaoKTA5G8BBejXPXx.Tpp78G4rHfbjDxE5IO3ncGAyK';

// ─── Register ─────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Reject non-string input up front (blocks {"$ne": null}-style injection)
    if ([name, email, password].some((v) => typeof v !== 'string') || (phone !== undefined && typeof phone !== 'string')) {
      return res.status(400).json({ success: false, message: 'Invalid input.' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const pwError = validatePassword(password, { email: normalizedEmail });
    if (pwError) return res.status(400).json({ success: false, message: pwError });
    if (phone && !/^[+\d][\d\s()-]{6,19}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user — use normalizedEmail (lowercase + trimmed), not the raw value.
    // The schema has lowercase:true but relying on that implicitly is fragile.
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      role: 'customer',
    });

    // Generate and send verification email (non-blocking — registration
    // still succeeds even if the email fails to send)
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Please confirm your email address',
        html: getVerificationEmailHTML(
          user.name,
          verificationToken,
          process.env.CLIENT_URL
        ),
        text: getVerificationEmailText(
          user.name,
          verificationToken,
          process.env.CLIENT_URL
        ),
      });
    } catch (emailError) {
      console.error('[register] Verification email failed to send:', {
        email: user.email,
        error: emailError.message,
      });
    }

    const token = generateToken(res, user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        token,
        user: {
          _id:        user._id,
          name:       user.name,
          email:      user.email,
          role:       user.role,
          phone:      user.phone,
          avatar:     user.avatar,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Login ────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      // Burn the same bcrypt time as a real check so response timing does not
      // reveal whether an email is registered.
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Per-account lockout (the IP limiter alone doesn't stop distributed guessing)
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}, or reset your password.`,
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.lockUntil && user.lockUntil <= Date.now() ? 0 : user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
        user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        user.failedLoginAttempts = 0;
      }
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.failedLoginAttempts || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    // Block unverified customers from logging in — return a specific code
    // so the frontend can show a dedicated "verify your email" screen with
    // a resend button, instead of a generic error toast.
    if (!user.isVerified && user.role === 'customer') {
      return res.status(403).json({
        success: false,
        code:    'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in.',
        email:   user.email,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(res, user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          _id:        user._id,
          name:       user.name,
          email:      user.email,
          role:       user.role,
          phone:      user.phone,
          avatar:     user.avatar,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Logout ───────────────────────────────────────────────────
export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// ─── Get current user ─────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('department', 'name');

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Forgot Password ──────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'A valid email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal whether email exists
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html: getPasswordResetEmailHTML(
          user.name,
          resetToken,
          process.env.CLIENT_URL
        ),
        text: getPasswordResetEmailText(
          user.name,
          resetToken,
          process.env.CLIENT_URL
        ),
      });
    } catch (emailError) {
      console.error('[forgotPassword] Reset email failed to send:', {
        email: user.email,
        error: emailError.message,
      });
      user.resetPasswordToken   = undefined;
      user.resetPasswordExpire  = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Try again later.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot-password error:', error);
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Reset Password ───────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ success: false, message: pwError });

    const user = await User.findOne({
      resetPasswordToken:  hashToken(token),
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    // Set new password
    user.password           = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil           = undefined;
    await user.save();

    const newToken = generateToken(res, user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful!',
      data: { token: newToken },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Verify Email ─────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken:  hashToken(token),
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link.',
      });
    }

    user.isVerified               = true;
    user.emailVerificationToken   = undefined;
    user.emailVerificationExpire  = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Resend Verification Email ────────────────────────────────
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'A valid email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const GENERIC = {
      success: true,
      message: 'If that email exists and is unverified, a verification link has been sent.',
    };
    // Same response for unknown AND already-verified accounts (no enumeration)
    if (!user || user.isVerified) {
      return res.status(200).json(GENERIC);
    }

    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Please confirm your email address',
        html: getVerificationEmailHTML(
          user.name,
          verificationToken,
          process.env.CLIENT_URL
        ),
        text: getVerificationEmailText(
          user.name,
          verificationToken,
          process.env.CLIENT_URL
        ),
      });
    } catch (emailError) {
      console.error('[resendVerification] Verification email failed to send:', {
        email: user.email,
        error: emailError.message,
      });
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Try again later.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification email sent!',
    });
  } catch (error) {
    console.error('Resend-verification error:', error);
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};
