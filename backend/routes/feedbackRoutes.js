import express from 'express';
import {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  getCompletedAppointmentsForFeedback,
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/', authorize('customer'), createFeedback);
router.get('/my', authorize('customer'), getMyFeedback);
router.get('/pending', authorize('customer'), getCompletedAppointmentsForFeedback);
router.get('/', authorize('admin'), getAllFeedback);

export default router;