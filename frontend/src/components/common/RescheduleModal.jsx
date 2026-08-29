// frontend/src/components/common/RescheduleModal.jsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ChevronLeft, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RescheduleModal = ({ appointment, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  // Fetch available slots whenever date changes
  const fetchSlots = useCallback(async (date) => {
    if (!date) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const { data } = await api.get('/appointments/slots', {
        params: { serviceId: appointment.service?._id, date: dateStr },
      });
      // Exclude the current appointment's own slot from "booked" — user can keep same time
      const currentSlotStart = appointment.timeSlot?.start;
      const enhanced = data.data.map((slot) => ({
        ...slot,
        available: slot.available || slot.start === currentSlotStart,
      }));
      setSlots(enhanced);
    } catch {
      toast.error('Could not load available slots');
    } finally {
      setLoadingSlots(false);
    }
  }, [appointment.service?._id, appointment.timeSlot?.start]);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      await api.patch(`/appointments/${appointment._id}/reschedule`, {
        date:     selectedDate.toLocaleDateString('en-CA'),
        timeSlot: { start: selectedSlot.start, end: selectedSlot.end },
      });
      toast.success('Appointment rescheduled successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reschedule failed');
    } finally {
      setSubmitting(false);
    }
  };

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Reschedule Appointment
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {appointment.service?.name} · {appointment.department?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ── Current booking info ──────────────────────────────── */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-3 text-sm">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: (appointment.department?.color || '#6366f1') + '20' }}
            >
              {appointment.department?.icon || '🏥'}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Currently booked</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(appointment.date).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
                {' · '}
                {appointment.timeSlot?.start} – {appointment.timeSlot?.end}
              </p>
            </div>
          </div>

          {/* ── Step 1: Pick date ─────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">1</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar size={14} /> Pick a new date
              </p>
            </div>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={new Date()}
              inline
              calendarClassName="!border-0 !shadow-none !font-sans w-full"
              renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                <div className="flex items-center justify-between px-2 py-1">
                  <button onClick={decreaseMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ChevronLeft size={16} className="text-slate-500" />
                  </button>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={increaseMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ChevronRight size={16} className="text-slate-500" />
                  </button>
                </div>
              )}
            />
          </div>

          {/* ── Step 2: Pick time slot ────────────────────────────── */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock size={14} /> Pick a time slot
                  {!loadingSlots && availableCount > 0 && (
                    <span className="text-xs text-slate-400 font-normal">
                      ({availableCount} available)
                    </span>
                  )}
                </p>
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No slots available — department may be closed this day
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`relative py-2.5 px-2 rounded-xl text-xs font-medium transition-all
                        ${!slot.available
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed line-through'
                          : selectedSlot?.start === slot.start
                            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30 scale-105'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-500/10'
                        }`}
                    >
                      {slot.start}
                      {selectedSlot?.start === slot.start && (
                        <CheckCircle2 size={10} className="absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Submit ───────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedSlot || submitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Rescheduling…
                </>
              ) : (
                <>
                  <Calendar size={14} />
                  Confirm Reschedule
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RescheduleModal;
