// frontend/src/pages/admin/Reports.jsx

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import {
  Download, TrendingUp, Users, Calendar,
  CheckCircle, XCircle, Clock, Building2,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import StatsCard from '../../components/common/StatsCard';

const COLORS = ['#5b5ff5', '#0fb894', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// Quick date range presets
const toISO = (d) => d.toISOString().slice(0, 10);
const today     = () => toISO(new Date());
const daysAgo   = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toISO(d); };
const startOfMonth = () => { const d = new Date(); d.setDate(1); return toISO(d); };
const startOfYear  = () => { const d = new Date(); d.setMonth(0, 1); return toISO(d); };

const PRESETS = [
  { label: 'Today',       start: today,        end: today        },
  { label: 'Last 7 days', start: () => daysAgo(6), end: today    },
  { label: 'Last 30 days',start: () => daysAgo(29), end: today   },
  { label: 'This Month',  start: startOfMonth, end: today        },
  { label: 'This Year',   start: startOfYear,  end: today        },
];

// Stat bubble (gradient card)
const StatBubble = ({ label, value, sub, icon: Icon, color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    accent:  'from-accent-500  to-accent-600',
    amber:   'from-amber-400   to-amber-500',
    rose:    'from-rose-400    to-rose-500',
    purple:  'from-purple-500  to-purple-600',
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[color]} p-5 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/70 text-xs font-medium">{label}</p>
        {Icon && <Icon size={16} className="text-white/60" />}
      </div>
      <p className="text-3xl font-bold tracking-tight">{value ?? '—'}</p>
      {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
    </div>
  );
};

const Reports = () => {
  const [globalStats, setGlobalStats] = useState(null);
  const [rangedStats, setRangedStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [rangeLoading, setRangeLoading] = useState(false);

  const [startDate, setStartDate]   = useState(daysAgo(6));
  const [endDate, setEndDate]       = useState(today());
  const [deptFilter, setDeptFilter] = useState('');
  const [activePreset, setActivePreset] = useState('Last 7 days');
  const [chartType, setChartType]   = useState('bar'); // 'bar' | 'line'

  // ── Fetch global stats (cards at top) ─────────────────────
  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const [statsRes, deptRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/departments'),
        ]);
        setGlobalStats(statsRes.data.data);
        setDepartments(deptRes.data.data);
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchGlobal();
  }, []);

  // ── Fetch ranged stats ─────────────────────────────────────
  const fetchRanged = useCallback(async () => {
    setRangeLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (deptFilter) params.set('department', deptFilter);
      const { data } = await api.get(`/users/stats/ranged?${params}`);
      setRangedStats(data.data);
    } catch {
      toast.error('Failed to load ranged data');
    } finally {
      setRangeLoading(false);
    }
  }, [startDate, endDate, deptFilter]);

  useEffect(() => { fetchRanged(); }, [fetchRanged]);

  // ── Apply a preset ─────────────────────────────────────────
  const applyPreset = (preset) => {
    setStartDate(preset.start());
    setEndDate(preset.end());
    setActivePreset(preset.label);
  };

  // ── Export CSV ─────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!rangedStats?.dailyData) return;

    const deptName = departments.find((d) => d._id === deptFilter)?.name || 'All Departments';
    const rows = [
      [`Slotly Report – ${deptName} – ${startDate} to ${endDate}`],
      [],
      ['Summary'],
      ['Total Appointments', rangedStats.total],
      ['Completed',          rangedStats.completed],
      ['Cancelled',          rangedStats.cancelled],
      ['Pending',            rangedStats.pending],
      ['Completion Rate',    `${rangedStats.completionRate}%`],
      [],
      ['Daily Breakdown'],
      ['Date', 'Bookings', 'Completed'],
      ...rangedStats.dailyData.map((d) => [d.day, d.bookings, d.completed]),
    ];

    if (rangedStats.deptBreakdown?.length) {
      rows.push([], ['By Department'], ['Department', 'Appointments']);
      rangedStats.deptBreakdown.forEach((d) => rows.push([d.name, d.count]));
    }

    const csv  = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `slotly-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported!');
  };

  // ── Pie data ───────────────────────────────────────────────
  const pieData = rangedStats ? [
    { name: 'Completed',  value: rangedStats.completed },
    { name: 'Cancelled',  value: rangedStats.cancelled },
    { name: 'Pending',    value: rangedStats.pending   },
  ].filter((d) => d.value > 0) : [];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-500 text-sm mt-1">Filterable insights across any date range</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchRanged}
            className="btn-secondary flex items-center gap-2 text-sm"
            disabled={rangeLoading}
          >
            <RefreshCw size={14} className={rangeLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-primary flex items-center gap-2 text-sm"
            disabled={!rangedStats}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Global stat cards ─────────────────────────────────  */}
      {globalStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Users"        value={globalStats.totalUsers}          icon={Users}       color="primary" delay={0.0} />
          <StatsCard title="Total Staff"        value={globalStats.totalStaff}          icon={Users}       color="blue"    delay={0.1} />
          <StatsCard title="Total Appointments" value={globalStats.totalAppointments}   icon={Calendar}    color="purple"  delay={0.2} />
          <StatsCard title="This Month"         value={globalStats.monthlyAppointments} icon={TrendingUp}  color="green"   delay={0.3} />
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="dash-card p-4 space-y-4">
        {/* Preset pills */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePreset === p.label
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Date inputs + department + chart type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 whitespace-nowrap">From</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => { setStartDate(e.target.value); setActivePreset(''); }}
              className="form-input flex-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 whitespace-nowrap">To</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today()}
              onChange={(e) => { setEndDate(e.target.value); setActivePreset(''); }}
              className="form-input flex-1 text-sm"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="form-input w-full lg:w-auto text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.icon} {d.name}</option>
            ))}
          </select>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 w-full lg:w-auto">
            {['bar','line'].map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`flex-1 px-4 py-2 text-xs font-semibold capitalize transition-all ${
                  chartType === t
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t} chart
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ranged stat bubbles ───────────────────────────────── */}
      {rangeLoading ? (
        <div className="flex justify-center py-10"><Spinner size="md" /></div>
      ) : rangedStats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatBubble label="Total"           value={rangedStats.total}              icon={Calendar}     color="primary" />
            <StatBubble label="Completed"       value={rangedStats.completed}          icon={CheckCircle}  color="accent"  />
            <StatBubble label="Cancelled"       value={rangedStats.cancelled}          icon={XCircle}      color="rose"    />
            <StatBubble label="Pending"         value={rangedStats.pending}            icon={Clock}        color="amber"   />
            <StatBubble
              label="Completion Rate"
              value={`${rangedStats.completionRate}%`}
              icon={TrendingUp}
              color="purple"
              sub={`${rangedStats.cancellationRate}% cancellation`}
            />
          </div>

          {/* ── Charts ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Daily trend chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="dash-card p-5 lg:col-span-2"
            >
              <h3 className="font-semibold text-slate-800 mb-1">Daily Appointments</h3>
              <p className="text-xs text-slate-400 mb-4">
                {startDate} → {endDate}
                {deptFilter && ` · ${departments.find(d => d._id === deptFilter)?.name}`}
              </p>
              {rangedStats.dailyData.every((d) => d.bookings === 0) ? (
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                  No appointments in this range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  {chartType === 'bar' ? (
                    <BarChart data={rangedStats.dailyData} barSize={rangedStats.dailyData.length > 14 ? 6 : 10}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                        interval={rangedStats.dailyData.length > 14 ? Math.floor(rangedStats.dailyData.length / 7) : 0}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Bar dataKey="bookings"  fill="#5b5ff5" radius={[4,4,0,0]} name="Bookings"  />
                      <Bar dataKey="completed" fill="#0fb894" radius={[4,4,0,0]} name="Completed" />
                    </BarChart>
                  ) : (
                    <LineChart data={rangedStats.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                        interval={rangedStats.dailyData.length > 14 ? Math.floor(rangedStats.dailyData.length / 7) : 0}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Line type="monotone" dataKey="bookings"  stroke="#5b5ff5" strokeWidth={2} dot={false} name="Bookings"  />
                      <Line type="monotone" dataKey="completed" stroke="#0fb894" strokeWidth={2} dot={false} name="Completed" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Pie chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="dash-card p-5"
            >
              <h3 className="font-semibold text-slate-800 mb-1">Status Breakdown</h3>
              <p className="text-xs text-slate-400 mb-4">For selected range</p>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* ── Department breakdown ───────────────────────────── */}
          {rangedStats.deptBreakdown?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="dash-card p-5"
            >
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-primary-500" /> By Department
              </h3>
              <div className="space-y-3">
                {rangedStats.deptBreakdown.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xl w-7 flex-shrink-0">{d.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-700 truncate">{d.name}</p>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{d.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((d.count / rangedStats.total) * 100)}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
                          className="h-full rounded-full bg-primary-400"
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right flex-shrink-0">
                      {Math.round((d.count / rangedStats.total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Summary table ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="dash-card overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Summary</h3>
              <span className="text-xs text-slate-400">{startDate} → {endDate}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="table-th">Metric</th>
                    <th className="table-th">Selected Range</th>
                    <th className="table-th">Today</th>
                    <th className="table-th">All Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'Total Appointments', range: rangedStats.total,            today: globalStats?.todayAppointments, allTime: globalStats?.totalAppointments },
                    { metric: 'Completed',           range: rangedStats.completed,        today: globalStats?.completedToday,    allTime: '—' },
                    { metric: 'Cancelled',           range: rangedStats.cancelled,        today: globalStats?.cancelledToday,    allTime: '—' },
                    { metric: 'Pending',             range: rangedStats.pending,          today: '—',                           allTime: '—' },
                    { metric: 'Completion Rate',     range: `${rangedStats.completionRate}%`, today: '—',                      allTime: '—' },
                    { metric: 'Registered Users',    range: '—',                         today: '—',                           allTime: globalStats?.totalUsers },
                    { metric: 'Active Departments',  range: '—',                         today: '—',                           allTime: globalStats?.totalDepartments },
                  ].map(({ metric, range, today: t, allTime }) => (
                    <tr key={metric} className="table-row">
                      <td className="table-td font-medium text-slate-700">{metric}</td>
                      <td className="table-td text-primary-600 font-semibold">{range ?? '—'}</td>
                      <td className="table-td text-slate-600">{t ?? '—'}</td>
                      <td className="table-td text-slate-600">{allTime ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Reports;
