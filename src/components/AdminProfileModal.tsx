import React, { useState } from 'react';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { User } from '../data/mockDatabase';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdatePassword: (newPassword: string) => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
  onLogout: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdatePassword,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const defaultAdminAvatar =
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80';
  const displayAvatar = user.avatar_url || defaultAdminAvatar;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordStatus({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    onUpdatePassword(newPassword);
    setPasswordStatus({ type: 'success', message: 'Master administrative credentials updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Banner with Crimson #800020 */}
        <div className="bg-[#800020] text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-amber-400 overflow-hidden bg-white shadow-md">
                <img src={displayAvatar} alt={user.full_name || 'Admin Portrait'} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 border-2 border-[#800020] flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                CENTRAL GOVERNANCE & REGISTRY
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight">{user.full_name || 'Registrar Admin'}</h2>
              <p className="text-xs text-red-100 mt-0.5">
                {user.designation || 'Chief Registrar & Super Administrator'} · Principal Secretariat
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-red-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer relative z-10 shrink-0"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-slate-200 bg-[#f8fafc] px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#800020] text-[#800020] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Administrative Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-[#800020] text-[#800020] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Master Password</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Institutional Details */}
              <div className="p-4 sm:p-5 bg-[#f8fafc] rounded-2xl border border-slate-200 divide-y divide-slate-200/70 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 first:pt-0">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Full Name</span>
                  <span className="font-black text-slate-900 sm:text-right">{user.full_name || 'Registrar Admin'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Institutional ID</span>
                  <span className="font-mono font-bold text-blue-950 sm:text-right">{user.institutional_id || 'UCMS-ADM-001'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Authority Level</span>
                  <span className="font-bold text-purple-900 sm:text-right">Super Administrator (Tier-1)</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Official Designation</span>
                  <span className="font-bold text-slate-800 sm:text-right">{user.designation || 'Chief Registrar & Principal Administrator'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Jurisdiction</span>
                  <span className="font-bold text-slate-800 sm:text-right">Central University Administration</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Institutional Email</span>
                  <span className="font-mono font-bold text-slate-700 sm:text-right break-all">{user.email || 'registrar@ucms.edu.pk'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Portal Username</span>
                  <span className="font-mono font-bold text-slate-700 sm:text-right">@{user.username}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Secretariat Office</span>
                  <span className="font-bold text-amber-900 sm:text-right">{user.chamber || 'Admin Block, Principal Secretariat, UCMS Khanewal'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 last:pb-0">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Active Academic Session</span>
                  <span className="font-bold text-emerald-800 sm:text-right">Spring 2025 (Annual Intake Cycle)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Master Password *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password or Ucms@2026!"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Master Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Master Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new master password"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-900 font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#800020] hover:bg-[#600018] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span>Update Master Credentials</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Close Button */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-slate-400">
              UCMS Central Secretariat
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
