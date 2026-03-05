const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TOKEN_KEY = 'auth_access_token';

let accessToken = (typeof localStorage !== 'undefined' && localStorage.getItem(TOKEN_KEY)) || null;

export function setAccessToken(token) {
  accessToken = token;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}

export function getAccessToken() {
  return accessToken;
}

/** Clear stored token (e.g. on logout). */
export function clearSession() {
  accessToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    credentials: 'include',
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      accessToken = null;
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch (_) {}
    }
    const message = data?.message || data?.error || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

/**
 * Login via username, email, or phone + password.
 * Sends the correct key based on input: username | email | phoneNo (string).
 * Stores JWT for subsequent requests.
 */
export function login({ identifier, password }) {
  const raw = (identifier ?? '').trim();
  const digitsOnly = raw.replace(/\D/g, '');
  const isPhone = digitsOnly.length >= 10 && /^\d+$/.test(digitsOnly);
  const isEmail = raw.includes('@');

  let body;
  if (isEmail) {
    body = { email: raw, password };
  } else if (isPhone) {
    body = { phoneNo: digitsOnly, password };
  } else {
    body = { username: raw, password };
  }

  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((data) => {
    if (data?.accessToken) {
      accessToken = data.accessToken;
      try {
        localStorage.setItem(TOKEN_KEY, data.accessToken);
      } catch (_) {}
    }
    return data;
  });
}

/** Check uniqueness: field is 'username' | 'email' | 'phoneno', value is the string to check. */
export function checkAvailability(field, value) {
  const params = new URLSearchParams({ field, value: String(value ?? '').trim() });
  return request(`/api/auth/check-availability?${params}`);
}

/** Request password reset email. */
export function forgotPassword(email) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: (email ?? '').trim() }),
  });
}

/** Reset password using token from email. */
export function resetPassword({ token, newPassword }) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token: (token ?? '').trim(), newPassword: newPassword ?? '' }),
  });
}

/** Change password (authenticated). Requires current password and new password. */
export function changePassword({ oldPassword, newPassword }) {
  return request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      oldPassword: oldPassword ?? '',
      newPassword: newPassword ?? '',
    }),
  });
}

export function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchMe() {
  return request('/api/auth/me', { method: 'GET' }).then((data) => data?.user ?? data);
}

