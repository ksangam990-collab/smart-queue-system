// frontend/src/pages/admin/ManageDepartments.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Building2,
  X, Check, ToggleLeft, ToggleRight, Briefcase,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const ICONS  = ['🏥','🦷','👁','🧪','💊','🏋️','🧠','❤️','🩺','🦴','🩸','🏨'];
const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];
const DAYS   = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const defaultDeptForm = {
  name: '', description: '', icon: '🏥', color: '#6366f1',
  workingHours: { start: '09:00', end: '17:00' },
  workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
};

const defaultServiceForm = {
  name: '', description: '', duration: 30, fee: 0, maxSlotsPerDay: 20,
};

const ManageDepartments = () => {
  const [departments, setDepartments]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');

  // Dept modal
  const [showDeptModal, setShowDeptModal]   = useState(false);
  const [editDept, setEditDept]             = useState(null);
  const [deptForm, setDeptForm]             = useState(defaultDeptForm);
  const [savingDept, setSavingDept]         = useState(false);
  const [deleteId, setDeleteId]             = useState(null);

  // Service modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [activeDept, setActiveDept]             = useState(null);
  const [services, setServices]                 = useState([]);
  const [loadingServices, setLoadingServices]   = useState(false);
  const [editService, setEditService]           = useState(null);
  const [serviceForm, setServiceForm]           = useState(defaultServiceForm);
  const [savingService, setSavingService]       = useState(false);
  const [deleteServiceId, setDeleteServiceId]   = useState(null);

  // ── Departments ──────────────────────────────────────────────
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/departments?search=${search}`);
      setDepartments(data.data);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, [search]);

  const openAddDept = () => {
    setEditDept(null);
    setDeptForm(defaultDeptForm);
    setShowDeptModal(true);
  };

  const openEditDept = (dept) => {
    setEditDept(dept);
    setDeptForm({
      name:         dept.name,
      description:  dept.description || '',
      icon:         dept.icon,
      color:        dept.color,
      workingHours: dept.workingHours,
      workingDays:  dept.workingDays,
    });
    setShowDeptModal(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    setSavingDept(true);
    try {
      if (editDept) {
        await api.put(`/departments/${editDept._id}`, deptForm);
        toast.success('Department updated!');
      } else {
        await api.post('/departments', deptForm);
        toast.success('Department created!');
      }
      setShowDeptModal(false);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSavingDept(false);
    }
  };

  const handleDeleteDept = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted!');
      setDeleteId(null);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/departments/${id}/toggle`);
      toast.success('Status updated!');
      fetchDepartments();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const toggleDay = (day) => {
    setDeptForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  // ── Services ─────────────────────────────────────────────────
  const openServicesModal = async (dept) => {
    setActiveDept(dept);
    setShowServiceModal(true);
    setEditService(null);
    setServiceForm(defaultServiceForm);
    setLoadingServices(true);
    try {
      const { data } = await api.get(`/services?department=${dept._id}`);
      setServices(data.data);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setSavingService(true);
    try {
      if (editService) {
        await api.put(`/services/${editService._id}`, serviceForm);
        toast.success('Service updated!');
      } else {
        await api.post('/services', {
          ...serviceForm,
          department: activeDept._id,
        });
        toast.success('Service added!');
      }
      setEditService(null);
      setServiceForm(defaultServiceForm);
      // Refresh services list
      const { data } = await api.get(`/services?department=${activeDept._id}`);
      setServices(data.data);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted!');
      setDeleteServiceId(null);
      const { data } = await api.get(`/services?department=${activeDept._id}`);
      setServices(data.data);
      fetchDepartments();
    } catch {
      toast.error('Delete failed');
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Departments</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage departments and their services
          </p>
        </div>
        <button onClick={openAddDept} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-11"
        />
      </div>

      {/* Department cards */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : departments.length === 0 ? (
        <div className="dash-card p-16 text-center">
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No departments yet</h3>
          <button onClick={openAddDept} className="btn-primary mt-4">
            <Plus size={16} /> Add Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept, i) => (
            <motion.div
              key={dept._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="dash-card p-6 hover:shadow-lg transition-all"
            >
              {/* Card header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: dept.color + '20' }}
                >
                  {dept.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{dept.name}</h3>
                  <Badge variant={dept.isActive ? 'success' : 'danger'}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {dept.description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{dept.description}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>⏰</span>
                <span>{dept.workingHours?.start} – {dept.workingHours?.end}</span>
              </div>

              {/* Services count — clickable */}
              <button
                onClick={() => openServicesModal(dept)}
                className="flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700 font-medium mb-4 hover:underline"
              >
                <Briefcase size={12} />
                {dept.services?.length || 0} services — Manage
              </button>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openEditDept(dept)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleToggle(dept._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                >
                  {dept.isActive
                    ? <><ToggleRight size={14} /> Deactivate</>
                    : <><ToggleLeft size={14} /> Activate</>
                  }
                </button>
                <button
                  onClick={() => setDeleteId(dept._id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Department Add/Edit Modal ────────────────────────── */}
      <AnimatePresence>
        {showDeptModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">
                  {editDept ? 'Edit Department' : 'Add Department'}
                </h2>
                <button onClick={() => setShowDeptModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleDeptSubmit} className="p-6 space-y-5">
                <div>
                  <label className="form-label">Department Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Cardiology"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input resize-none"
                    rows={3}
                    placeholder="Brief description..."
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setDeptForm({ ...deptForm, icon })}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                          deptForm.icon === icon
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-primary-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">Color</label>
                  <div className="flex gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setDeptForm({ ...deptForm, color })}
                        className={`w-8 h-8 rounded-full border-4 transition-all ${
                          deptForm.color === color ? 'border-slate-400 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">Working Hours</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      className="form-input"
                      value={deptForm.workingHours.start}
                      onChange={(e) => setDeptForm({
                        ...deptForm,
                        workingHours: { ...deptForm.workingHours, start: e.target.value }
                      })}
                    />
                    <span className="text-slate-400 font-medium">to</span>
                    <input
                      type="time"
                      className="form-input"
                      value={deptForm.workingHours.end}
                      onChange={(e) => setDeptForm({
                        ...deptForm,
                        workingHours: { ...deptForm.workingHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          deptForm.workingDays.includes(day)
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'border-slate-200 text-slate-600 hover:border-primary-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowDeptModal(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={savingDept} className="btn-primary flex-1">
                    {savingDept ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Check size={16} /> {editDept ? 'Update' : 'Create'}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Services Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showServiceModal && activeDept && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {activeDept.icon} {activeDept.name} — Services
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Add and manage services for this department
                  </p>
                </div>
                <button
                  onClick={() => { setShowServiceModal(false); setEditService(null); }}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">

                {/* Add/Edit service form */}
                <div className="bg-slate-50 rounded-2xl p-5">
                  <h3 className="font-semibold text-slate-700 mb-4 text-sm">
                    {editService ? '✏️ Edit Service' : '➕ Add New Service'}
                  </h3>
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="form-label">Service Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. General Consultation"
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="form-label">Description</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Brief description..."
                          value={serviceForm.description}
                          onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Duration (minutes) *</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="30"
                          min="5"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Fee (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0 for free"
                          min="0"
                          value={serviceForm.fee}
                          onChange={(e) => setServiceForm({ ...serviceForm, fee: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Max Slots Per Day</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="20"
                          min="1"
                          value={serviceForm.maxSlotsPerDay}
                          onChange={(e) => setServiceForm({ ...serviceForm, maxSlotsPerDay: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {editService && (
                        <button
                          type="button"
                          onClick={() => { setEditService(null); setServiceForm(defaultServiceForm); }}
                          className="btn-secondary"
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button type="submit" disabled={savingService} className="btn-primary flex-1">
                        {savingService ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Check size={16} />
                            {editService ? 'Update Service' : 'Add Service'}
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Services list */}
                <div>
                  <h3 className="font-semibold text-slate-700 mb-3 text-sm">
                    Current Services ({services.length})
                  </h3>

                  {loadingServices ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No services added yet. Add one above.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {services.map((service) => (
                        <div
                          key={service._id}
                          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl"
                        >
                          <div>
                            <p className="font-medium text-slate-800">{service.name}</p>
                            {service.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>⏱ {service.duration} min</span>
                              <span>💰 {service.fee > 0 ? `₹${service.fee}` : 'Free'}</span>
                              <span>📅 {service.maxSlotsPerDay} slots/day</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                setEditService(service);
                                setServiceForm({
                                  name:          service.name,
                                  description:   service.description || '',
                                  duration:      service.duration,
                                  fee:           service.fee,
                                  maxSlotsPerDay: service.maxSlotsPerDay,
                                });
                              }}
                              className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteServiceId(service._id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Department confirmation ───────────────────── */}
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Department?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This will also delete all services. Cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => handleDeleteDept(deleteId)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl px-5 py-2.5 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Service confirmation ──────────────────────── */}
      <AnimatePresence>
        {deleteServiceId && (
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Service?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteServiceId(null)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => handleDeleteService(deleteServiceId)}
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

export default ManageDepartments;