import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import PasswordConfirmModal from '../../../components/admin/PasswordConfirmModal';
import {
  adminGetUser,
  adminUpdateUserStatus,
  adminUpdateUserRole,
  adminDeleteUser,
  adminListInstitutions,
  adminReviewVerification,
  adminReviewDocument,
  adminDeleteDocument,
  adminListVerifications,
  adminListDocuments,
  adminGetDocumentFile,
  adminGetVerificationFile,
  adminListCredentials,
  adminDeleteCredential,
} from '../../../api/admin';
import {
  adminGetInfoRequests,
  adminCreateInfoRequest,
  adminDeleteInfoRequest,
  adminOpenResponseFile,
} from '../../../api/infoRequests';

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
function roleBadge(r) {
  if (r === 'ADMIN') return <span className="badge badge-admin">Admin</span>;
  if (r === 'INST_ADMIN') return <span className="badge badge-inst-admin">Inst Admin</span>;
  return <span className="badge badge-user">User</span>;
}
function docStatusBadge(s) {
  const map = { PENDING: 'badge-pending', APPROVED: 'badge-verified', REJECTED: 'badge-rejected' };
  return <span className={`badge ${map[s] || 'badge-inactive'}`}>{s}</span>;
}
function verifBadge(s) {
  const map = { PENDING: 'badge-pending', VERIFIED: 'badge-verified', REJECTED: 'badge-rejected' };
  return <span className={`badge ${map[s] || 'badge-inactive'}`}>{s}</span>;
}

function sourceLabel(source) {
  return source === 'verification_review' ? 'Verification' : 'General';
}

function requestStateLabel(request) {
  if (request.userResponse) return 'RESPONDED';
  if (request.resolved) return 'RESOLVED';
  return 'PENDING';
}

