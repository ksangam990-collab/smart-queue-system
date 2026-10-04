import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save, Download, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { avatarFallback, getAvatarUrl } from '../utils/avatar';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.data);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', { name, phone });
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data } = await api.get('/users/export-data');
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slotly-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Personal data exported!');
    } catch {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? All your personal details will be permanently anonymized and you will be signed out.'
    );
    if (!confirmed) return;
    try {
      await api.delete('/users/me');
      toast.success('Account deleted.');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Profile Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your account details</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User size={18} className="text-primary-500" /> Personal Information
        </h3>

        {/* Avatar upload */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <img
            src={getAvatarUrl(user, undefined, 64)}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover"
            onError={(e) => {
              e.currentTarget.src = avatarFallback(user?.name, undefined, 64);
            }}
          />
          <label className="btn-secondary cursor-pointer text-sm">
            {uploading ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </label>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input opacity-60" value={user?.email} disabled />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="dash-card p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Lock size={18} className="text-primary-500" /> Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} pattern="(?=.*[A-Za-z])(?=.*\d).{8,72}" title="At least 8 characters, with a letter and a number" />
          </div>
          <button type="submit" disabled={changingPassword} className="btn-primary">
            {changingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="dash-card p-6">
        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <ShieldAlert size={18} className="text-primary-500" /> Data Privacy & Account
        </h3>
        <p className="text-slate-500 text-sm mb-4">
          Export a copy of your personal data or request permanent account anonymization.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div>
            <h4 className="text-sm font-medium text-slate-800">Download Data</h4>
            <p className="text-xs text-slate-400">Export your appointments, feedback, and profile details as JSON.</p>
          </div>
          <button type="button" onClick={handleExportData} className="btn-secondary text-sm flex items-center gap-2">
            <Download size={15} /> Export My Data
          </button>
        </div>

        {user?.role !== 'admin' && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-100">
            <div>
              <h4 className="text-sm font-medium text-red-600">Delete Account</h4>
              <p className="text-xs text-slate-400">Permanently scrub your personal data and deactivate this account.</p>
            </div>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 size={15} /> Delete Account
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
