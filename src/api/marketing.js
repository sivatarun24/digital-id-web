import { getAccessToken } from './auth';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

async function request(path, options = {}) {
  const token = getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Templates ─────────────────────────────────────────────────────────────────

export const listTemplates = () => request('/api/admin/marketing/templates');

export const createTemplate = (data) =>
  request('/api/admin/marketing/templates', { method: 'POST', body: JSON.stringify(data) });

export const updateTemplate = (id, data) =>
  request(`/api/admin/marketing/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTemplate = (id) =>
  request(`/api/admin/marketing/templates/${id}`, { method: 'DELETE' });

// ── Campaigns ─────────────────────────────────────────────────────────────────

export const listCampaigns = () => request('/api/admin/marketing/campaigns');

export const createCampaign = (data) =>
  request('/api/admin/marketing/campaigns', { method: 'POST', body: JSON.stringify(data) });

export const updateCampaign = (id, data) =>
  request(`/api/admin/marketing/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const sendCampaign = (id) =>
  request(`/api/admin/marketing/campaigns/${id}/send`, { method: 'POST' });

export const cancelCampaign = (id) =>
  request(`/api/admin/marketing/campaigns/${id}/cancel`, { method: 'POST' });
