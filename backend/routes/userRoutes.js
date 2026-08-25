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
  getDashboardStats,
  getMyAvailability,
  updateMyAvailability,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadAvatar } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

// Admin dashboard stats
router.get('/stats', authorize('admin'), getDashboardStats);

// Own profile
router.put('/profile',  updateProfile);
router.put('/password', changePassword);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

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
