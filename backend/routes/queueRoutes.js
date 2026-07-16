// backend/routes/queueRoutes.js

import express from 'express';
import {
  getQueue,
  getAllQueues,
  callNext,
  getQueuePosition,
  skipToken,
  addToQueue,
  resetQueue,
} from '../controllers/queueController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Customer
router.get('/position', getQueuePosition);

// Admin + Staff
router.get('/',          authorize('admin', 'staff'), getQueue);
router.get('/all',       authorize('admin'),           getAllQueues);
router.post('/add',      authorize('admin', 'staff'),  addToQueue);
router.patch('/:queueId/call-next', authorize('admin', 'staff'), callNext);
router.post('/skip',     authorize('admin', 'staff'),  skipToken);
router.patch('/:queueId/reset', authorize('admin'),    resetQueue);

export default router;