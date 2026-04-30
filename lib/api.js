'use client';

import axios from 'axios';
import { getCSRFToken, fetchCSRFToken } from './csrf';

const BACKEND_URL = 'https://site--hng14-backend--nlrjqkv9zhwn.code.run';

// Central axios instance — all API calls go through this
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // sends HTTP-only cookies automatically
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '1'
  }
});

// Request interceptor — add CSRF token to state-changing requests
api.interceptors.request.use(
  async (config) => {
    // Add CSRF token to POST, PUT, DELETE, PATCH requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);



// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh — cookies sent automatically
        await axios.post(
          `${BACKEND_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry original request
        return api(originalRequest);
      } catch {
        // Refresh failed — redirect to login
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    // 403 — redirect to login
    if (error.response?.status === 403) {
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;
