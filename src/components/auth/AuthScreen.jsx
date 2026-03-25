import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useFieldAvailability } from '../../hooks/useAvailability';
import { validatePassword, getPasswordRuleStatus } from '../../utils/passwordValidation';
import { resendVerification } from '../../api/auth';
import AuthIllustration from './AuthIllustration';
import LegalModal from './LegalModal';
import PublicNav from '../layout/PublicNav';
import '../../styles/auth.css';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/** Inline availability badge shown below username / email / phone fields */
function AvailabilityBadge({ status }) {
  if (!status || status === null) return null;
  if (status === 'checking') {
    return (
      <span className="avail-badge avail-checking">
        <span className="auth-spinner-xs" />
        Checking…
      </span>
    );
  }
  if (status === 'available') {
    return <span className="avail-badge avail-ok">✓ Available</span>;
  }
  if (status === 'taken') {
    return <span className="avail-badge avail-taken">✗ Already taken</span>;
  }
  return <span className="avail-badge avail-error">Could not check availability</span>;
}

export default function AuthScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const redirectAfterLogin = location.state?.from;

  const isRegisterPath = location.pathname === '/register';
  const [mode, setMode] = useState(isRegisterPath ? 'register' : 'login');

  // Login fields
  const [identifier, setIdentifier] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneno, setPhoneno] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  // Shared
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'terms' | 'privacy' | null

  const isRegistering = mode === 'register';
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // Availability hooks — now return { status, checkNow }
  const { status: usernameStatus, checkNow: checkUsername } = useFieldAvailability('username', username, isRegistering);
  const { status: emailStatus, checkNow: checkEmail } = useFieldAvailability('email', email, isRegistering);
  const { status: phoneStatus, checkNow: checkPhone } = useFieldAvailability('phoneno', phoneno, isRegistering);

  // Password checklist — only show rules that haven't been met yet
  const passwordRules = getPasswordRuleStatus(password);
  const unmetRules = passwordRules.filter((r) => !r.passed);
  const allPasswordRulesMet = unmetRules.length === 0 && password.length > 0;

  function resetFeedback() {
    setError('');
    setMessage('');
  }

  function resetRegisterFields() {
    setName('');
    setUsername('');
    setEmail('');
    setPhoneno('');
    setDateOfBirth('');
    setGender('');
    setPassword('');
    setConfirmPassword('');
    setTermsAccepted(false);
  }

  function switchMode(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    resetFeedback();
    // Clear password + all register fields when switching to prevent pre-fill
    setPassword('');
    setConfirmPassword('');
    setIdentifier('');
    if (nextMode === 'register') resetRegisterFields();
    navigate(nextMode === 'login' ? '/login' : '/register', { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetFeedback();
    setLoading(true);

    try {
      if (mode === 'login') {
        const loggedInUser = await login({ identifier: identifier.trim(), password });
        setMessage('Logged in successfully.');
        if (loggedInUser?.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (loggedInUser?.role === 'INST_ADMIN') {
          navigate('/inst-admin', { replace: true });
        } else {
          navigate(redirectAfterLogin || '/home', { replace: true });
        }
      } else {
        const phoneNum = phoneno.replace(/\D/g, '');
        if (!phoneNum) {
          setError('Please enter a valid phone number.');
          setLoading(false);
          return;
        }

        const pwdCheck = validatePassword(password);
        if (!pwdCheck.valid) {
          setError(`Password does not meet requirements. Please fix the issues shown below.`);
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter your confirm password.');
          setLoading(false);
          return;
        }

        if (!termsAccepted) {
          setError('You must accept the Terms of Service and Privacy Policy to continue.');
          setLoading(false);
          return;
        }

        if (usernameStatus === 'taken') {
          setError('That username is already taken. Please choose a different one.');
          setLoading(false);
          return;
        }
        if (emailStatus === 'taken') {
          setError('An account with that email already exists.');
          setLoading(false);
          return;
        }
        if (phoneStatus === 'taken') {
          setError('An account with that phone number already exists.');
          setLoading(false);
          return;
        }

        await register({
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          phoneNo: Number(phoneNum),
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          password,
          role: 'USER',
          termsAccepted: true,
        });
        setRegisteredEmail(email.trim());
        setMode('verify-email');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setResendMsg('');
    try {
      await resendVerification(registeredEmail);
      setResendMsg('Verification email resent. Please check your inbox.');
    } catch {
      setResendMsg('Could not resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  }

  if (mode === 'verify-email') {
    return (
      <div className="auth-page">
        <PublicNav />
        <div className="auth-split">
          <div className="auth-left">
            <h1 className="auth-heading">Check your email</h1>
            <p className="auth-welcome">
              We sent a verification link to <strong>{registeredEmail}</strong>.
              Click the link in that email to activate your account.
            </p>
            <div className="auth-verify-box">
              <p className="auth-verify-hint">Didn't receive it? Check your spam folder, or:</p>
              <button
                type="button"
                className="auth-btn-outline"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending…' : 'Resend verification email'}
              </button>
              {resendMsg && <p className="auth-message" style={{ marginTop: '0.75rem' }}>{resendMsg}</p>}
            </div>
            <button
              type="button"
              className="auth-forgot-link"
              style={{ marginTop: '1.5rem' }}
              onClick={() => switchMode('login')}
            >
              Back to sign in
            </button>
          </div>
          <div className="auth-right"><AuthIllustration /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <PublicNav />

      {/* Legal modals */}
      {activeLegalModal && (
        <LegalModal type={activeLegalModal} onClose={() => setActiveLegalModal(null)} />
      )}

      <div className="auth-split">
        <div className="auth-left">
          <h1 className="auth-heading">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="auth-welcome">
            {mode === 'login'
              ? 'Sign in to access your verified digital identity.'
              : 'Secure, verified identity for government and commercial services.'}
          </p>

          {mode === 'login' ? (
            <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
              <div className="auth-input-group">
                <div className="auth-field">
                  <label htmlFor="identifier">Username, email, or phone</label>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your identifier"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="password">Password</label>
                  <div className="auth-password-wrap">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="auth-options">
                <label className="auth-remember">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>

              {error && <p className="auth-error">{error}</p>}
              {message && !error && <p className="auth-message">{message}</p>}

              <div className="auth-buttons">
                <button className="auth-btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
                <button type="button" className="auth-btn-outline" onClick={() => switchMode('register')}>
                  Create account
                </button>
              </div>

              <div className="auth-social">
                <span>Or continue with</span>
                <a href="#">Google</a>
                <a href="#">Apple</a>
                <a href="#">GitHub</a>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
              <div className="auth-input-group">

                {/* Username */}
                <div className="auth-field">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={checkUsername}
                    placeholder="johndoe"
                    autoComplete="off"
                    required
                  />
                  <AvailabilityBadge status={usernameStatus} />
                </div>

                {/* Full name */}
                <div className="auth-field">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    autoComplete="off"
                    required
                  />
                </div>

                {/* Email */}
                <div className="auth-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={checkEmail}
                    placeholder="you@example.com"
                    autoComplete="off"
                    required
                  />
                  <AvailabilityBadge status={emailStatus} />
                </div>

                {/* Phone */}
                <div className="auth-field">
                  <label htmlFor="phoneno">Phone number</label>
                  <input
                    id="phoneno"
                    type="tel"
                    value={phoneno}
                    onChange={(e) => setPhoneno(e.target.value)}
                    onBlur={checkPhone}
                    placeholder="9876543210"
                    autoComplete="off"
                    required
                  />
                  <AvailabilityBadge status={phoneStatus} />
                </div>

                {/* Date of birth */}
                <div className="auth-field">
                  <label htmlFor="dateOfBirth">Date of birth</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                {/* Gender */}
                <div className="auth-field">
                  <label htmlFor="gender">Gender <span className="auth-field-optional">(optional)</span></label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="auth-select"
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label htmlFor="reg-password">Password</label>
                  <div className="auth-password-wrap">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {/* Only show checklist when password is non-empty and not all rules met */}
                  {password.length > 0 && !allPasswordRulesMet && (
                    <ul className="password-checklist">
                      {unmetRules.map((rule) => (
                        <li key={rule.id} className="password-checklist-item">
                          <span className="password-checklist-dot" />
                          <span>{rule.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Confirm password */}
                <div className="auth-field">
                  <label htmlFor="confirm-password">Confirm password</label>
                  <div className="auth-password-wrap">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {/* Inline match feedback */}
                  {confirmPassword.length > 0 && (
                    password === confirmPassword
                      ? <span className="avail-badge avail-ok">✓ Passwords match</span>
                      : <span className="avail-badge avail-taken">✗ Passwords do not match</span>
                  )}
                </div>

              </div>

              {/* Terms */}
              <label className="auth-terms-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
                <span>
                  I agree to the{' '}
                  <button
                    type="button"
                    className="auth-terms-link"
                    onClick={() => setActiveLegalModal('terms')}
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    className="auth-terms-link"
                    onClick={() => setActiveLegalModal('privacy')}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>

              {error && <p className="auth-error">{error}</p>}
              {message && !error && <p className="auth-message">{message}</p>}

              <div className="auth-buttons">
                <button className="auth-btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
                <button type="button" className="auth-btn-outline" onClick={() => switchMode('login')}>
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="auth-right">
          <AuthIllustration />
        </div>
      </div>
    </div>
  );
}
