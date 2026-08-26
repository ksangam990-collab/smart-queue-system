// backend/models/Notification.js

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: [
        'appointment_confirmed',
        'appointment_cancelled',
        'appointment_reminder',
        'queue_called',
        'queue_alert',    // "your turn is coming" proximity alert (2–3 positions away)
        'queue_update',
        'general',
      ],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Link to open when notification is clicked in the UI
    link: {
      type: String,
      default: '/dashboard',
    },
    // Optional reference to the related appointment
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
  },
  { timestamps: true }
);

// Index for fetching notifications for a user, newest first
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
