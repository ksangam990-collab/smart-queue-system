// backend/utils/bookingValidation.js
//
// Server-side validation for booking / rescheduling. The frontend only ever
// offers valid slots, but the API must not trust that — otherwise anyone with
// a token can book past dates, closed days, or made-up time slots.

import { generateTimeSlots } from './generateQueueToken.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ADVANCE_DAYS = 90;
const TZ = 'Asia/Kolkata';

const istToday = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const istNowHM = () =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date());

/**
 * @param {{ service: object, date: any, timeSlot: any }} args
 *   service must have `department` populated.
 * @returns {{ ok: true, date: Date, slot: {start:string,end:string} } | { ok: false, message: string }}
 */
export const validateSlotRequest = ({ service, date, timeSlot }) => {
  const fail = (message) => ({ ok: false, message });

  if (typeof date !== 'string' || !DATE_RE.test(date)) {
    return fail('Invalid date. Use the format YYYY-MM-DD.');
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (isNaN(parsed) || parsed.toISOString().slice(0, 10) !== date) {
    return fail('Invalid date.');
  }

  const today = istToday();
  if (date < today) return fail('You cannot book an appointment in the past.');

  const limit = new Date(`${today}T00:00:00Z`);
  limit.setUTCDate(limit.getUTCDate() + MAX_ADVANCE_DAYS);
  if (parsed > limit) {
    return fail(`Appointments can only be booked up to ${MAX_ADVANCE_DAYS} days in advance.`);
  }

  const dept = service?.department;
  if (!dept || dept.isActive === false) {
    return fail('This department is not currently accepting appointments.');
  }

  const dayName = parsed.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  if (!dept.workingDays.includes(dayName)) {
    return fail(`${dept.name} is closed on ${dayName}.`);
  }

  // The slot must be one the server would itself have offered.
  const valid = generateTimeSlots(
    dept.workingHours.start,
    dept.workingHours.end,
    service.duration
  ).find((s) => s.start === timeSlot?.start && s.end === timeSlot?.end);

  if (!valid) return fail('Invalid time slot for this service.');

  if (date === today && valid.start <= istNowHM()) {
    return fail('That time slot has already started. Please choose a later one.');
  }

  return { ok: true, date: parsed, slot: { start: valid.start, end: valid.end } };
};
