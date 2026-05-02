// src/services/destinationService.js
import apiClient from './api'; // Use the main api.js, not apiClient.js

// Lightweight in-memory cache for GET requests to reduce duplicate network calls.
const GET_CACHE = new Map();
const DEFAULT_TTL = 60 * 1000; // 60 seconds

const cachedGet = async (url, { ttl = DEFAULT_TTL } = {}) => {
  const now = Date.now();
  const entry = GET_CACHE.get(url);
  if (entry && entry.expires > now) {
    return entry.value;
  }

  const promise = apiClient.get(url).then((res) => {
    GET_CACHE.set(url, { value: res, expires: Date.now() + ttl });
    return res;
  });

  // Store in cache immediately to dedupe concurrent requests
  GET_CACHE.set(url, { value: promise, expires: Date.now() + ttl });
  return promise;
};

export const destinationService = {
  getAll: (page = 1, pageSize = 20) =>
    cachedGet(`/destinations?page=${page}&page_size=${pageSize}`),

  getFeatured: (limit = 6) =>
    cachedGet(`/destinations/featured?limit=${limit}`),

  getById: (id) =>
    cachedGet(`/destinations/${id}`),

  getBySlug: (slug) =>
    cachedGet(`/destinations/slug/${slug}`),

  getCategories: () =>
    cachedGet('/destinations/categories'),

  // Mutations should bypass cache
  create: (data) => apiClient.post('/admin/destinations', data),
  update: (id, data) => apiClient.put(`/admin/destinations/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/destinations/${id}`),
  createCategory: (data) => apiClient.post('/admin/destinations/categories', data),
  
  // Utility: invalidate cache key (optional)
  _invalidate: (urlPattern) => {
    if (!urlPattern) {
      GET_CACHE.clear();
      return;
    }
    for (const key of GET_CACHE.keys()) {
      if (key.includes(urlPattern)) GET_CACHE.delete(key);
    }
  },
};