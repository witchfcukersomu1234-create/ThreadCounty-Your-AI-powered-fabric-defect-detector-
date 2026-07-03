import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  const { updatePassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;

  // Supabase sends an auth event when the user clicks the reset link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Check if session is already set (e.g. returning after hash token parse)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }
    if (strength.score < 2) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.success) {
      setDone(true);
      addToast('Password updated successfully!', 'success');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.error || 'Failed to reset password. The link may have expired.');
      addToast(result.error || 'Password reset failed', 'error');
    }
  };

  if (!sessionReady) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-gutter py-12">
        <div className="w-full max-w-md">
          <div className="glass-panel p-8 rounded-3xl border border-steel-border text-center">
            <p className="text-on-surface-variant font-label-sm mb-4">Verifying your reset link…</p>
            <p className="text-on-surface-variant text-sm">
              If nothing happens, your link may have expired.{' '}
              <Link to="/forgot-password" className="text-primary font-semibold hover:underline">Request a new one</Link>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-gutter py-12">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl border border-steel-border shadow-2xl shadow-ambient-glow relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {done ? (
            <div className="text-center relative z-10">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <h2 className="font-headline-lg text-3xl mb-3 text-on-surface">Password Updated!</h2>
              <p className="text-on-surface-variant mb-4 font-label-sm">Your password has been changed. Redirecting to login…</p>
            </div>
          ) : (
            <>
              <h2 className="font-headline-lg text-3xl mb-2 text-on-surface relative z-10">Set New Password</h2>
              <p className="text-on-surface-variant mb-8 font-label-sm relative z-10">Choose a strong new password for your account.</p>

              {error && (
                <div className="bg-red-500/20 text-red-200 border border-red-500/50 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {/* New Password */}
                <div>
                  <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container border border-steel-border rounded-xl py-3 pl-10 pr-11 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                    <input
                      id="reset-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-surface-container border rounded-xl py-3 pl-10 pr-11 text-on-surface focus:outline-none transition-colors ${
                        confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-steel-border focus:border-primary'
                      }`}
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating…</span>
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
