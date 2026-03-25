import { useState } from 'react';

export default function PasswordConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onClose }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handle() {
    if (!password) { setError('Password is required'); return; }
    setBusy(true);
    setError('');
    try {
      await onConfirm(password);
    } catch (e) {
      setError(e.message || 'Incorrect password');
      setBusy(false);
    }
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <p className="admin-modal-title">{title}</p>
        {message && <p className="admin-modal-body">{message}</p>}
        <div style={{ marginBottom: 12 }}>
          <label className="admin-label">Your admin password</label>
          <input
            type="password"
            className="admin-input"
            style={{ width: '100%' }}
            placeholder="Enter your password to confirm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            autoFocus
          />
        </div>
        {error && <div className="admin-error" style={{ marginBottom: 10 }}>{error}</div>}
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn btn-danger" onClick={handle} disabled={busy || !password}>
            {busy ? 'Verifying…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
