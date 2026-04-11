/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);
          setUserRole(response.data.role);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  // Login - redirect based on role
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    setUser(user);
    setUserRole(user.role);
    setIsAuthenticated(true);
    
    // Return the role so the component can redirect
    return { user, role: user.role };
  };

  // Logout
  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authAPI.logout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.clear();
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  // Verify email
  const verifyEmail = async (token) => {
    const response = await authAPI.verifyEmail(token);
    const { access_token, refresh_token, user } = response.data;

    if (access_token && refresh_token) {
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(user);
      setUserRole(user.role);
      setIsAuthenticated(true);
    }
    
    return response.data;
  };

  // Resend verification email
  const resendVerification = async (email) => {
    return await authAPI.resendVerification(email);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return userRole === role;
  };

  // Check if user is admin
  const isAdmin = () => userRole === 'admin';
  
  // Check if user is agent
  const isAgent = () => userRole === 'agent';
  
  // Check if user is customer
  const isCustomer = () => userRole === 'customer';

  const value = {
    user,
    loading,
    isAuthenticated,
    userRole,
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
    hasRole,
    isAdmin,
    isAgent,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
