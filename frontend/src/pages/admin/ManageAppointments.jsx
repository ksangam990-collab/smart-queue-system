// frontend/src/pages/admin/ManageAppointments.jsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Filter, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const statusVariant = {
  completed: 'success',
  confirmed: 'info',
  pending:   'warning',
  cancelled: 'danger',
  'no-show': 'danger',
};

const STATUS_OPTIONS = ['all','pending','confirmed','completed','cancelled','no-show'];

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter]     = useState('');
  const [departments, setDepartments]   = useState([]);
  const [deptFilter, setDeptFilter]     = useState('');
  const [updating, setUpdating]         = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter)             params.append('date',   dateFilter);
      if (deptFilter)             params.append('department', deptFilter);
      if (search)                 params.append('search', search);

      const { data } = await api.get(`/appointments?${params}`);
      setAppointments(data.data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter, deptFilter]);

  useEffect(() => {
    const fetchDepts = async () => {
      const { data } = await api.get('/departments');
      setDepartments(data.data);
    };
    fetchDepts();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchAppointments();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = appointments.filter((a) =>
    a.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
    a.queueToken?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage all appointments across departments
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="dash-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:flex-1 lg:min-w-48">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, token, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-11"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input w-full lg:w-auto"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>
          ))}
        </select>

        {/* Department filter */}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="form-input w-full lg:w-auto"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        {/* Date filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="form-input w-full lg:w-auto"
        />

        {/* Clear filters */}
        {(statusFilter !== 'all' || dateFilter || deptFilter || search) && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setDateFilter('');
              setDeptFilter('');
              setSearch('');
            }}
            className="btn-secondary flex items-center justify-center gap-2 text-sm w-full lg:w-auto"
          >
            <Filter size={14} /> Clear
          </button>
        )}
        </div>
      </div>

      {/* Table */}
      <div className="dash-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-th">Token</th>
                  <th className="table-th">Patient</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Service</th>
                  <th className="table-th">Date & Time</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt, i) => (
                  <motion.tr
                    key={apt._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="table-row"
                  >
                    <td className="table-td">
                      <span className="font-mono font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg text-xs">
                        {apt.queueToken}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <img
                          src={apt.user?.avatar?.url}
                          alt={apt.user?.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${apt.user?.name}&background=5b5ff5&color=fff&size=32`;
                          }}
                        />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{apt.user?.name}</p>
                          <p className="text-xs text-slate-400">{apt.user?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-slate-600">{apt.department?.name}</td>
                    <td className="table-td text-slate-600">{apt.service?.name}</td>
                    <td className="table-td">
                      <p className="text-sm text-slate-700">
                        {new Date(apt.date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {apt.timeSlot?.start} – {apt.timeSlot?.end}
                      </p>
                    </td>
                    <td className="table-td">
                      <Badge variant={statusVariant[apt.status]}>{apt.status}</Badge>
                    </td>
                    <td className="table-td">
                      {['pending', 'confirmed'].includes(apt.status) && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'completed')}
                            disabled={updating === apt._id}
                            className="text-xs px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all font-medium"
                          >
                            ✓ Done
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'no-show')}
                            disabled={updating === apt._id}
                            className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all font-medium"
                          >
                            ✗ No Show
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAppointments;