function requestStateBadge(request) {
  const state = requestStateLabel(request);
  const cls = { PENDING: 'badge-pending', RESPONDED: 'badge-verified', RESOLVED: 'badge-active' }[state] || 'badge-inactive';
  return <span className={`badge ${cls}`}>{state}</span>;
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function InfoRequestModal({ userId, onClose }) {
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    if (!note.trim()) return;
    setBusy(true);
    setErr('');
    try {
      await adminCreateInfoRequest(Number(userId), note.trim(), 'user_detail');
      setDone(true);
      setTimeout(onClose, 1000);
    } catch (e) {
      setErr(e.message || 'Failed to save');
      setBusy(false);
    }
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <p className="admin-modal-title">Request More Information</p>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#4ade80' }}>Request saved!</div>
        ) : (
          <>
            <p className="admin-modal-body">
              Describe what additional information or documents you need from this user.
            </p>
            <textarea
              className="admin-input"
              style={{ width: '100%', resize: 'vertical', minHeight: 100, marginBottom: 16 }}
              placeholder="e.g. Please upload a clearer photo of your ID front, the current one is too blurry."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            {err && <div style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: 10 }}>{err}</div>}
            <div className="admin-modal-footer">
              <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={busy || !note.trim()}>
                {busy ? 'Saving…' : 'Send Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [docBusy, setDocBusy] = useState({});
  const [verifBusy, setVerifBusy] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newInstId, setNewInstId] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showInfoRequest, setShowInfoRequest] = useState(false);
  const [infoRequests, setInfoRequests] = useState([]);
  const [viewingVerifFile, setViewingVerifFile] = useState({});
  const [infoRequestSearch, setInfoRequestSearch] = useState('');
  const [infoRequestStatusFilter, setInfoRequestStatusFilter] = useState('');
  const [infoRequestSourceFilter, setInfoRequestSourceFilter] = useState('');

  // Separately loaded verification + documents (in case adminGetUser doesn't embed them)
  const [verification, setVerification] = useState(undefined); // undefined = loading, null = none
  const [documents, setDocuments] = useState(null); // null = loading
  const [credentials, setCredentials] = useState(null); // null = loading
  const [viewingDoc, setViewingDoc] = useState({});
  const [credBusy, setCredBusy] = useState({});

  const refreshFlags = useCallback(() => {
    adminGetInfoRequests(Number(id)).then(setInfoRequests).catch(() => {});
  }, [id]);

  useEffect(() => {
    Promise.all([adminGetUser(id), adminListInstitutions()])
      .then(([u, insts]) => {
        setUser(u);
        setInstitutions(insts);
        setNewStatus(u.accountStatus);
        setNewRole(u.role);
        setNewInstId(u.institutionId ?? '');

        // Use embedded data if the API returns it; otherwise fetch separately
        if (u.latestVerification !== undefined) {
          setVerification(u.latestVerification ?? null);
        } else {
          adminListVerifications('').then(all => {
            const uid = Number(id);
            const mine = all.filter(v => v.userId === uid)
              .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
            setVerification(mine[0] ?? null);
          }).catch(() => setVerification(null));
        }

        if (Array.isArray(u.documents)) {
          setDocuments(u.documents);
        } else {
          adminListDocuments('').then(all => {
            const uid = Number(id);
            setDocuments(all.filter(d => d.userId === uid));
          }).catch(() => setDocuments([]));
        }

        adminListCredentials('').then(all => {
          const uid = Number(id);
          setCredentials(all.filter(c => c.userId === uid));
        }).catch(() => setCredentials([]));
      })
      .catch(e => setError(e.message));
    refreshFlags();
  }, [id, refreshFlags]);

  async function saveAccountControls() {
    setBusy(true);
    try {
      const statusChanged = newStatus !== user.accountStatus;
      const roleChanged = newRole !== user.role || newInstId != (user.institutionId ?? '');
      if (statusChanged) await adminUpdateUserStatus(id, newStatus);
      if (roleChanged) await adminUpdateUserRole(id, newRole, newRole === 'INST_ADMIN' ? Number(newInstId) : null);
      setUser(u => ({
        ...u,
        accountStatus: newStatus,
        role: newRole,
        institutionId: newRole === 'INST_ADMIN' ? Number(newInstId) : null,
      }));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function reviewDoc(docId, status) {
    setDocBusy(b => ({ ...b, [docId]: true }));
    try {
      await adminReviewDocument(docId, status);
      setDocuments(prev => (prev || []).map(d => d.id === docId ? { ...d, status } : d));
    } catch (e) { setError(e.message); }
    finally { setDocBusy(b => ({ ...b, [docId]: false })); }
  }

  async function deleteRejectedDoc(docId) {
    setDocBusy(b => ({ ...b, [docId]: true }));
    try {
      await adminDeleteDocument(docId);
      setDocuments(prev => (prev || []).filter(d => d.id !== docId));
    } catch (e) {
      setError(e.message);
    } finally {
      setDocBusy(b => ({ ...b, [docId]: false }));
    }
  }

  async function deleteCred(credId) {
    if (!window.confirm('Are you sure you want to permanently delete this credential submission? This will also remove the supporting documents.')) return;
    setCredBusy(b => ({ ...b, [credId]: true }));
    try {
      await adminDeleteCredential(credId);
      setCredentials(prev => (prev || []).filter(c => c.id !== credId));
      // Refresh documents as they might be linked
      adminListDocuments('').then(all => {
        const uid = Number(id);
        setDocuments(all.filter(d => d.userId === uid));
      }).catch(() => {});
    } catch (e) { setError(e.message); }
    finally { setCredBusy(b => ({ ...b, [credId]: false })); }
  }

  async function reviewVerif(status) {
    if (!verification) return;
    const notes = window.prompt(status === 'REJECTED' ? 'Enter rejection reason (optional):' : 'Enter approval note (optional):');
    if (notes === null) return; // Cancelled prompt
    
    setVerifBusy(true);
    try {
      await adminReviewVerification(verification.id, status, notes.trim() || null);
      setVerification(v => ({ 
        ...v, 
        status, 
        reviewedAt: new Date().toISOString(),
        reviewerNotes: notes.trim() || null 
      }));
    } catch (e) { setError(e.message); }
    finally { setVerifBusy(false); }
  }

  async function viewDoc(docId) {
    setViewingDoc(v => ({ ...v, [docId]: true }));
    try {
      await adminGetDocumentFile(docId);
    } catch (e) {
      setError(`Could not open file: ${e.message}`);
    } finally {
      setViewingDoc(v => ({ ...v, [docId]: false }));
    }
  }

  async function viewVerifFile(verifId, side) {
    const key = `${verifId}_${side}`;
    setViewingVerifFile(v => ({ ...v, [key]: true }));
    try {
      await adminGetVerificationFile(verifId, side);
    } catch (e) {
      setError(`Could not open file: ${e.message}`);
    } finally {
      setViewingVerifFile(v => ({ ...v, [key]: false }));
    }
  }

  async function doDelete(password) {
    await adminDeleteUser(id, password);
    navigate('/admin/users');
  }

  const institutionName = user?.institutionId
    ? institutions.find(i => i.id === user.institutionId)?.name ?? `ID ${user.institutionId}`
    : null;

  const hasChanges =
    newStatus !== (user?.accountStatus ?? '') ||
    newRole !== (user?.role ?? '') ||
    newInstId != (user?.institutionId ?? '');
  const roleNeedsInst = newRole === 'INST_ADMIN' && !newInstId;
  const infoRequestQuery = infoRequestSearch.trim().toLowerCase();
  const filteredInfoRequests = useMemo(() => (
    infoRequests.filter((request) => {
      const files = request.userResponse?.files || [];
      const status = requestStateLabel(request);
      const matchesQuery = !infoRequestQuery
        || (request.note || '').toLowerCase().includes(infoRequestQuery)
        || (request.userResponse?.message || '').toLowerCase().includes(infoRequestQuery)
        || files.some(file => (file.name || '').toLowerCase().includes(infoRequestQuery));
      const matchesStatus = !infoRequestStatusFilter || status === infoRequestStatusFilter;
      const matchesSource = !infoRequestSourceFilter || request.source === infoRequestSourceFilter;
      return matchesQuery && matchesStatus && matchesSource;
    })
  ), [infoRequests, infoRequestQuery, infoRequestSourceFilter, infoRequestStatusFilter]);
  const isFilteringInfoRequests = Boolean(infoRequestQuery || infoRequestStatusFilter || infoRequestSourceFilter);
  const displayedInfoRequests = isFilteringInfoRequests ? filteredInfoRequests : filteredInfoRequests.slice(0, 5);
  const infoRequestDocuments = useMemo(() => (
    infoRequests.flatMap((request) => (
      (request.userResponse?.files || []).map((file) => ({
        requestId: request.id,
        fileIndex: file.index,
        fileName: file.name,
        respondedAt: request.userResponse?.respondedAt,
        source: request.source,
        requestNote: request.note,
        responseMessage: request.userResponse?.message || '',
      }))
    ))
  ), [infoRequests]);
  const verificationDocuments = verification ? [
    { side: 'front', label: 'ID Front', available: verification.hasFrontFile !== false },
    { side: 'back', label: 'ID Back', available: verification.hasBackFile === true },
    { side: 'selfie', label: 'Selfie', available: verification.hasSelfieFile !== false },
  ] : [];

  if (!user && !error) return <AdminLayout variant="admin"><div className="admin-loading">Loading…</div></AdminLayout>;

  return (
    <AdminLayout variant="admin">
      <div className="admin-page">

        {/* Header */}
        <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <div style={{ flex: 1 }}>
            <h1 className="admin-page-title">{user?.name}</h1>
            <p className="admin-page-subtitle">{user?.email}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {user && roleBadge(user.role)}
            {user && statusBadge(user.accountStatus)}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/admin/documents?userId=${id}`)}
            >
              Documents Page {documents?.length > 0 ? `(${documents.length} uploaded)` : ''}
            </button>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {user && (
          <>
            {/* Info Requests management card */}
            <div className="admin-detail-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p className="admin-detail-card-title" style={{ margin: 0 }}>
                  Info Requests {infoRequests.length > 0 ? `(${infoRequests.length})` : ''}
                </p>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowInfoRequest(true)}
                >
                  + Add Request
                </button>
              </div>
              {infoRequests.length === 0 ? (
                <div style={{ color: '#475569', fontSize: '0.84rem' }}>No info requests sent to this user.</div>
              ) : (
                <div className="admin-table-wrap" style={{ marginTop: 4 }}>
                  <div className="admin-table-toolbar" style={{ gap: 10, flexWrap: 'wrap' }}>
                    <span className="admin-table-toolbar-title">
                      {displayedInfoRequests.length} request{displayedInfoRequests.length !== 1 ? 's' : ''}
                      {isFilteringInfoRequests && (
                        <span style={{ fontWeight: 400, color: '#475569', marginLeft: 6 }}>of {filteredInfoRequests.length}</span>
                      )}
                    </span>
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
                      <input
                        className="admin-input"
                        style={{ width: 240, padding: '5px 10px' }}
                        placeholder="Search request, response, files…"
                        value={infoRequestSearch}
                        onChange={e => setInfoRequestSearch(e.target.value)}
                      />
                      <select className="admin-filter-select" value={infoRequestStatusFilter} onChange={e => setInfoRequestStatusFilter(e.target.value)}>
                        <option value="">All states</option>
                        <option value="PENDING">Pending</option>
                        <option value="RESPONDED">Responded</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                      <select className="admin-filter-select" value={infoRequestSourceFilter} onChange={e => setInfoRequestSourceFilter(e.target.value)}>
                        <option value="">All sources</option>
                        <option value="user_detail">General</option>
                        <option value="verification_review">Verification</option>
                      </select>
                    </div>
                  </div>

                  {!isFilteringInfoRequests && filteredInfoRequests.length > 5 && (
                    <div style={{
                      padding: '7px 16px',
                      background: '#0a0d14',
                      borderBottom: '1px solid #1e2a3a',
                      fontSize: '0.73rem',
                      color: '#475569',
                    }}>
                      Showing 5 most recent requests. Search or filter to see all {filteredInfoRequests.length}.
                    </div>
                  )}

                  {displayedInfoRequests.length === 0 ? (
                    <div className="admin-empty">No info requests match the current filters</div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Source</th>
                          <th>Request</th>
                          <th>Response</th>
                          <th>Files</th>
                          <th>Status</th>
                          <th>Requested</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedInfoRequests.map(r => (
                          <tr key={r.id}>
                            <td>{sourceLabel(r.source)}</td>
                            <td className="td-primary" style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.note}</td>
                            <td style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: r.userResponse ? '#cbd5e1' : '#475569' }}>
                              {r.userResponse?.message || 'No response yet'}
                            </td>
                            <td style={{ maxWidth: 220 }}>
                              {r.userResponse?.files?.length ? (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {r.userResponse.files.map((f) => (
                                    <button
                                      key={f.index}
                                      onClick={() => adminOpenResponseFile(r.id, f.index)}
                                      style={{ fontSize: '0.72rem', color: '#60a5fa', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                      {f.name}
                                    </button>
                                  ))}
                                </div>
                              ) : '—'}
                            </td>
                            <td>{requestStateBadge(r)}</td>
                            <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{timeAgo(r.requestedAt)}</td>
                            <td>
                              <button className="btn btn-danger btn-sm" onClick={() => adminDeleteInfoRequest(r.id).then(refreshFlags).catch(() => {})}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="admin-detail-card">
              <p className="admin-detail-card-title">Profile</p>
              <div className="admin-detail-grid">
                <Field label="User ID" value={user.id} />
                <Field label="Username" value={user.username} />
                <Field label="Full Name" value={user.name} />
                <Field label="Email" value={user.email} />
                <Field label="Phone" value={user.phoneNo} />
                <Field label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null} />
                <Field label="Gender" value={user.gender} />
                <Field label="Role" value={roleBadge(user.role)} />
                <Field label="Status" value={statusBadge(user.accountStatus)} />
                <Field label="Institution" value={
                  user.institutionId ? (
                    <button className="admin-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}
                      onClick={() => navigate(`/admin/institutions/${user.institutionId}`)}>
                      {institutionName}
                    </button>
                  ) : 'None'
                } />
                <Field label="2FA" value={user.twoFactorEnabled ? 'Enabled' : 'Disabled'} />
                <Field label="Marketing Opt-in" value={user.marketingOptIn ? 'Yes' : 'No'} />
              </div>
            </div>

            {/* Account Security */}
            <div className="admin-detail-card">
              <p className="admin-detail-card-title">Account Security & Activity</p>
              <div className="admin-detail-grid">
                <Field label="Email Verified" value={user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleString() : 'Not verified'} />
                <Field label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'} />
                <Field label="Failed Login Attempts" value={user.failedLoginAttempts ?? 0} />
                <Field label="Password Updated" value={user.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleString() : null} />
                <Field label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : null} />
                <Field label="Last Updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : null} />
              </div>
            </div>

            {/* ── Account Controls (merged Status + Role) ── */}
            <div className="admin-detail-card">
              <p className="admin-detail-card-title">Account Controls</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                {/* Status column */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>
                    Account Status
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select className="admin-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="DISABLED">Disabled</option>
                    </select>
                    {statusBadge(newStatus)}
                  </div>
                </div>
                {/* Role column */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>
                    Role
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select className="admin-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="INST_ADMIN">Inst. Admin</option>
                    </select>
                    {roleBadge(newRole)}
                  </div>
                  {newRole === 'INST_ADMIN' && (
                    <select className="admin-select" style={{ width: '100%', marginTop: 8 }}
                      value={newInstId} onChange={e => setNewInstId(e.target.value)}>
                      <option value="">Select institution…</option>
                      {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={saveAccountControls}
                  disabled={busy || !hasChanges || roleNeedsInst}
                >
                  {busy ? 'Saving…' : 'Save Changes'}
                </button>
                {hasChanges && (
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    setNewStatus(user.accountStatus);
                    setNewRole(user.role);
                    setNewInstId(user.institutionId ?? '');
                  }}>
                    Reset
                  </button>
                )}
                {!hasChanges && <span style={{ fontSize: '0.75rem', color: '#475569' }}>No changes</span>}
              </div>
            </div>

            {/* ── Identity Verification ── */}
            <div className="admin-detail-card">
              <p className="admin-detail-card-title" style={{ marginBottom: 14 }}>Identity Verification</p>

              {verification === undefined ? (
                <div style={{ color: '#475569', fontSize: '0.84rem' }}>Loading…</div>
              ) : !verification ? (
                <div style={{ color: '#475569', fontSize: '0.84rem' }}>No verification submitted yet.</div>
              ) : (
                <>
                  <div className="admin-detail-grid" style={{ marginBottom: 16 }}>
                    <Field label="Verification ID" value={verification.id} />
                    <Field label="ID Type" value={verification.idType} />
                    <Field label="Status" value={verifBadge(verification.status)} />
                    <Field label="Submitted" value={verification.submittedAt ? new Date(verification.submittedAt).toLocaleString() : null} />
                    <Field label="Reviewed" value={verification.reviewedAt ? new Date(verification.reviewedAt).toLocaleString() : null} />
                    {verification.reviewerNotes && <Field label="Reviewer Notes" value={verification.reviewerNotes} />}
                    {verification.notes && <Field label="Notes" value={verification.notes} />}
                  </div>

                  {/* Uploaded Files */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                      Uploaded Files
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[
                        { side: 'front', label: 'ID Front', available: verification.hasFrontFile !== false },
                        { side: 'back',  label: 'ID Back',  available: verification.hasBackFile === true },
                        { side: 'selfie',label: 'Selfie',   available: verification.hasSelfieFile !== false },
                      ].map(({ side, label, available }) => (
                        <button
                          key={side}
                          className={`btn btn-ghost btn-sm`}
                          onClick={() => viewVerifFile(verification.id, side)}
                          disabled={!available || viewingVerifFile[`${verification.id}_${side}`]}
                          style={{ opacity: available ? 1 : 0.4 }}
                        >
                          {viewingVerifFile[`${verification.id}_${side}`] ? 'Opening…' : label}
                          {!available && ' (not provided)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {verification.status !== 'VERIFIED' && (
                      <button className="btn btn-success btn-sm" onClick={() => reviewVerif('VERIFIED')} disabled={verifBusy}>
                        Approve Verification
                      </button>
                    )}
                    {verification.status !== 'REJECTED' && (
                      <button className="btn btn-danger btn-sm" onClick={() => reviewVerif('REJECTED')} disabled={verifBusy}>
                        Cancel / Reject
                      </button>
                    )}
                    {verification.status === 'REJECTED' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => reviewVerif('PENDING')} disabled={verifBusy}>
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ── Documents ── */}
            <div className="admin-detail-card">
              <p className="admin-detail-card-title">
                Documents
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Professional Credentials {credentials?.length > 0 ? `(${credentials.length})` : ''}
                  </div>
                  {!credentials ? (
                    <div className="admin-empty" style={{ padding: '24px 0' }}>Loading credentials…</div>
                  ) : !credentials.length ? (
                    <div className="admin-empty" style={{ padding: '24px 0' }}>No credentials submitted</div>
                  ) : (
                    <table className="admin-table" style={{ marginBottom: 24 }}>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {credentials.map(c => (
                          <tr key={c.id}>
                            <td className="td-primary">{(c.credentialType || '').replace(/_/g, ' ')}</td>
                            <td>{verifBadge(c.status)}</td>
                            <td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}</td>
                            <td>
                              <div className="admin-row-actions">
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/verifications')}>
                                  View in Dashboard
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteCred(c.id)}
                                  disabled={credBusy[c.id]}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Uploaded Documents {documents?.length > 0 ? `(${documents.length})` : ''}
                  </div>
                  {documents === null ? (
                    <div style={{ color: '#475569', fontSize: '0.84rem' }}>Loading…</div>
                  ) : !documents.length ? (
                    <div className="admin-empty" style={{ padding: '24px 0' }}>No uploaded documents</div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>File</th>
                          <th>Size</th>
                          <th>Status</th>
                          <th>Uploaded</th>
                          <th>Expires</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map(d => (
                          <tr key={d.id}>
                            <td className="td-primary">{d.documentType}</td>
                            <td className="td-mono" style={{ fontSize: '0.75rem' }}>
                              {d.originalFileName || '—'}
                              {d.issuer && <div style={{ color: '#475569', fontSize: '0.7rem' }}>{d.issuer}</div>}
                            </td>
                            <td>{d.fileSize ? `${(d.fileSize / 1024).toFixed(1)} KB` : '—'}</td>
                            <td>{docStatusBadge(d.status)}</td>
                            <td>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '—'}</td>
                            <td>{d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : '—'}</td>
                            <td>
                              <div className="admin-row-actions">
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => viewDoc(d.id)}
                                  disabled={viewingDoc[d.id]}
                                >{viewingDoc[d.id] ? 'Opening…' : 'View'}</button>
                                {d.status !== 'APPROVED' && (
                                  <button className="btn btn-success btn-sm" onClick={() => reviewDoc(d.id, 'APPROVED')} disabled={docBusy[d.id]}>Approve</button>
                                )}
                                {d.status !== 'REJECTED' && (
                                  <button className="btn btn-danger btn-sm" onClick={() => reviewDoc(d.id, 'REJECTED')} disabled={docBusy[d.id]}>Reject</button>
                                )}
                                {d.status !== 'PENDING' && (
                                  <button className="btn btn-ghost btn-sm" onClick={() => reviewDoc(d.id, 'PENDING')} disabled={docBusy[d.id]}>Reset</button>
                                )}
                                {d.status === 'REJECTED' && (
                                  <button className="btn btn-danger btn-sm" onClick={() => deleteRejectedDoc(d.id)} disabled={docBusy[d.id]}>
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #1e2a3a', paddingTop: 18 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Info Request Documents {infoRequestDocuments.length > 0 ? `(${infoRequestDocuments.length})` : ''}
                  </div>
                  {!infoRequestDocuments.length ? (
                    <div className="admin-empty" style={{ padding: '24px 0' }}>No files uploaded through info requests</div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>File</th>
                          <th>Source</th>
                          <th>Request</th>
                          <th>Response</th>
                          <th>Responded</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {infoRequestDocuments.map(file => (
                          <tr key={`${file.requestId}-${file.fileIndex}`}>
                            <td className="td-primary">{file.fileName}</td>
                            <td>{sourceLabel(file.source)}</td>
                            <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.requestNote}</td>
                            <td style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.responseMessage || '—'}</td>
                            <td>{file.respondedAt ? new Date(file.respondedAt).toLocaleDateString() : '—'}</td>
                            <td>
                              <button className="btn btn-ghost btn-sm" onClick={() => adminOpenResponseFile(file.requestId, file.fileIndex)}>
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #1e2a3a', paddingTop: 18 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Identity Verification Documents
                    {verification?.idType && <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', color: '#475569' }}>· {verification.idType}</span>}
                  </div>
                  {!verification ? (
                    <div className="admin-empty" style={{ padding: '24px 0' }}>No identity verification files</div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr><th>File</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {verificationDocuments.map(({ side, label, available }) => (
                          <tr key={side}>
                            <td className="td-primary">{label}</td>
                            <td>
                              {available
                                ? <span className="badge badge-verified">Provided</span>
                                : <span className="badge badge-inactive">Not provided</span>}
                            </td>
                            <td>{verification.submittedAt ? new Date(verification.submittedAt).toLocaleDateString() : '—'}</td>
                            <td>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => viewVerifFile(verification.id, side)}
                                disabled={!available || viewingVerifFile[`${verification.id}_${side}`]}
                                style={{ opacity: available ? 1 : 0.4 }}
                              >
                                {viewingVerifFile[`${verification.id}_${side}`] ? 'Opening…' : 'View'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>


            {/* Danger zone */}
            <div className="admin-detail-card" style={{ borderColor: '#7f1d1d' }}>
              <p className="admin-detail-card-title" style={{ color: '#f87171' }}>Danger Zone</p>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
                Delete this user
              </button>
            </div>
          </>
        )}
      </div>

      {confirmDelete && (
        <PasswordConfirmModal
          title="Delete user?"
          message={`This will permanently delete ${user?.name} (${user?.email}) and all their data. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={doDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}

      {showInfoRequest && (
        <InfoRequestModal
          userId={id}
          onClose={() => { setShowInfoRequest(false); refreshFlags(); }}
        />
      )}
    </AdminLayout>
  );
}
