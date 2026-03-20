import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../../api/auth';
import AuthIllustration from '../../components/auth/AuthIllustration';
import PublicNav from '../../components/layout/PublicNav';
import '../../styles/auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error | no-token
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }
    verifyEmail(token)
      .then((data) => {
        setMessage(data.message || 'Email verified successfully.');
        setStatus('success');
      })
      .catch((err) => {
        setMessage(err.message || 'Verification failed. The link may have expired.');
        setStatus('error');
      });
  }, [token]);

  async function handleResend(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setResendLoading(true);
    setResendMsg('');
    try {
      await resendVerification(email.trim());
      setResendMsg('A new verification link has been sent. Check your inbox.');
    } catch {
      setResendMsg('Could not resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <PublicNav />
      <div className="auth-split">
        <div className="auth-left">

          {status === 'loading' && (
            <>
              <h1 className="auth-heading">Verifying your email…</h1>
              <p className="auth-welcome">Please wait while we confirm your address.</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-2)' }}>
                <div className="auth-spinner" />
                <span>Checking token…</span>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="auth-heading">Email verified!</h1>
              <p className="auth-welcome">{message}</p>
              <div className="auth-buttons" style={{ marginTop: '2rem' }}>
                <button
                  type="button"
                  className="auth-btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
              </div>
            </>
          )}

          {(status === 'error' || status === 'no-token') && (
            <>
              <h1 className="auth-heading">Verification failed</h1>
              <p className="auth-welcome" style={{ color: 'var(--error, #ef4444)' }}>
                {status === 'no-token'
                  ? 'No verification token found. Please use the link from your email.'
                  : message}
              </p>
              <div className="auth-verify-box" style={{ marginTop: '2rem' }}>
                <p className="auth-verify-hint">
                  Request a new verification link:
                </p>
                <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="auth-field">
                    <label htmlFor="ve-email">Email address</label>
                    <input
                      id="ve-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={resendLoading}
                  >
                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                  </button>
                </form>
                {resendMsg && <p className="auth-message">{resendMsg}</p>}
              </div>
              <button
                type="button"
                className="auth-forgot-link"
                style={{ marginTop: '1.5rem' }}
                onClick={() => navigate('/login')}
              >
                Back to sign in
              </button>
            </>
          )}

        </div>
        <div className="auth-right"><AuthIllustration /></div>
      </div>
    </div>
  );
}
