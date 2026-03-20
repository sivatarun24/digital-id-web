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
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || data?.message || 'Request failed');
  return data;
}

export function fetchNotifications() {
  return request('/api/notifications');
}

export function toggleRead(id) {
  return request(`/api/notifications/${id}/toggle-read`, { method: 'PUT' });
}

export function markAllRead() {
  return request('/api/notifications/mark-all-read', { method: 'PUT' });
}

export function dismissNotification(id) {
  return request(`/api/notifications/${id}`, { method: 'DELETE' });
}
