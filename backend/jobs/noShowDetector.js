// backend/jobs/noShowDetector.js
//
// Runs every 15 minutes and marks appointments as 'no-show' when:
//   - Status is still 'pending' or 'confirmed'
//   - The appointment is today
//   - The time slot END time has passed + 15-min grace period
//
// Also exported as detectNoShowsNow() for the admin manual trigger route.

import cron        from 'node-cron';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import Queue       from '../models/Queue.js';

const GRACE_MINUTES = 15;

// Parse "HH:MM" slot string into a real Date (today, IST)
const parseISTSlotTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const istDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  // Build UTC equivalent of IST time
  const d = new Date(`${istDateStr}T00:00:00+05:30`);
  d.setHours(d.getHours() + hours);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};

// Core detection logic — returns count of no-shows marked
export const detectNoShowsNow = async () => {
  const now        = new Date();
  const istDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const startOfDay = new Date(`${istDateStr}T00:00:00+05:30`);
  const endOfDay   = new Date(`${istDateStr}T23:59:59+05:30`);

  const appointments = await Appointment.find({
    status: { $in: ['pending', 'confirmed'] },
    date:   { $gte: startOfDay, $lte: endOfDay },
  }).populate('user', 'name _id');

  if (!appointments.length) return 0;

  const noShows = appointments.filter((apt) => {
    if (!apt.timeSlot?.end) return false;
    const deadline = new Date(
      parseISTSlotTime(apt.timeSlot.end).getTime() + GRACE_MINUTES * 60_000
    );
    return now > deadline;
  });

  if (!noShows.length) return 0;

  console.log(`[noShowDetector] Marking ${noShows.length} appointment(s) as no-show`);

  await Promise.all(
    noShows.map(async (apt) => {
      // Mark as no-show
      apt.status = 'no-show';
      await apt.save();

      // Remove from queue waiting list
      await Queue.updateOne(
        { department: apt.department, date: apt.date },
        { $pull: { waitingList: { appointment: apt._id } } }
      ).catch(() => {});

      // In-app notification
      if (apt.user?._id) {
        await Notification.create({
          recipient: apt.user._id,
          title:     '⚠️ Marked as No-Show',
          message:   `Your ${apt.timeSlot.start} appointment was marked as no-show — you didn't check in within the ${GRACE_MINUTES}-minute grace period. You can book a new slot anytime.`,
          type:      'general',
          link:      '/my-appointments',
        }).catch((err) =>
          console.error(`[noShowDetector] Notification failed:`, err.message)
        );
      }
    })
  );

  console.log(`[noShowDetector] ✅ Done — ${noShows.length} no-show(s) recorded`);
  return noShows.length;
};

// ── Scheduler ─────────────────────────────────────────────────
export const startNoShowDetector = () => {
  // Run once immediately on startup to catch any from overnight
  detectNoShowsNow().catch((err) =>
    console.error('[noShowDetector] Startup run failed:', err.message)
  );

  // Then every 15 minutes, IST timezone
  cron.schedule('*/15 * * * *', () => {
    detectNoShowsNow().catch((err) =>
      console.error('[noShowDetector] Scheduled run failed:', err.message)
    );
  }, { timezone: 'Asia/Kolkata' });

  console.log('[noShowDetector] ✅ Scheduled — runs every 15 min (IST)');
};
