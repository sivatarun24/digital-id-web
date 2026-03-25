import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { instAdminListUsers } from '../../../api/admin';
import useInstAdminPerms from '../../../hooks/useInstAdminPerms';

function statusBadge(s) {
  const cls = { ACTIVE: 'badge-active', INACTIVE: 'badge-inactive', DISABLED: 'badge-disabled' }[s] || 'badge-inactive';
  return <span className={`badge ${cls}`}>{s}</span>;
}

function verifiedBadge(user) {
  if (user.emailVerifiedAt) return <span className="badge badge-verified">Verified</span>;
  return <span className="badge badge-inactive">Unverified</span>;
}

function StatCard({ label, value, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className={`admin-stat-value${color ? ` ${color}` : ''}`}>{value}</div>
    </div>
  );
}

function AccessDenied({ feature }) {
  return (
    <div style={{
      margin: '40px auto', maxWidth: 480, textAlign: 'center',
      background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '36px 28px',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.4 }}>🔒</div>
      <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Access Not Enabled</h3>
      <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>
        {feature} access has not been enabled for your institution.<br />
        Contact a system administrator to request access.
      </p>
    </div>
  );
}

export default function InstAdminUsers() {
  const perms = useInstAdminPerms();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (perms === null) return; // still loading permissions
    if (!perms.canViewUsers) return;

    let active = true;
    instAdminListUsers()
      .then(data => { if (active) { setAllUsers(data || []); setLoading(false); } })
      .catch(e => { if (active) { setError(e.message); setLoading(false); } });
    return () => { active = false; };
  }, [perms]);

  if (perms === null) {
    return <AdminLayout variant="inst-admin"><div className="admin-loading">Loading…</div></AdminLayout>;
  }

  if (!perms.canViewUsers) {
    return (
      <AdminLayout variant="inst-admin">
        <div className="admin-page">
          <div className="admin-page-header">
            <h1 className="admin-page-title">Members</h1>
          </div>
          <AccessDenied feature="Member management" />
        </div>
      </AdminLayout>
    );
  }

  // Client-side filtering
  const isFiltering = q.trim() || statusFilter;

  const filtered = allUsers.filter(u => {
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

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
  );

  const displayed = isFiltering ? sorted : sorted.slice(0, 5);

  const stats = {
    total: allUsers.length,
    active: allUsers.filter(u => u.accountStatus === 'ACTIVE').length,
    inactive: allUsers.filter(u => u.accountStatus === 'INACTIVE').length,
    disabled: allUsers.filter(u => u.accountStatus === 'DISABLED').length,
    verified: allUsers.filter(u => u.emailVerifiedAt).length,
  };

  return (
    <AdminLayout variant="inst-admin">
      <div className="admin-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Members</h1>
          <p className="admin-page-subtitle">Users registered under your institution</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {!loading && (
          <div className="admin-stats-grid">
            <StatCard label="Total Members" value={stats.total} color="blue" />
            <StatCard label="Active" value={stats.active} color="green" />
            <StatCard label="Inactive" value={stats.inactive} />
            <StatCard label="Disabled" value={stats.disabled} color="red" />
            <StatCard label="Email Verified" value={stats.verified} color="yellow" />
          </div>
        )}

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
            <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          {!isFiltering && !loading && (
            <div style={{
              padding: '7px 16px', background: '#0a0d14', borderBottom: '1px solid #1e2a3a',
              fontSize: '0.73rem', color: '#475569',
            }}>
              Showing 5 most recently updated — search or filter to see all {allUsers.length} members
            </div>
          )}

          {loading ? (
            <div className="admin-loading">Loading…</div>
          ) : displayed.length === 0 ? (
            <div className="admin-empty">No members found</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(u => (
                  <tr key={u.id}>
                    <td className="td-primary">{u.name}</td>
                    <td>{u.email}</td>
                    <td className="td-mono">{u.username}</td>
                    <td>{statusBadge(u.accountStatus)}</td>
                    <td>{verifiedBadge(u)}</td>
                    <td>
                      {(u.updatedAt || u.createdAt)
                        ? new Date(u.updatedAt || u.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/inst-admin/users/${u.id}`)}
                      >View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
