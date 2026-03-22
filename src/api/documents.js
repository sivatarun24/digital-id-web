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
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Something went wrong');
  }
  return data;
}

export function fetchDocuments() {
  return request('/api/documents', { method: 'GET' });
}

export function uploadDocument({ documentType, issuer, expiresAt, file }) {
  const formData = new FormData();
  formData.append('documentType', documentType);
  if (issuer) formData.append('issuer', issuer);
  if (expiresAt) formData.append('expiresAt', expiresAt);
  formData.append('file', file);

  return fetch(`${API_BASE_URL}/api/documents`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: formData,
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || data?.message || 'Upload failed');
    return data;
  });
}

export function replaceDocument(id, file) {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(`${API_BASE_URL}/api/documents/${id}/file`, {
    method: 'PUT',
    credentials: 'include',
    headers: authHeaders(),
    body: formData,
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || data?.message || 'Replace failed');
    return data;
  });
}

export function deleteDocument(id) {
  return request(`/api/documents/${id}`, { method: 'DELETE' });
}

export async function openDocumentFile(id) {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}/file`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to load file');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
