import { useCallback, useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { login, register, fetchMe, checkAvailability, forgotPassword, resetPassword, clearSession } from './api/auth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { validatePassword, PASSWORD_HINT, getPasswordRuleStatus } from './utils/passwordValidation';

const AVAILABILITY_DEBOUNCE_MS = 400;

function AuthScreen({
  mode,
  setMode,
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
  showForgotPassword,
  setShowForgotPassword,
  forgotEmail,
  setForgotEmail,
  forgotLoading,
  forgotMessage,
  forgotError,
  showResetPassword,
  setShowResetPassword,
  resetToken,
  setResetToken,
  resetNewPassword,
  setResetNewPassword,
  resetLoading,
  resetMessage,
  resetError,
  handleSubmit,
  handleForgotPassword,
  handleResetPassword,
  switchMode,
}) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/auth' || location.pathname === '/login';

  return (
    <div className="auth-app">
      <div className="auth-card">
        <h1>{isLoginPage ? 'Welcome' : 'Authentication'}</h1>
        <p className="auth-subtitle">Sign in or create an account</p>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'auth-toggle-button active' : 'auth-toggle-button'}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-toggle-button active' : 'auth-toggle-button'}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'login' ? (
            <div className="field">
              <label htmlFor="identifier">Username, email, or phone</label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="johndoe / you@example.com / 9876543210"
                autoComplete="username"
                required
              />
            </div>
          ) : (
            <>
              <div className="field">
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
              <div className="field">
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
            </>
          )}

          {mode === 'register' && (
            <div className="field">
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
          )}

          {mode === 'register' && (
            <>
              <div className="field">
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
              <div className="field">
                <label htmlFor="dateOfBirth">Date of birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  autoComplete="bday"
                />
              </div>
              <div className="field">
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
            </>
          )}

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
            {mode === 'register' && (
              <ul className="password-checklist">
                {getPasswordRuleStatus(password).map((rule) => (
                  <li
                    key={rule.id}
                    className={rule.passed ? 'password-checklist-item passed' : 'password-checklist-item pending'}
                  >
                    <span className="password-checklist-dot" />
                    <span>{rule.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="auth-error">{error}</p>}
          {message && !error && <p className="auth-message">{message}</p>}

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>

          {mode === 'login' && (
            <button
              type="button"
              className="auth-link-button"
              onClick={() => {
                setShowForgotPassword((v) => !v);
                setShowResetPassword(false);
                setForgotMessage('');
                setForgotError('');
              }}
            >
              Forgot password?
            </button>
          )}
        </form>

        {mode === 'login' && showForgotPassword && (
          <div className="auth-extra-form">
            <h3 className="auth-extra-title">Forgot password</h3>
            <form onSubmit={handleForgotPassword}>
              <div className="field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {forgotError && <p className="auth-error">{forgotError}</p>}
              {forgotMessage && <p className="auth-message">{forgotMessage}</p>}
              <button className="submit-button" type="submit" disabled={forgotLoading}>
                {forgotLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          className="auth-link-button"
          onClick={() => {
            setShowResetPassword((v) => !v);
            setShowForgotPassword(false);
            setResetMessage('');
            setResetError('');
          }}
        >
          {showResetPassword ? 'Hide reset password' : 'Reset password with token'}
        </button>

        {showResetPassword && (
          <div className="auth-extra-form">
            <h3 className="auth-extra-title">Reset password</h3>
            <p className="auth-subtitle">Enter the token from your email and a new password.</p>
            <form onSubmit={handleResetPassword}>
              <div className="field">
                <label htmlFor="reset-token">Reset token</label>
                <input
                  id="reset-token"
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste token from email"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="reset-new-password">New password</label>
                <input
                  id="reset-new-password"
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                />
                <ul className="password-checklist">
                  {getPasswordRuleStatus(resetNewPassword).map((rule) => (
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
              {resetError && <p className="auth-error">{resetError}</p>}
              {resetMessage && <p className="auth-message">{resetMessage}</p>}
              <button className="submit-button" type="submit" disabled={resetLoading}>
                {resetLoading ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          </div>
        )}

        <p className="auth-hint">
          API base URL:{' '}
          <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}</code>
        </p>
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

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
    setShowForgotPassword(false);
    setShowResetPassword(false);
    setForgotMessage('');
    setForgotError('');
    setResetMessage('');
    setResetError('');
    navigate(nextMode === 'login' ? '/login' : '/register', { replace: true });
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotMessage('If an account exists, you will receive a reset link by email.');
    } catch (err) {
      setForgotError(err.message || 'Something went wrong');
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    const pwdCheck = validatePassword(resetNewPassword);
    if (!pwdCheck.valid) {
      setResetError(`Password: ${pwdCheck.errors.join('; ')}`);
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword({ token: resetToken, newPassword: resetNewPassword });
      setResetMessage('Password reset successfully. You can now log in.');
      setResetToken('');
      setResetNewPassword('');
    } catch (err) {
      setResetError(err.message || 'Something went wrong');
    } finally {
      setResetLoading(false);
    }
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
              setMode={setMode}
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
              showForgotPassword={showForgotPassword}
              setShowForgotPassword={setShowForgotPassword}
              forgotEmail={forgotEmail}
              setForgotEmail={setForgotEmail}
              forgotLoading={forgotLoading}
              forgotMessage={forgotMessage}
              forgotError={forgotError}
              showResetPassword={showResetPassword}
              setShowResetPassword={setShowResetPassword}
              resetToken={resetToken}
              setResetToken={setResetToken}
              resetNewPassword={resetNewPassword}
              setResetNewPassword={setResetNewPassword}
              resetLoading={resetLoading}
              resetMessage={resetMessage}
              resetError={resetError}
              handleSubmit={handleSubmit}
              handleForgotPassword={handleForgotPassword}
              handleResetPassword={handleResetPassword}
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
              setMode={setMode}
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
              showForgotPassword={showForgotPassword}
              setShowForgotPassword={setShowForgotPassword}
              forgotEmail={forgotEmail}
              setForgotEmail={setForgotEmail}
              forgotLoading={forgotLoading}
              forgotMessage={forgotMessage}
              forgotError={forgotError}
              showResetPassword={showResetPassword}
              setShowResetPassword={setShowResetPassword}
              resetToken={resetToken}
              setResetToken={setResetToken}
              resetNewPassword={resetNewPassword}
              setResetNewPassword={setResetNewPassword}
              resetLoading={resetLoading}
              resetMessage={resetMessage}
              resetError={resetError}
              handleSubmit={handleSubmit}
              handleForgotPassword={handleForgotPassword}
              handleResetPassword={handleResetPassword}
              switchMode={switchMode}
            />
          )
        }
      />
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