// backend/routes/appointmentRoutes.js

import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots,
  getTodayAppointments,
  getAnalytics,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require login
router.use(protect);

// Analytics
router.get('/analytics', authorize('admin'), getAnalytics);

// Slots
router.get('/slots', getAvailableSlots);

// Today
router.get('/today', authorize('admin', 'staff'), getTodayAppointments);

// Customer routes
router.post('/',            authorize('customer'), bookAppointment);
router.get('/my',           authorize('customer'), getMyAppointments);
router.patch('/:id/cancel', authorize('customer'), cancelAppointment);

// Admin/Staff routes
router.get('/',             authorize('admin', 'staff'), getAllAppointments);
router.get('/:id',          getAppointment);
router.patch('/:id/status', authorize('admin', 'staff'), updateAppointmentStatus);

export default router;