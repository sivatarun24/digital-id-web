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

// ── Developer self-service (public — no auth token needed) ─────────────────

export function registerDevApp(body) {
  return fetch(`${API_BASE_URL}/api/developers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || 'Registration failed');
    return data;
  });
}

// ── Consent / user grants (JWT protected) ──────────────────────────────────

export function fetchConsentInfo(appId, credentialType) {
  return request(`/api/consent/request?app_id=${appId}&credential_type=${credentialType}`);
}

export function approveConsent(appId, credentialType) {
  return request('/api/consent/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId, credentialType }),
  });
}

export function fetchMyGrants() {
  return request('/api/consent/grants');
}

export function revokeGrant(id) {
  return request(`/api/consent/grants/${id}`, { method: 'DELETE' });
}
