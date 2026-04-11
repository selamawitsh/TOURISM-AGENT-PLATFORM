import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api/v1';
const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:8082/api/v1';

// Auth API client (for auth endpoints)
const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// User API client (for user endpoints)
const userApi = axios.create({
  baseURL: USER_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token to BOTH clients
const addToken = (config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(addToken);
userApi.interceptors.request.use(addToken);

// Response interceptor to handle token refresh
const handleResponseError = async (error) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const response = await authApi.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return originalRequest._apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
  }
  return Promise.reject(error);
};

authApi.interceptors.response.use(null, handleResponseError);
userApi.interceptors.response.use(null, handleResponseError);

// Auth API calls
export const authAPI = {
  register: (userData) => authApi.post('/auth/register', userData),
  login: (credentials) => authApi.post('/auth/login', credentials),
  getMe: () => authApi.get('/auth/me'),
  logout: (refreshToken) => authApi.post('/auth/logout', { refresh_token: refreshToken }),
  refresh: (refreshToken) => authApi.post('/auth/refresh', { refresh_token: refreshToken }),
  
  // Email verification endpoints
  verifyEmail: (token) => authApi.post('/auth/verify-email', { token }),
  resendVerification: (email) => authApi.post('/auth/resend-verification', { email }),

  // Password reset 
  forgotPassword: (email) => authApi.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => authApi.post('/auth/reset-password', { token, new_password: newPassword }),
};

// User API calls
export const userAPI = {
  // Self service
  getProfile: () => userApi.get('/users/me'),
  updateProfile: (data) => userApi.put('/users/me', data),
  
  // Admin only
  getAllUsers: (page = 1, pageSize = 20) => userApi.get(`/admin/users?page=${page}&page_size=${pageSize}`),
  getUserById: (id) => userApi.get(`/admin/users/${id}`),
  createUser: (data) => userApi.post('/admin/users', data),
  updateUserRole: (id, role) => userApi.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => userApi.delete(`/admin/users/${id}`),
};

export default { authApi, userApi };