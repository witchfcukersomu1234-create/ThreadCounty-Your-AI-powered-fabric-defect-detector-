import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { User, Mail, Lock, Trash2, Loader2, Eye, EyeOff, Camera } from 'lucide-react';
import { supabase } from './supabase';

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-400' };
  if (score === 4) return { score, label: 'Good', color: 'bg-emerald-400' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, deleteAccount, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const strength = getPasswordStrength(newPassword);

  const handleNameSave = async (e) => {
    e.preventDefault();
    setSavingName(true);
    const result = await updateProfile({ full_name: fullName });
    setSavingName(false);
    if (result.success) addToast('Name updated successfully!', 'success');
    else addToast(result.error || 'Failed to update name', 'error');
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (strength.score < 2) {
      addToast('Please choose a stronger password.', 'error');
      return;
    }
    setSavingPassword(true);
    const result = await updatePassword(newPassword);
    setSavingPassword(false);
    if (result.success) {
      addToast('Password updated successfully!', 'success');
      setNewPassword('');
    } else {
      addToast(result.error || 'Failed to update password', 'error');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Avatar must be under 2MB', 'error');
      return;
    }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const result = await updateProfile({ avatar_url: urlData.publicUrl });
      if (result.success) addToast('Avatar updated!', 'success');
      else addToast(result.error, 'error');
    } catch (err) {
      addToast(err.message || 'Avatar upload failed', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('This will permanently delete your account. Are you sure?')) return;
    setDeletingAccount(true);
    const result = await deleteAccount();
    setDeletingAccount(false);
    if (result.success) {
      addToast('Account deleted. Goodbye!', 'info');
      navigate('/');
    } else {
      addToast(result.error || 'Failed to delete account', 'error');
    }
  };

  return (
    <div className="flex-1 px-gutter py-12 max-w-container-max mx-auto w-full">
      <h1 className="font-headline-lg text-3xl mb-2 text-on-surface">My Profile</h1>
      <p className="text-on-surface-variant font-label-sm mb-10">Manage your account settings</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Avatar & info */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-3xl border border-steel-border flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-surface-container border border-steel-border overflow-hidden flex items-center justify-center">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-on-surface-variant opacity-50" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-container rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity border border-steel-border"
              >
                {uploadingAvatar ? <Loader2 size={14} className="animate-spin text-on-primary" /> : <Camera size={14} className="text-on-primary" />}
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="font-headline-lg-mobile text-xl text-on-surface mb-1">{user?.full_name || 'User'}</div>
            <div className="text-on-surface-variant text-sm font-label-sm flex items-center gap-1">
              <Mail size={12} />
              {user?.email}
            </div>
            <div className="mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${user?.role === 'admin' ? 'bg-tertiary/20 text-tertiary border-tertiary/50' : 'bg-surface-container text-on-surface-variant border-steel-border'}`}>
                {user?.role || 'user'}
              </span>
            </div>
          </div>
        </div>

        {/* Right — Edit forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Update Name */}
          <form onSubmit={handleNameSave} className="glass-panel p-6 rounded-3xl border border-steel-border">
            <h2 className="font-headline-lg-mobile text-xl mb-5 text-on-surface">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface-container border border-steel-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-surface-container/50 border border-steel-border rounded-xl py-3 pl-10 pr-4 text-on-surface-variant opacity-60 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-1 opacity-60">Email cannot be changed</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={savingName}
                className="bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 disabled:opacity-60"
              >
                {savingName ? <Loader2 size={16} className="animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </form>

          {/* Update Password */}
          <form onSubmit={handlePasswordSave} className="glass-panel p-6 rounded-3xl border border-steel-border">
            <h2 className="font-headline-lg-mobile text-xl mb-5 text-on-surface">Change Password</h2>
            <div>
              <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container border border-steel-border rounded-xl py-3 pl-10 pr-11 text-on-surface focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${strength.score >= i ? strength.color : 'bg-steel-border'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Strength: <span className={`font-semibold ${strength.score >= 4 ? 'text-emerald-400' : strength.score >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>{strength.label}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword || !newPassword}
                className="bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 disabled:opacity-60"
              >
                {savingPassword ? <Loader2 size={16} className="animate-spin" /> : null}
                Update Password
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="glass-panel p-6 rounded-3xl border border-red-500/30">
            <h2 className="font-headline-lg-mobile text-xl mb-2 text-red-400">Danger Zone</h2>
            <p className="text-on-surface-variant text-sm mb-5">Deleting your account is permanent and cannot be undone.</p>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="bg-red-500/20 text-red-400 border border-red-500/50 px-6 py-2.5 rounded-xl font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {deletingAccount ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
