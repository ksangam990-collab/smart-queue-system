// backend/controllers/serviceController.js

import Service    from '../models/Service.js';
import Department from '../models/Department.js';
import { safeRegex } from '../utils/escapeRegex.js';

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
    return res.status(500).json({ success: false, message: error.message });
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create service ───────────────────────────────────────────
export const createService = async (req, res) => {
  try {
    const { name, description, department, duration, fee, maxSlotsPerDay } = req.body;

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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update service ───────────────────────────────────────────
export const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    return res.status(500).json({ success: false, message: error.message });
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
    return res.status(500).json({ success: false, message: error.message });
  }
};