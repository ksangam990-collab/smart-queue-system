// backend/routes/appointmentRoutes.js

import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
  getAvailableSlots,
  getTodayAppointments,
  getAnalytics,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { detectNoShowsNow } from '../jobs/noShowDetector.js';

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
router.post('/',                 authorize('customer'), bookAppointment);
router.get('/my',                authorize('customer'), getMyAppointments);
router.patch('/:id/cancel',      authorize('customer'), cancelAppointment);
router.patch('/:id/reschedule',  authorize('customer'), rescheduleAppointment);

// Admin/Staff routes
router.get('/',             authorize('admin', 'staff'), getAllAppointments);
router.get('/:id',          getAppointment);
router.patch('/:id/status', authorize('admin', 'staff'), updateAppointmentStatus);

// Admin: manually trigger no-show detection
router.post('/trigger-no-show', authorize('admin'), async (req, res) => {
  try {
    const count = await detectNoShowsNow();
    res.status(200).json({ success: true, message: `Marked ${count} no-show(s)` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
