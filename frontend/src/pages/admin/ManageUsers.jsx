// frontend/src/pages/admin/ManageUsers.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, ToggleLeft,
  ToggleRight, Trash2, Shield,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { TablePageSkeleton } from '../../components/common/Skeleton';

const ROLE_FILTERS = ['all', 'customer', 'staff', 'admin'];

const roleVariant = {
  admin:    'purple',
  staff:    'info',
  customer: 'success',
};

const ManageUsers = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteId, setDeleteId]     = useState(null);
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search)                  params.append('search', search);
      if (roleFilter !== 'all')    params.append('role', roleFilter);

      const { data } = await api.get(`/users?${params}`);
      setUsers(data.data);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

  const handleToggle = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle`);
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Users</h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage all registered users — {total} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-11"
          />
        </div>
        <div className="flex gap-2">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                roleFilter === r
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="dash-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
        {loading ? (
          <TablePageSkeleton cols={6} rows={6} />
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="table-th">User</th>
                    <th className="table-th">Role</th>
                    <th className="table-th">Phone</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Joined</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="table-row"
                    >
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar?.url}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=5b5ff5&color=fff&size=36`;
                            }}
                          />
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <Badge variant={roleVariant[user.role]}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="table-td text-slate-500 text-sm">
                        {user.phone || '—'}
                      </td>
                      <td className="table-td">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="table-td text-slate-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          {user.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleToggle(user._id)}
                                className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive
                                  ? <ToggleRight size={16} />
                                  : <ToggleLeft size={16} />
                                }
                              </button>
                              <button
                                onClick={() => setDeleteId(user._id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {user.role === 'admin' && (
                            <Shield size={16} className="text-purple-400" />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {users.length} of {total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={users.length < 10}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center max-h-[90vh] overflow-y-auto"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete User?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This action cannot be undone.
              </p>
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

export default ManageUsers;
