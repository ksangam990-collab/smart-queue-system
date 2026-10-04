// backend/routes/userRoutes.js

import express from 'express';
import {
  getUsers,
  getUser,
  createStaff,
  updateUser,
  toggleUserStatus,
  deleteUser,
  updateProfile,
  changePassword,
  exportMyData,
  deleteMyAccount,
  getDashboardStats,
  getRangedStats,
  getMyAvailability,
  updateMyAvailability,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { writeLimiter } from '../middleware/rateLimiter.js';
import { uploadAvatar } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

// Admin dashboard stats
router.get('/stats', authorize('admin'), getDashboardStats);
router.get('/stats/ranged', authorize('admin'), getRangedStats);

// Own profile & data privacy
router.put('/profile',     updateProfile);
router.put('/password',    writeLimiter, changePassword);
router.post('/avatar',     writeLimiter, upload.single('avatar'), uploadAvatar);
router.get('/export-data', exportMyData);
router.delete('/me',       writeLimiter, deleteMyAccount);

// Staff availability
router.get('/availability',  getMyAvailability);
router.put('/availability',  updateMyAvailability);

// Admin routes
router.get('/',               authorize('admin'), getUsers);
router.get('/:id',            authorize('admin'), getUser);
router.post('/staff',         authorize('admin'), createStaff);
router.put('/:id',            authorize('admin'), updateUser);
router.patch('/:id/toggle',   authorize('admin'), toggleUserStatus);
router.delete('/:id',         authorize('admin'), deleteUser);

export default router;
