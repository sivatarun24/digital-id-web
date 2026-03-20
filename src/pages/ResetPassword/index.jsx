import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import { validatePassword, getPasswordRuleStatus } from '../../utils/passwordValidation';
import AuthIllustration from '../../components/auth/AuthIllustration';
import PublicNav from '../../components/layout/PublicNav';
import '../../styles/auth.css';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <PublicNav />
        <div className="auth-split">
          <div className="auth-left">
            <h1 className="auth-heading">Invalid link</h1>
            <p className="auth-welcome" style={{ color: 'var(--error, #ef4444)' }}>
              This password reset link is missing or invalid. Please request a new one.
            </p>
            <div className="auth-buttons" style={{ marginTop: '2rem' }}>
              <button type="button" className="auth-btn-primary" onClick={() => navigate('/forgot-password')}>
                Request new link
              </button>
            </div>
          </div>
          <div className="auth-right"><AuthIllustration /></div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <PublicNav />
        <div className="auth-split">
          <div className="auth-left">
            <h1 className="auth-heading">Password reset!</h1>
            <p className="auth-welcome">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <div className="auth-buttons" style={{ marginTop: '2rem' }}>
              <button type="button" className="auth-btn-primary" onClick={() => navigate('/login')}>
                Sign in
              </button>
            </div>
          </div>
          <div className="auth-right"><AuthIllustration /></div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const check = validatePassword(newPassword);
    if (!check.valid) {
      setError(check.errors.join('. '));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <PublicNav />
      <div className="auth-split">
        <div className="auth-left">
          <h1 className="auth-heading">Set new password</h1>
          <p className="auth-welcome">Enter a strong new password for your account.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <div className="auth-field">
                <label htmlFor="rp-new">New password</label>
                <div className="auth-password-wrap">
                  <input
                    id="rp-new"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <ul className="password-checklist">
                  {getPasswordRuleStatus(newPassword).map((rule) => (
                    <li key={rule.id} className={rule.passed ? 'password-checklist-item passed' : 'password-checklist-item pending'}>
                      <span className="password-checklist-dot" />
                      <span>{rule.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="auth-field">
                <label htmlFor="rp-confirm">Confirm password</label>
                <div className="auth-password-wrap">
                  <input
                    id="rp-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowConfirm((v) => !v)}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-buttons">
              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
              <button type="button" className="auth-btn-outline" onClick={() => navigate('/login')}>
                Back to sign in
              </button>
            </div>
          </form>
        </div>
        <div className="auth-right"><AuthIllustration /></div>
      </div>
    </div>
  );
}
