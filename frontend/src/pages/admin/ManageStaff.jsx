// frontend/src/pages/admin/ManageStaff.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Briefcase, X,
  Check, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const defaultForm = {
  name: '', email: '', password: '', phone: '', department: '',
};

const ManageStaff = () => {
  const [staff, setStaff]             = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(defaultForm);
  const [saving, setSaving]           = useState(false);
  const [deleteId, setDeleteId]       = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'staff' });
      if (search) params.append('search', search);
      const { data } = await api.get(`/users?${params}`);
      setStaff(data.data);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, [search]);

  useEffect(() => {
    const fetchDepts = async () => {
      const { data } = await api.get('/departments');
      setDepartments(data.data);
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users/staff', form);
      toast.success('Staff account created!');
      setShowModal(false);
      setForm(defaultForm);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create staff');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle`);
      toast.success('Status updated');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('Staff deleted');
      setDeleteId(null);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage staff accounts and department assignments
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-11"
        />
      </div>

      {/* Staff cards */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : staff.length === 0 ? (
        <div className="dash-card p-16 text-center">
          <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No staff yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Add staff members to manage queues and appointments
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Add Staff
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {staff.map((member, i) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="dash-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar?.url}
                    alt={member.name}
                    className="w-12 h-12 rounded-2xl object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${member.name}&background=6366f1&color=fff&size=48`;
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-slate-800">{member.name}</h3>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>
                <Badge variant={member.isActive ? 'success' : 'danger'}>
                  {member.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {member.department && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Briefcase size={12} />
                  <span>{member.department?.name || 'No department'}</span>
                </div>
              )}

              {member.phone && (
                <p className="text-xs text-slate-500 mb-4">📱 {member.phone}</p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleToggle(member._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                >
                  {member.isActive
                    ? <><ToggleRight size={14} /> Deactivate</>
                    : <><ToggleLeft size={14} /> Activate</>
                  }
                </button>
                <button
                  onClick={() => setDeleteId(member._id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Add Staff Member</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="staff@hospital.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="form-label">Assign Department</label>
                  <select
                    className="form-input"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  >
                    <option value="">Select department (optional)</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.icon} {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Check size={16} /> Create Staff
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Staff?</h3>
              <p className="text-slate-500 text-sm mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl px-5 py-2.5 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageStaff;