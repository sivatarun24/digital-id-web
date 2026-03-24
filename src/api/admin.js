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
  return res.json();
}

// ── Super Admin ───────────────────────────────────────────────────────────────

export const adminGetStats = () => request('/api/admin/stats');

export const adminListUsers = (params = {}) => {
  const q = new URLSearchParams(Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  )).toString();
  return request(`/api/admin/users${q ? `?${q}` : ''}`);
};

export const adminGetUser = (id) => request(`/api/admin/users/${id}`);

export const adminCreateUser = (data) =>
  request('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminUpdateUserStatus = (id, status) =>
  request(`/api/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const adminUpdateUserRole = (id, role, institutionId) =>
  request(`/api/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role, institutionId }),
  });

export const adminDeleteUser = (id, adminPassword) =>
  request(`/api/admin/users/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ adminPassword }),
  });

export const adminListVerifications = (status) =>
  request(`/api/admin/verifications${status ? `?status=${status}` : ''}`);

export const adminGetVerification = (id) => request(`/api/admin/verifications/${id}`);

export const adminReviewVerification = (id, status, notes) =>
  request(`/api/admin/verifications/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes }),
  });

export async function adminGetVerificationFile(id, side) {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/api/admin/verifications/${id}/files/${side}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export const adminListDocuments = (status) =>
  request(`/api/admin/documents${status ? `?status=${status}` : ''}`);

export const adminReviewDocument = (id, status) =>
  request(`/api/admin/documents/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const adminDeleteDocument = (id) =>
  request(`/api/admin/documents/${id}`, {
    method: 'DELETE',
  });

export const adminListInstitutions = () => request('/api/admin/institutions');

export const adminGetInstitution = (id) => request(`/api/admin/institutions/${id}`);

export const adminUpdateInstitutionPermissions = (id, perms, adminPassword) =>
  request(`/api/admin/institutions/${id}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify({ ...perms, adminPassword }),
  });

export const adminCreateInstitution = (data) =>
  request('/api/admin/institutions', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminUpdateInstitution = (id, data) =>
  request(`/api/admin/institutions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const adminDeleteInstitution = (id, adminPassword) =>
  request(`/api/admin/institutions/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ adminPassword }),
  });

export const adminAssignInstAdmin = (institutionId, userId) =>
  request(`/api/admin/institutions/${institutionId}/assign-admin`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });

export const adminGetInstitutionMembers = (id) =>
  request(`/api/admin/institutions/${id}/members`);

export async function adminGetDocumentFile(id) {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/api/admin/documents/${id}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

// ── Institutional Admin ───────────────────────────────────────────────────────

export const instAdminGetStats = () => request('/api/inst-admin/stats');

export const instAdminGetPermissions = () => request('/api/inst-admin/permissions');

export const instAdminListUsers = (q) =>
  request(`/api/inst-admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`);

export const instAdminGetUser = (id) => request(`/api/inst-admin/users/${id}`);

export const instAdminListVerifications = (status) =>
  request(`/api/inst-admin/verifications${status ? `?status=${status}` : ''}`);

export const instAdminReviewVerification = (id, status, notes) =>
  request(`/api/inst-admin/verifications/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes }),
  });

export async function instAdminGetVerificationFile(id, side) {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/api/inst-admin/verifications/${id}/files/${side}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export const instAdminListDocuments = (status) =>
  request(`/api/inst-admin/documents${status ? `?status=${status}` : ''}`);

export const instAdminReviewDocument = (id, status) =>
  request(`/api/inst-admin/documents/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const instAdminDeleteDocument = (id) =>
  request(`/api/inst-admin/documents/${id}`, {
    method: 'DELETE',
  });

export async function instAdminGetDocumentFile(id) {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/api/inst-admin/documents/${id}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

// ── Admin Credentials ─────────────────────────────────────────────────────────
export const adminListCredentials = (status) => {
  const qs = status ? `?status=${status}` : '';
  return request(`/api/admin/credentials${qs}`);
};
export const adminReviewCredential = (id, status, notes) =>
  request(`/api/admin/credentials/${id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  });

// ── Inst Admin Credentials ────────────────────────────────────────────────────
export const instAdminListCredentials = (status) => {
  const qs = status ? `?status=${status}` : '';
  return request(`/api/inst-admin/credentials${qs}`);
};
export const instAdminReviewCredential = (id, status, notes) =>
  request(`/api/inst-admin/credentials/${id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  });

export async function adminGetCredentialFile(id) {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/api/admin/credentials/${id}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export async function instAdminGetCredentialFile(id) {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/api/inst-admin/credentials/${id}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
