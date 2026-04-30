'use client';

// Simple CSRF token management
let csrfToken = null;

export const getCSRFToken = () => {
  if (!csrfToken) {
    // Generate a random token
    csrfToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return csrfToken;
};

export const resetCSRFToken = () => {
  csrfToken = null;
};

// Get token from server (more secure approach)
export const fetchCSRFToken = async () => {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return getCSRFToken(); // Fallback to client-generated
  }
};
