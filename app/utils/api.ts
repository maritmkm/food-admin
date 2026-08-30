const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_auth_token') || localStorage.getItem('auth_token') || localStorage.getItem('food_auth_token');
  }
  return null;
}

export function setAuthToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('admin_auth_token', token);
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('admin_auth_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('food_auth_token');
    }
  }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
