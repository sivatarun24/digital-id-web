const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

function getInitialToken(key) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(key);
    }
  } catch {
    // Ignore
  }
  return null;
}

let accessToken = getInitialToken(TOKEN_KEY);
let refreshTokenValue = getInitialToken(REFRESH_TOKEN_KEY);
let isRefreshing = false;
let refreshSubscribers = [];

export function setAccessToken(token) {
  accessToken = token;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage errors (e.g. disabled cookies, private mode)
  }
}

export function getAccessToken() {
  return accessToken;
}

function setRefreshToken(token) {
  refreshTokenValue = token;
  try {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
}

/** Clear stored tokens (e.g. on logout). */
export function clearSession() {
  accessToken = null;
  refreshTokenValue = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
}

/** Attempt a silent token refresh. Returns new access token or throws. */
async function doRefresh() {
  if (!refreshTokenValue) throw new Error('No refresh token');
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error('Refresh failed');
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  return data.accessToken;
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function request(path, options = {}, _isRetry = false) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
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

  if (response.status === 401 && !_isRetry && refreshTokenValue) {
    // Queue concurrent requests while a refresh is in flight
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push(async () => {
          try {
            resolve(await request(path, options, true));
          } catch (e) {
            reject(e);
          }
        });
      });
    }

    isRefreshing = true;
    try {
      await doRefresh();
      isRefreshing = false;
      onRefreshed(accessToken);
      return request(path, options, true);
    } catch {
      isRefreshing = false;
      refreshSubscribers = [];
      clearSession();
      const message = data?.message || data?.error || 'Session expired. Please sign in again.';
      throw new Error(message);
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
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
      setAccessToken(data.accessToken);
    }
    if (data?.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
    return data;
  });
}

/** Call backend logout to invalidate session, then clear local tokens. */
export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore errors — always clear local session
  } finally {
    clearSession();
  }
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

/** Request an email OTP for password change after validating the current password. */
export function requestPasswordChangeOtp({ oldPassword }) {
  return request('/api/auth/change-password/request-otp', {
    method: 'POST',
    body: JSON.stringify({
      oldPassword: oldPassword ?? '',
    }),
  });
}

/** Change password (authenticated). Requires current password, confirmed new password, and email OTP. */
export function changePassword({ oldPassword, newPassword, confirmNewPassword, otp }) {
  return request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      oldPassword: oldPassword ?? '',
      newPassword: newPassword ?? '',
      confirmNewPassword: confirmNewPassword ?? '',
      otp: otp ?? '',
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

/** Verify email using the token from the verification link. */
export function verifyEmail(token) {
  const params = new URLSearchParams({ token });
  return request(`/api/auth/verify-email?${params}`, { method: 'GET' });
}

/** Resend the verification email to the given address. */
export function resendVerification(email) {
  return request('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email: (email ?? '').trim() }),
  });
}

/** Update editable profile fields (name, dateOfBirth, gender). */
export function updateProfile(payload) {
  return request('/api/auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** Permanently delete the authenticated account. */
export function deleteAccount(password) {
  return request('/api/auth/account', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

/** Get TOTP setup info (secret + QR URI). */
export function twoFactorSetup() {
  return request('/api/auth/2fa/setup', { method: 'GET' });
}

/** Enable 2FA after verifying the authenticator app code. */
export function twoFactorEnable(code) {
  return request('/api/auth/2fa/enable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

/** Disable 2FA by providing the current authenticator code. */
export function twoFactorDisable(code) {
  return request('/api/auth/2fa/disable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

