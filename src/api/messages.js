import { getAccessToken } from './auth';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data;
}

// ── Any authenticated user sends ──────────────────────────────────────────────

export function sendToAdmin(subject, body) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ subject, body, target: 'ADMIN' }),
  });
}

export function sendToInstAdmin(subject, body) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ subject, body, target: 'INST_ADMIN' }),
  });
}

export function getMyMessages() {
  return request('/api/messages/mine');
}

// ── Admin inbox ───────────────────────────────────────────────────────────────

export function getAdminMessages() {
  return request('/api/admin/messages');
}

export function markAdminRead(id) {
  return request(`/api/admin/messages/${id}/read`, { method: 'PUT' });
}

export function deleteAdminMessage(id) {
  return request(`/api/admin/messages/${id}`, { method: 'DELETE' });
}

// ── Inst-admin inbox ──────────────────────────────────────────────────────────

export function getInstMessages() {
  return request('/api/inst-admin/messages');
}

export function markInstRead(id) {
  return request(`/api/inst-admin/messages/${id}/read`, { method: 'PUT' });
}

export function deleteInstMessage(id) {
  return request(`/api/inst-admin/messages/${id}`, { method: 'DELETE' });
}
