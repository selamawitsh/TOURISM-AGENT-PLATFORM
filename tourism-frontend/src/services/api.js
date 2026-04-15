import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api/v1';
const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:8082/api/v1';
const DESTINATION_API_URL = import.meta.env.VITE_DESTINATION_API_URL || 'http://localhost:8083/api/v1';
const BOOKING_API_URL = import.meta.env.VITE_BOOKING_API_URL || 'http://localhost:8084/api/v1';
const FAVORITES_API_URL = import.meta.env.VITE_FAVORITES_API_URL || 'http://localhost:8085/api/v1';


// Auth API client
const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// User API client
const userApi = axios.create({
  baseURL: USER_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Destination API client
const destinationApi = axios.create({
  baseURL: DESTINATION_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Booking API client
const bookingApi = axios.create({
  baseURL: BOOKING_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add favorites API client
const favoritesApi = axios.create({
  baseURL: FAVORITES_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token to ALL clients
const addToken = (config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(addToken);
userApi.interceptors.request.use(addToken);
destinationApi.interceptors.request.use(addToken);
bookingApi.interceptors.request.use(addToken);
favoritesApi.interceptors.request.use(addToken);

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
destinationApi.interceptors.response.use(null, handleResponseError);
bookingApi.interceptors.response.use(null, handleResponseError);
favoritesApi.interceptors.response.use(null, handleResponseError);


// Auth API calls
export const authAPI = {
  register: (userData) => authApi.post('/auth/register', userData),
  login: (credentials) => authApi.post('/auth/login', credentials),
  getMe: () => authApi.get('/auth/me'),
  logout: (refreshToken) => authApi.post('/auth/logout', { refresh_token: refreshToken }),
  refresh: (refreshToken) => authApi.post('/auth/refresh', { refresh_token: refreshToken }),
  verifyEmail: (token) => authApi.post('/auth/verify-email', { token }),
  resendVerification: (email) => authApi.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => authApi.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => authApi.post('/auth/reset-password', { token, new_password: newPassword }),
};

// User API calls
export const userAPI = {
  getProfile: () => userApi.get('/users/me'),
  updateProfile: (data) => userApi.put('/users/me', data),
  getAllUsers: (page = 1, pageSize = 20) => userApi.get(`/admin/users?page=${page}&page_size=${pageSize}`),
  getUserById: (id) => userApi.get(`/admin/users/${id}`),
  createUser: (data) => userApi.post('/admin/users', data),
  updateUserRole: (id, role) => userApi.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => userApi.delete(`/admin/users/${id}`),
};

// Destination API calls
export const destinationAPI = {
  getAllDestinations: (page = 1, pageSize = 20) => 
    destinationApi.get(`/destinations?page=${page}&page_size=${pageSize}`),
  getFeaturedDestinations: (limit = 6) => 
    destinationApi.get(`/destinations/featured?limit=${limit}`),
  getDestinationById: (id) => 
    destinationApi.get(`/destinations/${id}`),
  getDestinationBySlug: (slug) => 
    destinationApi.get(`/destinations/slug/${slug}`),
  getAllCategories: () => 
    destinationApi.get('/destinations/categories'),
  createDestination: (data) => 
    destinationApi.post('/admin/destinations', data),
  updateDestination: (id, data) => 
    destinationApi.put(`/admin/destinations/${id}`, data),
  deleteDestination: (id) => 
    destinationApi.delete(`/admin/destinations/${id}`),
  createCategory: (data) => 
    destinationApi.post('/admin/destinations/categories', data),
};

// Booking API calls
export const bookingAPI = {
  // User endpoints
  createBooking: (data) => bookingApi.post('/bookings', data),
  getMyBookings: (page = 1, pageSize = 20) => 
    bookingApi.get(`/bookings?page=${page}&page_size=${pageSize}`),
  getBookingById: (id) => bookingApi.get(`/bookings/${id}`),
  cancelBooking: (id) => bookingApi.post(`/bookings/${id}/cancel`),
  
  // Admin endpoints
  getAllBookings: (page = 1, pageSize = 20) => 
    bookingApi.get(`/admin/bookings?page=${page}&page_size=${pageSize}`),
};

// Add to your existing exports
export const favoritesAPI = {
  // Add a destination to favorites
  addFavorite: (destinationId) => favoritesApi.post('/favorites', { destination_id: destinationId }),
  
  // Remove a destination from favorites
  removeFavorite: (destinationId) => favoritesApi.delete(`/favorites/${destinationId}`),
  
  // Get all user's favorites
  getFavorites: () => favoritesApi.get('/favorites'),
  
  // Check if a destination is favorited
  checkFavorite: (destinationId) => favoritesApi.get(`/favorites/check/${destinationId}`),
};


export default { authApi, userApi, destinationApi, bookingApi };