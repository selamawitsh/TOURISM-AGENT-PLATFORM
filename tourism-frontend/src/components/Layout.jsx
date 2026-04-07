import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-100 text-slate-900">
      <nav className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between h-16">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-extrabold tracking-tight text-sky-700">
                Tourism Agent
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Profile
                  </Link>
                  <span className="hidden text-sm text-slate-600 md:inline">
                    Hello, {user?.first_name}
                  </span>
                </>
              )}

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
