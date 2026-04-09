import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchConsentInfo, approveConsent } from '../../api/developer';
import './Consent.css';

export default function ConsentPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const appId         = params.get('app_id');
  const credentialType = params.get('credential_type');

  const hasParams = !!(appId && credentialType);
  const [info, setInfo]       = useState(null);
  const [loading, setLoading] = useState(hasParams);
  const [approving, setApproving] = useState(false);
  const [error, setError]     = useState(hasParams ? '' : 'Invalid consent request — missing app_id or credential_type.');

  useEffect(() => {
    if (!hasParams) return;
    fetchConsentInfo(appId, credentialType)
      .then(data => setInfo(data))
      .catch(() => setError('Could not load app information. This link may be invalid or expired.'))
      .finally(() => setLoading(false));
  }, [appId, credentialType, hasParams]);

  const handleApprove = async () => {
    setApproving(true);
    setError('');
    try {
      const data = await approveConsent(Number(appId), credentialType);
      window.location.href = data.callbackUrl;
    } catch (err) {
      setError(err.message || 'Failed to approve. Please try again.');
      setApproving(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="consent-page">
        <div className="consent-card">
          <div className="consent-spinner" />
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Loading…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error && !info) {
    return (
      <div className="consent-page">
        <div className="consent-card consent-card-error">
          <div className="consent-error-icon">✕</div>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text)' }}>Invalid Request</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{error}</p>
          <button className="consent-btn-deny" onClick={() => navigate('/home')}>Go Home</button>
        </div>
      </div>
    );
  }

  // ── Consent screen ───────────────────────────────────────────
  return (
    <div className="consent-page">
      <div className="consent-card">

        {/* App avatar */}
        <div className="consent-app-avatar">
          {info?.appName?.[0]?.toUpperCase() ?? '?'}
        </div>

        <h2 className="consent-title">Permission Request</h2>

        <p className="consent-subtitle">
          <strong>{info?.appName}</strong> is requesting permission to verify your{' '}
          <strong>{credentialType}</strong> credential.
        </p>

        {info?.appWebsite && (
          <a href={info.appWebsite} target="_blank" rel="noopener noreferrer"
            className="consent-website">
            {info.appWebsite}
          </a>
        )}

        {/* What is shared */}
        <div className="consent-share-box">
          <p className="consent-share-title">What will be shared</p>
          <ul className="consent-share-list">
            <li className="consent-share-item">
              <span className="consent-share-item-icon yes">✓</span>
              Whether your <strong>{credentialType}</strong> credential is verified
            </li>
            <li className="consent-share-item">
              <span className="consent-share-item-icon yes">✓</span>
              Verification date
            </li>
            <li className="consent-share-item">
              <span className="consent-share-item-icon no">✕</span>
              Your name, email, or any personal details — <strong>never shared</strong>
            </li>
          </ul>
        </div>

        {error && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--error)', background: 'var(--error-bg)',
            border: '1px solid var(--error-border)', borderRadius: 'var(--r-sm)',
            padding: '10px 14px', width: '100%', textAlign: 'left' }}>
            {error}
          </p>
        )}

        <div className="consent-divider" />

        {/* Actions */}
        <div className="consent-actions">
          <button className="consent-btn-allow" onClick={handleApprove} disabled={approving}>
            {approving ? 'Approving…' : `Allow ${info?.appName ?? 'this app'} to verify`}
          </button>
          <button className="consent-btn-deny" onClick={() => navigate(-1)} disabled={approving}>
            Deny
          </button>
        </div>

        <p className="consent-footer-note">
          This token is single-use and expires in 10 minutes.{' '}
          You can revoke permissions anytime from{' '}
          <a href="/settings">Settings</a>.
        </p>

      </div>
    </div>
  );
}
