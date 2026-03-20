import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import AuthIllustration from '../../components/auth/AuthIllustration';
import PublicNav from '../../components/layout/PublicNav';
import '../../styles/auth.css';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // 'email' | 'sent'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  async function handleSendLink(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setStep('sent');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendMsg('');
    setResendLoading(true);
    try {
      await forgotPassword(email.trim());
      setResendMsg('Reset link resent. Check your inbox.');
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
          <h1 className="auth-heading">Reset your password</h1>

          {step === 'email' && (
            <>
              <p className="auth-welcome">
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </p>
              <form className="auth-form" onSubmit={handleSendLink}>
                <div className="auth-input-group">
                  <div className="auth-field">
                    <label htmlFor="fp-email">Email address</label>
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <div className="auth-buttons">
                  <button className="auth-btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                  <button type="button" className="auth-btn-outline" onClick={() => navigate('/login')}>
                    Back to sign in
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'sent' && (
            <>
              <p className="auth-welcome">
                If an account with <strong>{email}</strong> exists, a password reset
                link has been sent. Click the link in your email to set a new password.
              </p>
              <div className="auth-verify-box" style={{ marginTop: '2rem' }}>
                <p className="auth-verify-hint">
                  Didn't receive it? Check your spam folder, or:
                </p>
                <button
                  type="button"
                  className="auth-btn-outline"
                  onClick={handleResend}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending…' : 'Resend reset link'}
                </button>
                {resendMsg && <p className="auth-message" style={{ marginTop: '0.5rem' }}>{resendMsg}</p>}
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

        <div className="auth-right">
          <AuthIllustration />
        </div>
      </div>
    </div>
  );
}
