import { getAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || data?.message || 'Request failed');
  return data;
}

export function fetchCredentials() {
  return request('/api/credentials');
}

export function startCredentialVerification(credentialType, fields = {}, file = null) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') form.append(k, String(v));
  });
  if (file) form.append('file', file);
  return fetch(`${API_BASE_URL}/api/credentials/${credentialType}/start`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: form,
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || data?.message || 'Request failed');
    return data;
  });
}

export function submitCredentialDocument(credentialType, file, verificationEmail = null) {
  const form = new FormData();
  form.append('file', file);
  if (verificationEmail) form.append('verificationEmail', verificationEmail);
  return request(`/api/credentials/${credentialType}/submit`, {
    method: 'POST',
    body: form,
  });
}

export function requestCredentialEmailVerification(credentialType, email) {
  return request(`/api/credentials/${credentialType}/request-email-verification`, {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function verifyCredentialEmailToken(token) {
  return request('/api/credentials/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: { 'Content-Type': 'application/json' },
  });
}
