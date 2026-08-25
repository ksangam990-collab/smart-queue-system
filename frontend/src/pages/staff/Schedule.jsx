// frontend/src/pages/staff/Schedule.jsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Settings, Save,
  CalendarOff, User, Stethoscope,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { QueuePanelSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_SHORT    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const statusVariant = {
  completed: 'success',
  confirmed: 'info',
  pending:   'warning',
  cancelled: 'danger',
  'no-show': 'danger',
};

// Produces a local YYYY-MM-DD string without timezone drift
const toLocalISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const Schedule = () => {
  const [appointments, setAppointments]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [savingAvail, setSavingAvail]     = useState(false);
  const [showSettings, setShowSettings]   = useState(false);
  const [activeTab, setActiveTab]         = useState('today'); // 'today' | 'availability'

  // Availability state
  const [workingDays, setWorkingDays] = useState(['Monday','Tuesday','Wednesday','Thursday','Friday']);
  const [offDates, setOffDates]       = useState([]); // string[]
  const [calMonth, setCalMonth]       = useState(new Date());

  // ── Fetch today's appointments ─────────────────────────────
  const fetchToday = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments/today');
      setAppointments(data.data);
    } catch {
      toast.error('Could not load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch availability ─────────────────────────────────────
  const fetchAvailability = useCallback(async () => {
    try {
      const { data } = await api.get('/users/availability');
      if (data.data?.workingDays) setWorkingDays(data.data.workingDays);
      if (data.data?.offDates)    setOffDates(data.data.offDates);
    } catch {
      // use defaults
    }
  }, []);

  useEffect(() => {
    fetchToday();
    fetchAvailability();
  }, [fetchToday, fetchAvailability]);

  // ── Toggle a working day ───────────────────────────────────
  const toggleDay = (day) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // ── Toggle an off-date on the mini calendar ────────────────
  const toggleOffDate = (dateStr) => {
    setOffDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  // ── Save availability ──────────────────────────────────────
  const saveAvailability = async () => {
    setSavingAvail(true);
    try {
      await api.put('/users/availability', { workingDays, offDates });
      toast.success('Availability saved!');
    } catch {
      toast.error('Failed to save availability');
    } finally {
      setSavingAvail(false);
    }
  };

  // ── Calendar helpers ───────────────────────────────────────
  const calYear  = calMonth.getFullYear();
  const calMonthIdx = calMonth.getMonth();
  const firstDay = new Date(calYear, calMonthIdx, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();
  // shift so week starts Monday
  const offset = (firstDay + 6) % 7;
  const today  = toLocalISO(new Date());

  const prevMonth = () => setCalMonth(new Date(calYear, calMonthIdx - 1, 1));
  const nextMonth = () => setCalMonth(new Date(calYear, calMonthIdx + 1, 1));

  const monthLabel = calMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Get the day-name for a calendar date
  const getDayName = (day) => {
    const d = new Date(calYear, calMonthIdx, day);
    return DAYS_OF_WEEK[(d.getDay() + 6) % 7]; // shift to Mon=0
  };

  const isNonWorkingDay = (day) => !workingDays.includes(getDayName(day));

  const isPast = (day) => {
    const d = new Date(calYear, calMonthIdx, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Schedule</h2>
          <p className="text-slate-500 text-sm mt-1">Today's appointments & availability settings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('today'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'today'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                : 'btn-secondary'
            }`}
          >
            <Calendar size={15} /> Today
          </button>
          <button
            onClick={() => { setActiveTab('availability'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'availability'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                : 'btn-secondary'
            }`}
          >
            <Settings size={15} /> Availability
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── TODAY'S APPOINTMENTS TAB ─────────────────────── */}
        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <QueuePanelSkeleton />
            ) : appointments.length === 0 ? (
              <div className="dash-card p-16 text-center">
                <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No appointments today</h3>
                <p className="text-slate-400 text-sm">Your schedule is clear for today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Summary chips */}
                <div className="flex flex-wrap gap-2">
                  {['confirmed','completed','cancelled','no-show'].map((s) => {
                    const count = appointments.filter((a) => a.status === s).length;
                    if (!count) return null;
                    return (
                      <span key={s} className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        s === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                        s === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-red-50 text-red-500'
                      }`}>
                        {count} {s}
                      </span>
                    );
                  })}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {appointments.length} total
                  </span>
                </div>

                {/* Appointment cards */}
                {appointments.map((apt, i) => (
                  <motion.div
                    key={apt._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="dash-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    {/* Token */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-50 flex flex-col items-center justify-center">
                      <span className="font-mono font-bold text-primary-600 text-sm leading-tight">
                        {apt.queueToken}
                      </span>
                      <span className="text-[10px] text-primary-400">token</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-800 text-sm">
                          <User size={13} className="text-slate-400" /> {apt.user?.name}
                        </span>
                        <Badge variant={statusVariant[apt.status]}>{apt.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <Stethoscope size={11} /> {apt.service?.name}
                        {apt.user?.phone && <> · 📞 {apt.user.phone}</>}
                      </p>
                    </div>

                    {/* Time */}
                    <div className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
                      <Clock size={14} className="text-slate-400" />
                      {apt.timeSlot?.start}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── AVAILABILITY TAB ──────────────────────────────── */}
        {activeTab === 'availability' && (
          <motion.div
            key="availability"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >

            {/* Working Days */}
            <div className="dash-card p-5">
              <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <CheckCircle size={16} className="text-accent-500" /> Working Days
              </h3>
              <p className="text-xs text-slate-400 mb-4">Toggle the days you are available for appointments.</p>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 transition-all text-xs font-semibold ${
                      workingDays.includes(day)
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span>{DAY_SHORT[i]}</span>
                    {workingDays.includes(day)
                      ? <CheckCircle size={12} className="mt-1 text-primary-500" />
                      : <XCircle    size={12} className="mt-1 text-slate-300" />
                    }
                  </button>
                ))}
              </div>
            </div>

            {/* Off Dates calendar */}
            <div className="dash-card p-5">
              <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <CalendarOff size={16} className="text-rose-400" /> Mark Days Off
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Tap a date to mark it as an off-day (leave, holiday, etc.).
                {offDates.length > 0 && (
                  <span className="ml-2 text-rose-500 font-semibold">
                    {offDates.length} day{offDates.length > 1 ? 's' : ''} off
                  </span>
                )}
              </p>

              {/* Month nav */}
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-slate-700">{monthLabel}</span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_SHORT.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dateStr = `${calYear}-${String(calMonthIdx + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const isOff      = offDates.includes(dateStr);
                  const nonWorking = isNonWorkingDay(day);
                  const past       = isPast(day);
                  const isToday    = dateStr === today;

                  return (
                    <button
                      key={day}
                      onClick={() => !past && !nonWorking && toggleOffDate(dateStr)}
                      disabled={past || nonWorking}
                      className={`
                        aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center
                        ${isToday    ? 'ring-2 ring-primary-400 ring-offset-1' : ''}
                        ${nonWorking ? 'bg-slate-50 text-slate-200 cursor-not-allowed' : ''}
                        ${past && !nonWorking ? 'text-slate-300 cursor-not-allowed' : ''}
                        ${isOff      ? 'bg-rose-100 text-rose-500 font-bold' : ''}
                        ${!isOff && !nonWorking && !past ? 'hover:bg-primary-50 hover:text-primary-600 text-slate-700' : ''}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Off dates list */}
              {offDates.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {offDates.sort().map((d) => (
                    <span key={d} className="flex items-center gap-1 text-xs bg-rose-50 text-rose-500 px-2 py-1 rounded-lg font-medium">
                      {new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      <button onClick={() => toggleOffDate(d)} className="hover:text-rose-700 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                onClick={saveAvailability}
                disabled={savingAvail}
                className="btn-primary flex items-center gap-2 min-w-[130px] justify-center"
              >
                {savingAvail ? <Spinner size="sm" /> : <Save size={15} />}
                {savingAvail ? 'Saving…' : 'Save Availability'}
              </button>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Schedule;
