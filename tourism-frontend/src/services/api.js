import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api/v1';
const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:8082/api/v1';
const DESTINATION_API_URL = import.meta.env.VITE_DESTINATION_API_URL || 'http://localhost:8083/api/v1';
const BOOKING_API_URL = import.meta.env.VITE_BOOKING_API_URL || 'http://localhost:8084/api/v1';
const FAVORITES_API_URL = import.meta.env.VITE_FAVORITES_API_URL || 'http://localhost:8085/api/v1';
const REVIEW_API_URL = import.meta.env.VITE_REVIEW_API_URL || 'http://localhost:8086/api/v1';
const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:8087/api/v1';
const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8088/api/v1';


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

// Add review API client
const reviewApi = axios.create({
  baseURL: REVIEW_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add payment API client
const paymentApi = axios.create({
  baseURL: PAYMENT_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const analyticsApi = axios.create({
  baseURL: ANALYTICS_API_URL,
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
reviewApi.interceptors.request.use(addToken);
paymentApi.interceptors.request.use(addToken);
analyticsApi.interceptors.request.use(addToken);



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
reviewApi.interceptors.response.use(null, handleResponseError);
paymentApi.interceptors.response.use(null, handleResponseError);
analyticsApi.interceptors.response.use(null, handleResponseError);

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

// Favorites API calls
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

// Add review API calls
export const reviewAPI = {
  // Get reviews for a destination (public)
  getDestinationReviews: (destinationId, page = 1, pageSize = 10) => 
    reviewApi.get(`/reviews/destinations/${destinationId}?page=${page}&page_size=${pageSize}`),
  
  // Create a review
  createReview: (data) => reviewApi.post('/reviews', data),
  
  // Get my reviews
  getMyReviews: () => reviewApi.get('/reviews/me'),
  
  // Update a review
  updateReview: (id, data) => reviewApi.put(`/reviews/${id}`, data),
  
  // Delete a review
  deleteReview: (id) => reviewApi.delete(`/reviews/${id}`),
  
  // Mark review as helpful
  markHelpful: (id) => reviewApi.post(`/reviews/${id}/helpful`),
};

export const paymentAPI = {
  // Initialize payment for a booking
  initializePayment: (bookingId) => paymentApi.post('/payments/initialize', { booking_id: bookingId }),
  
  // Verify payment status
  verifyPayment: (transactionRef) => paymentApi.get(`/payments/verify/${transactionRef}`),
  
  // Get payment status
  getPaymentStatus: (transactionRef) => paymentApi.get(`/payments/status/${transactionRef}`),
};

export const analyticsAPI = {
  // Dashboard summary
  getDashboardSummary: () => analyticsApi.get('/admin/analytics/dashboard'),
  
  // Booking analytics
  getBookingAnalytics: (period = 'month') => analyticsApi.get(`/admin/analytics/bookings?period=${period}`),
  
  // Revenue analytics
  getRevenueAnalytics: (period = 'month') => analyticsApi.get(`/admin/analytics/revenue?period=${period}`),
  
  // Popular destinations
  getPopularDestinations: (limit = 10) => analyticsApi.get(`/admin/analytics/popular-destinations?limit=${limit}`),
  
  // User growth
  getUserGrowth: (period = 'month') => analyticsApi.get(`/admin/analytics/user-growth?period=${period}`),
  
  // Review analytics
  getReviewAnalytics: () => analyticsApi.get('/admin/analytics/reviews'),
};
export default { authApi, userApi, destinationApi, bookingApi, paymentApi };