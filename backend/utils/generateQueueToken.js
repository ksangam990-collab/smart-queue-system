// backend/utils/generateQueueToken.js

import Queue from "../models/Queue.js";
import Department from "../models/Department.js";

/**
 * Generate Queue Token (Production Safe)
 * Example:
 * Cardiology -> C-001
 * Cardiology -> C-002
 * Neurology  -> N-001
 */
export const generateQueueToken = async (departmentId, date) => {
  // Create today's date range
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get department
  const department = await Department.findById(departmentId);

  if (!department) {
    throw new Error("Department not found");
  }

  const prefix = department.name.charAt(0).toUpperCase();

  // Atomically increment the counter or create it if it doesn't exist
  const queue = await Queue.findOneAndUpdate(
    {
      department: departmentId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    },
    {
      $setOnInsert: {
        department: departmentId,
        date: startOfDay,
        tokenPrefix: prefix,
      },
      $inc: {
        lastIssuedNumber: 1,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );

  const tokenNumber = queue.lastIssuedNumber;

  const token = `${queue.tokenPrefix}-${String(tokenNumber).padStart(3, "0")}`;

  return {
    token,
    tokenNumber,
    queueId: queue._id,
  };
};

/**
 * Generate Available Time Slots
 */
export const generateTimeSlots = (startTime, endTime, durationMinutes) => {
  const slots = [];

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let current = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  while (current + durationMinutes <= end) {
    const startH = Math.floor(current / 60);
    const startM = current % 60;

    const endH = Math.floor((current + durationMinutes) / 60);
    const endM = (current + durationMinutes) % 60;

    const format = (h, m) =>
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    slots.push({
      start: format(startH, startM),
      end: format(endH, endM),
      label: `${format(startH, startM)} - ${format(endH, endM)}`,
    });

    current += durationMinutes;
  }

  return slots;
};
