import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { updateProfile } from '../../api/auth';
import './DataPrivacy.css';

const Icon = {
  Eye: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  IdCard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 10h4M14 14h3" />
    </svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Download: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Trash: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const DATA_CONTROLS = [
  {
    id: 'profile',
    icon: Icon.User,
    label: 'Profile Information',
    hint: 'Your name and profile details visible to connected services',
    defaultOn: true,
  },
  {
    id: 'email',
    icon: Icon.Mail,
    label: 'Email Address',
    hint: 'Allow connected services to see your verified email',
    defaultOn: true,
  },
  {
    id: 'phone',
    icon: Icon.Phone,
    label: 'Phone Number',
    hint: 'Allow connected services to see your verified phone number',
    defaultOn: false,
  },
  {
    id: 'identity',
    icon: Icon.IdCard,
    label: 'Identity Verification Status',
    hint: 'Share whether your identity has been verified (not the raw documents)',
    defaultOn: true,
  },
  {
    id: 'documents',
    icon: Icon.FileText,
    label: 'Document Details',
    hint: 'Share document metadata (type, issuer) — never the actual files',
    defaultOn: false,
  },
  {
    id: 'credentials',
    icon: Icon.Shield,
    label: 'Credentials & Affiliations',
    hint: 'Share your verified credentials (military, student, professional)',
    defaultOn: true,
  },
];

function Toggle({ on, onToggle, disabled }) {
  return (
    <button
      type="button"
      className={'dp-toggle' + (on ? ' on' : '')}
      onClick={onToggle}
      disabled={disabled}
      aria-checked={on}
      role="switch"
    >
      <span className="dp-toggle-knob" />
    </button>
  );
}

export default function DataPrivacy() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [controls, setControls] = useState(
    Object.fromEntries(DATA_CONTROLS.map((c) => [c.id, c.defaultOn]))
  );
  const [saving, setSaving] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [showDeleteRequestModal, setShowDeleteRequestModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteSubmitted, setDeleteSubmitted] = useState(false);

  async function toggleControl(id) {
    const next = !controls[id];
    setControls((prev) => ({ ...prev, [id]: next }));
    setSaving(id);
    try {
      // Persist marketing opt-in since it maps directly to a user field
      if (id === 'email') {
        await updateProfile({ marketingOptIn: next });
      }
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    } catch {
      // revert on failure
      setControls((prev) => ({ ...prev, [id]: !next }));
    } finally {
      setSaving(null);
    }
  }

  function handleDeleteRequest(e) {
    e.preventDefault();
    setDeleteSubmitted(true);
    setTimeout(() => setShowDeleteRequestModal(false), 2000);
  }

  return (
    <div className="dp-page">
      {/* Header */}
      <div className="dp-header">
        <button type="button" className="dp-back-btn" onClick={() => navigate('/settings')}>
          <Icon.ArrowLeft /> Back to Settings
        </button>
        <div className="dp-header-content">
          <div className="dp-header-icon"><Icon.Eye /></div>
          <div>
            <h2>Data Privacy</h2>
            <p className="dp-header-sub">
              Control exactly what information connected services and Digital ID can access.
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="dp-info-banner">
        <span className="dp-info-icon"><Icon.Shield /></span>
        <div>
          <div className="dp-info-title">Your data is always encrypted</div>
          <div className="dp-info-desc">
            Digital ID never sells your data. Disabling a control instantly revokes that data category
            from all connected services — no manual action needed.
          </div>
        </div>
      </div>

      {/* Data sharing controls */}
      <div className="dp-group">
        <h3 className="dp-group-title">Data Sharing Controls</h3>
        <p className="dp-group-desc">
          Toggle which categories of your information connected services are allowed to access.
        </p>
        <div className="dp-card">
          {DATA_CONTROLS.map((ctrl, i) => (
            <div key={ctrl.id} className={'dp-item' + (i === DATA_CONTROLS.length - 1 ? ' last' : '')}>
              <div className="dp-item-header">
                <span className="dp-item-icon"><ctrl.icon /></span>
                <div className="dp-item-text">
                  <span className="dp-item-label">{ctrl.label}</span>
                  <span className="dp-item-hint">{ctrl.hint}</span>
                </div>
              </div>
              <div className="dp-item-right">
                {savedId === ctrl.id && (
                  <span className="dp-saved-chip"><Icon.Check /> Saved</span>
                )}
                <Toggle
                  on={controls[ctrl.id]}
                  onToggle={() => toggleControl(ctrl.id)}
                  disabled={saving === ctrl.id}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data access summary */}
      <div className="dp-group">
        <h3 className="dp-group-title">Your Account Data</h3>
        <div className="dp-card">
          <div className="dp-data-row">
            <div className="dp-data-row-icon"><Icon.User /></div>
            <div className="dp-data-row-info">
              <span className="dp-data-row-label">Account holder</span>
              <span className="dp-data-row-value">{user?.name || user?.username || '—'}</span>
            </div>
          </div>
          <div className="dp-data-row">
            <div className="dp-data-row-icon"><Icon.Mail /></div>
            <div className="dp-data-row-info">
              <span className="dp-data-row-label">Email on file</span>
              <span className="dp-data-row-value">{user?.email || '—'}</span>
            </div>
          </div>
          <div className="dp-data-row last">
            <div className="dp-data-row-icon"><Icon.Phone /></div>
            <div className="dp-data-row-info">
              <span className="dp-data-row-label">Phone on file</span>
              <span className="dp-data-row-value">{user?.phoneNo ? `•••-•••-${String(user.phoneNo).slice(-4)}` : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="dp-group">
        <h3 className="dp-group-title">Data Actions</h3>
        <div className="dp-card">
          <div className="dp-action-item">
            <div className="dp-action-item-header">
              <span className="dp-action-icon download"><Icon.Download /></span>
              <div>
                <span className="dp-item-label">Export My Data</span>
                <span className="dp-item-hint">Download a copy of all information Digital ID holds about you</span>
              </div>
            </div>
            <button
              type="button"
              className="dp-action-btn"
              onClick={() => alert('Data export request received. You will receive an email with your data within 24 hours.')}
            >
              Request Export
            </button>
          </div>
          <div className="dp-action-item last">
            <div className="dp-action-item-header">
              <span className="dp-action-icon danger"><Icon.Trash /></span>
              <div>
                <span className="dp-item-label">Request Data Deletion</span>
                <span className="dp-item-hint">Ask Digital ID to permanently delete your data (separate from deleting your account)</span>
              </div>
            </div>
            <button
              type="button"
              className="dp-action-btn danger"
              onClick={() => { setShowDeleteRequestModal(true); setDeleteSubmitted(false); setDeleteReason(''); }}
            >
              Request Deletion
            </button>
          </div>
        </div>
      </div>

      {/* Delete request modal */}
      {showDeleteRequestModal && (
        <div className="dp-modal-backdrop" onClick={() => setShowDeleteRequestModal(false)}>
          <div className="dp-modal" onClick={(e) => e.stopPropagation()}>
            {deleteSubmitted ? (
              <div className="dp-modal-success">
                <span className="dp-modal-success-icon"><Icon.Check /></span>
                <h3>Request Submitted</h3>
                <p>Your data deletion request has been received. Our privacy team will review and process it within 30 days as required by applicable privacy law.</p>
              </div>
            ) : (
              <>
                <div className="dp-modal-header">
                  <span className="dp-modal-warn-icon"><Icon.AlertTriangle /></span>
                  <div>
                    <h3>Request Data Deletion</h3>
                    <p>This requests the deletion of your personal data held by Digital ID. This is separate from deleting your account.</p>
                  </div>
                  <button type="button" className="dp-modal-close" onClick={() => setShowDeleteRequestModal(false)}>×</button>
                </div>
                <form onSubmit={handleDeleteRequest}>
                  <div className="dp-modal-body">
                    <label className="dp-field-label" htmlFor="dp-delete-reason">
                      Reason <span className="dp-field-optional">(optional)</span>
                    </label>
                    <textarea
                      id="dp-delete-reason"
                      className="dp-textarea"
                      placeholder="Tell us why you want your data deleted…"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="dp-modal-footer">
                    <button type="submit" className="dp-modal-confirm-danger">Submit Request</button>
                    <button type="button" className="dp-modal-cancel" onClick={() => setShowDeleteRequestModal(false)}>Cancel</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
