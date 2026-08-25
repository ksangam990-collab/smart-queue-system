// frontend/src/pages/customer/LiveQueue.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import api from '../../services/api';
import socket from '../../services/socket';
import Spinner from '../../components/common/Spinner';
import { CardItemSkeleton } from '../../components/common/Skeleton';
import MagneticButton from '../../components/home/MagneticButton';

const LiveQueue = () => {
  const [appointments, setAppointments] = useState([]);
  const [queueData, setQueueData]       = useState({});
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [connected, setConnected]       = useState(false);
  const joinedRoomsRef                  = useRef(new Set());

  // ── Fetch appointments from API ────────────────────────────
  const fetchActiveAppointments = useCallback(async () => {
    try {
      const { data } = await api.get('/appointments/my?status=confirmed');
      return data.data || [];
    } catch {
      return [];
    }
  }, []);

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
    return positions;
  }, []);

  const loadAll = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const apts      = await fetchActiveAppointments();
      const positions = await fetchQueuePositions(apts);
      setAppointments(apts);
      setQueueData(positions);
      setLastUpdated(new Date());

      // Join socket rooms for each department
      apts.forEach((apt) => {
        const deptId = apt.department?._id;
        if (deptId && !joinedRoomsRef.current.has(deptId)) {
          socket.emit('join_queue_room', { departmentId: deptId });
          joinedRoomsRef.current.add(deptId);
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchActiveAppointments, fetchQueuePositions]);

  // ── Socket.io setup ────────────────────────────────────────
  useEffect(() => {
    socket.connect();

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // When server emits a queue update, refresh positions for all appointments
    socket.on('queue_updated', (payload) => {
      setLastUpdated(new Date());
      // Re-fetch positions silently (payload has currentToken / waitingCount
      // but we need full position data per appointment)
      setRefreshing(true);
      fetchActiveAppointments()
        .then((apts) => fetchQueuePositions(apts).then((positions) => {
          setAppointments(apts);
          setQueueData(positions);
        }))
        .finally(() => setRefreshing(false));
    });

    // Initial load
    loadAll();

    return () => {
      // Leave all joined rooms on unmount
      joinedRoomsRef.current.forEach((deptId) => {
        socket.emit('leave_queue_room', { departmentId: deptId });
      });
      joinedRoomsRef.current.clear();
      socket.off('connect');
      socket.off('disconnect');
      socket.off('queue_updated');
      socket.disconnect();
    };
  }, [loadAll, fetchActiveAppointments, fetchQueuePositions]);

  // ── Helpers ────────────────────────────────────────────────
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Live Queue</h2>
          <p className="text-slate-500 text-sm mt-1">Track your real-time queue position</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
            connected
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-slate-100 text-slate-400'
          }`}>
            {connected
              ? <><Wifi size={12} /> Live</>
              : <><WifiOff size={12} /> Connecting…</>
            }
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
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-xs text-slate-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
          {connected ? ' · Updates instantly via live connection' : ' · Reconnecting…'}
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-5">{Array.from({length:2}).map((_,i)=><CardItemSkeleton key={i}/>)}</div>
      ) : appointments.length === 0 ? (
        <div className="dash-card p-16 text-center">
          <Zap size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No active appointments</h3>
          <p className="text-slate-400 text-sm mb-6">You have no confirmed appointments today to track.</p>
          <MagneticButton className="inline-block" strength={0.15}>
            <a href="/book" className="btn-primary inline-flex">Book Appointment</a>
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
                {/* Alert banner */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`px-6 py-3 border-b text-sm font-medium flex items-center gap-2 ${getStatusColor(status)} ${
                        status === 'called' ? 'animate-pulse-soft' : ''
                      }`}
                    >
                      {status === 'called' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-6">
                  {/* Appointment info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: apt.department?.color + '20' || '#6366f120' }}
                      >
                        {apt.department?.icon || '🏥'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">{apt.service?.name}</h3>
                        <p className="text-sm text-slate-500 truncate">{apt.department?.name}</p>
                        <p className="text-xs text-slate-400">{apt.timeSlot?.start} – {apt.timeSlot?.end}</p>
                      </div>
                    </div>
                    <div className="sm:text-right flex-shrink-0">
                      <p className="text-xs text-slate-400 mb-1">Your Token</p>
                      <span className="font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl text-lg">
                        {apt.queueToken}
                      </span>
                    </div>
                  </div>

                  {/* Queue stats */}
                  {queue ? (
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 text-center">
                        <p className="text-[11px] sm:text-xs text-slate-500 mb-1">Now Serving</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-800 font-mono">
                          {queue.currentToken || '—'}
                        </p>
                      </div>
                      <div className="bg-primary-50 rounded-2xl p-3 sm:p-4 text-center border border-primary-100">
                        <p className="text-[11px] sm:text-xs text-primary-600 mb-1">Your Position</p>
                        <motion.p
                          key={queue.position}
                          initial={{ scale: 0.85, opacity: 0.6 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className="text-xl sm:text-2xl font-bold text-primary-600"
                        >
                          #{queue.position || '—'}
                        </motion.p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 text-center">
                        <p className="text-[11px] sm:text-xs text-slate-500 mb-1">Est. Wait</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-800">
                          {queue.estimatedWait > 0 ? `${queue.estimatedWait}m` : '—'}
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
            This page updates <strong>instantly</strong> via a live connection — no need to refresh
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Please arrive 10 minutes before your slot time
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            You'll get a notification and email when your turn is coming
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
