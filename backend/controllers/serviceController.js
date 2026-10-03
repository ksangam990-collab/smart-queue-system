// backend/controllers/serviceController.js

import Service    from '../models/Service.js';
import Department from '../models/Department.js';
import { safeRegex } from '../utils/escapeRegex.js';
import { isValidId } from '../utils/queueAccess.js';

const num = (v) => (typeof v === 'number' || (typeof v === 'string' && v.trim() !== '')) && Number.isFinite(Number(v));

// Whitelist + type-check admin-editable service fields (see departmentController).
const pickServiceFields = (body, { allowDepartment }) => {
  const out = {};
  for (const k of ['name', 'description']) {
    if (body[k] !== undefined) {
      if (typeof body[k] !== 'string') return { error: `Invalid ${k}` };
      out[k] = body[k];
    }
  }
  if (body.duration !== undefined) {
    if (!num(body.duration) || Number(body.duration) < 5 || Number(body.duration) > 480) return { error: 'Duration must be between 5 and 480 minutes' };
    out.duration = Number(body.duration);
  }
  if (body.fee !== undefined) {
    if (!num(body.fee) || Number(body.fee) < 0) return { error: 'Fee must be 0 or more' };
    out.fee = Number(body.fee);
  }
  if (body.maxSlotsPerDay !== undefined) {
    if (!num(body.maxSlotsPerDay) || Number(body.maxSlotsPerDay) < 1 || Number(body.maxSlotsPerDay) > 500) return { error: 'Max slots per day must be between 1 and 500' };
    out.maxSlotsPerDay = Number(body.maxSlotsPerDay);
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') return { error: 'Invalid isActive' };
    out.isActive = body.isActive;
  }
  if (allowDepartment && body.department !== undefined) {
    if (!isValidId(body.department)) return { error: 'Invalid department' };
    out.department = body.department;
  }
  return { data: out };
};
import { safeMessage } from '../utils/safeError.js';

// ─── Get all services ─────────────────────────────────────────
export const getServices = async (req, res) => {
  try {
    const { department, search, isActive } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (search)     filter.name       = safeRegex(search);
    if (isActive)   filter.isActive   = isActive === 'true';

    const services = await Service.find(filter)
      .populate('department', 'name icon color')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Get single service ───────────────────────────────────────
export const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('department', 'name');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    return res.status(200).json({ success: true, data: service });
  } catch (error) {
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Create service ───────────────────────────────────────────
export const createService = async (req, res) => {
  try {
    const picked = pickServiceFields(req.body, { allowDepartment: true });
    if (picked.error) return res.status(400).json({ success: false, message: picked.error });
    const { name, description, department, duration, fee, maxSlotsPerDay } = picked.data;
    if (!department) return res.status(400).json({ success: false, message: 'Department is required' });

    // Check department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    const service = await Service.create({
      name,
      description,
      department,
      duration,
      fee,
      maxSlotsPerDay,
    });

    await service.populate('department', 'name');

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Update service ───────────────────────────────────────────
export const updateService = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid service id' });
    const picked = pickServiceFields(req.body, { allowDepartment: true });
    if (picked.error) return res.status(400).json({ success: false, message: picked.error });

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      picked.data,
      { new: true, runValidators: true }
    ).populate('department', 'name');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

// ─── Delete service ───────────────────────────────────────────
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    await service.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: safeMessage(error) });
  }
};