import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import PasswordConfirmModal from '../../../components/admin/PasswordConfirmModal';
import {
  adminGetInstitution,
  adminUpdateInstitutionPermissions,
  adminDeleteInstitution,
} from '../../../api/admin';

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="admin-detail-field">
      <label>{label}</label>
      <span>{value}</span>
    </div>
  );
}

function statusBadge(s) {
  const cls = { ACTIVE: 'badge-active', INACTIVE: 'badge-inactive', DISABLED: 'badge-disabled' }[s] || 'badge-inactive';
  return <span className={`badge ${cls}`}>{s}</span>;
}

function roleBadge(r) {
  if (r === 'ADMIN') return <span className="badge badge-admin">Admin</span>;
  if (r === 'INST_ADMIN') return <span className="badge badge-inst-admin">Inst Admin</span>;
  return <span className="badge badge-user">User</span>;
}

const PERM_GROUPS = [
  {
    label: 'Users',
    perms: [
      { key: 'canViewUsers', label: 'View Users', desc: 'Can see the list of institution members' },
      { key: 'canManageUsers', label: 'Manage Users', desc: 'Can update user status and role' },
      { key: 'canDeleteUsers', label: 'Delete Users', desc: 'Can permanently delete users' },
    ],
  },
  {
    label: 'Identity Verifications',
    perms: [
      { key: 'canViewVerifications', label: 'View Verifications', desc: 'Can see identity verification submissions' },
      { key: 'canManageVerifications', label: 'Review Verifications', desc: 'Can approve or reject verifications' },
    ],
  },
  {
    label: 'Documents',
    perms: [
      { key: 'canViewDocuments', label: 'View Documents', desc: 'Can see uploaded documents' },
      { key: 'canManageDocuments', label: 'Review Documents', desc: 'Can approve or reject documents' },
    ],
  },
  {
    label: 'Activity',
    perms: [
      { key: 'canViewActivity', label: 'View Activity Log', desc: 'Can see audit logs and activity history' },
    ],
  },
];

