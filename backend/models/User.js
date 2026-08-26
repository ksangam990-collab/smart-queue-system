// backend/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      public_id: { type: String, default: '' },
      url: {
        type: String,
        default: 'https://api.dicebear.com/7.x/initials/svg?seed=User',
      },
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    // Staff availability settings
    availability: {
      workingDays: {
        type: [String],
        enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        default: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
      },
      offDates: {
        type: [String], // ISO date strings e.g. "2026-08-25"
        default: [],
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerificationToken:  String,
    emailVerificationExpire: Date,
    resetPasswordToken:      String,
    resetPasswordExpire:     Date,
    lastLogin:               Date,
  },
  {
    timestamps: true,
  }
);

// ─── Hash password before saving ──────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Compare password ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Generate JWT ─────────────────────────────────────────────
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// ─── Generate email verification token ───────────────────────
userSchema.methods.generateVerificationToken = function () {
  // 32 random bytes → 64-char hex string. Cryptographically secure unlike Math.random().
  const token = randomBytes(32).toString('hex');
  this.emailVerificationToken  = token;
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

// ─── Generate password reset token ───────────────────────────
userSchema.methods.generateResetToken = function () {
  // 32 random bytes → 64-char hex string. Cryptographically secure unlike Math.random().
  const token = randomBytes(32).toString('hex');
  this.resetPasswordToken  = token;
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return token;
};

// Sparse indexes on token fields — queried on every verify/reset request.
// Sparse so null/undefined entries (the common case) are excluded from the index.
userSchema.index({ resetPasswordToken: 1 },       { sparse: true });
userSchema.index({ emailVerificationToken: 1 },   { sparse: true });

export default mongoose.model('User', userSchema);
