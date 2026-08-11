// frontend/src/pages/customer/CustomerDashboard.jsx

import { motion } from 'framer-motion';
import { Calendar, Clock, Zap, Star, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';

const recentBookings = [
  { id: 1, service: 'General Checkup', dept: 'Cardiology',  date: 'Jul 3, 2026', time: '10:00 AM', token: 'A-012', status: 'completed' },
  { id: 2, service: 'Eye Test',        dept: 'Ophthalmology',date: 'Jul 5, 2026', time: '02:30 PM', token: 'C-007', status: 'confirmed' },
  { id: 3, service: 'Blood Test',      dept: 'Pathology',   date: 'Jul 8, 2026', time: '09:00 AM', token: 'D-003', status: 'pending'   },
];

const statusVariant = {
  completed: 'success',
  confirmed: 'info',
  pending:   'warning',
  cancelled: 'danger',
};

const CustomerDashboard = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Hi, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage your appointments and track your queue.
          </p>
        </div>
        <button
          onClick={() => navigate('/book')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Book Appointment
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Bookings"   value="12"  icon={Calendar} color="primary" delay={0.0} />
        <StatsCard title="Completed"        value="8"   icon={Star}     color="green"   delay={0.1} />
        <StatsCard title="Upcoming"         value="3"   icon={Clock}    color="blue"    delay={0.2} />
        <StatsCard title="Queue Position"   value="#4"  icon={Zap}      color="orange"  delay={0.3} />
      </div>

      {/* Live queue + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live queue card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="dash-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Live Queue</h3>
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>

          <div className="text-center py-4">
            <p className="text-sm text-slate-500 mb-1">Currently Serving</p>
            <p className="text-3xl font-bold text-primary-500 mb-4">A-008</p>
            <div className="bg-primary-50 rounded-2xl p-4 mb-4">
              <p className="text-sm text-slate-500 mb-1">Your Token</p>
              <p className="text-2xl font-bold text-slate-800">A-012</p>
              <p className="text-xs text-slate-500 mt-1">4 people ahead</p>
            </div>
            <p className="text-sm text-slate-500">
              Est. wait: <span className="font-semibold text-slate-700">~20 mins</span>
            </p>
          </div>

          <button
            onClick={() => navigate('/live-queue')}
            className="w-full btn-secondary text-sm mt-2 flex items-center justify-center gap-2"
          >
            View Full Queue <ChevronRight size={14} />
          </button>
        </motion.div>

        {/* Recent bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card overflow-hidden lg:col-span-2"
        >
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
            {recentBookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Calendar size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{booking.service}</p>
                    <p className="text-xs text-slate-500">{booking.dept} · {booking.date} · {booking.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                    {booking.token}
                  </span>
                  <Badge variant={statusVariant[booking.status]}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: 'Book Appointment', icon: Calendar, path: '/book',            color: 'bg-primary-50 text-primary-600' },
          { label: 'My Bookings',      icon: Clock,    path: '/my-appointments', color: 'bg-blue-50 text-blue-600'     },
          { label: 'Live Queue',       icon: Zap,      path: '/live-queue',      color: 'bg-orange-50 text-orange-600' },
          { label: 'Leave Feedback',   icon: Star,     path: '/feedback',        color: 'bg-green-50 text-green-600'   },
        ].map(({ label, icon: Icon, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="dash-card p-5 flex flex-col items-center gap-3 hover:shadow-lg transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
              <Icon size={22} />
            </div>
            <span className="text-sm font-medium text-slate-700 text-center">{label}</span>
          </button>
        ))}
      </motion.div>

    </div>
  );
};

export default CustomerDashboard;
