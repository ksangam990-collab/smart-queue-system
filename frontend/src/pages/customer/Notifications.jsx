import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    fetchAll();
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
          <p className="text-slate-500 text-sm mt-1">All your recent updates</p>
        </div>
        <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-2">
          <Check size={14} /> Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="dash-card p-16 text-center">
          <Bell size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`dash-card p-4 ${!n.isRead ? 'border-l-4 border-primary-500' : ''}`}
            >
              <p className="font-medium text-slate-800 text-sm">{n.title}</p>
              <p className="text-xs text-slate-500 mt-1">{n.message}</p>
              <p className="text-xs text-slate-400 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;