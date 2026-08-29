// frontend/src/pages/customer/MyAppointments.jsx

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, X, RefreshCw, Zap,
  Search, SlidersHorizontal, ChevronDown, QrCode, Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import { AppointmentsSkeleton } from '../../components/common/Skeleton';
import MagneticButton from '../../components/home/MagneticButton';
import QRCode from 'react-qr-code';
import RescheduleModal from '../../components/common/RescheduleModal';

// ── Constants ─────────────────────────────────────────────────
const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
const SORT_OPTIONS   = [
  { label: 'Newest first',  value: 'date-desc' },
  { label: 'Oldest first',  value: 'date-asc'  },
  { label: 'By department', value: 'dept'       },
];

const statusVariant = {
  completed: 'success',
  confirmed: 'info',
  pending:   'warning',
  cancelled: 'danger',
  'no-show': 'danger',
};

// Download QR as PNG
const downloadQR = (ref) => {
  const svg = document.getElementById(`qr-${ref}`);
  if (!svg) return;
  const data   = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 200;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.drawImage(img, 0, 0, 200, 200);
    const a = document.createElement('a');
    a.download = `slotly-${ref}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
};

// ── Component ─────────────────────────────────────────────────
const MyAppointments = () => {
  const navigate = useNavigate();

  // Remote data
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Filters (all client-side except statusFilter which hits the API)
  const [statusFilter, setStatusFilter]   = useState('all');
  const [searchQuery,  setSearchQuery]    = useState('');
  const [dateFrom,     setDateFrom]       = useState('');
  const [dateTo,       setDateTo]         = useState('');
  const [sortBy,       setSortBy]         = useState('date-desc');
  const [showFilters,  setShowFilters]    = useState(false);

  // Modal states
  const [cancelId,      setCancelId]      = useState(null);
  const [showQR,        setShowQR]        = useState(null);
  const [cancelling,    setCancelling]    = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/appointments/my${params}`);
      setAppointments(data.data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [statusFilter]);

  // ── Client-side filter + sort ──────────────────────────────
  const filtered = useMemo(() => {
    let list = [...appointments];

    // Text search — matches service, department, token, ref
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        a.service?.name?.toLowerCase().includes(q) ||
        a.department?.name?.toLowerCase().includes(q) ||
        a.queueToken?.toLowerCase().includes(q) ||
        a.bookingReference?.toLowerCase().includes(q)
      );
    }

    // Date range
    if (dateFrom) {
      list = list.filter((a) => new Date(a.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      list = list.filter((a) => new Date(a.date) <= new Date(dateTo + 'T23:59:59'));
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'date-asc')  return new Date(a.date) - new Date(b.date);
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'dept')
        return (a.department?.name || '').localeCompare(b.department?.name || '');
      return 0;
    });

    return list;
  }, [appointments, searchQuery, dateFrom, dateTo, sortBy]);

  const hasActiveFilters = searchQuery || dateFrom || dateTo || sortBy !== 'date-desc';

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setSortBy('date-desc');
  };

  // ── Cancel ────────────────────────────────────────────────
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/appointments/${cancelId}/cancel`, { reason: 'Cancelled by user' });
      toast.success('Appointment cancelled');
      setCancelId(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Appointments</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {loading ? 'Loading…' : `${filtered.length} appointment${filtered.length !== 1 ? 's' : ''}${filtered.length !== appointments.length ? ` of ${appointments.length}` : ''}`}
          </p>
        </div>
        <MagneticButton strength={0.15}>
          <button onClick={() => navigate('/book')} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
            <Calendar size={16} /> Book New
          </button>
        </MagneticButton>
      </div>

      {/* ── Search + filter bar ────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by service, department, or token…"
              className="form-input pl-9 pr-9 w-full text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || (dateFrom || dateTo || sortBy !== 'date-desc')
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            )}
          </button>
        </div>

        {/* Expandable filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                {/* Date from */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    From date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="form-input text-sm w-full"
                  />
                </div>

                {/* Date to */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    To date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="form-input text-sm w-full"
                  />
                </div>

                {/* Sort */}
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Sort by
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-input text-sm w-full appearance-none pr-8"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status filter tabs */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="flex gap-2 flex-wrap"
        >
          {STATUS_FILTERS.map((s) => (
            <motion.button
              key={s}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors duration-200 ${
                statusFilter === s
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* ── Appointments list ───────────────────────────────── */}
      {loading ? (
        <AppointmentsSkeleton />
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="dash-card p-16 text-center"
        >
          <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
            {hasActiveFilters ? 'No results found' : 'No appointments found'}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters'
              : statusFilter === 'all'
                ? "You haven't booked any appointments yet"
                : `No ${statusFilter} appointments`}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="btn-secondary">
              Clear filters
            </button>
          ) : (
            <MagneticButton strength={0.15}>
              <button onClick={() => navigate('/book')} className="btn-primary">
                Book Appointment
              </button>
            </MagneticButton>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt, i) => (
            <motion.div
              key={apt._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="dash-card p-5 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Left */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: (apt.department?.color || '#6366f1') + '20' }}
                  >
                    {apt.department?.icon || '🏥'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                        {apt.service?.name}
                      </h3>
                      <Badge variant={statusVariant[apt.status]}>{apt.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {apt.department?.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(apt.date).toLocaleDateString('en-IN', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {apt.timeSlot?.start} – {apt.timeSlot?.end}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex sm:flex-col sm:items-end items-center gap-2 flex-shrink-0">
                  <span className="font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-3 py-1 rounded-xl text-sm">
                    {apt.queueToken}
                  </span>
                  <span className="text-xs text-slate-400">Ref: {apt.bookingReference}</span>
                  {apt.fee > 0 && (
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      ₹{apt.fee}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {['pending', 'confirmed'].includes(apt.status) && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                  <button
                    onClick={() => navigate('/live-queue')}
                    className="flex items-center gap-1.5 text-xs text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 px-3 py-2 rounded-xl transition-all font-medium"
                  >
                    <Zap size={12} /> Track Queue
                  </button>
                  <button
                    onClick={() => setRescheduleApt(apt)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-3 py-2 rounded-xl transition-all font-medium"
                  >
                    <RefreshCw size={12} /> Reschedule
                  </button>
                  <button
                    onClick={() => setShowQR(apt)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-xl transition-all font-medium"
                  >
                    <QrCode size={12} /> QR Code
                  </button>
                  <button
                    onClick={() => setCancelId(apt._id)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-2 rounded-xl transition-all font-medium"
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Reschedule modal ────────────────────────────────── */}
      <AnimatePresence>
        {rescheduleApt && (
          <RescheduleModal
            appointment={rescheduleApt}
            onClose={() => setRescheduleApt(null)}
            onSuccess={fetchAppointments}
          />
        )}
      </AnimatePresence>

      {/* ── Cancel modal ────────────────────────────────────── */}
      <AnimatePresence>
        {cancelId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setCancelId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <X size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                Cancel Appointment?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                This action cannot be undone. You can always rebook anytime.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setCancelId(null)} className="btn-secondary flex-1">
                  Keep it
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl px-5 py-2.5 transition-all disabled:opacity-60"
                >
                  {cancelling ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={14} className="animate-spin" /> Cancelling…
                    </span>
                  ) : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── QR Code modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQR(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 text-center max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">
                Appointment QR Code
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Show this at the counter for instant check-in
              </p>
              <div className="flex justify-center mb-3">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <QRCode
                    id={`qr-${showQR.bookingReference}`}
                    value={JSON.stringify({
                      ref:   showQR.bookingReference,
                      token: showQR.queueToken,
                      dept:  showQR.department?.name,
                      time:  showQR.timeSlot?.start,
                    })}
                    size={160}
                    level="M"
                  />
                </div>
              </div>
              <p className="font-mono font-bold text-xl text-primary-600 dark:text-primary-400 mb-1">
                {showQR.queueToken}
              </p>
              <p className="text-xs text-slate-400 mb-5">
                Ref: {showQR.bookingReference}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowQR(null)} className="btn-secondary flex-1">
                  Close
                </button>
                <button
                  onClick={() => downloadQR(showQR.bookingReference)}
                  className="btn-primary flex-1 flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyAppointments;
