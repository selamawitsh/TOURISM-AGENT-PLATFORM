import axios from 'axios';

const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL ||
  'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach token only when needed
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global error handling ONLY (no business logic)
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn('Unauthorized request');
    }

    if (status === 403) {
      console.warn('Forbidden request');
    }

    if (status === 429) {
      console.warn('Rate limit hit');
    }

    return Promise.reject(error);
  }
);

export default apiClient;