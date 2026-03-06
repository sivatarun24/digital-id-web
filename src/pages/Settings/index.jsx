import { useState } from 'react';
import './Settings.css';
import { changePassword } from '../../api/auth';
import { validateChangePassword, PASSWORD_HINT, getPasswordRuleStatus } from '../../utils/passwordValidation';

export default function Settings() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePwdError, setChangePwdError] = useState('');
  const [changePwdMessage, setChangePwdMessage] = useState('');
  const [changePwdLoading, setChangePwdLoading] = useState(false);

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

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <div className="settings-group">
        <h3 className="settings-group-title">Security</h3>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon">🔑</span>
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
              <span className="settings-icon">📱</span>
              <div>
                <span className="settings-label">Two-Factor Authentication</span>
                <span className="settings-hint">Add an extra layer of security to your account</span>
              </div>
            </div>
            <span className="settings-badge off">Off</span>
          </div>

          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon">🔐</span>
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
              <span className="settings-icon">🪪</span>
              <div>
                <span className="settings-label">Identity Verification</span>
                <span className="settings-hint">Manage your verified identity documents</span>
              </div>
            </div>
            <button type="button" className="settings-action">Manage</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon">🎖️</span>
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
              <span className="settings-icon">🔔</span>
              <div>
                <span className="settings-label">Notifications</span>
                <span className="settings-hint">Email alerts for sign-ins and security events</span>
              </div>
            </div>
            <span className="settings-badge on">On</span>
          </div>

          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon">👁️</span>
              <div>
                <span className="settings-label">Data Privacy</span>
                <span className="settings-hint">Control what information connected services can see</span>
              </div>
            </div>
            <button type="button" className="settings-action">Manage</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-header">
              <span className="settings-icon">🔗</span>
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
              <span className="settings-icon">⚠️</span>
              <div>
                <span className="settings-label">Delete Account</span>
                <span className="settings-hint">Permanently remove your Digital ID and all associated data</span>
              </div>
            </div>
            <button type="button" className="settings-action settings-action-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
