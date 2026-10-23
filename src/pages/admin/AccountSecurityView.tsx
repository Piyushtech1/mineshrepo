import React, { useState } from 'react';
import { api } from '../../services/api';
import { usePortfolio } from '../../context/PortfolioContext';
import { KeyRound, Shield, Check, AlertCircle, UserCheck } from 'lucide-react';

export const AccountSecurityView: React.FC = () => {
  const { admin, setAdminUser } = usePortfolio();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passNotice, setPassNotice] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Profile state
  const [name, setName] = useState(admin?.name || 'Elena Rostova');
  const [email, setEmail] = useState(admin?.email || 'admin@auradesign.studio');
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassNotice(null);
    setPassError(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('Password must be at least 8 characters long.');
      return;
    }

    setIsUpdatingPass(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPassNotice('Master admin password successfully changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);
    setProfileError(null);
    setIsUpdatingProfile(true);

    try {
      const res = await api.updateAdminProfile({ name, email });
      setAdminUser(res.admin);
      setProfileNotice('Admin profile details updated.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update admin profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Single Admin Account & Security
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Control master login credentials, password hashing, and session authentication
          </p>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 text-amber-500 border-b border-zinc-800 pb-2">
          <UserCheck className="h-5 w-5" />
          <h2 className="font-heading text-lg font-bold text-white">
            1. Administrator Contact Credentials
          </h2>
        </div>

        {profileNotice && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{profileNotice}</span>
          </div>
        )}

        {profileError && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Admin Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Admin Login Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="self-start rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {isUpdatingProfile ? 'Updating...' : 'Update Details'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 text-amber-500 border-b border-zinc-800 pb-2">
          <KeyRound className="h-5 w-5" />
          <h2 className="font-heading text-lg font-bold text-white">
            2. Change Master Password
          </h2>
        </div>

        {passNotice && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{passNotice}</span>
          </div>
        )}

        {passError && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono-meta text-zinc-400">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">New Password (min 8 chars) *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingPass}
            className="self-start rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow disabled:opacity-50"
          >
            {isUpdatingPass ? 'Hashing & Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
