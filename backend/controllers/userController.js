// backend/controllers/userController.js

import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Department from "../models/Department.js";
import cloudinary from "../config/cloudinary.js";

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
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
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

    // Weekly data for charts
    const weeklyData = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const d = new Date(getISTDateString());
        d.setDate(d.getDate() - (6 - i));
        const start = new Date(d).setHours(0, 0, 0, 0);
        const end = new Date(d).setHours(23, 59, 59, 999);

        const [bookings, completed] = await Promise.all([
          Appointment.countDocuments({ date: { $gte: start, $lte: end } }),
          Appointment.countDocuments({
            date: { $gte: start, $lte: end },
            status: "completed",
          }),
        ]);

        return {
          day: d.toLocaleDateString("en-US", { weekday: "short" }),
          bookings,
          completed,
        };
      }),
    );

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

    // Department breakdown (only when no department filter)
    let deptBreakdown = [];
    if (!department) {
      const depts = await Department.find({ isActive: true }).select('name icon color');
      deptBreakdown = await Promise.all(
        depts.map(async (d) => {
          const count = await Appointment.countDocuments({
            ...baseFilter,
            department: d._id,
          });
          return { name: d.name, icon: d.icon, count };
        })
      );
      deptBreakdown = deptBreakdown.filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count);
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
