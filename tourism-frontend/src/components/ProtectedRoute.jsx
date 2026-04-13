import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, userRole } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="rounded-3xl bg-white/90 px-8 py-10 shadow-2xl backdrop-blur-xl text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-5 text-lg font-medium text-slate-700">Loading your experience…</p>
        </div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'agent':
        return <Navigate to="/agent/dashboard" replace />;
      default:
        return <Navigate to="/customer/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;