import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { instAdminGetUser } from '../../../api/admin';
import useInstAdminPerms from '../../../hooks/useInstAdminPerms';

function Field({ label, value }) {
  return (
    <div className="admin-detail-field">
      <label>{label}</label>
      <span>{value ?? '—'}</span>
    </div>
  );
}

function statusBadge(s) {
  const cls = { ACTIVE: 'badge-active', INACTIVE: 'badge-inactive', DISABLED: 'badge-disabled' }[s] || 'badge-inactive';
  return <span className={`badge ${cls}`}>{s}</span>;
}

function docStatusBadge(s) {
  const cls = { PENDING: 'badge-pending', APPROVED: 'badge-verified', REJECTED: 'badge-rejected' }[s] || 'badge-inactive';
  return <span className={`badge ${cls}`}>{s}</span>;
}

export default function InstAdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const perms = useInstAdminPerms();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (perms === null) return;
    if (!perms.canViewUsers) return;
    instAdminGetUser(id)
      .then(setUser)
      .catch(e => setError(e.message));
  }, [id, perms]);

  if (perms === null || (!user && !error && perms?.canViewUsers)) {
    return <AdminLayout variant="inst-admin"><div className="admin-loading">Loading…</div></AdminLayout>;
  }

  if (perms && !perms.canViewUsers) {
    return (
      <AdminLayout variant="inst-admin">
        <div className="admin-page">
          <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inst-admin/users')}>← Back</button>
            <h1 className="admin-page-title">Member Detail</h1>
          </div>
          <div style={{ margin: '40px auto', maxWidth: 480, textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '36px 28px' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.4 }}>🔒</div>
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Access Not Enabled</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>
              Member management access has not been enabled for your institution.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout variant="inst-admin">
      <div className="admin-page">
        <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inst-admin/users')}>← Back</button>
            <div>
              <h1 className="admin-page-title">{user?.name}</h1>
              <p className="admin-page-subtitle">{user?.email}</p>
            </div>
          </div>
          {perms?.canViewDocuments && user && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/inst-admin/documents?userId=${id}`)}
            >
              View Documents {user.documents?.length > 0 ? `(${user.documents.length})` : ''}
            </button>
          )}
        </div>

        {error && <div className="admin-error">{error}</div>}

        {user && (
          <>
            <div className="admin-detail-card">
              <p className="admin-detail-card-title">Profile</p>
              <div className="admin-detail-grid">
                <Field label="ID" value={user.id} />
                <Field label="Username" value={user.username} />
                <Field label="Name" value={user.name} />
                <Field label="Email" value={user.email} />
                <Field label="Phone" value={user.phoneNo} />
                <Field label="Status" value={<>{statusBadge(user.accountStatus)}</>} />
                <Field label="Email Verified" value={user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleString() : 'No'} />
                <Field label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'} />
                <Field label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'} />
              </div>
            </div>

            {perms?.canViewVerifications && user.latestVerification && (
              <div className="admin-detail-card">
                <p className="admin-detail-card-title">Identity Verification</p>
                <div className="admin-detail-grid">
                  <Field label="ID Type" value={user.latestVerification.idType} />
                  <Field label="Status" value={<span className={`badge badge-${user.latestVerification.status.toLowerCase()}`}>{user.latestVerification.status}</span>} />
                  <Field label="Submitted" value={user.latestVerification.submittedAt ? new Date(user.latestVerification.submittedAt).toLocaleString() : '—'} />
                  <Field label="Reviewed" value={user.latestVerification.reviewedAt ? new Date(user.latestVerification.reviewedAt).toLocaleString() : '—'} />
                </div>
              </div>
            )}

            {perms?.canViewDocuments && user.documents?.length > 0 && (
              <div className="admin-detail-card">
                <p className="admin-detail-card-title">Documents ({user.documents.length})</p>
                <table className="admin-table">
                  <thead>
                    <tr><th>Type</th><th>Issuer</th><th>Status</th><th>Uploaded</th></tr>
                  </thead>
                  <tbody>
                    {user.documents.map(d => (
                      <tr key={d.id}>
                        <td className="td-primary">{d.documentType}</td>
                        <td>{d.issuer || '—'}</td>
                        <td>{docStatusBadge(d.status)}</td>
                        <td>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {user.connectedServices?.length > 0 && (
              <div className="admin-detail-card">
                <p className="admin-detail-card-title">Connected Services ({user.connectedServices.length})</p>
                <table className="admin-table">
                  <thead>
                    <tr><th>Service</th><th>Connected</th><th>Last Used</th></tr>
                  </thead>
                  <tbody>
                    {user.connectedServices.map(svc => (
                      <tr key={svc.serviceSlug}>
                        <td className="td-primary" style={{ textTransform: 'capitalize' }}>
                          {svc.serviceSlug.replace(/_/g, ' ')}
                        </td>
                        <td>{svc.connectedAt || '—'}</td>
                        <td>{svc.lastUsedAt || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
