// backend/controllers/appointmentController.js

import Appointment from "../models/Appointment.js";
import Department from "../models/Department.js";
import Service from "../models/Service.js";
import Queue from "../models/Queue.js";
import Notification from "../models/Notification.js";
import {
  generateQueueToken,
  generateTimeSlots,
} from "../utils/generateQueueToken.js";
import { safeRegex } from "../utils/escapeRegex.js";
import {
  sendEmail,
  getBookingConfirmationHTML,
  getBookingConfirmationText,
  getAppointmentCancelledHTML,
  getAppointmentCancelledText,
  getAppointmentStatusHTML,
  getAppointmentStatusText,
} from "../utils/sendEmail.js";

// Use CLIENT_URL everywhere — FRONTEND_URL was an inconsistent duplicate.
// No hardcoded fallback: if CLIENT_URL is unset the app is misconfigured and
// email links should fail loudly rather than silently point to the wrong domain.
const BASE_URL = process.env.CLIENT_URL;

// India follows IST (UTC+5:30) — the server runs in UTC, so "today" must be
// computed relative to IST, not the server's own clock, or day boundaries
// shift incorrectly late at night / early morning.
const getISTDateString = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

// ─── Get available time slots ─────────────────────────────────
export const getAvailableSlots = async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: "Service and date are required",
      });
    }

    const service = await Service.findById(serviceId).populate("department");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const dept = service.department;

    // Check if selected date is a working day
    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    if (!dept.workingDays.includes(dayName)) {
      return res.status(200).json({
        success: true,
        data: [],
        message: `${dept.name} is closed on ${dayName}`,
      });
    }

    // Generate all possible slots
    const allSlots = generateTimeSlots(
      dept.workingHours.start,
      dept.workingHours.end,
      service.duration
    );

    // Find already booked slots for this date
    const bookedAppointments = await Appointment.find({
      service: serviceId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999),
      },
      status: { $in: ["pending", "confirmed"] },
    });

    const bookedSlots = bookedAppointments.map((a) => a.timeSlot.start);

    // Mark slots as available or booked
    const slots = allSlots.map((slot) => ({
      ...slot,
      available: !bookedSlots.includes(slot.start),
    }));

    return res.status(200).json({
      success: true,
      data: slots,
      service: {
        name: service.name,
        duration: service.duration,
        fee: service.fee,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Book appointment ─────────────────────────────────────────
export const bookAppointment = async (req, res) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before booking an appointment.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const { departmentId, serviceId, date, timeSlot, notes } = req.body;
    const userId = req.user._id;

    // Validate service exists and belongs to department
    const service = await Service.findOne({
      _id: serviceId,
      department: departmentId,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or inactive",
      });
    }

    // ── Atomic slot reservation ───────────────────────────────────────────────
    // Without a transaction, two concurrent requests for the same slot can both
    // pass the "slot taken" check and both create appointments — classic TOCTOU
    // race. We wrap the check + create in a MongoDB session so only one succeeds.
    const mongoose = await import('mongoose');
    const session = await mongoose.default.startSession();

    let appointment;
    let token, tokenNumber, queueId;

    try {
      await session.withTransaction(async () => {
        // Re-check slot inside the transaction
        const slotTaken = await Appointment.findOne({
          service: serviceId,
          date: {
            $gte: new Date(date).setHours(0, 0, 0, 0),
            $lte: new Date(date).setHours(23, 59, 59, 999),
          },
          "timeSlot.start": timeSlot.start,
          status: { $in: ["pending", "confirmed"] },
        }).session(session);

        if (slotTaken) {
          // Throwing inside withTransaction automatically aborts the session
          const err = new Error("This time slot is already booked. Please choose another.");
          err.statusCode = 400;
          throw err;
        }

        // Check user doesn't already have appointment same day same dept
        const existingBooking = await Appointment.findOne({
          user: userId,
          department: departmentId,
          date: {
            $gte: new Date(date).setHours(0, 0, 0, 0),
            $lte: new Date(date).setHours(23, 59, 59, 999),
          },
          status: { $in: ["pending", "confirmed"] },
        }).session(session);

        if (existingBooking) {
          const err = new Error("You already have an appointment in this department on this date.");
          err.statusCode = 400;
          throw err;
        }

        // Generate queue token (its own atomic findOneAndUpdate — safe inside session)
        ({ token, tokenNumber, queueId } = await generateQueueToken(departmentId, date));

        // Create appointment — the unique index on (department, date, queueToken)
        // acts as a last-resort guard if two requests somehow get the same token.
        [appointment] = await Appointment.create(
          [{
            user: userId,
            department: departmentId,
            service: serviceId,
            date: new Date(date),
            timeSlot,
            notes,
            queueToken: token,
            queueNumber: tokenNumber,
            status: "confirmed",
            fee: service.fee,
          }],
          { session }
        );

        // Add to queue waiting list within the same transaction
        await Queue.findByIdAndUpdate(
          queueId,
          {
            $push: {
              waitingList: {
                appointment: appointment._id,
                token,
                tokenNumber,
                status: "waiting",
              },
            },
          },
          { session }
        );
      });
    } catch (txError) {
      session.endSession();
      if (txError.statusCode === 400) {
        return res.status(400).json({ success: false, message: txError.message });
      }
      throw txError; // re-throw unexpected errors to the outer catch
    }

    await appointment.populate([
      { path: "department", select: "name icon color" },
      { path: "service", select: "name duration fee" },
      { path: "user", select: "name email phone" },
    ]);

    // Create in-app notification
    await Notification.create({
      recipient: userId,
      title: "Appointment Confirmed!",
      message: `Your appointment for ${service.name} is confirmed. Token: ${token}`,
      type: "appointment_confirmed",
      appointment: appointment._id,
      link: "/my-appointments",
    });

    // Update department total appointments
    await Department.findByIdAndUpdate(departmentId, {
      $inc: { totalAppointments: 1 },
    });

    // Send booking confirmation email (non-blocking — never fail the booking)
    sendEmail({
      to: appointment.user.email,
      subject: `✅ Appointment Confirmed – ${service.name} | Token ${token}`,
      html: getBookingConfirmationHTML({
        name: appointment.user.name,
        appointment,
        baseUrl: BASE_URL,
      }),
      text: getBookingConfirmationText({
        name: appointment.user.name,
        appointment,
        baseUrl: BASE_URL,
      }),
    }).catch((err) =>
      console.error('[bookAppointment] Confirmation email failed:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      data: appointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get my appointments (customer) ──────────────────────────
export const getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate("department", "name icon color")
      .populate("service", "name duration fee")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pages: Math.ceil(total / limit),
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all appointments (admin/staff) ──────────────────────
export const getAllAppointments = async (req, res) => {
  try {
    const {
      status,
      department,
      date,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    // ── Build base filter (non-search fields go directly into MongoDB) ──
    const filter = {};
    if (status)     filter.status     = status;
    if (department) filter.department = new (await import('mongoose')).default.Types.ObjectId(department);
    if (date) {
      filter.date = {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999),
      };
    }

    // ── Search: resolve matching user IDs first, then filter in DB ──
    // This means pagination is always correct — we never filter post-fetch.
    if (search) {
      const User = (await import('../models/User.js')).default;
      const searchRegex = safeRegex(search);   // escape to prevent ReDoS

      // Find users whose name or email matches
      const matchingUsers = await User.find({
        $or: [
          { name:  searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      // Also allow direct booking reference / queue token search
      filter.$or = [
        { user:             { $in: userIds }    },
        { bookingReference: searchRegex         },
        { queueToken:       searchRegex         },
      ];
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('user',       'name email phone avatar')
      .populate('department', 'name icon color')
      .populate('service',    'name duration fee')
      .sort({ date: -1, 'timeSlot.start': 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pages: Math.ceil(total / limit),
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get single appointment ───────────────────────────────────
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name email phone avatar")
      .populate("department", "name icon color workingHours")
      .populate("service", "name duration fee");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Customers can only see their own appointments
    if (
      req.user.role === "customer" &&
      appointment.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Valid status values and the transitions allowed from each state.
// Staff/admin can only move appointments forward, never reopen completed ones.
const ALLOWED_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled', 'no-show'],
  confirmed: ['completed', 'cancelled', 'no-show'],
  completed: [],   // terminal — no further changes
  cancelled: [],   // terminal
  'no-show': [],   // terminal
};

// ─── Update appointment status (admin/staff) ──────────────────
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;

    // Validate incoming status against the enum allowlist
    const validStatuses = Object.keys(ALLOWED_TRANSITIONS);
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Enforce state-machine transitions — prevent reopening terminal states
    const allowedNext = ALLOWED_TRANSITIONS[appointment.status] ?? [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${appointment.status}' to '${status}'.`,
      });
    }

    appointment.status = status;
    if (status === "cancelled" && cancelReason) {
      appointment.cancelReason = cancelReason;
    }
    if (status === "completed") {
      appointment.completedAt = new Date();
    }

    await appointment.save();

    // Populate user + service + department for email & notification
    await appointment.populate([
      { path: "user", select: "name email" },
      { path: "service", select: "name" },
      { path: "department", select: "name icon" },
    ]);

    // In-app notification
    await Notification.create({
      recipient: appointment.user._id,
      title: `Appointment ${status}`,
      message: `Your appointment (${appointment.queueToken}) has been marked as ${status}.`,
      type:
        status === "confirmed"
          ? "appointment_confirmed"
          : "appointment_cancelled",
      appointment: appointment._id,
      link: "/my-appointments",
    });

    // Email — cancelled by admin uses cancellation template; other status
    // changes (confirmed, completed, no-show) use the status update template
    if (status === "cancelled") {
      sendEmail({
        to: appointment.user.email,
        subject: `❌ Appointment Cancelled – ${appointment.service?.name}`,
        html: getAppointmentCancelledHTML({
          name: appointment.user.name,
          appointment,
          reason: cancelReason,
          cancelledBy: 'admin',
          baseUrl: BASE_URL,
        }),
        text: getAppointmentCancelledText({
          name: appointment.user.name,
          appointment,
          reason: cancelReason,
          cancelledBy: 'admin',
          baseUrl: BASE_URL,
        }),
      }).catch((err) =>
        console.error('[updateAppointmentStatus] Cancellation email failed:', err.message)
      );
    } else {
      sendEmail({
        to: appointment.user.email,
        subject: `📋 Appointment Update – ${appointment.service?.name}`,
        html: getAppointmentStatusHTML({
          name: appointment.user.name,
          appointment,
          status,
          baseUrl: BASE_URL,
        }),
        text: getAppointmentStatusText({
          name: appointment.user.name,
          appointment,
          status,
          baseUrl: BASE_URL,
        }),
      }).catch((err) =>
        console.error('[updateAppointmentStatus] Status email failed:', err.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Appointment marked as ${status}`,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reschedule appointment (customer) ───────────────────────
export const rescheduleAppointment = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;

    if (!date || !timeSlot?.start || !timeSlot?.end) {
      return res.status(400).json({
        success: false,
        message: 'New date and time slot are required.',
      });
    }

    // Only the owner can reschedule
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or confirmed appointments can be rescheduled.',
      });
    }

    // Check the new slot is not already taken (exclude this appointment)
    const slotTaken = await Appointment.findOne({
      _id:      { $ne: appointment._id },
      service:  appointment.service,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999),
      },
      'timeSlot.start': timeSlot.start,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (slotTaken) {
      return res.status(400).json({
        success: false,
        message: 'That time slot is already booked. Please choose another.',
      });
    }

    // Remove from old queue waiting list
    await Queue.updateOne(
      { department: appointment.department, date: appointment.date },
      { $pull: { waitingList: { appointment: appointment._id } } }
    );

    // Update the appointment
    const oldDate     = appointment.date;
    const oldTimeSlot = { ...appointment.timeSlot };

    appointment.date     = new Date(date);
    appointment.timeSlot = timeSlot;
    appointment.status   = 'confirmed'; // re-confirm on reschedule
    await appointment.save();

    // Generate new queue token for the new date/dept
    const { token, tokenNumber, queueId } = await generateQueueToken(
      appointment.department,
      date,
    );

    appointment.queueToken  = token;
    appointment.queueNumber = tokenNumber;
    await appointment.save();

    // Add to new queue
    await Queue.findByIdAndUpdate(queueId, {
      $push: {
        waitingList: {
          appointment: appointment._id,
          token,
          tokenNumber,
          status: 'waiting',
        },
      },
    });

    // Populate for email + response
    await appointment.populate([
      { path: 'user',       select: 'name email' },
      { path: 'service',    select: 'name' },
      { path: 'department', select: 'name icon' },
    ]);

    // In-app notification
    await Notification.create({
      recipient: appointment.user._id,
      title:     '📅 Appointment Rescheduled',
      message:   `Your appointment for ${appointment.service?.name} has been moved to ${new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at ${timeSlot.start}.`,
      type:      'appointment_confirmed',
      link:      '/my-appointments',
    });

    // Confirmation email (non-blocking)
    sendEmail({
      to:      appointment.user.email,
      subject: `📅 Appointment Rescheduled – ${appointment.service?.name}`,
      html: getBookingConfirmationHTML({
        name: appointment.user.name,
        appointment,
        baseUrl: BASE_URL,
      }),
      text: getBookingConfirmationText({
        name: appointment.user.name,
        appointment,
        baseUrl: BASE_URL,
      }),
    }).catch((err) =>
      console.error('[rescheduleAppointment] Email failed:', err.message)
    );

    return res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Cancel appointment (customer) ───────────────────────────
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (["completed", "cancelled"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "This appointment cannot be cancelled",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelReason = req.body.reason || "Cancelled by user";
    await appointment.save();

    // Populate for email
    await appointment.populate([
      { path: "user", select: "name email" },
      { path: "service", select: "name" },
      { path: "department", select: "name icon" },
    ]);

    // Send cancellation email (non-blocking)
    sendEmail({
      to: appointment.user.email,
      subject: `❌ Appointment Cancelled – ${appointment.service?.name}`,
      html: getAppointmentCancelledHTML({
        name: appointment.user.name,
        appointment,
        reason: appointment.cancelReason,
        cancelledBy: 'user',
        baseUrl: BASE_URL,
      }),
      text: getAppointmentCancelledText({
        name: appointment.user.name,
        appointment,
        reason: appointment.cancelReason,
        cancelledBy: 'user',
        baseUrl: BASE_URL,
      }),
    }).catch((err) =>
      console.error('[cancelAppointment] Cancellation email failed:', err.message)
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get today's appointments (staff) ────────────────────────
export const getTodayAppointments = async (req, res) => {
  try {
    const today = new Date(getISTDateString());
    const filter = {
      date: {
        $gte: new Date(today).setHours(0, 0, 0, 0),
        $lte: new Date(today).setHours(23, 59, 59, 999),
      },
    };

    if (req.user.role === "staff" && req.user.department) {
      filter.department = req.user.department;
    }

    const appointments = await Appointment.find(filter)
      .populate("user", "name phone avatar")
      .populate("department", "name icon")
      .populate("service", "name duration")
      .sort({ "timeSlot.start": 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Dashboard analytics ──────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const today = new Date(getISTDateString());
    const startOfDay = new Date(today).setHours(0, 0, 0, 0);
    const endOfDay = new Date(today).setHours(23, 59, 59, 999);

    const [
      totalUsers,
      totalAppointments,
      todayAppointments,
      completedToday,
      cancelledToday,
      pendingToday,
    ] = await Promise.all([
      (await import("../models/User.js")).default.countDocuments({
        role: "customer",
      }),
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
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["pending", "confirmed"] },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAppointments,
        todayAppointments,
        completedToday,
        cancelledToday,
        pendingToday,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
