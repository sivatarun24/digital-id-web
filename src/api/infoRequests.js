import { getAccessToken } from './auth';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...authHeaders(),
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data;
}

async function fetchFile(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

export function adminCreateInfoRequest(userId, note, source = 'user_detail') {
  return request('/api/admin/info-requests', {
    method: 'POST',
    body: JSON.stringify({ userId, note, source }),
  });
}

export function adminGetInfoRequests(userId) {
  return request(`/api/admin/info-requests?userId=${userId}`);
}

export function adminDeleteInfoRequest(id) {
  return request(`/api/admin/info-requests/${id}`, { method: 'DELETE' });
}

export function adminOpenResponseFile(requestId, fileIndex) {
  return fetchFile(`/api/admin/info-requests/${requestId}/files/${fileIndex}`);
}

// ── User endpoints ────────────────────────────────────────────────────────────

export function getMyInfoRequests() {
  return request('/api/info-requests');
}

export function respondToInfoRequest(requestId, message, files = []) {
  const formData = new FormData();
  if (message) formData.append('message', message);
  files.forEach(f => formData.append('files', f));
  return request(`/api/info-requests/${requestId}/respond`, {
    method: 'POST',
    body: formData,
  });
}

export function openMyResponseFile(requestId, fileIndex) {
  return fetchFile(`/api/info-requests/${requestId}/files/${fileIndex}`);
}
