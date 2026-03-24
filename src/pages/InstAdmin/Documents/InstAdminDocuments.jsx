import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  instAdminListDocuments,
  instAdminReviewDocument,
  instAdminGetDocumentFile,
  instAdminDeleteDocument,
} from '../../../api/admin';
import useInstAdminPerms from '../../../hooks/useInstAdminPerms';

function statusBadge(s) {
  const cls = { PENDING: 'badge-pending', APPROVED: 'badge-verified', REJECTED: 'badge-rejected' }[s] || 'badge-inactive';
  return <span className={`badge ${cls}`}>{s}</span>;
}

function StatCard({ label, value, color }) {
  const colors = { blue: '#60a5fa', yellow: '#fbbf24', green: '#4ade80', red: '#f87171' };
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value" style={{ color: colors[color] || '#e2e8f0' }}>{value}</div>
    </div>
  );
}

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString();
}

function DetailField({ label, children, labelStyle, valueStyle }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{children || '—'}</div>
    </div>
  );
}

// ── Document Detail Modal ─────────────────────────────────────────────────────

function DocDetailModal({ doc, canManage, onClose, onReview, onDelete, onViewFile, reviewing, viewing }) {
  if (!doc) return null;

  const labelStyle = { color: '#94a3b8', fontSize: '0.75rem', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const valueStyle = { color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 14 };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#f1f5f9', fontWeight: 600 }}>Document Details</h2>
            <div style={{ marginTop: 4 }}>{statusBadge(doc.status)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        {/* Member info */}
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Uploaded by</div>
          <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{doc.userName || '—'}</div>
          {doc.userEmail && <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{doc.userEmail}</div>}
          {doc.username && <div style={{ color: '#64748b', fontSize: '0.8rem' }}>@{doc.username}</div>}
        </div>

        {/* Document fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <DetailField label="Document Type" labelStyle={labelStyle} valueStyle={valueStyle}>{(doc.documentType || '').replace(/_/g, ' ')}</DetailField>
          <DetailField label="Institution" labelStyle={labelStyle} valueStyle={valueStyle}>{doc.institutionName || '—'}</DetailField>
          <DetailField label="Issuer" labelStyle={labelStyle} valueStyle={valueStyle}>{doc.issuer}</DetailField>
          <DetailField label="File Name" labelStyle={labelStyle} valueStyle={valueStyle}>
            <span style={{ wordBreak: 'break-all', fontSize: '0.85rem' }}>{doc.originalFileName}</span>
          </DetailField>
          <DetailField label="File Size" labelStyle={labelStyle} valueStyle={valueStyle}>{fmtSize(doc.fileSize)}</DetailField>
          <DetailField label="Uploaded At" labelStyle={labelStyle} valueStyle={valueStyle}>{fmtDate(doc.uploadedAt)}</DetailField>
          <DetailField label="Expires At" labelStyle={labelStyle} valueStyle={valueStyle}>{fmtDate(doc.expiresAt)}</DetailField>
        </div>

        {/* Actions */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: 18, marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onViewFile(doc.id)}
            disabled={viewing[doc.id]}
            style={{ flex: '1 1 auto' }}
          >
            {viewing[doc.id] ? 'Opening…' : 'View File'}
          </button>
          {canManage && (
            <>
              {doc.status !== 'APPROVED' && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => onReview(doc.id, 'APPROVED')}
                  disabled={reviewing[doc.id]}
                  style={{ flex: '1 1 auto' }}
                >
                  {reviewing[doc.id] ? '…' : 'Approve'}
                </button>
              )}
              {doc.status !== 'REJECTED' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onReview(doc.id, 'REJECTED')}
                  disabled={reviewing[doc.id]}
                  style={{ flex: '1 1 auto' }}
                >
                  {reviewing[doc.id] ? '…' : 'Reject'}
                </button>
              )}
              {doc.status !== 'PENDING' && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onReview(doc.id, 'PENDING')}
                  disabled={reviewing[doc.id]}
                  style={{ flex: '1 1 auto' }}
                >
                  {reviewing[doc.id] ? '…' : 'Reset to Pending'}
                </button>
              )}
              {doc.status === 'REJECTED' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(doc.id)}
                  disabled={reviewing[doc.id]}
                  style={{ flex: '1 1 auto' }}
                >
                  {reviewing[doc.id] ? '…' : 'Delete'}
                </button>
              )}
            </>
          )}
          {!canManage && (
            <div style={{ flex: 1, fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', alignSelf: 'center' }}>
              Read-only — document management not enabled for your institution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function InstAdminDocuments() {
  const perms = useInstAdminPerms();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdFilter = searchParams.get('userId');
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState(userIdFilter || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [reviewing, setReviewing] = useState({});
  const [viewing, setViewing] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);

  const loadAll = useCallback(() => {
    if (!perms?.canViewDocuments) return;
    setLoading(true);
    instAdminListDocuments('')
      .then(setAll)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [perms]);

  useEffect(() => {
    if (perms === null) return;
    if (!perms.canViewDocuments) { setLoading(false); return; }
    loadAll();
  }, [perms, loadAll]);

  async function review(id, status) {
    setReviewing(r => ({ ...r, [id]: true }));
    try {
      await instAdminReviewDocument(id, status);
      loadAll();
      setSelectedDoc(prev => prev && prev.id === id ? { ...prev, status } : prev);
    } catch (e) {
      setError(e.message);
    } finally {
      setReviewing(r => ({ ...r, [id]: false }));
    }
  }

  async function remove(id) {
    setReviewing(r => ({ ...r, [id]: true }));
    try {
      await instAdminDeleteDocument(id);
      setAll(prev => prev.filter(doc => doc.id !== id));
      setSelectedDoc(prev => prev?.id === id ? null : prev);
    } catch (e) {
      setError(e.message);
    } finally {
      setReviewing(r => ({ ...r, [id]: false }));
    }
  }

  async function viewFile(id) {
    setViewing(v => ({ ...v, [id]: true }));
    try {
      await instAdminGetDocumentFile(id);
    } catch (e) {
      setError(`Could not open file: ${e.message}`);
    } finally {
      setViewing(v => ({ ...v, [id]: false }));
    }
  }

  if (perms === null) {
    return <AdminLayout variant="inst-admin"><div className="admin-loading">Loading…</div></AdminLayout>;
  }

  if (!perms.canViewDocuments) {
    return (
      <AdminLayout variant="inst-admin">
        <div className="admin-page">
          <div className="admin-page-header">
            <h1 className="admin-page-title">Documents</h1>
          </div>
          <div style={{ margin: '40px auto', maxWidth: 480, textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '36px 28px' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.4 }}>🔒</div>
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Access Not Enabled</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>
              Document access has not been enabled for your institution.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Stats — scoped to user filter if active
  const effectiveUserFilter = userIdFilter || userFilter;
  const statsBase = effectiveUserFilter ? all.filter(d => String(d.userId) === String(effectiveUserFilter)) : all;
  const total    = statsBase.length;
  const pending  = statsBase.filter(d => d.status === 'PENDING').length;
  const approved = statsBase.filter(d => d.status === 'APPROVED').length;
  const rejected = statsBase.filter(d => d.status === 'REJECTED').length;

  // Client-side filter
  const q = search.trim().toLowerCase();
  const filtered = all.filter(d => {
    const matchStatus = !statusFilter || d.status === statusFilter;
    const matchUser = !effectiveUserFilter || String(d.userId) === String(effectiveUserFilter);
    const matchType = !typeFilter || d.documentType === typeFilter;
    const matchSearch = !q
      || (d.userName || '').toLowerCase().includes(q)
      || (d.institutionName || '').toLowerCase().includes(q)
      || (d.documentType || '').toLowerCase().includes(q)
      || (d.originalFileName || '').toLowerCase().includes(q)
      || (d.issuer || '').toLowerCase().includes(q);
    return matchStatus && matchSearch && matchUser && matchType;
  });
  const displayed = (search || statusFilter || effectiveUserFilter || typeFilter) ? filtered : filtered.slice(0, 5);
  const userOptions = [...new Map(all.map(d => [d.userId, { id: d.userId, name: d.userName || `Member #${d.userId}` }])).values()];
  const typeOptions = [...new Set(all.map(d => d.documentType).filter(Boolean))].sort();

  const userLabel = effectiveUserFilter && all.length > 0
    ? (all.find(d => String(d.userId) === String(effectiveUserFilter))?.userName ?? `User #${effectiveUserFilter}`)
    : null;

  const canManage = !!perms.canManageDocuments;

  return (
    <AdminLayout variant="inst-admin">
      <div className="admin-page">
        <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="admin-page-title">
              Documents {userLabel ? `— ${userLabel}` : ''}
            </h1>
            <p className="admin-page-subtitle">
              {userLabel
                ? `Review documents uploaded by ${userLabel}`
                : 'Review documents uploaded by your institution members'}
              {!canManage && (
                <span style={{ marginLeft: 10, fontSize: '0.75rem', color: '#fbbf24' }}>· Read-only access</span>
              )}
            </p>
          </div>
          {userIdFilter && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/inst-admin/users/${userIdFilter}`)}>← Back to Member</button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inst-admin/documents')}>All Documents</button>
            </div>
          )}
        </div>

        {error && <div className="admin-error" style={{ cursor: 'pointer' }} onClick={() => setError('')}>{error} ✕</div>}

        {!loading && (
          <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <StatCard label="Total Documents" value={total}    color="blue" />
            <StatCard label="Pending Review"  value={pending}  color="yellow" />
            <StatCard label="Approved"        value={approved} color="green" />
            <StatCard label="Rejected"        value={rejected} color="red" />
          </div>
        )}

        <div className="admin-table-wrap">
          <div className="admin-table-toolbar" style={{ gap: 10, flexWrap: 'wrap' }}>
            <span className="admin-table-toolbar-title">
              {displayed.length} document{displayed.length !== 1 ? 's' : ''}
              {(search || statusFilter || effectiveUserFilter || typeFilter) && total > 0 && filtered.length !== total && (
                <span style={{ fontWeight: 400, color: '#475569', marginLeft: 6 }}>of {total}</span>
              )}
            </span>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
              <input
                className="admin-input"
                style={{ width: 200, padding: '5px 10px' }}
                placeholder="Search member, file, issuer…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {!userIdFilter && (
                <select className="admin-filter-select" value={userFilter} onChange={e => setUserFilter(e.target.value)}>
                  <option value="">All members</option>
                  {userOptions.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
              )}
              <select className="admin-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All types</option>
                {typeOptions.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {!(search || statusFilter || effectiveUserFilter || typeFilter) && !loading && filtered.length > 5 && (
            <div style={{
              padding: '7px 16px', background: '#0a0d14', borderBottom: '1px solid #1e2a3a',
              fontSize: '0.73rem', color: '#475569',
            }}>
              Showing 5 most recent documents. Search or filter to see all {filtered.length}.
            </div>
          )}

          {loading ? (
            <div className="admin-loading">Loading…</div>
          ) : displayed.length === 0 ? (
            <div className="admin-empty">No documents found</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Institution</th>
                  <th>Type</th>
                  <th>File</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayed.map(d => (
                  <tr
                    key={d.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedDoc(d)}
                  >
                    <td>
                      <button
                        className="admin-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                        onClick={e => { e.stopPropagation(); navigate(`/inst-admin/users/${d.userId}`); }}
                      >{d.userName || '—'}</button>
                    </td>
                    <td>{d.institutionName || '—'}</td>
                    <td className="td-primary">{d.documentType}</td>
                    <td className="td-mono" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.originalFileName || '—'}
                      {d.issuer && <div style={{ color: '#475569', fontSize: '0.7rem' }}>{d.issuer}</div>}
                    </td>
                    <td style={{ color: '#64748b' }}>{fmtSize(d.fileSize)}</td>
                    <td>{statusBadge(d.status)}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '—'}
                    </td>
                    {canManage && (
                      <td onClick={e => e.stopPropagation()}>
                        <div className="admin-row-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => viewFile(d.id)} disabled={viewing[d.id]}>
                            {viewing[d.id] ? 'Opening…' : 'View'}
                          </button>
                          {d.status !== 'APPROVED' && (
                            <button className="btn btn-success btn-sm" onClick={() => review(d.id, 'APPROVED')} disabled={reviewing[d.id]}>Approve</button>
                          )}
                          {d.status !== 'REJECTED' && (
                            <button className="btn btn-danger btn-sm" onClick={() => review(d.id, 'REJECTED')} disabled={reviewing[d.id]}>Reject</button>
                          )}
                          {d.status !== 'PENDING' && (
                            <button className="btn btn-ghost btn-sm" onClick={() => review(d.id, 'PENDING')} disabled={reviewing[d.id]}>Reset</button>
                          )}
                          {d.status === 'REJECTED' && (
                            <button className="btn btn-danger btn-sm" onClick={() => remove(d.id)} disabled={reviewing[d.id]}>Delete</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedDoc && (
        <DocDetailModal
          doc={selectedDoc}
          canManage={canManage}
          onClose={() => setSelectedDoc(null)}
          onReview={async (id, status) => { await review(id, status); }}
          onDelete={async (id) => { await remove(id); }}
          onViewFile={viewFile}
          reviewing={reviewing}
          viewing={viewing}
        />
      )}
    </AdminLayout>
  );
}
