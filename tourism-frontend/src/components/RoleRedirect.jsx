
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleRedirect = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        switch (userRole) {
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'agent':
            navigate('/agent/dashboard', { replace: true });
            break;
          case 'customer':
            navigate('/customer/dashboard', { replace: true });
            break;
          default:
            navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="rounded-3xl bg-white/90 px-8 py-10 shadow-2xl backdrop-blur-xl text-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-amber-500 mx-auto"></div>
        <p className="mt-5 text-lg font-medium text-slate-700">Preparing your Ethiopian journey…</p>
        <p className="mt-2 text-sm text-slate-500">One moment while we bring your dashboard to life.</p>
      </div>
    </div>
  );
};

export default RoleRedirect;
