import axios from 'axios';

// SINGLE API GATEWAY URL
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api/v1';

// Public endpoints that should NOT send Authorization header
const PUBLIC_ENDPOINTS = [
  '/destinations',
  '/destinations/featured',
  '/destinations/categories',
  '/reviews/destinations',
  '/health',
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/ai/parse',
  '/ai/itinerary',
  '/ai/recommendations',
  '/ai/enhance-destination',
  '/ai/smart-booking-recommendation',
  '/ai/dynamic-pricing',
];

const isPublicEndpoint = (url) => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Create API client
const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 30000,
});

// Request interceptor - ONLY add token for protected routes
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    
    // Don't add token for public endpoints
    if (isPublicEndpoint(url)) {
      delete config.headers.Authorization;
      return config;
    }
    
    // Add token only for protected endpoints
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    
    // Don't retry for public endpoints
    if (isPublicEndpoint(url)) {
      return Promise.reject(error);
    }
    
    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_GATEWAY_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.clear();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }
    
    // Handle 403 - invalid token
    if (error.response?.status === 403) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),
  logout: (refreshToken) => apiClient.post('/auth/logout', { refresh_token: refreshToken }),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  resendVerification: (email) => apiClient.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => apiClient.post('/auth/reset-password', { token, new_password: newPassword }),
};

// User API
export const userAPI = {
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data) => apiClient.put('/users/me', data),
  getAllUsers: (page = 1, pageSize = 20) => apiClient.get(`/admin/users?page=${page}&page_size=${pageSize}`),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (data) => apiClient.post('/admin/users', data),
  updateUserRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
};

// Destination API
export const destinationAPI = {
  getAllDestinations: (page = 1, pageSize = 20) => apiClient.get(`/destinations?page=${page}&page_size=${pageSize}`),
  getFeaturedDestinations: (limit = 6) => apiClient.get(`/destinations/featured?limit=${limit}`),
  getDestinationById: (id) => apiClient.get(`/destinations/${id}`),
  getDestinationBySlug: (slug) => apiClient.get(`/destinations/slug/${slug}`),
  getAllCategories: () => apiClient.get('/destinations/categories'),
  createDestination: (data) => apiClient.post('/admin/destinations', data),
  updateDestination: (id, data) => apiClient.put(`/admin/destinations/${id}`, data),
  deleteDestination: (id) => apiClient.delete(`/admin/destinations/${id}`),
  createCategory: (data) => apiClient.post('/admin/destinations/categories', data),
};

// Booking API
export const bookingAPI = {
  createBooking: (data) => apiClient.post('/bookings', data),
  getMyBookings: (page = 1, pageSize = 20) => apiClient.get(`/bookings?page=${page}&page_size=${pageSize}`),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  cancelBooking: (id) => apiClient.post(`/bookings/${id}/cancel`),
  getAllBookings: (page = 1, pageSize = 20) => apiClient.get(`/admin/bookings?page=${page}&page_size=${pageSize}`),
};

// Favorites API
export const favoritesAPI = {
  addFavorite: (destinationId) => apiClient.post('/favorites', { destination_id: destinationId }),
  removeFavorite: (destinationId) => apiClient.delete(`/favorites/${destinationId}`),
  getFavorites: () => apiClient.get('/favorites'),
  checkFavorite: (destinationId) => apiClient.get(`/favorites/check/${destinationId}`),
};

// Review API
export const reviewAPI = {
  getDestinationReviews: (destinationId, page = 1, pageSize = 10) => 
    apiClient.get(`/reviews/destinations/${destinationId}?page=${page}&page_size=${pageSize}`),
  createReview: (data) => apiClient.post('/reviews', data),
  getMyReviews: () => apiClient.get('/reviews/me'),
  updateReview: (id, data) => apiClient.put(`/reviews/${id}`, data),
  deleteReview: (id) => apiClient.delete(`/reviews/${id}`),
  markHelpful: (id) => apiClient.post(`/reviews/${id}/helpful`),
};

// Payment API
export const paymentAPI = {
  initializePayment: (bookingId) => apiClient.post('/payments/initialize', { booking_id: bookingId }),
  verifyPayment: (transactionRef) => apiClient.get(`/payments/verify/${transactionRef}`),
  getPaymentStatus: (transactionRef) => apiClient.get(`/payments/status/${transactionRef}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardSummary: () => apiClient.get('/admin/analytics/dashboard'),
  getBookingAnalytics: (period = 'month') => apiClient.get(`/admin/analytics/bookings?period=${period}`),
  getRevenueAnalytics: (period = 'month') => apiClient.get(`/admin/analytics/revenue?period=${period}`),
  getPopularDestinations: (limit = 10) => apiClient.get(`/admin/analytics/popular-destinations?limit=${limit}`),
  getUserGrowth: (period = 'month') => apiClient.get(`/admin/analytics/user-growth?period=${period}`),
  getReviewAnalytics: () => apiClient.get('/admin/analytics/reviews'),
};

// AI API
export const aiAPI = {
  parse: (text) => apiClient.post('/ai/parse', { text }),
  itinerary: (prefs) => apiClient.post('/ai/itinerary', prefs),
  recommendations: (data) => apiClient.post('/ai/recommendations', data),
  bookingStatus: (userId) => apiClient.post('/ai/booking-status', { userId }),
  enhanceDestination: (data) => apiClient.post('/ai/enhance-destination', data),
  smartBookingRecommendation: (data) => apiClient.post('/ai/smart-booking-recommendation', data),
  dynamicPricing: (data) => apiClient.post('/ai/dynamic-pricing', data),
};

// System/Health API
export const systemAPI = {
  healthCheck: () => apiClient.get('/health'),
  getGatewayInfo: () => apiClient.get('/health'),
};

export default apiClient;