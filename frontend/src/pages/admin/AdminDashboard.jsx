// frontend/src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import {
  Users, Calendar, CheckCircle, XCircle,
  Building2, TrendingUp, Zap, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import StatsCard   from '../../components/common/StatsCard';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import Badge       from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';

const statusVariant = {
  completed: 'success',
  confirmed: 'info',
  pending:   'warning',
  cancelled: 'danger',
  'no-show': 'danger',
};

const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};

const AdminDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get('/users/stats');
      setStats(data.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Greeting based on IST hour
  const hour = new Date().toLocaleString('en-IN', {
    hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata',
  });
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <p className="text-slate-500 dark:text-slate-400">Failed to load dashboard data.</p>
        <button onClick={fetchStats} className="btn-primary flex items-center gap-2">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const weeklyData       = stats?.weeklyData       || [];
  const userGrowthData   = stats?.userGrowthData   || [];
  const recentAppointments = stats?.recentAppointments || [];

  return (
    <div className="space-y-6">

      {/* ── Welcome header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Here's what's happening at Slotly today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium">
            <Zap size={16} />
            Live Dashboard
          </div>
        </div>
      </motion.div>

      {/* ── Stats cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Users"      value={stats?.totalUsers         ?? '—'} icon={Users}      color="primary" delay={0.0} />
        <StatsCard title="Today's Bookings" value={stats?.todayAppointments  ?? '—'} icon={Calendar}   color="blue"    delay={0.1} />
        <StatsCard title="Completed Today"  value={stats?.completedToday     ?? '—'} icon={CheckCircle} color="green"  delay={0.2} />
        <StatsCard title="Cancelled Today"  value={stats?.cancelledToday     ?? '—'} icon={XCircle}    color="red"     delay={0.3} />
        <StatsCard title="This Month"       value={stats?.monthlyAppointments ?? '—'} icon={TrendingUp} color="primary" delay={0.4} />
        <StatsCard title="Departments"      value={stats?.totalDepartments   ?? '—'} icon={Building2}  color="purple"  delay={0.5} />
        <StatsCard title="Total Bookings"   value={stats?.totalAppointments  ?? '—'} icon={TrendingUp} color="primary" delay={0.6} />
        <StatsCard title="Staff Members"    value={stats?.totalStaff         ?? '—'} icon={Users}      color="blue"    delay={0.7} />
      </div>

      {/* ── Charts row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly bookings bar chart — real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
          <div className="p-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
              Weekly Bookings
            </h3>
            <p className="text-xs text-slate-400 mb-4">Bookings vs Completed — last 7 days</p>
            {weeklyData.length === 0 || weeklyData.every(d => d.bookings === 0) ? (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
                No bookings in the last 7 days
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day"      tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar dataKey="bookings"  fill="#5b5ff5" radius={[4,4,0,0]} name="Bookings"  />
                  <Bar dataKey="completed" fill="#0fb894" radius={[4,4,0,0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* User growth line chart — real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dash-card overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
          <div className="p-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
              User Growth
            </h3>
            <p className="text-xs text-slate-400 mb-4">New customer registrations — last 7 months</p>
            {userGrowthData.length === 0 || userGrowthData.every(d => d.users === 0) ? (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
                No registrations in the last 7 months
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month"    tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#5b5ff5"
                    strokeWidth={2.5}
                    dot={{ fill: '#5b5ff5', strokeWidth: 2, r: 4 }}
                    name="New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Recent appointments table — real data ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="dash-card overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              Recent Appointments
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Today's latest activity</p>
          </div>
          <button
            onClick={() => navigate('/admin/appointments')}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            View all
          </button>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
            No appointments today yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="table-th">Token</th>
                  <th className="table-th">Patient</th>
                  <th className="table-th">Service</th>
                  <th className="table-th">Time</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt) => (
                  <tr key={apt._id} className="table-row">
                    <td className="table-td">
                      <span className="font-mono font-semibold text-primary-600 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-400 px-2 py-1 rounded-lg text-xs">
                        {apt.queueToken || '—'}
                      </span>
                    </td>
                    <td className="table-td font-medium text-slate-800 dark:text-slate-200">
                      {apt.user?.name || 'Unknown'}
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400">
                      {apt.service?.name || '—'}
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400">
                      {apt.timeSlot?.start
                        ? apt.timeSlot.start
                        : formatTime(apt.date)}
                    </td>
                    <td className="table-td">
                      <Badge variant={statusVariant[apt.status] || 'warning'}>
                        {apt.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
