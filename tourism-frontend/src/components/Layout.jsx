import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated, isAdmin, isAgent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (isAdmin()) {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'User Management', path: '/admin/user-management', icon: '👥' }, 
        { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
        { name: 'Tours', path: '/admin/tours', icon: '🌍' },
      ];
    }

    if (isAgent()) {
      return [
        { name: 'Dashboard', path: '/agent/dashboard', icon: '📋' },
        { name: 'Bookings', path: '/agent/bookings', icon: '📅' },
        { name: 'Clients', path: '/agent/clients', icon: '👤' },
        { name: 'Tours', path: '/agent/tours', icon: '🌍' },
      ];
    }

    return [
      { name: 'Dashboard', path: '/customer/dashboard', icon: '🏠' },
      { name: 'Bookings', path: '/bookings', icon: '📅' },
      { name: 'Tours', path: '/tours', icon: '🌍' },
    ];
  };

  const navItems = getNavItems();

  const getDashboardPath = () => {
    if (isAdmin()) return '/admin/dashboard';
    if (isAgent()) return '/agent/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to={getDashboardPath()}
            className="flex items-center gap-3 rounded-2xl bg-sky-600 px-4 py-2 text-white shadow-sm transition hover:bg-sky-700"
          >
            <span className="text-lg font-bold">Tourism</span>
            <span className="text-xs uppercase tracking-[0.28em] text-sky-100">Platform</span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 shadow-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="rounded-full px-3 py-2 text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 shadow-sm">
                  <span>👋</span>
                  <span>{user?.first_name} {user?.last_name}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    isAdmin() ? 'bg-purple-100 text-purple-700' : isAgent() ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link className="text-sm font-medium text-slate-700 hover:text-slate-900" to="/login">
                  Login
                </Link>
                <Link
                  className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                  to="/register"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
