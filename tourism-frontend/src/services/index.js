// src/services/index.js
// Export everything from the main api.js file

export { default as apiClient } from './api';
export * from './api';

// Also export destinationService if it's separate
export { destinationService } from './destinationService';