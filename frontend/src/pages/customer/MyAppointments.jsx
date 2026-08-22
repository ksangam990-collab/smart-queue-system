// frontend/src/pages/customer/MyAppointments.jsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, X, RefreshCw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import MagneticButton from '../../components/home/MagneticButton';
import QRCode from 'react-qr-code';

const statusVariant = {
  completed: 'success',
  confirmed: 'info',
  pending:   'warning',
  cancelled: 'danger',
  'no-show': 'danger',
};

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelId, setCancelId]         = useState(null);
  const [showQR, setShowQR]             = useState(null);
  const [cancelling, setCancelling]     = useState(false);

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

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/appointments/${cancelId}/cancel`, {
        reason: 'Cancelled by user',
      });
      toast.success('Appointment cancelled');
      setCancelId(null);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Appointments</h2>
          <p className="text-slate-500 text-sm mt-1">
            View and manage all your bookings
          </p>
        </div>
        <MagneticButton strength={0.15}>
          <button
            onClick={() => navigate('/book')}
            className="btn-primary flex items-center gap-2"
          >
            <Calendar size={16} /> Book New
          </button>
        </MagneticButton>
      </div>

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
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
            }`}
          >
            {s}
          </motion.button>
        ))}
      </motion.div>

      {/* Appointments list */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <div className="dash-card p-16 text-center">
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No appointments found</h3>
          <p className="text-slate-400 text-sm mb-6">
            {statusFilter === 'all'
              ? "You haven't booked any appointments yet"
              : `No ${statusFilter} appointments`}
          </p>
          <MagneticButton strength={0.15}>
            <button onClick={() => navigate('/book')} className="btn-primary">
              Book Appointment
            </button>
          </MagneticButton>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt, i) => (
            <motion.div
              key={apt._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              transition={{ delay: i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="dash-card p-5 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: apt.department?.color + '20' || '#6366f120' }}
                  >
                    {apt.department?.icon || '🏥'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{apt.service?.name}</h3>
                      <Badge variant={statusVariant[apt.status]}>{apt.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">{apt.department?.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(apt.date).toLocaleDateString('en-IN', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
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
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-xl text-sm">
                    {apt.queueToken}
                  </span>
                  <span className="text-xs text-slate-400">
                    Ref: {apt.bookingReference}
                  </span>
                  {apt.fee > 0 && (
                    <span className="text-xs font-semibold text-slate-600">
                      ₹{apt.fee}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {['pending', 'confirmed'].includes(apt.status) && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate('/live-queue')}
                    className="flex items-center gap-1.5 text-xs text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-xl transition-all font-medium"
                  >
                    <Zap size={12} /> Track Queue
                  </button>
                  <button
                    onClick={() => setShowQR(apt)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all font-medium"
                  >
                    QR Code
                  </button>
                  <button
                    onClick={() => setCancelId(apt._id)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-all font-medium"
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Cancel Appointment?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelId(null)}
                className="btn-secondary flex-1"
              >
                Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl px-5 py-2.5 transition-all"
              >
                {cancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin" /> Cancelling...
                  </span>
                ) : 'Yes, Cancel'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* QR Code modal */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQR(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-white rounded-3xl p-8 text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <QRCode value={showQR.bookingReference} size={200} />
            </div>
            <p className="mt-4 font-mono font-bold text-lg text-slate-800">
              {showQR.queueToken}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Ref: {showQR.bookingReference}
            </p>
            <button
              onClick={() => setShowQR(null)}
              className="btn-secondary w-full"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MyAppointments;
