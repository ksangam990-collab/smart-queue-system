// backend/controllers/userController.js

import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Department from "../models/Department.js";
import cloudinary from "../config/cloudinary.js";
import { safeRegex } from "../utils/escapeRegex.js";

// India follows IST (UTC+5:30) — the server runs in UTC, so "today" must be
// computed relative to IST, not the server's own clock, or day boundaries
// shift incorrectly late at night / early morning.
const getISTDateString = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

// ─── Get all users ────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10, isActive } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive) filter.isActive = isActive === "true";
    if (search) {
      const re = safeRegex(search);
      filter.$or = [
        { name:  re },
        { email: re },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate("department", "name")
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get single user ──────────────────────────────────────────
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("department", "name");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create staff user (admin only) ──────────────────────────
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      department,
      role: "staff",
      isVerified: true,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update user ──────────────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, department, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role, department, isActive },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Toggle user active status ────────────────────────────────
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate admin accounts",
      });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete user ──────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin accounts",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update own profile ───────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Change password ──────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get dashboard stats (admin) ──────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date(getISTDateString());
    const startOfDay = new Date(today).setHours(0, 0, 0, 0);
    const endOfDay = new Date(today).setHours(23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalUsers,
      totalStaff,
      totalAppointments,
      todayAppointments,
      completedToday,
      cancelledToday,
      monthlyAppointments,
      totalDepartments,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "staff" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
      }),
      Appointment.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: "completed",
      }),
      Appointment.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: "cancelled",
      }),
      Appointment.countDocuments({
        date: { $gte: startOfMonth },
      }),
      Department.countDocuments({ isActive: true }),
    ]);

    // Weekly data for charts — single aggregation instead of 14 countDocuments
    const sevenDaysAgo = new Date(getISTDateString());
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyRaw = await Appointment.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'Asia/Kolkata' },
          },
          bookings:  { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    // Build a full 7-day array (fill gaps where no appointments exist)
    const weeklyMap = Object.fromEntries(weeklyRaw.map((r) => [r._id, r]));
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(getISTDateString());
      d.setDate(d.getDate() - (6 - i));
      const key = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
      return {
        day:       d.toLocaleDateString('en-US', { weekday: 'short' }),
        bookings:  weeklyMap[key]?.bookings  ?? 0,
        completed: weeklyMap[key]?.completed ?? 0,
      };
    });

    // Monthly user growth — last 7 months, one aggregation
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
    sevenMonthsAgo.setDate(1);
    sevenMonthsAgo.setHours(0, 0, 0, 0);

    const userGrowthRaw = await User.aggregate([
      { $match: { role: 'customer', createdAt: { $gte: sevenMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          users: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const userGrowthData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (6 - i));
      const match = userGrowthRaw.find(
        (r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1
      );
      return {
        month: MONTH_NAMES[d.getMonth()],
        users: match?.users ?? 0,
      };
    });

    // Recent appointments — last 5 from today for the dashboard table
    const recentAppointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('user',    'name')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStaff,
        totalAppointments,
        todayAppointments,
        completedToday,
        cancelledToday,
        monthlyAppointments,
        totalDepartments,
        weeklyData,
        userGrowthData,
        recentAppointments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Upload avatar ─────────────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "smartqueue/avatars",
      transformation: [{ width: 200, height: 200, crop: "fill" }],
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: { public_id: result.public_id, url: result.secure_url } },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get my availability (staff) ─────────────────────────────
export const getMyAvailability = async (req, res) => {
  try {
    const user = await (await import('../models/User.js')).default
      .findById(req.user._id)
      .select('availability');
    return res.status(200).json({ success: true, data: user.availability });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update my availability (staff) ──────────────────────────
export const updateMyAvailability = async (req, res) => {
  try {
    const { workingDays, offDates } = req.body;
    const allowed = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

    if (workingDays && !workingDays.every(d => allowed.includes(d))) {
      return res.status(400).json({ success: false, message: 'Invalid working day value.' });
    }

    const User = (await import('../models/User.js')).default;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { availability: { workingDays, offDates } },
      { new: true, runValidators: true }
    ).select('availability');

    return res.status(200).json({
      success: true,
      message: 'Availability updated.',
      data: user.availability,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Ranged analytics for Reports page ───────────────────────
export const getRangedStats = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end   = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const baseFilter = {
      date: { $gte: start, $lte: end },
      ...(department ? { department } : {}),
    };

    // Total counts for the range
    const [total, completed, cancelled, pending] = await Promise.all([
      Appointment.countDocuments(baseFilter),
      Appointment.countDocuments({ ...baseFilter, status: 'completed' }),
      Appointment.countDocuments({ ...baseFilter, status: 'cancelled' }),
      Appointment.countDocuments({ ...baseFilter, status: { $in: ['pending', 'confirmed'] } }),
    ]);

    // Daily breakdown for chart (one entry per day in range)
    const days = [];
    const cur  = new Date(start);
    while (cur <= end) {
      const dayStart = new Date(cur); dayStart.setHours(0, 0, 0, 0);
      const dayEnd   = new Date(cur); dayEnd.setHours(23, 59, 59, 999);
      const dayFilter = {
        date: { $gte: dayStart, $lte: dayEnd },
        ...(department ? { department } : {}),
      };
      const [b, c] = await Promise.all([
        Appointment.countDocuments(dayFilter),
        Appointment.countDocuments({ ...dayFilter, status: 'completed' }),
      ]);
      days.push({
        day:       cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bookings:  b,
        completed: c,
      });
      cur.setDate(cur.getDate() + 1);
    }

    // Department breakdown — single aggregation instead of N countDocuments
    let deptBreakdown = [];
    if (!department) {
      const deptAgg = await Appointment.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        { $match: { 'dept.isActive': true } },
        {
          $project: {
            _id: 0,
            name:  '$dept.name',
            icon:  '$dept.icon',
            count: 1,
          },
        },
      ]);
      deptBreakdown = deptAgg;
    }

    return res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        cancelled,
        pending,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
        cancellationRate: total ? Math.round((cancelled / total) * 100) : 0,
        dailyData: days,
        deptBreakdown,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
