// backend/controllers/departmentController.js

import Department from '../models/Department.js';
import Service    from '../models/Service.js';
import { safeRegex } from '../utils/escapeRegex.js';
import { isValidId } from '../utils/queueAccess.js';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;

// Whitelist + type-check the fields an admin may set. Previously updateDepartment
// passed req.body straight to Mongo, letting any field (totalAppointments,
// isActive, $-operators inside nested objects…) be written.
const pickDepartmentFields = (body) => {
  const out = {};
  for (const k of ['name', 'description', 'icon', 'color']) {
    if (body[k] !== undefined) {
      if (typeof body[k] !== 'string') return { error: `Invalid ${k}` };
      out[k] = body[k];
    }
  }
  if (body.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(body.color)) return { error: 'Color must be a hex value like #6366f1' };
  if (body.workingDays !== undefined) {
    if (!Array.isArray(body.workingDays) || !body.workingDays.every((d) => DAYS.includes(d))) return { error: 'Invalid working days' };
    out.workingDays = [...new Set(body.workingDays)];
  }
  if (body.workingHours !== undefined) {
    const { start, end } = body.workingHours || {};
    if (!HM.test(start) || !HM.test(end) || start >= end) return { error: 'Working hours must be HH:MM with start before end' };
    out.workingHours = { start, end };
  }
  return { data: out };
};
import { safeMessage } from '../utils/safeError.js';

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
    return res.status(500).json({ success: false, message: safeMessage(error) });
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
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Create department ────────────────────────────────────────
export const createDepartment = async (req, res) => {
  try {
    const picked = pickDepartmentFields(req.body);
    if (picked.error) return res.status(400).json({ success: false, message: picked.error });
    const { name, description, icon, color, workingHours, workingDays } = picked.data;
    if (!name) return res.status(400).json({ success: false, message: 'Department name is required' });

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
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Update department ────────────────────────────────────────
export const updateDepartment = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid department id' });
    const picked = pickDepartmentFields(req.body);
    if (picked.error) return res.status(400).json({ success: false, message: picked.error });

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      picked.data,
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
    return res.status(500).json({ success: false, message: safeMessage(error) });
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
    return res.status(500).json({ success: false, message: safeMessage(error) });
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
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};