// frontend/src/pages/staff/QueuePanel.jsx

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight, SkipForward, CheckCircle,
  RefreshCw, Users, Clock, Zap,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';

const statusVariant = {
  waiting: 'warning',
  called:  'info',
  serving: 'info',
  done:    'success',
  skipped: 'danger',
};

const QueuePanel = () => {
  const { user }                        = useAuth();
  const [departments, setDepartments]   = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [queue, setQueue]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const [calling, setCalling]           = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const { data } = await api.get('/departments?isActive=true');
        setDepartments(data.data);
        if (data.data.length > 0) {
          setSelectedDept(data.data[0]._id);
        }
      } catch {
        toast.error('Failed to load departments');
      }
    };
    fetchDepts();
  }, []);

  const fetchQueue = useCallback(async () => {
    if (!selectedDept) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/queue?departmentId=${selectedDept}`);
      setQueue(data.data);
    } catch {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleCallNext = async () => {
    if (!queue?._id) {
      toast.error('No queue found for today');
      return;
    }
    setCalling(true);
    try {
      await api.patch(`/queue/${queue._id}/call-next`);
      toast.success('Next token called!');
      fetchQueue();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to call next');
    } finally {
      setCalling(false);
    }
  };

  const handleSkip = async (token) => {
    try {
      await api.post('/queue/skip', { queueId: queue._id, token });
      toast.success(`Token ${token} skipped`);
      fetchQueue();
    } catch {
      toast.error('Failed to skip token');
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, {
        status: 'completed',
      });
      toast.success('Appointment marked as completed!');
      fetchQueue();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const waitingList  = queue?.waitingList?.filter((i) => i.status === 'waiting')  || [];
  const calledList   = queue?.waitingList?.filter((i) => i.status === 'called' || i.status === 'serving') || [];
  const completedList = queue?.waitingList?.filter((i) => i.status === 'done' || i.status === 'skipped') || [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Queue Panel</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage today's patient queue
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Department selector */}
      <div className="dash-card p-4">
        <label className="form-label">Select Department</label>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="form-input"
        >
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.icon} {d.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !queue ? (
        <div className="dash-card p-16 text-center">
          <Users size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No queue today</h3>
          <p className="text-slate-400 text-sm">
            Queue will be created automatically when appointments are booked.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Waiting',   value: waitingList.length,   color: 'bg-orange-50 text-orange-600', icon: Clock       },
              { label: 'Being Served', value: calledList.length, color: 'bg-blue-50 text-blue-600',    icon: Zap         },
              { label: 'Completed', value: queue.totalServed,    color: 'bg-green-50 text-green-600',  icon: CheckCircle },
              { label: 'Skipped',   value: queue.totalSkipped,   color: 'bg-red-50 text-red-600',     icon: SkipForward },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="dash-card p-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Current + Call Next */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Currently serving */}
            <div className="dash-card p-6 text-center">
              <p className="text-sm font-medium text-slate-500 mb-3">Now Serving</p>
              {queue.currentToken ? (
                <>
                  <div className="w-28 h-28 rounded-full bg-primary-50 border-4 border-primary-200 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary-600 font-mono">
                      {queue.currentToken}
                    </span>
                  </div>
                  {calledList[0]?.appointment?.user && (
                    <div className="mb-4">
                      <p className="font-semibold text-slate-800">
                        {calledList[0].appointment.user.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {calledList[0].appointment.service?.name}
                      </p>
                    </div>
                  )}
                  {calledList[0] && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(calledList[0].appointment?._id)}
                        className="flex-1 btn-primary text-sm py-2"
                      >
                        <CheckCircle size={14} /> Complete
                      </button>
                      <button
                        onClick={() => handleSkip(calledList[0].token)}
                        className="flex-1 btn-secondary text-sm py-2"
                      >
                        <SkipForward size={14} /> Skip
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6">
                  <p className="text-slate-400 text-sm mb-4">No token being served</p>
                </div>
              )}

              <button
                onClick={handleCallNext}
                disabled={calling || waitingList.length === 0}
                className="w-full btn-primary mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {calling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <ChevronRight size={16} />
                    Call Next Token
                    {waitingList.length > 0 && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {waitingList[0]?.token}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>

            {/* Waiting list */}
            <div className="dash-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">
                  Waiting List ({waitingList.length})
                </h3>
              </div>
              <div className="overflow-y-auto max-h-80">
                {waitingList.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No patients waiting
                  </div>
                ) : (
                  waitingList.map((item, i) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between px-5 py-3 border-b border-slate-50 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400 w-5">
                          {i + 1}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-primary-600 text-sm">
                            {item.token}
                          </span>
                          {item.appointment?.user && (
                            <p className="text-xs text-slate-500">
                              {item.appointment.user.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={statusVariant[item.status]}>
                        {item.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Completed/Skipped today */}
          {completedList.length > 0 && (
            <div className="dash-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">
                  Completed Today ({completedList.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="table-th">Token</th>
                      <th className="table-th">Patient</th>
                      <th className="table-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedList.map((item) => (
                      <tr key={item._id} className="table-row">
                        <td className="table-td">
                          <span className="font-mono font-bold text-slate-600 text-sm">
                            {item.token}
                          </span>
                        </td>
                        <td className="table-td">
                          {item.appointment?.user?.name || '—'}
                        </td>
                        <td className="table-td">
                          <Badge variant={statusVariant[item.status]}>
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QueuePanel;