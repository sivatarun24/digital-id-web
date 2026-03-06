import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../api/auth';
import AuthIllustration from '../../components/auth/AuthIllustration';
import PublicNav from '../../components/layout/PublicNav';
import { validatePassword, getPasswordRuleStatus } from '../../utils/passwordValidation';
import './ForgotPassword.css';

const CODE_LENGTH = 8;

export default function ForgotPassword() {
  const navigate = useNavigate();

  // 'email' | 'code' | 'reset' | 'success'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const codeRefs = useRef([]);

  async function handleSendCode(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setStep('code');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(index, value) {
    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-Z0-9]$/.test(char)) return;

    const next = [...code];
    next[index] = char;
    setCode(next);
    setError('');

    if (char && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index, e) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, CODE_LENGTH);
    if (!pasted) return;

    const next = [...code];
    for (let i = 0; i < CODE_LENGTH; i++) {
      next[i] = pasted[i] || '';
    }
    setCode(next);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    codeRefs.current[focusIndex]?.focus();
  }

  function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    const token = code.join('');
    if (token.length < CODE_LENGTH) {
      setError(`Please enter the full ${CODE_LENGTH}-digit code.`);
      return;
    }
    setStep('reset');
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');

    const pwdCheck = validatePassword(newPassword);
    if (!pwdCheck.valid) {
      setError(pwdCheck.errors.join('. '));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const token = code.join('');
      await resetPassword({ token, newPassword });
      setStep('success');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function renderStepIndicator() {
    const steps = [
      { key: 'email', label: 'Email' },
      { key: 'code', label: 'Verify' },
      { key: 'reset', label: 'Reset' },
    ];
    const currentIndex = steps.findIndex((s) => s.key === step);

    return (
      <div className="fp-steps">
        {steps.map((s, i) => (
          <div
            key={s.key}
            className={
              'fp-step' +
              (i < currentIndex ? ' completed' : '') +
              (i === currentIndex ? ' active' : '')
            }
          >
            <div className="fp-step-circle">
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span className="fp-step-label">{s.label}</span>
            {i < steps.length - 1 && <div className="fp-step-line" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="auth-page">
      <PublicNav />

      <div className="auth-split">
        <div className="auth-left">
          <h1 className="auth-heading">Reset Your Password</h1>

          {step !== 'success' && renderStepIndicator()}

          {step === 'email' && (
            <>
              <p className="auth-welcome">
                Enter the email address associated with your account and we'll
                send you an 8-digit code to reset your password.
              </p>
              <form className="auth-form" onSubmit={handleSendCode}>
                <div className="auth-input-group">
                  <div className="auth-field">
                    <label htmlFor="fp-email">Email Address</label>
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
                  <button
                    className="auth-btn-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Sending…' : 'Send Reset Code'}
                  </button>
                  <button
                    type="button"
                    className="auth-btn-outline"
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'code' && (
            <>
              <p className="auth-welcome">
                We've sent an 8-digit code to <strong>{email}</strong>.
                Enter it below to continue.
              </p>
              <form className="auth-form" onSubmit={handleVerifyCode}>
                <div className="fp-code-inputs" onPaste={handleCodePaste}>
                  {code.map((char, i) => (
                    <input
                      key={i}
                      ref={(el) => (codeRefs.current[i] = el)}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      className="fp-code-box"
                      value={char}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                {error && <p className="auth-error">{error}</p>}

                <div className="fp-code-actions">
                  <button
                    type="button"
                    className="fp-resend"
                    onClick={async () => {
                      setError('');
                      setLoading(true);
                      try {
                        await forgotPassword(email.trim());
                        setCode(Array(CODE_LENGTH).fill(''));
                        codeRefs.current[0]?.focus();
                      } catch (err) {
                        setError(err.message || 'Could not resend code.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Resending…' : 'Resend Code'}
                  </button>
                </div>

                <div className="auth-buttons">
                  <button
                    className="auth-btn-primary"
                    type="submit"
                    disabled={code.join('').length < CODE_LENGTH}
                  >
                    Verify Code
                  </button>
                  <button
                    type="button"
                    className="auth-btn-outline"
                    onClick={() => { setStep('email'); setError(''); }}
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <p className="auth-welcome">
                Code verified. Set your new password below.
              </p>
              <form className="auth-form" onSubmit={handleResetPassword}>
                <div className="auth-input-group">
                  <div className="auth-field">
                    <label htmlFor="fp-new-password">New Password</label>
                    <div className="auth-password-wrap">
                      <input
                        id="fp-new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <ul className="password-checklist">
                      {getPasswordRuleStatus(newPassword).map((rule) => (
                        <li
                          key={rule.id}
                          className={
                            rule.passed
                              ? 'password-checklist-item passed'
                              : 'password-checklist-item pending'
                          }
                        >
                          <span className="password-checklist-dot" />
                          <span>{rule.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="fp-confirm-password">Confirm Password</label>
                    <div className="auth-password-wrap">
                      <input
                        id="fp-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <div className="auth-buttons">
                  <button
                    className="auth-btn-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Resetting…' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="fp-success">
              <div className="fp-success-icon">✓</div>
              <h2>Password Reset Successful</h2>
              <p>
                Your password has been updated. You can now log in with your
                new password.
              </p>
              <div className="auth-buttons">
                <button
                  className="auth-btn-primary"
                  type="button"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="auth-right">
          <AuthIllustration />
        </div>
      </div>
    </div>
  );
}
