import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateTimeSlots } from '../utils/generateQueueToken.js';
import { validateSlotRequest } from '../utils/bookingValidation.js';

describe('Booking & Slot Validation Suite', () => {
  describe('generateTimeSlots', () => {
    it('should generate correct non-overlapping discrete time slots', () => {
      const slots = generateTimeSlots('09:00', '11:00', 30);
      assert.equal(slots.length, 4);
      assert.deepEqual(slots[0], { start: '09:00', end: '09:30', label: '09:00 - 09:30' });
      assert.deepEqual(slots[1], { start: '09:30', end: '10:00', label: '09:30 - 10:00' });
      assert.deepEqual(slots[2], { start: '10:00', end: '10:30', label: '10:00 - 10:30' });
      assert.deepEqual(slots[3], { start: '10:30', end: '11:00', label: '10:30 - 11:00' });
    });

    it('should omit remaining time if smaller than slot duration', () => {
      const slots = generateTimeSlots('09:00', '10:15', 45);
      assert.equal(slots.length, 1);
      assert.deepEqual(slots[0], { start: '09:00', end: '09:45', label: '09:00 - 09:45' });
    });
  });

  describe('validateSlotRequest', () => {
    const mockDept = {
      name: 'Cardiology',
      isActive: true,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '09:00', end: '17:00' },
    };

    const mockService = {
      name: 'General Consultation',
      duration: 30,
      department: mockDept,
    };

    it('should reject malformed or non-string dates', () => {
      const res1 = validateSlotRequest({ service: mockService, date: 'not-a-date', timeSlot: { start: '09:00', end: '09:30' } });
      assert.equal(res1.ok, false);
      assert.match(res1.message, /Invalid date/i);

      const res2 = validateSlotRequest({ service: mockService, date: '2026-02-31', timeSlot: { start: '09:00', end: '09:30' } });
      assert.equal(res2.ok, false);
      assert.match(res2.message, /Invalid date/i);
    });

    it('should reject dates in the past', () => {
      const res = validateSlotRequest({ service: mockService, date: '2020-01-01', timeSlot: { start: '09:00', end: '09:30' } });
      assert.equal(res.ok, false);
      assert.match(res.message, /past/i);
    });

    it('should reject dates beyond maximum advance booking window (90 days)', () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 120);
      const dateStr = farFuture.toISOString().slice(0, 10);

      const res = validateSlotRequest({ service: mockService, date: dateStr, timeSlot: { start: '09:00', end: '09:30' } });
      assert.equal(res.ok, false);
      assert.match(res.message, /90 days/i);
    });

    it('should reject bookings when department is inactive', () => {
      const inactiveService = {
        ...mockService,
        department: { ...mockDept, isActive: false },
      };
      // Next day
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      const dateStr = nextDay.toISOString().slice(0, 10);

      const res = validateSlotRequest({ service: inactiveService, date: dateStr, timeSlot: { start: '09:00', end: '09:30' } });
      assert.equal(res.ok, false);
      assert.match(res.message, /not currently accepting appointments/i);
    });

    it('should reject time slots that do not align with department schedule', () => {
      // Find a weekday in near future
      const target = new Date();
      target.setDate(target.getDate() + 2);
      while ([0, 6].includes(target.getUTCDay())) {
        target.setDate(target.getDate() + 1);
      }
      const dateStr = target.toISOString().slice(0, 10);

      const res = validateSlotRequest({
        service: mockService,
        date: dateStr,
        timeSlot: { start: '08:15', end: '08:45' }, // before 09:00 opening
      });

      assert.equal(res.ok, false);
      assert.match(res.message, /Invalid time slot/i);
    });

    it('should accept a valid future slot on an active department working day', () => {
      const target = new Date();
      target.setDate(target.getDate() + 2);
      while ([0, 6].includes(target.getUTCDay())) {
        target.setDate(target.getDate() + 1);
      }
      const dateStr = target.toISOString().slice(0, 10);

      const res = validateSlotRequest({
        service: mockService,
        date: dateStr,
        timeSlot: { start: '10:00', end: '10:30' },
      });

      assert.equal(res.ok, true);
      assert.equal(res.slot.start, '10:00');
      assert.equal(res.slot.end, '10:30');
    });
  });
});
