import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Lock, Mail, User, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

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

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;

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
    if (!termsAccepted) {
      setError('You must accept the Terms and Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    const result = await signup(email, password, fullName);
    setLoading(false);

    if (result.success) {
      if (result.emailVerificationRequired) {
        setSuccess(true);
        addToast('Account created! Check your email to verify.', 'success', 8000);
      } else {
        addToast('Account created successfully!', 'success');
        navigate('/upload');
      }
    } else {
      setError(result.error || 'Failed to create account. Please try again.');
      addToast(result.error || 'Signup failed', 'error');
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-gutter py-12">
        <div className="w-full max-w-md">
          <div className="glass-panel p-10 rounded-3xl border border-steel-border shadow-2xl shadow-ambient-glow text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h2 className="font-headline-lg text-3xl mb-3 text-on-surface">Check Your Email</h2>
            <p className="text-on-surface-variant mb-8 font-label-sm leading-relaxed">
              We've sent a verification link to <span className="text-primary font-semibold">{email}</span>.
              Please click the link in your email to activate your account, then log in.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-gradient-to-r from-tertiary to-tertiary/80 text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg text-center"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-gutter py-12">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl border border-steel-border shadow-2xl shadow-ambient-glow relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-bl from-tertiary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <h2 className="font-headline-lg text-3xl mb-2 text-center text-on-surface">Create Account</h2>
          <p className="text-on-surface-variant text-center mb-8 font-label-sm">Join the most advanced fabric intelligence platform.</p>

          {error && (
            <div className="bg-red-500/20 text-red-200 border border-red-500/50 px-4 py-3 rounded-xl mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Full Name */}
            <div>
              <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                <input
                  id="signup-fullname"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-container border border-steel-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-tertiary transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                <input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container border border-steel-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-tertiary transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container border border-steel-border rounded-xl py-3 pl-10 pr-11 text-on-surface focus:outline-none focus:border-tertiary transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strength.score >= i ? strength.color : 'bg-steel-border'
                        }`}
                      />
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
                  id="signup-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-surface-container border rounded-xl py-3 pl-10 pr-11 text-on-surface focus:outline-none transition-colors ${
                    confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-steel-border focus:border-tertiary'
                  }`}
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-steel-border bg-surface-container accent-tertiary cursor-pointer shrink-0"
              />
              <label htmlFor="terms" className="text-sm text-on-surface-variant cursor-pointer select-none leading-snug">
                I agree to the{' '}
                <span className="text-tertiary font-semibold hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-tertiary font-semibold hover:underline cursor-pointer">Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-tertiary to-tertiary/80 text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-tertiary font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
