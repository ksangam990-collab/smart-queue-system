// backend/controllers/departmentController.js

import Department from '../models/Department.js';
import Service    from '../models/Service.js';
import { safeRegex } from '../utils/escapeRegex.js';

// ─── Get all departments ───────────────────────────────────────
export const getDepartments = async (req, res) => {
  try {
    const { search, isActive } = req.query;

    const filter = {};
    if (search)   filter.name     = safeRegex(search);
    if (isActive) filter.isActive = isActive === 'true';

    const departments = await Department.find(filter)
      .populate('services')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get single department ─────────────────────────────────────
export const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('services');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    return res.status(200).json({ success: true, data: department });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create department ────────────────────────────────────────
export const createDepartment = async (req, res) => {
  try {
    const { name, description, icon, color, workingHours, workingDays } = req.body;

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists',
      });
    }

    const department = await Department.create({
      name,
      description,
      icon,
      color,
      workingHours,
      workingDays,
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update department ────────────────────────────────────────
export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete department ────────────────────────────────────────
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Delete all services under this department
    await Service.deleteMany({ department: req.params.id });
    await department.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Department and its services deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Toggle department active status ──────────────────────────
export const toggleDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    department.isActive = !department.isActive;
    await department.save();

    return res.status(200).json({
      success: true,
      message: `Department ${department.isActive ? 'activated' : 'deactivated'}`,
      data: department,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};