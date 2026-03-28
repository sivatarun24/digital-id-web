import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  adminListVerifications,
  adminReviewVerification,
  adminGetUser,
  adminGetVerificationFile,
  adminListCredentials,
  adminReviewCredential,
  adminGetCredentialFile,
  adminDeleteCredential,
  instAdminDeleteCredential,
} from '../../../api/admin';
import { adminCreateInfoRequest, adminGetInfoRequests, adminOpenResponseFile } from '../../../api/infoRequests';

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(s) {
  const cls = {
    PENDING:  'badge-pending',
    VERIFIED: 'badge-verified',
    REJECTED: 'badge-rejected',
  }[s] || 'badge-inactive';
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

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Info Request Modal ────────────────────────────────────────────────────────

function InfoRequestModal({ verification, onClose, onSaved }) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleSave() {
    if (!note.trim()) return;
    setBusy(true);
    setErr('');
    try {
      await adminCreateInfoRequest(verification.userId, note.trim(), 'verification_review');
      setSaved(true);
      setTimeout(() => { onSaved(); onClose(); }, 900);
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <p className="admin-modal-title">Request More Information</p>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 16 }}>
          From: <strong style={{ color: '#e2e8f0' }}>{verification.userName || `User #${verification.userId}`}</strong>
        </div>
        {saved ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#4ade80', fontWeight: 600 }}>
            Request saved — user will see it on their profile.
          </div>
        ) : (
          <>
            <label className="admin-label">What information do you need? *</label>
            <textarea
              className="admin-input"
              style={{ width: '100%', resize: 'vertical', minHeight: 100, marginBottom: 20, boxSizing: 'border-box' }}
              placeholder="e.g. Please resubmit a clearer photo of your ID front — the current image is too blurry."
              value={note}
              onChange={e => setNote(e.target.value)}
              autoFocus
            />
            {err && <div style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: 10 }}>{err}</div>}
            <div className="admin-modal-footer">
              <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!note.trim() || busy}>
                {busy ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── File view button ──────────────────────────────────────────────────────────

function FileViewBtn({ verificationId, side, hasFile }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function open() {
    setErr('');
    setLoading(true);
    try {
      await adminGetVerificationFile(verificationId, side);
    } catch {
      setErr('Could not open file');
    } finally {
      setLoading(false);
    }
  }

  if (!hasFile) return <span style={{ color: '#334155' }}>Not provided</span>;
  return (
    <span>
      <button
        className="btn btn-ghost btn-sm"
        style={{ padding: '2px 10px', fontSize: '0.75rem' }}
        onClick={open}
        disabled={loading}
      >
        {loading ? 'Opening…' : 'View file ↗'}
      </button>
      {err && <span style={{ color: '#f87171', fontSize: '0.72rem', marginLeft: 6 }}>{err}</span>}
    </span>
  );
}

// ── Review Action Panel ───────────────────────────────────────────────────────

function ReviewPanel({ v, onReview, reviewing }) {
  const [pendingAction, setPendingAction] = useState(null); // 'VERIFIED' | 'REJECTED' | 'PENDING'
  const [notes, setNotes] = useState('');

  function startAction(action) {
    setPendingAction(action);
    setNotes('');
  }

  async function confirm() {
    if ((pendingAction === 'VERIFIED' || pendingAction === 'REJECTED') && !notes.trim()) return;
    await onReview(v.id, pendingAction, notes.trim());
    setPendingAction(null);
    setNotes('');
  }

  if (pendingAction) {
    const isApprove = pendingAction === 'VERIFIED';
    const isReject  = pendingAction === 'REJECTED';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <div style={{ fontSize: '0.8rem', color: isApprove ? '#4ade80' : isReject ? '#f87171' : '#94a3b8', fontWeight: 600 }}>
          {isApprove ? 'Approve verification' : isReject ? 'Reject verification' : 'Reset to pending'} — add a message for the user
        </div>
        <textarea
          className="admin-input"
          style={{ width: '100%', resize: 'vertical', minHeight: 70, boxSizing: 'border-box', fontSize: '0.82rem' }}
          placeholder={
            isApprove ? 'e.g. Your identity has been successfully verified.' :
            isReject  ? 'e.g. Your documents were unclear. Please resubmit with higher quality images.' :
            'Optional note…'
          }
          value={notes}
          onChange={e => setNotes(e.target.value)}
          autoFocus
        />
        {(isApprove || isReject) && !notes.trim() && (
          <div style={{ fontSize: '0.72rem', color: '#fbbf24' }}>A message is required before submitting.</div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${isApprove ? 'btn-success' : isReject ? 'btn-danger' : 'btn-ghost'}`}
            onClick={confirm}
            disabled={reviewing[v.id] || ((isApprove || isReject) && !notes.trim())}
          >
            {reviewing[v.id] ? 'Saving…' : 'Confirm'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setPendingAction(null)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {v.status === 'PENDING' && (
        <>
          <button className="btn btn-success btn-sm" disabled={reviewing[v.id]} onClick={() => startAction('VERIFIED')}>
            Approve
          </button>
          <button className="btn btn-danger btn-sm" disabled={reviewing[v.id]} onClick={() => startAction('REJECTED')}>
            Reject
          </button>
        </>
      )}
      {v.status === 'VERIFIED' && (
        <button className="btn btn-danger btn-sm" disabled={reviewing[v.id]} onClick={() => startAction('REJECTED')}>
          Revoke Approval
        </button>
      )}
      {v.status === 'REJECTED' && (
        <button className="btn btn-ghost btn-sm" disabled={reviewing[v.id]} onClick={() => startAction('PENDING')}>
          Reset to Pending
        </button>
      )}
    </div>
  );
}

// ── Verification Detail Modal ─────────────────────────────────────────────────

function VerificationModal({ v, onClose, onReview, reviewing, onRequestInfo, infoRefreshKey }) {
  const [user, setUser] = useState(null);
  const [verifRequests, setVerifRequests] = useState([]);

  useEffect(() => {
    adminGetUser(v.userId).then(setUser).catch(() => {});
  }, [v.userId]);

  useEffect(() => {
    adminGetInfoRequests(v.userId)
      .then(all => setVerifRequests(all.filter(r => r.source === 'verification_review')))
      .catch(() => {});
  }, [v.userId, infoRefreshKey]);

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: 780, width: '100%', padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1e2a3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p className="admin-modal-title" style={{ margin: 0 }}>Verification Review</p>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
              {v.userName} · {v.idType} · {statusBadge(v.status)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '1.2rem', lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Body - two column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, maxHeight: '65vh', overflowY: 'auto' }}>

          {/* Left: User Profile */}
          <div style={{ padding: '20px 24px', borderRight: '1px solid #1e2a3a' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              User Profile
            </div>
            {!user ? (
              <div style={{ color: '#475569', fontSize: '0.82rem' }}>Loading…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: 'Full Name',     value: user.name || '—' },
                  { label: 'Username',      value: user.username || '—' },
                  { label: 'Email',         value: user.email || '—' },
                  { label: 'Phone',         value: user.phoneNo || '—' },
                  { label: 'Date of Birth', value: fmtDate(user.dateOfBirth) },
                  { label: 'Gender',        value: user.gender || '—' },
                  { label: 'Account Status',value: user.accountStatus || '—' },
                  { label: 'Email Verified',value: user.emailVerifiedAt ? `Yes — ${fmtDate(user.emailVerifiedAt)}` : 'No' },
                  { label: 'Member Since',  value: fmtDate(user.createdAt) },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: 10, fontSize: '0.81rem', alignItems: 'baseline' }}>
                    <span style={{ color: '#475569', minWidth: 100, flexShrink: 0 }}>{row.label}</span>
                    <span style={{ color: '#e2e8f0' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {verifRequests.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Info Requests &amp; User Responses
                </div>
                {verifRequests.map(req => (
                  <div key={req.id} style={{ borderRadius: 6, border: `1px solid ${req.userResponse ? '#1e3a1e' : '#78350f'}`, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 10px', background: '#0f1117' }}>
                      <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 2, textTransform: 'uppercase' }}>Admin Request</div>
                      <div style={{ fontSize: '0.78rem', color: req.userResponse ? '#64748b' : '#fde68a' }}>{req.note}</div>
                    </div>
                    {req.userResponse ? (
                      <div style={{ padding: '8px 10px', background: '#0a1a0a', borderTop: '1px solid #1e3a1e' }}>
                        <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 600, marginBottom: 4 }}>
                          ✓ User Response · {req.userResponse.respondedAt ? new Date(req.userResponse.respondedAt).toLocaleString() : ''}
                        </div>
                        {req.userResponse.message && (
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: req.userResponse.files?.length ? 6 : 0 }}>
                            {req.userResponse.message}
                          </div>
                        )}
                        {req.userResponse.files?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {req.userResponse.files.map((f) => (
                              <button key={f.index} onClick={() => adminOpenResponseFile(req.id, f.index)}
                                style={{ fontSize: '0.72rem', color: '#60a5fa', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                📎 {f.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '6px 10px', background: '#3d2e00', fontSize: '0.7rem', color: '#fbbf24' }}>
                        ⏳ Awaiting user response
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Submitted Docs */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Submitted Documents
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'ID Type',   value: v.idType || '—',      file: false },
                { label: 'Submitted', value: fmt(v.submittedAt),    file: false },
                { label: 'Reviewed',  value: fmt(v.reviewedAt),     file: false },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', gap: 10, fontSize: '0.81rem', alignItems: 'baseline' }}>
                  <span style={{ color: '#475569', minWidth: 100, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ color: '#e2e8f0' }}>{row.value}</span>
                </div>
              ))}

              {/* File rows */}
              {[
                { label: 'Front ID', side: 'front',  has: v.hasFrontFile },
                { label: 'Back ID',  side: 'back',   has: v.hasBackFile  },
                { label: 'Selfie',   side: 'selfie', has: v.hasSelfieFile },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', gap: 10, fontSize: '0.81rem', alignItems: 'center' }}>
                  <span style={{ color: '#475569', minWidth: 100, flexShrink: 0 }}>{row.label}</span>
                  <FileViewBtn verificationId={v.id} side={row.side} hasFile={row.has} />
                </div>
              ))}

              {/* Reviewer notes from previous review */}
              {v.reviewerNotes && (
                <div style={{ marginTop: 8, background: '#0d1117', borderRadius: 6, padding: '8px 12px', border: '1px solid #1e2a3a' }}>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previous reviewer note</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{v.reviewerNotes}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #1e2a3a',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <ReviewPanel v={v} onReview={onReview} reviewing={reviewing} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onRequestInfo(v)}
              style={{ borderColor: '#fbbf24', color: '#fbbf24' }}
            >
              Request More Info
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => window.open(`/admin/users/${v.userId}`, '_blank')}
            >
              View Full Profile ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Credential Review Panel ───────────────────────────────────────────────────

function CredReviewPanel({ c, onReview, reviewing }) {
  const [pendingAction, setPendingAction] = useState(null);
  const [notes, setNotes] = useState('');

  function startAction(action) { setPendingAction(action); setNotes(''); }

  async function confirm() {
    if ((pendingAction === 'VERIFIED' || pendingAction === 'REJECTED') && !notes.trim()) return;
    await onReview(c.id, pendingAction, notes.trim());
    setPendingAction(null);
    setNotes('');
  }

  if (pendingAction) {
    const isApprove = pendingAction === 'VERIFIED';
    const isReject  = pendingAction === 'REJECTED';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <div style={{ fontSize: '0.8rem', color: isApprove ? '#4ade80' : isReject ? '#f87171' : '#94a3b8', fontWeight: 600 }}>
          {isApprove ? 'Approve credential' : isReject ? 'Reject credential' : 'Reset to pending'} — add a note for the user
        </div>
        <textarea
          className="admin-input"
          style={{ width: '100%', resize: 'vertical', minHeight: 70, boxSizing: 'border-box', fontSize: '0.82rem' }}
          placeholder={isApprove ? 'e.g. Your credential has been verified.' : isReject ? 'e.g. Submitted documents were unclear.' : 'Optional note…'}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          autoFocus
        />
        {(isApprove || isReject) && !notes.trim() && (
          <div style={{ fontSize: '0.72rem', color: '#fbbf24' }}>A message is required before submitting.</div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${isApprove ? 'btn-success' : isReject ? 'btn-danger' : 'btn-ghost'}`}
            onClick={confirm}
            disabled={reviewing[c.id] || ((isApprove || isReject) && !notes.trim())}
          >
            {reviewing[c.id] ? 'Saving…' : 'Confirm'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setPendingAction(null)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {c.status === 'PENDING' && (
        <>
          <button className="btn btn-success btn-sm" disabled={reviewing[c.id]} onClick={() => startAction('VERIFIED')}>Approve</button>
          <button className="btn btn-danger btn-sm"  disabled={reviewing[c.id]} onClick={() => startAction('REJECTED')}>Reject</button>
        </>
      )}
      {c.status === 'VERIFIED' && (
        <button className="btn btn-danger btn-sm" disabled={reviewing[c.id]} onClick={() => startAction('REJECTED')}>Revoke</button>
      )}
      {c.status === 'REJECTED' && (
        <button className="btn btn-ghost btn-sm" disabled={reviewing[c.id]} onClick={() => startAction('PENDING')}>Reset to Pending</button>
      )}
    </div>
  );
}

// ── Credential File View Button ───────────────────────────────────────────────

function CredFileViewBtn({ credId }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  async function open() {
    setErr(''); setLoading(true);
    try { await adminGetCredentialFile(credId); }
    catch { setErr('Could not open file'); }
    finally { setLoading(false); }
  }
  return (
    <span>
      <button className="btn btn-ghost btn-sm" style={{ padding: '2px 10px', fontSize: '0.75rem' }} onClick={open} disabled={loading}>
        {loading ? 'Opening…' : 'View document ↗'}
      </button>
      {err && <span style={{ color: '#f87171', fontSize: '0.72rem', marginLeft: 6 }}>{err}</span>}
    </span>
  );
}

// ── Credential Detail Modal ───────────────────────────────────────────────────

function CredentialModal({ c, onClose, onReview, reviewing }) {
  const fields = c.fields || {};

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: 680, width: '100%', padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="admin-modal-title" style={{ margin: 0 }}>Credential Review</p>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
              {c.userName} · {(c.credentialType || '').replace(/_/g, ' ')} · {statusBadge(c.status)}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ padding: '20px 24px', borderRight: '1px solid #1e2a3a' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>User</div>
            {[
              { label: 'Name',  value: c.userName  || '—' },
              { label: 'Email', value: c.userEmail || '—' },
              { label: 'Submitted', value: fmt(c.submittedAt) },
              { label: 'Reviewed',  value: fmt(c.reviewedAt) },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: 10, fontSize: '0.81rem', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ color: '#475569', minWidth: 80, flexShrink: 0 }}>{row.label}</span>
                <span style={{ color: '#e2e8f0' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Submitted Fields</div>
            {Object.keys(fields).length === 0 ? (
              <div style={{ color: '#475569', fontSize: '0.82rem' }}>No field data available</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(fields).map(([k, v]) => {
                  if (v === null || v === undefined || v === '') return null;
                  const label = k.replace(/([A-Z])/g, ' $1').trim();
                  return (
                    <div key={k} style={{ display: 'flex', gap: 10, fontSize: '0.81rem', alignItems: 'baseline' }}>
                      <span style={{ color: '#475569', minWidth: 130, flexShrink: 0, textTransform: 'capitalize' }}>{label}</span>
                      <span style={{ color: '#e2e8f0' }}>{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {c.reviewerNotes && (
              <div style={{ marginTop: 16, background: '#0d1117', borderRadius: 6, padding: '8px 12px', border: '1px solid #1e2a3a' }}>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previous reviewer note</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.reviewerNotes}</div>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Supporting Document</div>
              <CredFileViewBtn credId={c.id} />
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #1e2a3a', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <CredReviewPanel c={c} onReview={onReview} reviewing={reviewing} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => window.open(`/admin/users/${c.userId}`, '_blank')}>
              View Profile ↗
            </button>
            <button
              className="btn btn-sm"
              style={{
                backgroundColor: 'transparent',
                color: '#ef4444',
                border: '1px solid #ef4444',
                fontSize: '0.75rem'
              }}
              onClick={() => onReview(c.id, 'DELETE')}
              disabled={reviewing}
            >
              Delete Submission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Credentials Tab ───────────────────────────────────────────────────────────

function CredentialsTab() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [reviewing, setReviewing] = useState({});

  const loadAll = useCallback(() => {
    setLoading(true);
    adminListCredentials('')
      .then(data => setAll(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleReview(id, status, notes) {
    if (status === 'DELETE') {
      if (!window.confirm('Are you sure you want to permanently delete this submission and all associated documents?')) return;
      setReviewing(r => ({ ...r, [id]: true }));
      try {
        await adminDeleteCredential(id);
        loadAll();
        setSelected(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setReviewing(r => ({ ...r, [id]: false }));
      }
      return;
    }

    setReviewing(r => ({ ...r, [id]: true }));
    try {
      await adminReviewCredential(id, status, notes);
      loadAll();
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setReviewing(r => ({ ...r, [id]: false }));
    }
  }

  const total    = all.length;
  const pending  = all.filter(c => c.status === 'PENDING').length;
  const verified = all.filter(c => c.status === 'VERIFIED').length;
  const rejected = all.filter(c => c.status === 'REJECTED').length;

  const q = search.trim().toLowerCase();
  const filtered = all.filter(c => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchSearch = !q
      || (c.userName  || '').toLowerCase().includes(q)
      || (c.userEmail || '').toLowerCase().includes(q)
      || (c.credentialType || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <>
      {error && <div className="admin-error" style={{ cursor: 'pointer' }} onClick={() => setError('')}>{error} ✕</div>}

      {!loading && (
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <StatCard label="Total Submissions" value={total}    color="blue" />
          <StatCard label="Pending Review"    value={pending}  color="yellow" />
          <StatCard label="Approved"          value={verified} color="green" />
          <StatCard label="Rejected"          value={rejected} color="red" />
        </div>
      )}

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar" style={{ gap: 10, flexWrap: 'wrap' }}>
          <span className="admin-table-toolbar-title">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            {(search || statusFilter) && total > 0 && filtered.length !== total && (
              <span style={{ fontWeight: 400, color: '#475569', marginLeft: 6 }}>of {total}</span>
            )}
          </span>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <input
              className="admin-input"
              style={{ width: 200, padding: '5px 10px' }}
              placeholder="Search name, email, type…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">No credential submissions found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Credential Type</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0d1320'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td className="td-primary">{c.userName || '—'}</td>
                  <td style={{ color: '#94a3b8' }}>{c.userEmail || '—'}</td>
                  <td className="td-mono" style={{ textTransform: 'capitalize' }}>{(c.credentialType || '—').replace(/_/g, ' ')}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {c.reviewedAt ? new Date(c.reviewedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <CredentialModal
          c={selected}
          onClose={() => setSelected(null)}
          onReview={handleReview}
          reviewing={reviewing}
        />
      )}
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminVerifications() {
  const [tab, setTab] = useState('identity');
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [reviewing, setReviewing] = useState({});
  const [infoTarget, setInfoTarget] = useState(null);
  const [infoRefreshKey, setInfoRefreshKey] = useState(0);

  const loadAll = useCallback(() => {
    setLoading(true);
    adminListVerifications('')
      .then(setAll)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleReview(id, status, notes) {
    setReviewing(r => ({ ...r, [id]: true }));
    try {
      await adminReviewVerification(id, status, notes);
      loadAll();
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setReviewing(r => ({ ...r, [id]: false }));
    }
  }

  // Stats
  const total    = all.length;
  const pending  = all.filter(v => v.status === 'PENDING').length;
  const verified = all.filter(v => v.status === 'VERIFIED').length;
  const rejected = all.filter(v => v.status === 'REJECTED').length;

  // Filter
  const q = search.trim().toLowerCase();
  const filtered = all.filter(v => {
    const matchStatus = !statusFilter || v.status === statusFilter;
    const matchSearch = !q
      || (v.userName || '').toLowerCase().includes(q)
      || (v.userEmail || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <AdminLayout variant="admin">
      <div className="admin-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Verifications</h1>
          <p className="admin-page-subtitle">Review identity and credential submissions</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {[
            { id: 'identity', label: 'Identity Verifications' },
            { id: 'credentials', label: 'Credential Verifications' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '7px 18px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.15s',
                background: tab === t.id ? '#1e3a5f' : 'transparent',
                color: tab === t.id ? '#60a5fa' : '#475569',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'credentials' ? (
          <CredentialsTab />
        ) : (
          <>
            {error && <div className="admin-error" style={{ cursor: 'pointer' }} onClick={() => setError('')}>{error} ✕</div>}

            {/* Stats */}
            {!loading && (
              <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <StatCard label="Total Submissions" value={total}    color="blue" />
                <StatCard label="Pending Review"    value={pending}  color="yellow" />
                <StatCard label="Verified"          value={verified} color="green" />
                <StatCard label="Rejected"          value={rejected} color="red" />
              </div>
            )}

            {/* Table */}
            <div className="admin-table-wrap">
              <div className="admin-table-toolbar" style={{ gap: 10, flexWrap: 'wrap' }}>
                <span className="admin-table-toolbar-title">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                  {(search || statusFilter) && total > 0 && filtered.length !== total && (
                    <span style={{ fontWeight: 400, color: '#475569', marginLeft: 6 }}>of {total}</span>
                  )}
                </span>
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
                  <input
                    className="admin-input"
                    style={{ width: 200, padding: '5px 10px' }}
                    placeholder="Search name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <select
                    className="admin-filter-select"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="admin-loading">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="admin-empty">No verifications found</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>ID Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Reviewed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(v => (
                      <tr
                        key={v.id}
                        onClick={() => setSelected(v)}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0d1320'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td className="td-primary">{v.userName || '—'}</td>
                        <td style={{ color: '#94a3b8' }}>{v.userEmail || '—'}</td>
                        <td className="td-mono">{v.idType || '—'}</td>
                        <td>{statusBadge(v.status)}</td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {v.reviewedAt ? new Date(v.reviewedAt).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={e => { e.stopPropagation(); window.open(`/admin/users/${v.userId}`, '_blank'); }}
                          >
                            Profile ↗
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {selected && (
              <VerificationModal
                v={selected}
                onClose={() => setSelected(null)}
                onReview={handleReview}
                reviewing={reviewing}
                onRequestInfo={v => { setInfoTarget(v); }}
                infoRefreshKey={infoRefreshKey}
              />
            )}

            {infoTarget && (
              <InfoRequestModal
                verification={infoTarget}
                onClose={() => setInfoTarget(null)}
                onSaved={() => { setInfoTarget(null); setInfoRefreshKey(k => k + 1); }}
              />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
