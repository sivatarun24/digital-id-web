import { useCallback, useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { login, register, fetchMe, checkAvailability, clearSession } from './api/auth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import Solutions from './pages/Solutions';
import Verify from './pages/Verify';
import About from './pages/About';
import Help from './pages/Help';
import VerifyIdentity from './pages/VerifyIdentity';
import Credentials from './pages/Credentials';
import ConnectedServices from './pages/ConnectedServices';
import Activity from './pages/Activity';
import Documents from './pages/Documents';
import Wallet from './pages/Wallet';
import Notifications from './pages/Notifications';
import AuthIllustration from './components/AuthIllustration';
import PublicNav from './components/PublicNav';
import { validatePassword, getPasswordRuleStatus } from './utils/passwordValidation';

const AVAILABILITY_DEBOUNCE_MS = 400;

function AuthScreen({
  mode,
  identifier,
  setIdentifier,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  username,
  setUsername,
  phoneno,
  setPhoneno,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  loading,
  error,
  message,
  handleSubmit,
  switchMode,
}) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
                  <button
                    type="button"
                    className="auth-btn-outline"
                    onClick={() => switchMode('register')}
                  >
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
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="johndoe"
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="name">Full name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="phoneno">Phone number</label>
                    <input
                      id="phoneno"
                      type="tel"
                      value={phoneno}
                      onChange={(e) => setPhoneno(e.target.value)}
                      placeholder="9876543210"
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="dateOfBirth">Date of birth</label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      autoComplete="bday"
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="auth-select"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
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
                </div>

                {error && <p className="auth-error">{error}</p>}
                {message && !error && <p className="auth-message">{message}</p>}

                <div className="auth-buttons">
                  <button className="auth-btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Please wait…' : 'Create account'}
                  </button>
                  <button
                    type="button"
                    className="auth-btn-outline"
                    onClick={() => switchMode('login')}
                  >
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

function App() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState(''); // login: username, email, or phone
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
  const [user, setUser] = useState(null);
  // availability: null | 'checking' | 'available' | 'taken' | 'error'
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [phonenoStatus, setPhonenoStatus] = useState(null);
  const usernameDebounce = useRef(null);
  const emailDebounce = useRef(null);
  const phonenoDebounce = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe().then((data) => setUser(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.pathname === '/login' && mode !== 'login') {
      setMode('login');
    } else if (location.pathname === '/register' && mode !== 'register') {
      setMode('register');
    }
  }, [location.pathname, mode]);

  const checkField = useCallback(async (field, value, setStatus) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) {
      setStatus(null);
      return;
    }
    setStatus('checking');
    try {
      const res = await checkAvailability(field, field === 'phoneno' ? trimmed.replace(/\D/g, '') : trimmed);
      setStatus(res?.available === true ? 'available' : 'taken');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (mode !== 'register') return;
    const run = () => {
      if (username.trim()) checkField('username', username, setUsernameStatus);
      else setUsernameStatus(null);
    };
    usernameDebounce.current = setTimeout(run, AVAILABILITY_DEBOUNCE_MS);
    return () => clearTimeout(usernameDebounce.current);
  }, [mode, username, checkField]);

  useEffect(() => {
    if (mode !== 'register') return;
    const run = () => {
      if (email.trim()) checkField('email', email, setEmailStatus);
      else setEmailStatus(null);
    };
    emailDebounce.current = setTimeout(run, AVAILABILITY_DEBOUNCE_MS);
    return () => clearTimeout(emailDebounce.current);
  }, [mode, email, checkField]);

  useEffect(() => {
    if (mode !== 'register') return;
    const run = () => {
      const digits = phoneno.replace(/\D/g, '');
      if (digits.length >= 10) checkField('phoneno', digits, setPhonenoStatus);
      else setPhonenoStatus(digits.length > 0 ? 'checking' : null);
    };
    phonenoDebounce.current = setTimeout(run, AVAILABILITY_DEBOUNCE_MS);
    return () => clearTimeout(phonenoDebounce.current);
  }, [mode, phoneno, checkField]);

  function resetFeedback() {
    setError('');
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
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
        setMode('login');
      }

      // After successful auth, try to load current user info
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        // If /me fails, keep going – user may still be authenticated
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    resetFeedback();
    navigate(nextMode === 'login' ? '/login' : '/register', { replace: true });
  }

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  const isAuthed = !!user;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthed ? (
            <Navigate to="/home" replace />
          ) : (
            <AuthScreen
              mode={mode}
              identifier={identifier}
              setIdentifier={setIdentifier}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              name={name}
              setName={setName}
              username={username}
              setUsername={setUsername}
              phoneno={phoneno}
              setPhoneno={setPhoneno}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              gender={gender}
              setGender={setGender}
              loading={loading}
              error={error}
              message={message}
              handleSubmit={handleSubmit}
              switchMode={switchMode}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthed ? (
            <Navigate to="/home" replace />
          ) : (
            <AuthScreen
              mode={mode}
              identifier={identifier}
              setIdentifier={setIdentifier}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              name={name}
              setName={setName}
              username={username}
              setUsername={setUsername}
              phoneno={phoneno}
              setPhoneno={setPhoneno}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              gender={gender}
              setGender={setGender}
              loading={loading}
              error={error}
              message={message}
              handleSubmit={handleSubmit}
              switchMode={switchMode}
            />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthed ? (
            <Navigate to="/home" replace />
          ) : (
            <ForgotPassword />
          )
        }
      />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/about" element={<About />} />
      <Route path="/help" element={<Help />} />
      <Route
        path="/home"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <Home user={user} />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: location.pathname }} replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <Profile user={user} />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: '/profile' }} replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <Settings />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: '/settings' }} replace />
          )
        }
      />
      <Route
        path="/verify-identity"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <VerifyIdentity user={user} />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: '/verify-identity' }} replace />
          )
        }
      />
      <Route
        path="/credentials"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <Credentials user={user} />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: '/credentials' }} replace />
          )
        }
      />
      <Route
        path="/services"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <ConnectedServices />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: '/services' }} replace />
          )
        }
      />
      <Route
        path="/activity"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <Activity />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: '/activity' }} replace />
          )
        }
      />
      <Route
        path="/documents"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <Documents user={user} />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: '/documents' }} replace />
          )
        }
      />
      <Route
        path="/wallet"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <Wallet user={user} />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: '/wallet' }} replace />
          )
        }
      />
      <Route
        path="/notifications"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <Notifications />
            </Layout>
          ) : (
            <Navigate to="/login" state={{ from: '/notifications' }} replace />
          )
        }
      />
      <Route
        path="/"
        element={<Navigate to={isAuthed ? '/home' : '/login'} replace />}
      />
      <Route
        path="*"
        element={
          isAuthed ? (
            <Layout user={user} onLogout={handleLogout}>
              <div className="not-found-page">
                <div className="not-found-orb" />
                <h1>Page not found</h1>
                <p className="not-found-text">
                  The page you are looking for does not exist or has been moved.
                </p>
                <button
                  type="button"
                  className="submit-button"
                  onClick={() => (window.location.href = '/home')}
                >
                  Go home
                </button>
              </div>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;