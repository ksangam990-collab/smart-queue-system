// frontend/src/pages/staff/StaffDashboard.jsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import MagneticButton from '../../components/home/MagneticButton';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const statusVariant = {
  completed: 'success',
  confirmed: 'info',
  pending:   'warning',
  cancelled: 'danger',
};

const StaffDashboard = () => {
  const { user }                            = useAuth();
  const navigate                            = useNavigate();
  const [appointments, setAppointments]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [stats, setStats]                   = useState({
    total: 0, completed: 0, pending: 0, avgWait: 12,
  });

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const { data } = await api.get('/appointments/today');
        setAppointments(data.data);
        const completed = data.data.filter((a) => a.status === 'completed').length;
        const pending   = data.data.filter((a) => ['pending','confirmed'].includes(a.status)).length;
        setStats({
          total:     data.data.length,
          completed,
          pending,
          avgWait:   12,
        });
      } catch {
        // fallback to empty
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, []);

  return (
    <div className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage today's queue and appointments.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Today's Total"  value={stats.total}     icon={Users}       color="primary" delay={0.0} />
        <StatsCard title="Completed"      value={stats.completed} icon={CheckCircle} color="green"   delay={0.1} />
        <StatsCard title="Remaining"      value={stats.pending}   icon={Clock}       color="orange"  delay={0.2} />
        <StatsCard title="Avg. Wait"      value={`${stats.avgWait}m`} icon={Calendar} color="blue"  delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="dash-card p-6 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary-50 border-4 border-primary-200 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-600 font-mono">
              {appointments.find((a) => ['pending','confirmed'].includes(a.status))?.queueToken || '—'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Next in Queue</p>
          <p className="font-semibold text-slate-800 mb-1">
            {appointments.find((a) => ['pending','confirmed'].includes(a.status))?.user?.name || 'No patients'}
          </p>
          <MagneticButton className="w-full mt-4" strength={0.15}>
            <button
              onClick={() => navigate('/staff/queue')}
              className="btn-primary w-full"
            >
              Open Queue Panel
            </button>
          </MagneticButton>
        </motion.div>

        {/* Today's schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card overflow-hidden lg:col-span-2"
        >
          <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Today's Schedule</h3>
          </div>
          {loading ? (
          <DashboardSkeleton />
          ) : appointments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No appointments today
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="table-th">Token</th>
                    <th className="table-th">Patient</th>
                    <th className="table-th">Time</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 8).map((apt) => (
                    <tr key={apt._id} className="table-row">
                      <td className="table-td">
                        <span className="font-mono font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg text-xs">
                          {apt.queueToken}
                        </span>
                      </td>
                      <td className="table-td font-medium text-slate-800 text-sm">
                        {apt.user?.name}
                      </td>
                      <td className="table-td text-slate-500 text-sm">
                        {apt.timeSlot?.start}
                      </td>
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
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StaffDashboard;
