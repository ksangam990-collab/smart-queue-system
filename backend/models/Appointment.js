// backend/models/Appointment.js

import mongoose from "mongoose";
import { randomBytes } from "crypto";

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    timeSlot: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending",
    },
    queueToken: {
      type: String,
      required: true,
    },
    queueNumber: {
      type: Number,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    bookingReference: {
      type: String,
      unique: true,
    },
    cancelReason: String,
    completedAt: Date,
    reminderSent: {
      type: Boolean,
      default: false,
    },
    fee: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Auto-generate booking reference before saving
appointmentSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    // 3 random bytes → 6-char uppercase hex. Cryptographically secure unlike Math.random().
    const random = randomBytes(3).toString("hex").toUpperCase();
    this.bookingReference = `SQ-${date}-${random}`;
  }
  if (typeof next === "function") next();
});

appointmentSchema.index({ user: 1, date: -1 });
appointmentSchema.index({ department: 1, date: 1, status: 1 });
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index(
  {
    department: 1,
    date: 1,
    queueToken: 1,
  },
  {
    unique: true,
  },
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
