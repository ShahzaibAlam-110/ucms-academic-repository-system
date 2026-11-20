import React, { useState } from 'react';
import { ShieldAlert, KeyRound, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { User } from '../data/mockDatabase';

interface FirstLoginModalProps {
  user: User;
  onPasswordChanged: (newPassword: string) => void;
  onSkipForNow: () => void;
}

export const FirstLoginModal: React.FC<FirstLoginModalProps> = ({
  user,
  onPasswordChanged,
  onSkipForNow,
}) => {
  const [wantsToChange, setWantsToChange] = useState<boolean | null>(null);
  const [currentPassword, setCurrentPassword] = useState('password123');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword === 'password123') {
      setError('Please choose a password different from default "password123".');
      return;
    }

    onPasswordChanged(newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Seal & Header */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full border-2 border-[#800020] p-1 mx-auto mb-3 bg-white shadow-md flex items-center justify-center overflow-hidden">
            <img 
              src="./assets/aistudio/logo_c68140aa.png" 
              onError={(e) => { (e.target as HTMLImageElement).src = './logo.png'; }}
              alt="UCMS Seal" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-amber-700" /> First Login Security Option
          </span>
          <h2 className="text-xl font-black text-blue-950">First-Time Portal Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">
            Welcome to the UCMS Portal, <strong>{user.full_name}</strong>.
          </p>
        </div>

        {/* Question Step: Do you want to change your password now? */}
        {wantsToChange === null && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <p className="text-sm font-bold text-slate-800">
                Do you want to change your default password now?
              </p>
              <p className="text-xs text-slate-500 mt-1">
                If you choose not to change it now, you can safely continue and change your password anytime later from your profile settings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWantsToChange(true)}
                className="w-full py-2.5 px-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Yes, Change Now
              </button>

              <button
                type="button"
                onClick={onSkipForNow}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-slate-500" />
                No, Change Later
              </button>
            </div>
          </div>
        )}

        {/* Change Password Form (if user selected Yes) */}
        {wantsToChange === true && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password (Minimum 8 Characters)
              </label>
              <input
                type="password"
                placeholder="Enter new secure password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                required
                minLength={8}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Confirm New Password
              </button>
              <button
                type="button"
                onClick={onSkipForNow}
                className="px-3 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl"
              >
                Skip For Now
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
