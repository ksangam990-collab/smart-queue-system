// frontend/src/pages/customer/CustomerDashboard.jsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Zap, Star, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/common/Badge';
import MagneticButton from '../../components/home/MagneticButton';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const statusVariant = {
  completed: 'success',
  confirmed: 'info',
  pending:   'warning',
  cancelled: 'danger',
};

const CustomerDashboard = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveQueue, setLiveQueue] = useState(null); // { token, position, currentToken, estimatedWait }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/appointments/my?limit=50');
        const list = data.data || [];
        setAppointments(list);

        // Find the most relevant active appointment (confirmed/pending) to
        // show live queue info for — prefer the soonest upcoming one.
        const active = list
          .filter((a) => ['confirmed', 'pending'].includes(a.status))
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        if (active) {
          try {
            const posRes = await api.get(
              `/queue/position?token=${active.queueToken}&departmentId=${active.department?._id}`
            );
            setLiveQueue({ ...posRes.data.data, token: active.queueToken });
          } catch {
            setLiveQueue(null);
          }
        }
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalBookings = appointments.length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const upcomingCount = appointments.filter((a) =>
    ['confirmed', 'pending'].includes(a.status)
  ).length;

  const recentBookings = [...appointments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #4740e8 0%, #5b5ff5 55%, #3b32cc 100%)',
        }}
      >
        {/* Faint grid, matching the auth brand panel's texture */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Drifting accent glows, echoing the auth brand panel */}
        <motion.div
          className="absolute -top-10 -right-10 w-56 h-56 bg-accent-400/20 rounded-full blur-3xl pointer-events-none"
          animate={{ x: [0, 15, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-16 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"
          animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white">
            Hi, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-primary-100 text-sm mt-1">
            Manage your appointments and track your queue.
          </p>
        </div>
        <MagneticButton className="relative z-10" strength={0.2}>
          <button
            onClick={() => navigate('/book')}
            style={{ backgroundColor: '#ffffff', color: '#4740e8' }}
            className="hover:brightness-95 font-semibold rounded-2xl px-5 py-2.5 text-sm transition-[filter] inline-flex items-center gap-2 shadow-lg shadow-primary-900/20"
          >
            <Plus size={16} /> Book Appointment
          </button>
        </MagneticButton>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Bookings"   value={loading ? '—' : totalBookings}   icon={Calendar} color="primary" delay={0.0} />
        <StatsCard title="Completed"        value={loading ? '—' : completedCount}  icon={Star}     color="green"   delay={0.1} />
        <StatsCard title="Upcoming"         value={loading ? '—' : upcomingCount}   icon={Clock}    color="blue"    delay={0.2} />
        <StatsCard
          title="Queue Position"
          value={loading ? '—' : liveQueue?.position ? `#${liveQueue.position}` : '—'}
          icon={Zap}
          color="orange"
          delay={0.3}
        />
      </div>

      {/* Live queue + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live queue card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="dash-card overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-primary-500 via-accent-400 to-primary-500" />
          <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Live Queue</h3>
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>

          {liveQueue ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-1">Currently Serving</p>
              <p className="text-3xl font-bold text-primary-500 mb-4">
                {liveQueue.currentToken || '—'}
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-primary-50 rounded-2xl p-4 mb-4"
              >
                <span className="absolute inset-0 rounded-2xl border-2 border-primary-300 animate-pulse-soft pointer-events-none" />
                <p className="text-sm text-slate-500 mb-1">Your Token</p>
                <p className="text-2xl font-bold text-slate-800">{liveQueue.token}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.max((liveQueue.position || 1) - 1, 0)} people ahead
                </p>
              </motion.div>
              <p className="text-sm text-slate-500">
                Est. wait: <span className="font-semibold text-slate-700">~{liveQueue.estimatedWait || 0} mins</span>
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No active queue right now.</p>
            </div>
          )}

          <button
            onClick={() => navigate('/live-queue')}
            className="w-full btn-secondary text-sm mt-2 flex items-center justify-center gap-2"
          >
            View Full Queue <ChevronRight size={14} />
          </button>
          </div>
        </motion.div>

        {/* Recent bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card overflow-hidden lg:col-span-2"
        >
          <div className="h-1 bg-gradient-to-r from-primary-500 via-accent-400 to-primary-500" />
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Recent Bookings</h3>
            <button
              onClick={() => navigate('/my-appointments')}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                {loading ? 'Loading...' : "You haven't booked any appointments yet."}
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Calendar size={18} className="text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{booking.service?.name}</p>
                      <p className="text-xs text-slate-500">
                        {booking.department?.name} ·{' '}
                        {new Date(booking.date).toLocaleDateString('en-IN', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}{' '}
                        · {booking.timeSlot?.start}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                      {booking.queueToken}
                    </span>
                    <Badge variant={statusVariant[booking.status] || 'default'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: 'Book Appointment', icon: Calendar, path: '/book',            color: 'bg-primary-50 text-primary-600' },
          { label: 'My Bookings',      icon: Clock,    path: '/my-appointments', color: 'bg-blue-50 text-blue-600'     },
          { label: 'Live Queue',       icon: Zap,      path: '/live-queue',      color: 'bg-orange-50 text-orange-600' },
          { label: 'Leave Feedback',   icon: Star,     path: '/feedback',        color: 'bg-accent-500/10 text-accent-600' },
        ].map(({ label, icon: Icon, path, color }) => (
          <motion.button
            key={path}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => navigate(path)}
            className="dash-card p-5 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
              <Icon size={22} />
            </div>
            <span className="text-sm font-medium text-slate-700 text-center">{label}</span>
          </motion.button>
        ))}
      </motion.div>

    </div>
  );
};

export default CustomerDashboard;
