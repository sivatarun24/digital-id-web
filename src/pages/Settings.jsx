import { useState } from 'react';
import './Settings.css';
import { changePassword } from '../api/auth';
import { validateChangePassword, PASSWORD_HINT, getPasswordRuleStatus } from '../utils/passwordValidation';

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

      <div className="settings-card">
        <div className="settings-item">
          <span className="settings-label">Notifications</span>
          <span className="settings-hint">Email and in-app notifications</span>
        </div>
        <div className="settings-item">
          <span className="settings-label">Privacy</span>
          <span className="settings-hint">Profile visibility and data</span>
        </div>
        <div className="settings-item">
          <span className="settings-label">Security</span>
          <span className="settings-hint">Password and two-factor auth</span>
          <button
            type="button"
            className="settings-action"
            onClick={() => {
              setShowChangePassword((v) => !v);
              setChangePwdError('');
              setChangePwdMessage('');
            }}
          >
            {showChangePassword ? 'Hide' : 'Change password'}
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
      </div>
    </div>
  );
}
