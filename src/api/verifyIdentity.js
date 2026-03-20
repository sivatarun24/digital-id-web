import { getAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function fetchVerificationStatus() {
  return fetch(`${API_BASE_URL}/api/verify-identity/status`, {
    credentials: 'include',
    headers: authHeaders(),
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch status');
    return data;
  });
}

export function submitVerification({ idType, frontFile, backFile, selfieFile }) {
  const formData = new FormData();
  formData.append('idType', idType);
  formData.append('frontFile', frontFile);
  if (backFile) formData.append('backFile', backFile);
  formData.append('selfieFile', selfieFile);

  return fetch(`${API_BASE_URL}/api/verify-identity/submit`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: formData,
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || data?.message || 'Submission failed');
    return data;
  });
}
