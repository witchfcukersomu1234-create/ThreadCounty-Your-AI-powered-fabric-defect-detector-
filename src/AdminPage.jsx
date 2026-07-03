import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  Server,
  AlertTriangle,
  Search,
  Loader2,
  RefreshCw,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { supabase } from './supabase';

const ADMIN_EMAIL = 'witchfcukersomu1234@gmail.com';

function isAdminEmail(email) {
  return (email || '').trim().toLowerCase() === ADMIN_EMAIL;
}

function formatDate(value) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
}

// ---------- Admin Login form (shown when user is not admin) ----------
function AdminLoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (user?.email && !isAdminEmail(user.email)) {
      setError('This account does not have admin privileges.');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials');
      addToast(result.error || 'Login failed', 'error');
    } else if (!isAdminEmail(result.user?.email || email)) {
      setError('This account does not have admin privileges.');
      addToast('Not an admin account', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-gutter py-12">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl border border-steel-border shadow-2xl shadow-ambient-glow relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-tertiary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-full bg-tertiary/20 border border-tertiary/40 flex items-center justify-center">
              <ShieldAlert size={20} className="text-tertiary" />
            </div>
            <div>
              <h2 className="font-headline-lg text-2xl text-on-surface">Admin Login</h2>
              <p className="text-on-surface-variant font-label-sm text-xs">Restricted access</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-200 border border-red-500/50 px-4 py-3 rounded-xl mb-6 text-sm text-center relative z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container border border-steel-border rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-tertiary transition-colors"
                  placeholder="Admin email"
                />
              </div>
            </div>
            <div>
              <label className="block text-on-surface-variant font-label-sm mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={18} />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container border border-steel-border rounded-xl py-3 pl-10 pr-11 text-on-surface focus:outline-none focus:border-tertiary transition-colors"
                  placeholder="Admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-tertiary to-tertiary/80 text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Admin Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------- Admin Dashboard ----------
export default function AdminPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [adminRecords, setAdminRecords] = useState([]);
  const [latestReports, setLatestReports] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_uploads: 0,
    todays_analyses: 0,
    latest_reports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = isAdminEmail(user?.email);

  if (!isAdmin) {
    return <AdminLoginView />;
  }

  const fetchData = async () => {
    setLoading(true);

    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { count: totalScans, error: totalError } = await supabase
        .from('scan_history')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { count: todayScans, error: todayError } = await supabase
        .from('scan_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfToday.toISOString());

      if (todayError) throw todayError;

      const { data: reports, error: reportsError } = await supabase
        .from('scan_history')
        .select('id, created_at, total_defects, ai_summary')
        .order('created_at', { ascending: false })
        .limit(8);

      if (reportsError) throw reportsError;

      setAdminRecords([
        {
          id: user?.id || 'administrator',
          full_name: user?.full_name || user?.user_metadata?.full_name || 'Administrator',
          email: user?.email || ADMIN_EMAIL,
          role: 'admin',
        },
      ]);

      setLatestReports(reports || []);

      setStats({
        total_users: 1,
        total_uploads: totalScans || 0,
        todays_analyses: todayScans || 0,
        latest_reports: reports?.length || 0,
      });
    } catch (err) {
      console.error(err);
      addToast('Failed to load admin dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    addToast('Dashboard refreshed', 'success');
  };

  const filteredAdmins = adminRecords.filter((item) =>
    (item.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredReports = latestReports.filter((item) =>
    (item.id || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.ai_summary || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 px-gutter py-12 max-w-container-max mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline-lg text-3xl text-tertiary">System Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label-sm"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'TOTAL USERS', value: stats.total_users, Icon: Users, accent: 'border-tertiary', iconBg: 'bg-tertiary/20', iconColor: 'text-tertiary' },
          { label: 'TOTAL UPLOADS', value: stats.total_uploads, Icon: Server, accent: 'border-primary', iconBg: 'bg-primary/20', iconColor: 'text-primary' },
          { label: "TODAY'S SCANS", value: stats.todays_analyses, Icon: AlertTriangle, accent: 'border-[#D84D8A]', iconBg: 'bg-[#D84D8A]/20', iconColor: 'text-[#D84D8A]' },
          { label: 'LATEST REPORTS', value: stats.latest_reports, Icon: Server, accent: 'border-secondary', iconBg: 'bg-secondary/20', iconColor: 'text-secondary' },
        ].map(({ label, value, Icon, accent, iconBg, iconColor }) => (
          <div key={label} className={`glass-panel p-6 rounded-2xl flex items-center space-x-4 border-l-4 ${accent}`}>
            <div className={`${iconBg} p-3 rounded-xl`}>
              <Icon className={iconColor} size={24} />
            </div>
            <div>
              <div className="font-label-sm text-on-surface-variant">{label}</div>
              <div className="font-headline-lg-mobile text-xl">{loading ? '—' : value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline-lg-mobile text-2xl">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={16} />
          <input
            id="admin-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admin or reports..."
            className="bg-surface-container border border-steel-border rounded-xl py-2 pl-9 pr-4 text-on-surface focus:outline-none focus:border-primary transition-colors text-sm w-56"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-steel-border">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-tertiary" size={32} />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container/50 border-b border-steel-border">
              <tr>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant">NAME</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant">EMAIL</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant">ROLE</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-border">
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-on-surface-variant py-8 font-label-sm">
                    No users found.
                  </td>
                </tr>
              )}
              {filteredAdmins.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-body-md font-semibold text-primary">{item.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 font-body-md text-on-surface-variant">{item.email || '—'}</td>
                  <td className="px-6 py-4 font-body-md">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-tertiary/20 text-tertiary border-tertiary/50">
                      {item.role || 'admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface-variant">Primary administrator</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between mt-12 mb-4">
        <h2 className="font-headline-lg-mobile text-2xl">Latest Reports</h2>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-steel-border">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-tertiary" size={32} />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container/50 border-b border-steel-border">
              <tr>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant">REPORT ID</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant">DATE</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant">TOTAL DEFECTS</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant">AI SUMMARY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-border">
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-on-surface-variant py-8 font-label-sm">
                    No reports found.
                  </td>
                </tr>
              )}
              {filteredReports.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-body-md font-semibold text-primary max-w-[160px] truncate">{item.id}</td>
                  <td className="px-6 py-4 font-body-md text-on-surface-variant">{formatDate(item.created_at)}</td>
                  <td className="px-6 py-4 font-body-md text-on-surface">{item.total_defects ?? 0}</td>
                  <td className="px-6 py-4 font-body-md text-on-surface-variant max-w-[420px]">
                    <div className="truncate">{item.ai_summary || 'No AI summary available.'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
