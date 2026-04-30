'use client';

import { useEffect } from 'react';
import { fetchCSRFToken } from '@/lib/csrf';

export default function CSRFInitializer() {
  useEffect(() => {
    // Initialize CSRF token when component mounts
    fetchCSRFToken().catch(console.error);
  }, []);

  return null; // This component doesn't render anything
}
