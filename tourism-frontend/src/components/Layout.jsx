import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated, isAdmin, isAgent, isCustomer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Role-based navigation items
  const getNavItems = () => {
    if (isAdmin()) {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
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
    // Customer
    return [
      { name: 'Dashboard', path: '/customer/dashboard', icon: '🏠' },
      { name: 'Bookings', path: '/bookings', icon: '📅' },
      { name: 'Tours', path: '/tours', icon: '🌍' },
    ];
  };

  const navItems = getNavItems();

  // Role-based dashboard path for logo click
  const getDashboardPath = () => {
    if (isAdmin()) return '/admin/dashboard';
    if (isAgent()) return '/agent/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to={getDashboardPath()} className="text-xl font-bold text-blue-600">
                Tourism Platform
              </Link>
              {isAuthenticated && (
                <div className="ml-10 flex space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="text-gray-700 hover:text-blue-600 flex items-center space-x-1"
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      👋 {user?.first_name} {user?.last_name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isAdmin() ? 'bg-purple-100 text-purple-700' :
                      isAgent() ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;