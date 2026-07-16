// backend/models/Queue.js

import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // The token currently being served (e.g. "A-012")
    currentToken: {
      type: String,
      default: null,
    },
    currentNumber: {
      type: Number,
      default: 0,
    },
    // Counter for generating next token number
    lastIssuedNumber: {
      type: Number,
      default: 0,
    },
    // Prefix letter for tokens (A for Cardiology, B for Dentist, etc.)
    tokenPrefix: {
      type: String,
      default: 'A',
    },
    totalServed: {
      type: Number,
      default: 0,
    },
    totalSkipped: {
      type: Number,
      default: 0,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    // List of waiting appointments in order
    waitingList: [
      {
        appointment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Appointment',
        },
        token: String,
        tokenNumber: Number,
        status: {
          type: String,
          enum: ['waiting', 'called', 'serving', 'done', 'skipped'],
          default: 'waiting',
        },
        calledAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Compound index — one queue document per department per day
queueSchema.index({ department: 1, date: 1 }, { unique: true });

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;