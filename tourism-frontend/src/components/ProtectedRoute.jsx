import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-20">
        <div className="rounded-3xl bg-white/95 px-8 py-10 shadow-2xl backdrop-blur-xl text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-5 text-lg font-medium text-slate-700">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
