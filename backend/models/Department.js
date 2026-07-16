// backend/models/Department.js

import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      default: '🏢', // Emoji icon for the department card in UI
    },
    color: {
      type: String,
      default: '#6366f1', // Accent color for department cards
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalAppointments: {
      type: Number,
      default: 0,
    },
    // Working hours for this department
    workingHours: {
      start: { type: String, default: '09:00' },
      end:   { type: String, default: '17:00' },
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: get all services that belong to this department
departmentSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'department',
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;