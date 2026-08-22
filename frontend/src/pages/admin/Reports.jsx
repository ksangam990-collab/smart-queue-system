// frontend/src/pages/admin/Reports.jsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  Download, TrendingUp, Users,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import StatsCard from '../../components/common/StatsCard';

const COLORS = ['#5b5ff5', '#0fb894', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/users/stats');
        setStats(data.data);
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportCSV = () => {
    if (!stats?.weeklyData) return;
    const rows = [
      ['Day', 'Bookings', 'Completed'],
      ...stats.weeklyData.map((d) => [d.day, d.bookings, d.completed]),
    ];
    const csv     = rows.map((r) => r.join(',')).join('\n');
    const blob    = new Blob([csv], { type: 'text/csv' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `smartqueue-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported!');
  };

  const statusData = stats ? [
    { name: 'Completed',  value: stats.completedToday  },
    { name: 'Cancelled',  value: stats.cancelledToday  },
    { name: 'Pending',    value: stats.todayAppointments - stats.completedToday - stats.cancelledToday },
  ] : [];

  if (loading) {
    return (
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-500 text-sm mt-1">
            Overview of system performance and statistics
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Users"        value={stats.totalUsers}          icon={Users}        color="primary" delay={0.0} />
          <StatsCard title="Total Staff"        value={stats.totalStaff}          icon={Users}        color="blue"    delay={0.1} />
          <StatsCard title="Total Appointments" value={stats.totalAppointments}   icon={Calendar}     color="purple"  delay={0.2} />
          <StatsCard title="This Month"         value={stats.monthlyAppointments} icon={TrendingUp}   color="green"   delay={0.3} />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly bookings bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dash-card p-6"
        >
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Weekly Bookings
          </h3>
          <p className="text-xs text-slate-400 mb-4">Last 7 days performance</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.weeklyData || []} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Bar dataKey="bookings"  fill="#5b5ff5" radius={[4,4,0,0]} name="Bookings"  />
              <Bar dataKey="completed" fill="#0fb894" radius={[4,4,0,0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Today's status pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card p-6"
        >
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Today's Status
          </h3>
          <p className="text-xs text-slate-400 mb-4">Appointment breakdown</p>
          {stats?.todayAppointments === 0 ? (
            <div className="flex items-center justify-center h-52 text-slate-400 text-sm">
              No appointments today
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Summary table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="dash-card overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-th">Metric</th>
                <th className="table-th">Today</th>
                <th className="table-th">This Month</th>
                <th className="table-th">All Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  metric:   'Total Appointments',
                  today:    stats?.todayAppointments,
                  month:    stats?.monthlyAppointments,
                  allTime:  stats?.totalAppointments,
                },
                {
                  metric:   'Completed',
                  today:    stats?.completedToday,
                  month:    '—',
                  allTime:  '—',
                },
                {
                  metric:   'Cancelled',
                  today:    stats?.cancelledToday,
                  month:    '—',
                  allTime:  '—',
                },
                {
                  metric:   'Registered Users',
                  today:    '—',
                  month:    '—',
                  allTime:  stats?.totalUsers,
                },
                {
                  metric:   'Active Departments',
                  today:    '—',
                  month:    '—',
                  allTime:  stats?.totalDepartments,
                },
              ].map(({ metric, today, month, allTime }) => (
                <tr key={metric} className="table-row">
                  <td className="table-td font-medium text-slate-700">{metric}</td>
                  <td className="table-td text-slate-600">{today ?? '—'}</td>
                  <td className="table-td text-slate-600">{month ?? '—'}</td>
                  <td className="table-td text-slate-600">{allTime ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
};

export default Reports;