export default function AdminInstitutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inst, setInst] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSavePerms, setConfirmSavePerms] = useState(false);
  const [q, setQ] = useState('');
  const [permSaved, setPermSaved] = useState(false);

  const [perms, setPerms] = useState({});

  const load = useCallback(() => {
    adminGetInstitution(id)
      .then(data => {
        setInst(data);
        setPerms({
          allowVerifications: data.allowVerifications,
          allowDocuments: data.allowDocuments,
          canViewUsers: data.canViewUsers,
          canManageUsers: data.canManageUsers,
          canDeleteUsers: data.canDeleteUsers,
          canViewVerifications: data.canViewVerifications,
          canManageVerifications: data.canManageVerifications,
          canViewDocuments: data.canViewDocuments,
          canManageDocuments: data.canManageDocuments,
          canViewActivity: data.canViewActivity,
        });
      })
      .catch(e => setError(e.message));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function doSavePermissions(password) {
    await adminUpdateInstitutionPermissions(id, perms, password);
    setConfirmSavePerms(false);
    setPermSaved(true);
    setTimeout(() => setPermSaved(false), 2000);
    load();
  }

  async function doDelete(password) {
    await adminDeleteInstitution(id, password);
    navigate('/admin/institutions');
  }

  const setPerm = (key, val) => setPerms(p => ({ ...p, [key]: val }));

  const filteredMembers = inst?.members?.filter(u => {
    if (!q.trim()) return true;
    const lq = q.toLowerCase();
    return (
      u.name?.toLowerCase().includes(lq) ||
      u.email?.toLowerCase().includes(lq) ||
      u.username?.toLowerCase().includes(lq)
    );
  }) ?? [];

  if (!inst && !error) return (
    <AdminLayout variant="admin"><div className="admin-loading">Loading…</div></AdminLayout>
  );

  return (
    <AdminLayout variant="admin">
      <div className="admin-page">
        <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/institutions')}>← Back</button>
          <div>
            <h1 className="admin-page-title">{inst?.name}</h1>
            <p className="admin-page-subtitle">
              {inst?.type && <span className="badge badge-inactive" style={{ marginRight: 6 }}>{inst.type}</span>}
              {inst?.code && <span className="td-mono">{inst.code}</span>}
              {inst?.city && ` · ${[inst.city, inst.state, inst.country].filter(Boolean).join(', ')}`}
            </p>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {inst && (
          <>
            <div className="admin-detail-card">
              <p className="admin-detail-card-title">Institution Details</p>
              <div className="admin-detail-grid">
                <Field label="Name" value={inst.name} />
                <Field label="Code" value={inst.code} />
                <Field label="Type" value={inst.type} />
                <Field label="Email" value={inst.email} />
                <Field label="Phone" value={inst.phone} />
                <Field label="Website" value={inst.website} />
                <Field label="Address" value={inst.address} />
                <Field label="City" value={inst.city} />
                <Field label="State" value={inst.state} />
                <Field label="Country" value={inst.country} />
                <Field label="Pincode" value={inst.pincode} />
                <Field label="County" value={inst.county} />
                <Field label="Total Members" value={inst.memberCount} />
                <Field label="Created" value={inst.createdAt ? new Date(inst.createdAt).toLocaleString() : null} />
                <Field label="Last Updated" value={inst.updatedAt ? new Date(inst.updatedAt).toLocaleString() : null} />
              </div>
              {inst.description && (
                <div style={{ marginTop: 10, fontSize: '0.875rem', color: 'var(--text-secondary, #aaa)' }}>
                  {inst.description}
                </div>
              )}
            </div>

            {/* Access Control */}
            <div className="admin-detail-card">
              <p className="admin-detail-card-title">Institutional Admin Access Control</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #888)', marginBottom: 16 }}>
                Fine-grained control over what the institutional admin of this institution can access and perform.
              </p>

              {PERM_GROUPS.map(group => (
                <div key={group.label} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    {group.label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {group.perms.map(({ key, label, desc }) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={!!perms[key]}
                          onChange={e => setPerm(key, e.target.checked)}
                          style={{ width: 16, height: 16, flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{label}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #888)' }}>{desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border, #333)', paddingTop: 14 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setConfirmSavePerms(true)}>
                  Save Permissions
                </button>
                {permSaved && <span style={{ fontSize: '0.82rem', color: '#4ade80' }}>Saved!</span>}
              </div>
            </div>

            {/* Members */}
            <div className="admin-detail-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p className="admin-detail-card-title" style={{ margin: 0 }}>
                  Members ({inst.memberCount})
                </p>
                <input
                  className="admin-search"
                  placeholder="Search name, email, username…"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  style={{ width: 220 }}
                />
              </div>

              {filteredMembers.length === 0 ? (
                <div className="admin-empty">{q ? 'No members match your search' : 'No members linked to this institution'}</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Username</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(u => (
                      <tr key={u.id}>
                        <td className="td-primary">{u.name}</td>
                        <td>{u.email}</td>
                        <td className="td-mono">{u.username}</td>
                        <td>{roleBadge(u.role)}</td>
                        <td>{statusBadge(u.accountStatus)}</td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                          >
                            View User
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Danger Zone */}
            <div className="admin-detail-card" style={{ borderColor: '#7f1d1d' }}>
              <p className="admin-detail-card-title" style={{ color: '#f87171' }}>Danger Zone</p>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
                Delete this institution
              </button>
            </div>
          </>
        )}
      </div>

      {confirmSavePerms && (
        <PasswordConfirmModal
          title="Confirm permission changes"
          message={`You are updating access permissions for ${inst?.name}. Enter your admin password to confirm.`}
          confirmLabel="Save Permissions"
          onConfirm={doSavePermissions}
          onClose={() => setConfirmSavePerms(false)}
        />
      )}

      {confirmDelete && (
        <PasswordConfirmModal
          title="Delete institution?"
          message={`All ${inst?.memberCount} members will be unlinked and ${inst?.name} permanently deleted. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={doDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </AdminLayout>
  );
}
