import React, { useState } from 'react';
import { X, Lock, KeyRound, LogOut, CheckCircle2, AlertCircle, Camera, UserCheck, ShieldCheck } from 'lucide-react';
import { User } from '../data/mockDatabase';

interface FacultyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdatePassword: (newPassword: string) => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
  onLogout: () => void;
}

export const FacultyProfileModal: React.FC<FacultyProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdatePassword,
  onUpdateAvatar,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'security'>('records');
  const [avatarInputUrl, setAvatarInputUrl] = useState(user.avatar_url || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [picFeedback, setPicFeedback] = useState('');

  if (!isOpen) return null;

  const defaultFacultyAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
  const displayAvatar = avatarInputUrl || user.avatar_url || defaultFacultyAvatar;

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
    setPasswordStatus({ type: 'success', message: 'Security credentials updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarInputUrl(reader.result);
          if (onUpdateAvatar) onUpdateAvatar(reader.result);
          setPicFeedback('Official faculty photo updated!');
          setTimeout(() => setPicFeedback(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPhoto = () => {
    setAvatarInputUrl(defaultFacultyAvatar);
    if (onUpdateAvatar) onUpdateAvatar(defaultFacultyAvatar);
    setPicFeedback('Photo reset to default faculty portrait.');
    setTimeout(() => setPicFeedback(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Blue Top Bar matching video 00:42 */}
        <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border-2 border-amber-400 overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-xs">
              <img
                src={displayAvatar}
                onError={(e) => { (e.target as HTMLImageElement).src = defaultFacultyAvatar; }}
                alt="Faculty Portrait"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                Official Faculty Profile
              </h2>
              <p className="text-xs text-blue-100 font-medium opacity-90">
                University College of Management and Sciences, Khanewal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Profile Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs Switcher */}
        <div className="flex border-b border-slate-200 bg-[#f8fafc] px-6 pt-3 gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'records'
                ? 'border-blue-900 text-blue-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Official Records</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'border-blue-900 text-blue-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4 text-blue-900" />
            <span>Security & Password</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
          
          {activeTab === 'records' ? (
            <>
              {/* Profile Photo Row */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-slate-200">
                <div className="w-20 h-20 rounded-full border-2 border-amber-600 p-0.5 bg-white shadow-xs shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={displayAvatar}
                    onError={(e) => { (e.target as HTMLImageElement).src = defaultFacultyAvatar; }}
                    alt="Faculty Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-black text-slate-900">{user.full_name}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Photo Editable
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    You can change your portal photo. Official employment records remain locked.
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg cursor-pointer shadow-2xs transition-colors">
                      <Camera className="w-3.5 h-3.5 text-amber-300" />
                      <span>Upload New Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleResetPhoto}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                    >
                      Reset Photo
                    </button>
                  </div>

                  {picFeedback && (
                    <p className="text-[11px] font-bold text-emerald-700">{picFeedback}</p>
                  )}
                </div>
              </div>

              {/* Institutional Records (Strictly Read-Only with Institutional Lock) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Institutional Records (Strictly Read-Only)
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    <span>LOCKED</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Designation
                    </span>
                    <span className="font-bold text-blue-950 text-sm">
                      {user.designation || 'Assistant Professor'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Department
                    </span>
                    <span className="font-bold text-blue-950 text-sm">
                      {user.department_name || 'Department of Computer Science'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Faculty / Employee ID
                    </span>
                    <span className="font-mono font-bold text-blue-950 text-sm">
                      {user.institutional_id || 'UCMS-FAC-2018-042'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Roll / Faculty ID
                    </span>
                    <span className="font-mono font-bold text-blue-950 text-sm">
                      {user.institutional_id || 'UCMS-FAC-2018-042'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Batch / Session
                    </span>
                    <span className="font-bold text-amber-800 text-sm">
                      {user.batch || 'Spring 2025 (Morning)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Appointment Type
                    </span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {user.appointment_type || 'Grade-19 · Tenured Regular'}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Institutional Email
                    </span>
                    <span className="font-mono font-bold text-blue-900 text-xs sm:text-sm">
                      {user.email || 'asim.riaz@ucms.edu.pk'}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Chamber / Office
                    </span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      {user.chamber || 'Room 204, Academic Block B, UCMS Khanewal'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Official employment records are maintained by UCMS Registrar</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className="font-bold text-blue-900 hover:underline cursor-pointer"
                  >
                    Change Password →
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Security & Password Tab */
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Update Security Password
                </h3>
                <p className="text-xs text-slate-500">
                  Choose a secure password of at least 6 characters for portal access.
                </p>
              </div>

              {passwordStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password (default: password123)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-[#f8fafc] flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
