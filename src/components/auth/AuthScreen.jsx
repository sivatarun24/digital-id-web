import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useFieldAvailability } from '../../hooks/useAvailability';
import { validatePassword, getPasswordRuleStatus } from '../../utils/passwordValidation';
import AuthIllustration from './AuthIllustration';
import PublicNav from '../layout/PublicNav';
import '../../styles/auth.css';

export default function AuthScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const isRegisterPath = location.pathname === '/register';
  const [mode, setMode] = useState(isRegisterPath ? 'register' : 'login');

  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneno, setPhoneno] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isRegistering = mode === 'register';

  useFieldAvailability('username', username, isRegistering);
  useFieldAvailability('email', email, isRegistering);
  useFieldAvailability('phoneno', phoneno, isRegistering);

  function resetFeedback() {
    setError('');
    setMessage('');
  }

  function switchMode(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    resetFeedback();
    navigate(nextMode === 'login' ? '/login' : '/register', { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetFeedback();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ identifier: identifier.trim(), password });
        setMessage('Logged in successfully.');
      } else {
        const phoneNum = phoneno.replace(/\D/g, '');
        if (!phoneNum) {
          setError('Please enter a valid phone number.');
          setLoading(false);
          return;
        }
        const pwdCheck = validatePassword(password);
        if (!pwdCheck.valid) {
          setError(`Password: ${pwdCheck.errors.join('; ')}`);
          setLoading(false);
          return;
        }
        await register({
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          phoneNo: Number(phoneNum),
          dateOfBirth: dateOfBirth || null,
          gender,
          password,
          role: 'USER',
        });
        setMessage('Registered successfully. You can now log in.');
        switchMode('login');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <PublicNav />

      <div className="auth-split">
        <div className="auth-left">
          <h1 className="auth-heading">
            Secure Digital Identity
            Verification You Can Trust
          </h1>

          {mode === 'login' ? (
            <>
              <p className="auth-welcome">Welcome back! Sign in to access your verified digital identity.</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-section-label">
                  <span className="auth-section-icon">✦</span> Sign in
                </div>

                <div className="auth-input-group">
                  <div className="auth-field">
                    <label htmlFor="identifier">Username, Email, or Phone</label>
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter username, email, or phone number"
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
                  </div>
                </div>

                <div className="auth-options">
                  <label className="auth-remember">
                    <input type="checkbox" />
                    <span>Remember Me</span>
                  </label>
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && <p className="auth-error">{error}</p>}
                {message && !error && <p className="auth-message">{message}</p>}

                <div className="auth-buttons">
                  <button className="auth-btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Please wait…' : 'Login'}
                  </button>
                  <button type="button" className="auth-btn-outline" onClick={() => switchMode('register')}>
                    Sign Up
                  </button>
                </div>

                <div className="auth-social">
                  <span>Or sign in with</span>
                  <a href="#">Google</a>
                  <a href="#">Apple</a>
                  <a href="#">GitHub</a>
                </div>
              </form>
            </>
          ) : (
            <>
              <p className="auth-welcome">Create your secure digital identity.</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-input-group">
                  <div className="auth-field">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" autoComplete="username" required />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="name">Full name</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" autoComplete="name" required />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="phoneno">Phone number</label>
                    <input id="phoneno" type="tel" value={phoneno} onChange={(e) => setPhoneno(e.target.value)} placeholder="9876543210" autoComplete="tel" required />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="dateOfBirth">Date of birth</label>
                    <input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} autoComplete="bday" />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="gender">Gender</label>
                    <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="auth-select">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
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
                      {getPasswordRuleStatus(password).map((rule) => (
                        <li key={rule.id} className={rule.passed ? 'password-checklist-item passed' : 'password-checklist-item pending'}>
                          <span className="password-checklist-dot" />
                          <span>{rule.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {error && <p className="auth-error">{error}</p>}
                {message && !error && <p className="auth-message">{message}</p>}

                <div className="auth-buttons">
                  <button className="auth-btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Please wait…' : 'Create account'}
                  </button>
                  <button type="button" className="auth-btn-outline" onClick={() => switchMode('login')}>
                    Back to Login
                  </button>
                </div>
              </form>
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
