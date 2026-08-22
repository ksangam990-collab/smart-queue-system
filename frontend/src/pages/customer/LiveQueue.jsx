// frontend/src/pages/customer/LiveQueue.jsx

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import MagneticButton from '../../components/home/MagneticButton';

const LiveQueue = () => {
  const [appointments, setAppointments] = useState([]);
  const [queueData, setQueueData]       = useState({});
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(null);

  // Fetch customer's active appointments
  const fetchActiveAppointments = useCallback(async () => {
    try {
      const { data } = await api.get('/appointments/my?status=confirmed');
      setAppointments(data.data || []);
      return data.data || [];
    } catch {
      return [];
    }
  }, []);

  // Fetch queue position for each appointment
  const fetchQueuePositions = useCallback(async (apts) => {
    const positions = {};
    await Promise.all(
      apts.map(async (apt) => {
        try {
          const { data } = await api.get(
            `/queue/position?token=${apt.queueToken}&departmentId=${apt.department?._id}`
          );
          positions[apt._id] = data.data;
        } catch {
          positions[apt._id] = null;
        }
      })
    );
    setQueueData(positions);
  }, []);

  const loadAll = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const apts = await fetchActiveAppointments();
      await fetchQueuePositions(apts);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchActiveAppointments, fetchQueuePositions]);

  useEffect(() => {
    loadAll();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadAll(true), 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const getStatusColor = (status) => {
    if (status === 'called')  return 'text-green-600 bg-green-50 border-green-200';
    if (status === 'serving') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (status === 'waiting') return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getStatusMessage = (status) => {
    if (status === 'called')  return '🔔 Your token is being called! Please proceed to the counter.';
    if (status === 'serving') return '✅ You are currently being served.';
    if (status === 'done')    return '✅ Your appointment is complete.';
    if (status === 'skipped') return '⚠️ Your token was skipped. Please contact the counter.';
    return null;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Live Queue</h2>
          <p className="text-slate-500 text-sm mt-1">
            Track your real-time queue position
          </p>
        </div>
        <MagneticButton strength={0.15}>
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </MagneticButton>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-xs text-slate-400">
          Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 30s
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <div className="dash-card p-16 text-center">
          <Zap size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            No active appointments
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            You have no confirmed appointments today to track.
          </p>
          <MagneticButton className="inline-block" strength={0.15}>
            <a href="/book" className="btn-primary inline-flex">
              Book Appointment
            </a>
          </MagneticButton>
        </div>
      ) : (
        <div className="space-y-5">
          {appointments.map((apt, idx) => {
            const queue   = queueData[apt._id];
            const status  = queue?.status || 'waiting';
            const message = getStatusMessage(status);

            return (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="dash-card overflow-hidden"
              >
                {/* Alert message */}
                {message && (
                  <div
                    className={`relative px-6 py-3 border-b text-sm font-medium flex items-center gap-2 ${getStatusColor(status)} ${
                      status === 'called' ? 'animate-pulse-soft' : ''
                    }`}
                  >
                    {status === 'called'
                      ? <AlertCircle size={16} />
                      : <CheckCircle size={16} />
                    }
                    {message}
                  </div>
                )}

                <div className="p-6">
                  {/* Appointment info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: apt.department?.color + '20' || '#6366f120' }}
                      >
                        {apt.department?.icon || '🏥'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{apt.service?.name}</h3>
                        <p className="text-sm text-slate-500">{apt.department?.name}</p>
                        <p className="text-xs text-slate-400">
                          {apt.timeSlot?.start} – {apt.timeSlot?.end}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Your Token</p>
                      <span className="font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl text-lg">
                        {apt.queueToken}
                      </span>
                    </div>
                  </div>

                  {/* Queue stats */}
                  {queue ? (
                    <div className="grid grid-cols-3 gap-4">

                      {/* Current token */}
                      <div className="bg-slate-50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">Now Serving</p>
                        <p className="text-xl font-bold text-slate-800 font-mono">
                          {queue.currentToken || '—'}
                        </p>
                      </div>

                      {/* Position */}
                      <div className="bg-primary-50 rounded-2xl p-4 text-center border border-primary-100">
                        <p className="text-xs text-primary-600 mb-1">Your Position</p>
                        <motion.p
                          key={queue.position}
                          initial={{ scale: 0.85, opacity: 0.6 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className="text-2xl font-bold text-primary-600"
                        >
                          #{queue.position || '—'}
                        </motion.p>
                      </div>

                      {/* Wait time */}
                      <div className="bg-slate-50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">Est. Wait</p>
                        <p className="text-xl font-bold text-slate-800">
                          {queue.estimatedWait > 0
                            ? `${queue.estimatedWait}m`
                            : '—'
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl p-4 text-center text-sm text-slate-400">
                      Queue data not available yet. Check back closer to your appointment time.
                    </div>
                  )}

                  {/* Progress bar */}
                  {queue && queue.position > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{queue.totalServed || 0} served</span>
                        <span>{queue.position - 1} ahead of you</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.max(5, 100 - ((queue.position - 1) / Math.max(queue.position, 1)) * 100)}%`
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info card */}
      <div className="dash-card p-5">
        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
          <Clock size={16} className="text-primary-500" /> Tips
        </h4>
        <ul className="space-y-2 text-xs text-slate-500">
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Page auto-refreshes every 30 seconds
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Please arrive 10 minutes before your slot time
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            You'll get a notification when your token is called
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Estimated wait is approximately 15 minutes per patient
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LiveQueue;
