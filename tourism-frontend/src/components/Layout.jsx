
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, LayoutDashboard, LogOut, UserRound } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated, isAdmin, isAgent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (isAdmin()) return '/admin/dashboard';
    if (isAgent()) return '/agent/dashboard';
    return '/customer/dashboard';
  };

  const getBrandPath = () => (isAuthenticated ? getDashboardPath() : '/');
  const navigationItems = [
    { to: '/', label: 'Home', show: true },
    { to: getDashboardPath(), label: 'Dashboard', show: isAuthenticated },
    { to: '/profile', label: 'Profile', show: isAuthenticated },
  ];

  return (
    <div className="min-h-screen text-slate-900">
      <nav className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/60 bg-[rgba(255,250,244,0.82)] shadow-[0_22px_65px_-40px_rgba(24,31,22,0.65)] backdrop-blur-xl">
          <div className="ethiopian-stripe h-1 w-full animate-pulse-line" />
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link
              to={getBrandPath()}
              className="group inline-flex items-center gap-3 rounded-[1.6rem] border border-primary/10 bg-white/70 px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="grid h-12 w-12 place-items-center rounded-[1.3rem] bg-[linear-gradient(145deg,#204d3d,#2e7158)] text-white shadow-lg shadow-primary/20 transition group-hover:rotate-3">
                <Compass className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-tight">
                <strong className="font-heading text-xl text-slate-950">Ethiopia Tours</strong>
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Highlands, heritage, hospitality
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {navigationItems.filter((item) => item.show).map((item) => (
                <Link
                  key={item.label}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-muted hover:text-slate-950"
                  to={item.to}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-border/70 bg-white/80 px-3 py-2 soft-outline">
                    <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-muted text-primary">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-slate-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <div className="mt-1">
                        <Badge
                          variant={isAdmin() ? 'accent' : isAgent() ? 'gold' : 'default'}
                          className="border-transparent bg-slate-900/[0.03] px-2.5 py-1 text-[0.6rem]"
                        >
                          {user?.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="bg-white/70">
                    <Link to={getDashboardPath()}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>

                  <Button onClick={handleLogout} className="shadow-lg shadow-primary/15">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Link className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/70" to="/login">
                    Login
                  </Link>
                  <Button asChild className="shadow-lg shadow-primary/15">
                    <Link to="/register">Create Account</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-12 pt-8 sm:pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!isAuthenticated && (
            <div className="mb-6 hidden items-center justify-between rounded-[1.5rem] border border-white/60 bg-white/65 px-5 py-4 text-sm text-slate-600 shadow-sm backdrop-blur md:flex">
              <p>
                A warmer interface for Ethiopian travel planning, with story-led visuals and calmer booking flows.
              </p>
              <Badge variant="outline" className="bg-white/70 text-slate-700">
                Designed for mobile and desktop
              </Badge>
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
