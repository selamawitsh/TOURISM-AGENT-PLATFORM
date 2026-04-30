// src/services/destinationService.js
import apiClient from './api'; // Use the main api.js, not apiClient.js

export const destinationService = {
  getAll: (page = 1, pageSize = 20) => 
    apiClient.get(`/destinations?page=${page}&page_size=${pageSize}`),
  
  getFeatured: (limit = 6) => 
    apiClient.get(`/destinations/featured?limit=${limit}`),
  
  getById: (id) => 
    apiClient.get(`/destinations/${id}`),
  
  getBySlug: (slug) => 
    apiClient.get(`/destinations/slug/${slug}`),
  
  getCategories: () => 
    apiClient.get('/destinations/categories'),
  
  create: (data) => 
    apiClient.post('/admin/destinations', data),
  
  update: (id, data) => 
    apiClient.put(`/admin/destinations/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/admin/destinations/${id}`),
  
  createCategory: (data) => 
    apiClient.post('/admin/destinations/categories', data),
};