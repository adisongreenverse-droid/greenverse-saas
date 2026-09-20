// src/config/api.js

// This configuration checks if a production API URL is provided.
// During local development, it defaults to localhost.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
