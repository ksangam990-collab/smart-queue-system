// backend/routes/authRoutes.js

import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  authLimiter,
  passwordResetLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register',                    authLimiter, register);
router.post('/login',                       authLimiter, login);
router.post('/forgot-password',             authLimiter, passwordResetLimiter, forgotPassword);
router.put('/reset-password/:token',        resetPasswordLimiter, resetPassword);
router.get('/verify-email/:token',                       verifyEmail);
router.post('/resend-verification',         authLimiter, resendVerificationLimiter, resendVerification);

// Protected routes (login required)
router.post('/logout',   protect, logout);
router.get('/me',        protect, getMe);

export default router;
