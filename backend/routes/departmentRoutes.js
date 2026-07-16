// backend/routes/departmentRoutes.js

import express from 'express';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartment,
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public — customers can view departments when booking
router.get('/',    getDepartments);
router.get('/:id', getDepartment);

// Admin only
router.post('/',              protect, authorize('admin'), createDepartment);
router.put('/:id',            protect, authorize('admin'), updateDepartment);
router.delete('/:id',         protect, authorize('admin'), deleteDepartment);
router.patch('/:id/toggle',   protect, authorize('admin'), toggleDepartment);

export default router;