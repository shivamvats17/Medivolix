// Centralized API client for Medivolix
// Connects to Core Java Servlets backend via /api or configured VITE_API_BASE_URL.

function getBaseUrl() {
  let base = import.meta.env.VITE_API_BASE_URL || '/api';
  base = base.trim().replace(/\/+$/, '');
  // If base is a full URL like "http://localhost:8080" without /api, ensure /api is appended
  if (base.startsWith('http') && !base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base || '/api';
}

const BASE_URL = getBaseUrl();

export async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const defaultHeaders = {
    'Accept': 'application/json',
  };

  // Only set Content-Type if there's a body and it's not FormData
  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Retrieve fallback auth token from localStorage if session cookie is not used
  const storedUser = localStorage.getItem('medivolix_user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.id) {
        defaultHeaders['Authorization'] = `Bearer ${parsed.id}`;
      }
    } catch {
      // ignore
    }
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Include credentials (session cookies) for secure HttpOnly cookie session support
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        if (!text || text.trim().startsWith('<')) {
          data = {
            message: response.status === 404
              ? 'Requested API endpoint not found (HTTP 404). Please ensure the backend is running and the endpoint is mapped.'
              : `Backend returned HTTP ${response.status} (${response.statusText || 'Error'})`,
          };
        } else {
          data = { message: text };
        }
      }
    }

    if (!response.ok) {
      let errorMessage = data?.message;
      if (!errorMessage) {
        if (response.status === 404) {
          errorMessage = 'The requested resource or API endpoint was not found (HTTP 404). Please ensure the backend server is running.';
        } else if (response.status === 502 || response.status === 503 || response.status === 504) {
          errorMessage = 'The Medivolix backend server is unreachable. Please ensure the backend is running on port 8080.';
        } else {
          errorMessage = `Request failed with status ${response.status}${response.statusText ? ` (${response.statusText})` : ''}`;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    // Backend returns standard ApiResponse: { success: true, message: "...", data: ... }
    return data?.data !== undefined ? data.data : data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to backend server. Ensure Tomcat / Java backend is running on port 8080.');
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};
