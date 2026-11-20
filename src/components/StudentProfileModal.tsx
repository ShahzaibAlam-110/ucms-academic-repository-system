import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, LogOut, CheckCircle2, AlertCircle, Camera, Link as LinkIcon } from 'lucide-react';
import { User } from '../data/mockDatabase';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdatePassword: (newPassword: string) => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
  onLogout: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdatePassword,
  onUpdateAvatar,
  onLogout,
}) => {
  const [activePicTab, setActivePicTab] = useState<'upload' | 'url'>('upload');
  const [avatarInputUrl, setAvatarInputUrl] = useState(user.avatar_url || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [picFeedback, setPicFeedback] = useState('');

  if (!isOpen) return null;

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
    setPasswordStatus({ type: 'success', message: 'Security password successfully updated!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(null), 4000);
  };

  const handleSavePicture = () => {
    if (onUpdateAvatar && avatarInputUrl.trim()) {
      onUpdateAvatar(avatarInputUrl.trim());
      setPicFeedback('Profile picture updated successfully!');
      setTimeout(() => setPicFeedback(''), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarInputUrl(reader.result);
          if (onUpdateAvatar) {
            onUpdateAvatar(reader.result);
          }
          setPicFeedback('Profile image loaded and saved!');
          setTimeout(() => setPicFeedback(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const defaultStudentAvatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80';
  const displayAvatar = avatarInputUrl || user.avatar_url || defaultStudentAvatar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-amber-600 overflow-hidden bg-white shadow-2xs shrink-0 flex items-center justify-center">
              <img
                src={displayAvatar}
                onError={(e) => { (e.target as HTMLImageElement).src = defaultStudentAvatar; }}
                alt="Student Identity"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-blue-950 tracking-tight">
                Student Profile & Account Settings
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {user.full_name} · {user.roll_number || 'UCMS-BSCS-2022-041'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Profile Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-130px)] overflow-y-auto">
          
          {/* SECTION 1: PROFILE PICTURE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Profile Picture
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                Editable
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-slate-200">
              <div className="w-20 h-20 rounded-full border-2 border-amber-600 p-0.5 bg-white shadow-xs shrink-0 overflow-hidden flex items-center justify-center">
                <img
                  src={displayAvatar}
                  onError={(e) => { (e.target as HTMLImageElement).src = defaultStudentAvatar; }}
                  alt="Student Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="flex-1 w-full space-y-2.5">
                <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-lg w-fit text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActivePicTab('upload')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activePicTab === 'upload' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePicTab('url')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activePicTab === 'url' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {activePicTab === 'upload' ? (
                  <div>
                    <label className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors">
                      <Camera className="w-3.5 h-3.5 text-amber-700" />
                      <span>Choose file from device (PNG/JPEG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={avatarInputUrl}
                      onChange={(e) => setAvatarInputUrl(e.target.value)}
                      placeholder="Paste image web address (https://...)"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleSavePicture}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg shadow-2xs cursor-pointer transition-colors"
                    >
                      Save Picture
                    </button>
                  </div>
                )}

                {picFeedback && (
                  <p className="text-[11px] font-bold text-emerald-700">{picFeedback}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: INSTITUTIONAL RECORDS (STRICTLY READ-ONLY) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Institutional Records (Strictly Read-Only)
                </span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                Institutional Lock
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Official academic identification data managed by University College of Management and Sciences, Khanewal.
            </p>

            <div className="grid grid-cols-2 gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Roll No
                </span>
                <span className="font-mono font-bold text-blue-950 text-xs sm:text-sm">
                  {user.roll_number || 'UCMS-BSCS-2022-041'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Batch
                </span>
                <span className="font-bold text-blue-950 text-xs sm:text-sm">
                  {user.batch || 'Batch 2022-2026'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Department
                </span>
                <span className="font-bold text-emerald-800 text-xs sm:text-sm">
                  {user.department_name || 'Department of Computer Science'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Institutional ID
                </span>
                <span className="font-mono font-bold text-blue-950 text-xs sm:text-sm">
                  {user.institutional_id || 'UCMS-2022-041'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: SECURITY & PASSWORD */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-900" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Security & Password
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Update your portal login password (minimum 6 characters)
            </p>

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

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
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
                    placeholder="Enter new password (min. 6 characters)"
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

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

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
