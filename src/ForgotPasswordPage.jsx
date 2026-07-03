import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
      addToast('Reset link sent! Check your inbox.', 'success');
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
      addToast(result.error || 'Failed to send reset email', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-gutter py-12">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl border border-steel-border shadow-2xl shadow-ambient-glow relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {sent ? (
            <div className="text-center relative z-10">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <h2 className="font-headline-lg text-3xl mb-3 text-on-surface">Email Sent</h2>
              <p className="text-on-surface-variant mb-8 font-label-sm leading-relaxed">
                If an account exists for <span className="text-primary font-semibold">{email}</span>,
                you will receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm mb-6 relative z-10">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
              <h2 className="font-headline-lg text-3xl mb-2 text-on-surface">Forgot Password?</h2>
              <p className="text-on-surface-variant mb-8 font-label-sm">
                Enter your email and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="bg-red-500/20 text-red-200 border border-red-500/50 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container border border-steel-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    'Send Reset Link'
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
