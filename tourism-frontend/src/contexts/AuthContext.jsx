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

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register - No auto-login, user must verify email first
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    // Don't auto-login - just return the response with message
    return response.data;
  };

  // Login
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    setUser(user);
    setIsAuthenticated(true);
    return response.data;
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
    setIsAuthenticated(false);
  };

  // Verify email
  const verifyEmail = async (token) => {
    const response = await authAPI.verifyEmail(token);
    const { access_token, refresh_token, user } = response.data;

    // After verification, store tokens and set user
    if (access_token && refresh_token) {
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(user);
      setIsAuthenticated(true);
    }
    
    return response.data;
  };

  // Resend verification email
  const resendVerification = async (email) => {
    return await authAPI.resendVerification(email);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};