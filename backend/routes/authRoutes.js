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
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register',                    authLimiter, register);
router.post('/login',                       authLimiter, login);
router.post('/forgot-password',             authLimiter, forgotPassword);
router.put('/reset-password/:token',                     resetPassword);
router.get('/verify-email/:token',                       verifyEmail);

// Protected routes (login required)
router.post('/logout',   protect, logout);
router.get('/me',        protect, getMe);

export default router;