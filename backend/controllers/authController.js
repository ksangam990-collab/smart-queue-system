// backend/controllers/authController.js

import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import {
  sendEmail,
  getVerificationEmailHTML,
  getVerificationEmailText,
  getPasswordResetEmailHTML,
  getPasswordResetEmailText,
} from '../utils/sendEmail.js';

// ─── Register ─────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
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
    return res.status(500).json({ success: false, message: error.message });
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Forgot Password ──────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase().trim() });
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reset Password ───────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken:  token,
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
    await user.save();

    const newToken = generateToken(res, user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful!',
      data: { token: newToken },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Verify Email ─────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken:  token,
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Resend Verification Email ────────────────────────────────
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a verification link has been sent.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified.',
      });
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
    return res.status(500).json({ success: false, message: error.message });
  }
};
