import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import PasswordConfirmModal from '../../../components/admin/PasswordConfirmModal';
import {
  adminListUsers,
  adminUpdateUserStatus,
  adminDeleteUser,
  adminCreateUser,
  adminListInstitutions,
} from '../../../api/admin';

function roleBadge(role) {
  if (role === 'INST_ADMIN') return <span className="badge badge-inst-admin">Inst Admin</span>;
  return <span className="badge badge-user">User</span>;
}

function statusBadge(status) {
  const cls = { ACTIVE: 'badge-active', INACTIVE: 'badge-inactive', DISABLED: 'badge-disabled' }[status] || 'badge-inactive';
  return <span className={`badge ${cls}`}>{status}</span>;
}

const EMPTY_USER_FORM = { name: '', email: '', username: '', password: '', role: 'USER', institutionId: '' };

function CreateUserModal({ institutions, onSave, onClose, busy }) {
  const [form, setForm] = useState(EMPTY_USER_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSubmit = form.name && form.email && form.username && form.password &&
    (form.role !== 'INST_ADMIN' || form.institutionId);

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <p className="admin-modal-title">Create User</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <div>
            <label className="admin-label">Full Name *</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="Full name"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Email *</label>
            <input className="admin-input" style={{ width: '100%' }} type="email" placeholder="email@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Username *</label>
            <input className="admin-input" style={{ width: '100%' }} placeholder="username"
              value={form.username} onChange={e => set('username', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Password *</label>
            <input className="admin-input" style={{ width: '100%' }} type="password" placeholder="Temporary password"
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Role</label>
            <select className="admin-select" style={{ width: '100%' }}
              value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="USER">User</option>
              <option value="INST_ADMIN">Inst. Admin</option>
            </select>
          </div>
          {form.role === 'INST_ADMIN' && (
            <div>
              <label className="admin-label">Institution *</label>
              <select className="admin-select" style={{ width: '100%' }}
                value={form.institutionId} onChange={e => set('institutionId', e.target.value)}>
                <option value="">Select institution…</option>
                {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          )}
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #888)', margin: 0 }}>
            The account will be created as ACTIVE with email pre-verified.
          </p>
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={busy || !canSubmit}>
            {busy ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className={`admin-stat-value${color ? ` ${color}` : ''}`}>{value}</div>
    </div>
  );
}

export default function AdminUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    adminListUsers()
      .then(data => setAllUsers((data || []).filter(u => u.role !== 'ADMIN')))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    adminListInstitutions().then(setInstitutions).catch(() => {});
  }, []);

  // Client-side filtering
  const isFiltering = q.trim() || roleFilter || statusFilter;

  const filtered = allUsers.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter && u.accountStatus !== statusFilter) return false;
    if (q.trim()) {
      const lq = q.trim().toLowerCase();
      if (
        !u.name?.toLowerCase().includes(lq) &&
        !u.email?.toLowerCase().includes(lq) &&
        !u.username?.toLowerCase().includes(lq)
      ) return false;
    }
    return true;
  });

  // Sort by updatedAt desc (fallback to createdAt)
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
  );

  const displayed = isFiltering ? sorted : sorted.slice(0, 5);

  // Stats derived from full list
  const stats = {
    total: allUsers.length,
    active: allUsers.filter(u => u.accountStatus === 'ACTIVE').length,
    inactive: allUsers.filter(u => u.accountStatus === 'INACTIVE').length,
    disabled: allUsers.filter(u => u.accountStatus === 'DISABLED').length,
    instAdmins: allUsers.filter(u => u.role === 'INST_ADMIN').length,
  };

  async function toggleStatus(user) {
    const next = user.accountStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setBusy(true);
    try {
      await adminUpdateUserStatus(user.id, next);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function doDelete(password) {
    await adminDeleteUser(confirmDelete.id, password);
    setConfirmDelete(null);
    load();
  }

  async function doCreate(form) {
    setBusy(true);
    try {
      await adminCreateUser(form);
      setShowCreate(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout variant="admin">
      <div className="admin-page">
        <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="admin-page-title">Users</h1>
            <p className="admin-page-subtitle">Manage users and institutional admins</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            + Add User
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {/* Stats */}
        {!loading && (
          <div className="admin-stats-grid">
            <StatCard label="Total" value={stats.total} color="blue" />
            <StatCard label="Active" value={stats.active} color="green" />
            <StatCard label="Inactive" value={stats.inactive} />
            <StatCard label="Disabled" value={stats.disabled} color="red" />
            <StatCard label="Inst Admins" value={stats.instAdmins} color="yellow" />
          </div>
        )}

        {/* Table */}
        <div className="admin-table-wrap">
          <div className="admin-table-toolbar">
            <span className="admin-table-toolbar-title">
              {isFiltering
                ? `${displayed.length} result${displayed.length !== 1 ? 's' : ''}`
                : 'Recently updated'}
            </span>
            <input
              className="admin-search"
              placeholder="Search name, email, username…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <select className="admin-filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              <option value="USER">User</option>
              <option value="INST_ADMIN">Inst Admin</option>
            </select>
            <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          {!isFiltering && !loading && (
            <div style={{
              padding: '7px 16px',
              background: '#0a0d14',
              borderBottom: '1px solid #1e2a3a',
              fontSize: '0.73rem',
              color: '#475569',
            }}>
              Showing 5 most recently updated — search or filter to see all {allUsers.length} users
            </div>
          )}

          {loading ? (
            <div className="admin-loading">Loading…</div>
          ) : displayed.length === 0 ? (
            <div className="admin-empty">No users found</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(u => (
                  <tr
                    key={u.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                    onMouseEnter={e => e.currentTarget.style.background = '#0d1320'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td className="td-primary">{u.name}</td>
                    <td>{u.email}</td>
                    <td className="td-mono">{u.username}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td>{statusBadge(u.accountStatus)}</td>
                    <td>
                      {(u.updatedAt || u.createdAt)
                        ? new Date(u.updatedAt || u.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <div className="admin-row-actions" onClick={e => e.stopPropagation()}>
                        <button
                          className={`btn btn-sm ${u.accountStatus === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleStatus(u)}
                          disabled={busy}
                        >{u.accountStatus === 'ACTIVE' ? 'Disable' : 'Enable'}</button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirmDelete(u)}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          institutions={institutions}
          onSave={doCreate}
          onClose={() => setShowCreate(false)}
          busy={busy}
        />
      )}

      {confirmDelete && (
        <PasswordConfirmModal
          title="Delete user?"
          message={`This will permanently delete ${confirmDelete.name} (${confirmDelete.email}) and all their data. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={doDelete}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </AdminLayout>
  );
}
