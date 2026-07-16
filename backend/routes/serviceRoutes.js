// backend/routes/serviceRoutes.js

import express from 'express';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/',    getServices);
router.get('/:id', getService);

// Admin only
router.post('/',      protect, authorize('admin'), createService);
router.put('/:id',    protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

export default router;