import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Globe, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Layout() {
  const { token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-steel-border shadow-md">
        <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto">
          <Link to="/" className="font-headline-lg text-headline-lg font-bold tracking-tighter text-on-surface" aria-label="ThreadCounty Home">
            THREADCOUNTY
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">Home</Link>
            <Link to="/pricing" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">Pricing</Link>
            <Link to="/contact" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">Contact</Link>
            {token && (
              <>
                <Link to="/upload" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">Analyze</Link>
                <Link to="/history" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">History</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">Admin</Link>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button aria-label="Language" className="text-primary hover:bg-white/5 p-2 rounded-full transition-all">
              <Globe size={24} />
            </button>
            {token ? (
              <>
                <Link to="/profile" className="text-on-surface-variant hover:text-primary flex items-center space-x-2 transition-colors" title="Profile">
                  <UserCircle size={22} />
                </Link>
                <button onClick={handleLogout} className="text-on-surface-variant hover:text-primary flex items-center space-x-2 transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
                <Link to="/upload" className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-sm text-label-sm font-semibold hover:opacity-90 transition-opacity">
                  Start Scan
                </Link>
              </>
            ) : (
              <Link to="/login" className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-sm text-label-sm font-semibold hover:opacity-90 transition-opacity">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
