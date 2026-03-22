import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';
import { changePassword, deleteAccount, twoFactorSetup, twoFactorEnable, twoFactorDisable } from '../../api/auth';
import useAuth from '../../hooks/useAuth';
import { validateChangePassword, PASSWORD_HINT, getPasswordRuleStatus } from '../../utils/passwordValidation';

const Icon = {
  Key: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" />
      <path d="M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  ),
  Phone: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Lock: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  IdCard: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4M14 14h3" />
    </svg>
  ),
  Award: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Bell: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Eye: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Link: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

export default function Settings() {
  const { logout, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePwdError, setChangePwdError] = useState('');
  const [changePwdMessage, setChangePwdMessage] = useState('');
  const [changePwdLoading, setChangePwdLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState('setup'); // 'setup' | 'verify' | 'disable'
  const [twoFAQrUri, setTwoFAQrUri] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');


  async function handleDeleteAccount(e) {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError('Password is required to confirm deletion.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAccount(deletePassword);
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Something went wrong');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setChangePwdError('');
    setChangePwdMessage('');
    const check = validateChangePassword(oldPassword, newPassword);
    if (!check.valid) {
      setChangePwdError(check.errors.join('; '));
      return;
    }
    setChangePwdLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setChangePwdMessage('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setChangePwdError(err.message || 'Something went wrong');
    } finally {
      setChangePwdLoading(false);
    }
  }

  async function openSetup2FA() {
    setTwoFAError('');
    setTwoFACode('');
    setTwoFALoading(true);
    try {
      const data = await twoFactorSetup();
      setTwoFAQrUri(data.qrUri);
      setTwoFASecret(data.secret);
      setTwoFAStep('setup');
      setShow2FAModal(true);
    } catch (err) {
      setTwoFAError(err.message || 'Failed to start 2FA setup');
    } finally {
      setTwoFALoading(false);
    }
  }

  async function handleEnable2FA(e) {
    e.preventDefault();
    if (!twoFACode.trim()) { setTwoFAError('Enter the 6-digit code from your authenticator app.'); return; }
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      await twoFactorEnable(twoFACode.trim());
      await refreshUser();
      setShow2FAModal(false);
      setTwoFACode('');
    } catch (err) {
      setTwoFAError(err.message || 'Invalid code');
    } finally {
      setTwoFALoading(false);
    }
  }

  async function openDisable2FA() {
    setTwoFAError('');
    setTwoFACode('');
    setTwoFAStep('disable');
    setShow2FAModal(true);
  }

  async function handleDisable2FA(e) {
    e.preventDefault();
    if (!twoFACode.trim()) { setTwoFAError('Enter the 6-digit code from your authenticator app.'); return; }
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      await twoFactorDisable(twoFACode.trim());
      await refreshUser();
      setShow2FAModal(false);
      setTwoFACode('');
    } catch (err) {
      setTwoFAError(err.message || 'Invalid code');
    } finally {
      setTwoFALoading(false);
    }
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <div className="settings-group">
        <h3 className="settings-group-title">Security</h3>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon"><Icon.Key /></span>
              <div>
                <span className="settings-label">Password</span>
                <span className="settings-hint">Update your account password</span>
              </div>
            </div>
            <button
              type="button"
              className="settings-action"
              onClick={() => {
                setShowChangePassword((v) => !v);
                setChangePwdError('');
                setChangePwdMessage('');
              }}
            >
              {showChangePassword ? 'Cancel' : 'Change'}
            </button>
          </div>

          {showChangePassword && (
            <form className="settings-cp-form" onSubmit={handleChangePassword}>
              <div className="settings-cp-field">
                <label htmlFor="settings-old-password">Current password</label>
                <input
                  id="settings-old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Current password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="settings-cp-field">
                <label htmlFor="settings-new-password">New password</label>
                <input
                  id="settings-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                  required
                />
                <span className="settings-cp-hint">{PASSWORD_HINT}</span>
                <ul className="password-checklist">
                  {getPasswordRuleStatus(newPassword).map((rule) => (
                    <li
                      key={rule.id}
                      className={rule.passed ? 'password-checklist-item passed' : 'password-checklist-item pending'}
                    >
                      <span className="password-checklist-dot" />
                      <span>{rule.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {changePwdError && <p className="settings-cp-error">{changePwdError}</p>}
              {changePwdMessage && <p className="settings-cp-message">{changePwdMessage}</p>}
              <button type="submit" className="settings-cp-submit" disabled={changePwdLoading}>
                {changePwdLoading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}

          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon"><Icon.Phone /></span>
              <div>
                <span className="settings-label">Two-Factor Authentication</span>
                <span className="settings-hint">Add an extra layer of security to your account</span>
              </div>
            </div>
            {user?.twoFactorEnabled ? (
              <button
                type="button"
                className="settings-action settings-action-danger"
                onClick={openDisable2FA}
                disabled={twoFALoading}
              >
                Disable
              </button>
            ) : (
              <button
                type="button"
                className="settings-action"
                onClick={openSetup2FA}
                disabled={twoFALoading}
              >
                {twoFALoading ? 'Loading…' : 'Set up'}
              </button>
            )}
          </div>
          {twoFAError && !show2FAModal && (
            <p className="settings-cp-error" style={{ margin: '0 18px 14px' }}>{twoFAError}</p>
          )}

          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon"><Icon.Lock /></span>
              <div>
                <span className="settings-label">Active Sessions</span>
                <span className="settings-hint">View and manage devices signed in to your account</span>
              </div>
            </div>
            <span className="settings-badge">1 device</span>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h3 className="settings-group-title">Identity</h3>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon"><Icon.IdCard /></span>
              <div>
                <span className="settings-label">Identity Verification</span>
                <span className="settings-hint">Manage your verified identity documents</span>
              </div>
            </div>
            <button type="button" className="settings-action">Manage</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon"><Icon.Award /></span>
              <div>
                <span className="settings-label">Group Affiliations</span>
                <span className="settings-hint">Military, student, first responder, and more</span>
              </div>
            </div>
            <button type="button" className="settings-action">Verify</button>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h3 className="settings-group-title">Privacy & Notifications</h3>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon"><Icon.Bell /></span>
              <div>
                <span className="settings-label">Notifications</span>
                <span className="settings-hint">Email alerts for sign-ins and security events</span>
              </div>
            </div>
            <span className="settings-badge on">On</span>
          </div>

          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon"><Icon.Eye /></span>
              <div>
                <span className="settings-label">Data Privacy</span>
                <span className="settings-hint">Control what information connected services can see</span>
              </div>
            </div>
            <button type="button" className="settings-action">Manage</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon"><Icon.Link /></span>
              <div>
                <span className="settings-label">Connected Services</span>
                <span className="settings-hint">Manage services linked to your Digital ID</span>
              </div>
            </div>
            <span className="settings-badge">0 services</span>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h3 className="settings-group-title">Danger Zone</h3>
        <div className="settings-card settings-card-danger">
          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon"><Icon.AlertTriangle /></span>
              <div>
                <span className="settings-label">Delete Account</span>
                <span className="settings-hint">Permanently remove your Digital ID and all associated data</span>
              </div>
            </div>
            <button
              type="button"
              className="settings-action settings-action-danger"
              onClick={() => { setShowDeleteModal(true); setDeleteError(''); setDeletePassword(''); }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="settings-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="settings-modal-title">Delete Account</h3>
            <p className="settings-modal-body">
              This will permanently delete your Digital ID and all associated data — documents, credentials, and connections. This cannot be undone.
            </p>
            <form onSubmit={handleDeleteAccount}>
              <div className="settings-cp-field">
                <label htmlFor="delete-password">Enter your password to confirm</label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {deleteError && <p className="settings-cp-error">{deleteError}</p>}
              <div className="settings-modal-actions">
                <button
                  type="submit"
                  className="settings-modal-confirm-danger"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting…' : 'Delete my account'}
                </button>
                <button
                  type="button"
                  className="settings-action"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {show2FAModal && (
        <div className="settings-modal-backdrop" onClick={() => { setShow2FAModal(false); setTwoFAError(''); setTwoFACode(''); }}>
          <div className="settings-modal settings-modal-2fa" onClick={(e) => e.stopPropagation()}>
            {twoFAStep === 'setup' && (
              <>
                <h3 className="settings-modal-title-neutral">Set Up Two-Factor Authentication</h3>
                <p className="settings-modal-body">
                  Scan the QR code below with your authenticator app (e.g. Google Authenticator, Authy), then enter the 6-digit code to confirm.
                </p>
                <div className="twofa-qr-block">
                  <p className="twofa-qr-label">Scan with your app:</p>
                  <a
                    className="twofa-qr-link"
                    href={twoFAQrUri}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in authenticator app
                  </a>
                  <p className="twofa-manual-label">Or enter this code manually:</p>
                  <code className="twofa-secret">{twoFASecret}</code>
                </div>
                <form onSubmit={handleEnable2FA}>
                  <div className="settings-cp-field">
                    <label htmlFor="twofa-code">Authenticator code</label>
                    <input
                      id="twofa-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>
                  {twoFAError && <p className="settings-cp-error">{twoFAError}</p>}
                  <div className="settings-modal-actions">
                    <button type="submit" className="settings-cp-submit" disabled={twoFALoading}>
                      {twoFALoading ? 'Verifying…' : 'Enable 2FA'}
                    </button>
                    <button
                      type="button"
                      className="settings-action"
                      onClick={() => { setShow2FAModal(false); setTwoFAError(''); setTwoFACode(''); }}
                      disabled={twoFALoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {twoFAStep === 'disable' && (
              <>
                <h3 className="settings-modal-title">Disable Two-Factor Authentication</h3>
                <p className="settings-modal-body">
                  Enter the current 6-digit code from your authenticator app to disable 2FA.
                </p>
                <form onSubmit={handleDisable2FA}>
                  <div className="settings-cp-field">
                    <label htmlFor="twofa-disable-code">Authenticator code</label>
                    <input
                      id="twofa-disable-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>
                  {twoFAError && <p className="settings-cp-error">{twoFAError}</p>}
                  <div className="settings-modal-actions">
                    <button type="submit" className="settings-modal-confirm-danger" disabled={twoFALoading}>
                      {twoFALoading ? 'Disabling…' : 'Disable 2FA'}
                    </button>
                    <button
                      type="button"
                      className="settings-action"
                      onClick={() => { setShow2FAModal(false); setTwoFAError(''); setTwoFACode(''); }}
                      disabled={twoFALoading}
                    >
                      Cancel
                    </button>
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
