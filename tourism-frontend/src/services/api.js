import axios from 'axios';

// SINGLE API GATEWAY URL - This is the only URL the frontend needs!
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api/v1';

// Create a single API client for the gateway
const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token to ALL requests
const addToken = (config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(addToken);

// Response interceptor to handle token refresh
const handleResponseError = async (error) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const response = await apiClient.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Clear all auth data and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    } else {
      // No refresh token, redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
  }
  
  // Handle rate limiting
  if (error.response?.status === 429) {
    console.error('Rate limit exceeded. Please try again later.');
    // You could show a notification to the user here
  }
  
  return Promise.reject(error);
};

apiClient.interceptors.response.use(null, handleResponseError);

// Auth API calls
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

// User API calls
export const userAPI = {
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data) => apiClient.put('/users/me', data),
  getAllUsers: (page = 1, pageSize = 20) => apiClient.get(`/admin/users?page=${page}&page_size=${pageSize}`),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (data) => apiClient.post('/admin/users', data),
  updateUserRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
};

// Destination API calls
export const destinationAPI = {
  getAllDestinations: (page = 1, pageSize = 20) => 
    apiClient.get(`/destinations?page=${page}&page_size=${pageSize}`),
  getFeaturedDestinations: (limit = 6) => 
    apiClient.get(`/destinations/featured?limit=${limit}`),
  getDestinationById: (id) => 
    apiClient.get(`/destinations/${id}`),
  getDestinationBySlug: (slug) => 
    apiClient.get(`/destinations/slug/${slug}`),
  getAllCategories: () => 
    apiClient.get('/destinations/categories'),
  createDestination: (data) => 
    apiClient.post('/admin/destinations', data),
  updateDestination: (id, data) => 
    apiClient.put(`/admin/destinations/${id}`, data),
  deleteDestination: (id) => 
    apiClient.delete(`/admin/destinations/${id}`),
  createCategory: (data) => 
    apiClient.post('/admin/destinations/categories', data),
};

// Booking API calls
export const bookingAPI = {
  // User endpoints
  createBooking: (data) => apiClient.post('/bookings', data),
  getMyBookings: (page = 1, pageSize = 20) => 
    apiClient.get(`/bookings?page=${page}&page_size=${pageSize}`),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  cancelBooking: (id) => apiClient.post(`/bookings/${id}/cancel`),
  
  // Admin endpoints
  getAllBookings: (page = 1, pageSize = 20) => 
    apiClient.get(`/admin/bookings?page=${page}&page_size=${pageSize}`),
};

// Favorites API calls
export const favoritesAPI = {
  // Add a destination to favorites
  addFavorite: (destinationId) => apiClient.post('/favorites', { destination_id: destinationId }),
  
  // Remove a destination from favorites
  removeFavorite: (destinationId) => apiClient.delete(`/favorites/${destinationId}`),
  
  // Get all user's favorites
  getFavorites: () => apiClient.get('/favorites'),
  
  // Check if a destination is favorited
  checkFavorite: (destinationId) => apiClient.get(`/favorites/check/${destinationId}`),
};

// Review API calls
export const reviewAPI = {
  // Get reviews for a destination (public)
  getDestinationReviews: (destinationId, page = 1, pageSize = 10) => 
    apiClient.get(`/reviews/destinations/${destinationId}?page=${page}&page_size=${pageSize}`),
  
  // Create a review
  createReview: (data) => apiClient.post('/reviews', data),
  
  // Get my reviews
  getMyReviews: () => apiClient.get('/reviews/me'),
  
  // Update a review
  updateReview: (id, data) => apiClient.put(`/reviews/${id}`, data),
  
  // Delete a review
  deleteReview: (id) => apiClient.delete(`/reviews/${id}`),
  
  // Mark review as helpful
  markHelpful: (id) => apiClient.post(`/reviews/${id}/helpful`),
};

// Payment API calls
export const paymentAPI = {
  // Initialize payment for a booking
  initializePayment: (bookingId) => apiClient.post('/payments/initialize', { booking_id: bookingId }),
  
  // Verify payment status
  verifyPayment: (transactionRef) => apiClient.get(`/payments/verify/${transactionRef}`),
  
  // Get payment status
  getPaymentStatus: (transactionRef) => apiClient.get(`/payments/status/${transactionRef}`),
};

// Analytics API calls
export const analyticsAPI = {
  // Dashboard summary
  getDashboardSummary: () => apiClient.get('/admin/analytics/dashboard'),
  
  // Booking analytics
  getBookingAnalytics: (period = 'month') => apiClient.get(`/admin/analytics/bookings?period=${period}`),
  
  // Revenue analytics
  getRevenueAnalytics: (period = 'month') => apiClient.get(`/admin/analytics/revenue?period=${period}`),
  
  // Popular destinations
  getPopularDestinations: (limit = 10) => apiClient.get(`/admin/analytics/popular-destinations?limit=${limit}`),
  
  // User growth
  getUserGrowth: (period = 'month') => apiClient.get(`/admin/analytics/user-growth?period=${period}`),
  
  // Review analytics
  getReviewAnalytics: () => apiClient.get('/admin/analytics/reviews'),
};

// Health check utility (useful for debugging)
export const systemAPI = {
  healthCheck: () => apiClient.get('/health'),
  getGatewayInfo: () => apiClient.get('/health'), // Gateway returns service info
};

// AI service API calls (proxied through gateway at /api/v1/ai/...)
export const aiAPI = {
  parse: (text) => apiClient.post('/ai/parse', { text }),
  itinerary: (prefs) => apiClient.post('/ai/itinerary', prefs),
  recommendations: (body) => apiClient.post('/ai/recommendations', body),
  bookingStatus: (body) => apiClient.post('/ai/booking-status', body),
};

// Default export for backward compatibility if needed
export default apiClient;