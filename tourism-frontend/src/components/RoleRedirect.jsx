import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleRedirect = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect based on role
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
    } else if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  // Show loading spinner while checking
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default RoleRedirect;