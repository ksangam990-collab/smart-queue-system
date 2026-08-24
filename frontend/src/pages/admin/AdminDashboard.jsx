// frontend/src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Building2,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import StatsCard from "../../components/common/StatsCard";
import Badge from "../../components/common/Badge";
import { useAuth } from "../../hooks/useAuth";

const userGrowthData = [
  { month: "Jan", users: 40 },
  { month: "Feb", users: 80 },
  { month: "Mar", users: 120 },
  { month: "Apr", users: 190 },
  { month: "May", users: 240 },
  { month: "Jun", users: 310 },
  { month: "Jul", users: 390 },
];

const recentAppointments = [
  {
    id: 1,
    name: "Rahul Sharma",
    service: "General Checkup",
    time: "09:00 AM",
    status: "completed",
    token: "A-001",
  },
  {
    id: 2,
    name: "Priya Singh",
    service: "Dental Care",
    time: "10:30 AM",
    status: "confirmed",
    token: "B-002",
  },
  {
    id: 3,
    name: "Amit Kumar",
    service: "Eye Test",
    time: "11:00 AM",
    status: "pending",
    token: "C-003",
  },
  {
    id: 4,
    name: "Sneha Patel",
    service: "Blood Test",
    time: "02:00 PM",
    status: "cancelled",
    token: "A-004",
  },
  {
    id: 5,
    name: "Vikram Mehta",
    service: "X-Ray",
    time: "03:30 PM",
    status: "confirmed",
    token: "D-005",
  },
];

const statusVariant = {
  completed: "success",
  confirmed: "info",
  pending: "warning",
  cancelled: "danger",
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/users/stats');
        setStats(data.data);
      } catch {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  const weeklyData = stats?.weeklyData || [];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Good morning, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Here's what's happening at Slotly today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-medium w-fit">
          <Zap size={16} />
          Live Dashboard
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || "—"}
          icon={Users}
          color="primary"
          change={12}
          delay={0.0}
        />
        <StatsCard
          title="Today's Bookings"
          value={stats?.todayAppointments || "—"}
          icon={Calendar}
          color="blue"
          change={8}
          delay={0.1}
        />
        <StatsCard
          title="Completed Today"
          value={stats?.completedToday || "—"}
          icon={CheckCircle}
          color="green"
          change={5}
          delay={0.2}
        />
        <StatsCard
          title="Cancelled Today"
          value={stats?.cancelledToday || "—"}
          icon={XCircle}
          color="red"
          change={2}
          changeType="decrease"
          delay={0.3}
        />
        <StatsCard
          title="This Month"
          value={stats?.monthlyAppointments || "—"}
          icon={TrendingUp}
          color="primary"
          change={18}
          delay={0.4}
        />
        <StatsCard
          title="Departments"
          value={stats?.totalDepartments || "—"}
          icon={Building2}
          color="purple"
          delay={0.5}
        />
        <StatsCard
          title="Total Bookings"
          value={stats?.totalAppointments || "—"}
          icon={TrendingUp}
          color="primary"
          delay={0.6}
        />
        <StatsCard
          title="Staff Members"
          value={stats?.totalStaff || "—"}
          icon={Users}
          color="blue"
          delay={0.7}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
          <div className="p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Weekly Bookings
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Bookings vs Completed this week
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="bookings"
                fill="#5b5ff5"
                radius={[4, 4, 0, 0]}
                name="Bookings"
              />
              <Bar
                dataKey="completed"
                fill="#0fb894"
                radius={[4, 4, 0, 0]}
                name="Completed"
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Line chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dash-card overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
          <div className="p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            User Growth
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            New registrations over time
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#5b5ff5"
                strokeWidth={2.5}
                dot={{ fill: "#5b5ff5", strokeWidth: 2, r: 4 }}
                name="Users"
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent appointments table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="dash-card overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Recent Appointments
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Today's appointment activity
            </p>
          </div>
          <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-th">Token</th>
                <th className="table-th">Patient</th>
                <th className="table-th">Service</th>
                <th className="table-th">Time</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map((apt) => (
                <tr key={apt.id} className="table-row">
                  <td className="table-td">
                    <span className="font-mono font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg text-xs">
                      {apt.token}
                    </span>
                  </td>
                  <td className="table-td font-medium text-slate-800">
                    {apt.name}
                  </td>
                  <td className="table-td text-slate-500">{apt.service}</td>
                  <td className="table-td text-slate-500">{apt.time}</td>
                  <td className="table-td">
                    <Badge variant={statusVariant[apt.status]}>
                      {apt.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
