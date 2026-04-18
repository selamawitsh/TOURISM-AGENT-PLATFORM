import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, LayoutDashboard, LogOut, UserRound, Heart, Star, Calendar, Users, MapPin, TrendingUp } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated, isAdmin, isAgent, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
  
  // Role-based navigation items
  const getNavItems = () => {
    if (isAdmin()) {
      return [
        { to: getDashboardPath(), label: 'Dashboard', icon: LayoutDashboard },
        { to: '/profile', label: 'Profile', icon: UserRound },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/destinations', label: 'Destinations', icon: MapPin },
        { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
        { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
        { to: '/favorites', label: 'Favorites', icon: Heart },
        { to: '/my-reviews', label: 'Reviews', icon: Star },
      ];
    }
    if (isAgent()) {
      return [
        { to: getDashboardPath(), label: 'Dashboard', icon: LayoutDashboard },
        { to: '/profile', label: 'Profile', icon: UserRound },
        { to: '/destinations', label: 'Destinations', icon: MapPin },
        { to: '/my-bookings', label: 'My Bookings', icon: Calendar },
        { to: '/favorites', label: 'Favorites', icon: Heart },
        { to: '/my-reviews', label: 'Reviews', icon: Star },
      ];
    }
    // Customer
    return [
      { to: getDashboardPath(), label: 'Dashboard', icon: LayoutDashboard },
      { to: '/profile', label: 'Profile', icon: UserRound },
      { to: '/destinations', label: 'Destinations', icon: MapPin },
      { to: '/my-bookings', label: 'My Bookings', icon: Calendar },
      { to: '/favorites', label: 'Favorites', icon: Heart },
      { to: '/my-reviews', label: 'Reviews', icon: Star },
    ];
  };

  const navigationItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar - Full Width */}
      <nav className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            {/* Logo */}
            <Link
              to={getBrandPath()}
              className="group inline-flex items-center gap-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <strong className="font-heading text-lg text-slate-950">Ethiopia Tours</strong>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Highlands, heritage, hospitality
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 inline-flex items-center gap-2"
                    to={item.to}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-slate-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                    Login
                  </Link>
                  <Button asChild size="sm">
                    <Link to="/register">Create Account</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Full Width, No Padding Constraints */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;