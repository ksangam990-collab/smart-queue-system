// frontend/src/pages/staff/Schedule.jsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const statusVariant = {
  completed: 'success',
  confirmed: 'info',
  pending:   'warning',
  cancelled: 'danger',
  'no-show': 'danger',
};

const Schedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const { data } = await api.get('/appointments/today');
        setAppointments(data.data);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">
          Today's Schedule
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          All appointments assigned to you today
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <div className="dash-card p-16 text-center">
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
            No appointments today
          </h3>
          <p className="text-slate-400 text-sm">
            Your schedule is clear for today.
          </p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#14141f] border-b border-slate-100 dark:border-[#2a2a42]">
                  <th className="table-th">Token</th>
                  <th className="table-th">Patient</th>
                  <th className="table-th">Service</th>
                  <th className="table-th">Time</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt, i) => (
                  <motion.tr
                    key={apt._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="table-row"
                  >
                    <td className="table-td">
                      <span className="font-mono font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/15 px-2 py-1 rounded-lg text-xs">
                        {apt.queueToken}
                      </span>
                    </td>
                    <td className="table-td font-medium text-slate-800 dark:text-slate-100">
                      {apt.user?.name}
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400">
                      {apt.service?.name}
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {apt.timeSlot?.start}
                      </span>
                    </td>
                    <td className="table-td">
                      <Badge variant={statusVariant[apt.status]}>
                        {apt.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;