import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import GuestRoute from '../components/common/GuestRoute';
import AuthScreen from '../components/auth/AuthScreen';

const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Solutions = lazy(() => import('../pages/Solutions'));
const Verify = lazy(() => import('../pages/Verify'));
const About = lazy(() => import('../pages/About'));
const Help = lazy(() => import('../pages/Help'));

const Home = lazy(() => import('../pages/Home'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const VerifyIdentity = lazy(() => import('../pages/VerifyIdentity'));
const Credentials = lazy(() => import('../pages/Credentials'));
const ConnectedServices = lazy(() => import('../pages/ConnectedServices'));
const Activity = lazy(() => import('../pages/Activity'));
const Documents = lazy(() => import('../pages/Documents'));
const Wallet = lazy(() => import('../pages/Wallet'));
const Notifications = lazy(() => import('../pages/Notifications'));

function LazyPage({ children }) {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem', color: '#999' }}>
          Loading…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function NotFound() {
  return (
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
  );
}

export default function AppRoutes() {
  const { isAuthed, initializing } = useAuth();

  if (initializing) return null;

  return (
    <Routes>
      {/* --- Guest-only routes --- */}
      <Route path="/login" element={<GuestRoute><AuthScreen /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AuthScreen /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><LazyPage><ForgotPassword /></LazyPage></GuestRoute>} />

      {/* --- Public routes --- */}
      <Route path="/solutions" element={<LazyPage><Solutions /></LazyPage>} />
      <Route path="/verify" element={<LazyPage><Verify /></LazyPage>} />
      <Route path="/about" element={<LazyPage><About /></LazyPage>} />
      <Route path="/help" element={<LazyPage><Help /></LazyPage>} />

      {/* --- Protected routes --- */}
      <Route path="/home" element={<ProtectedRoute><LazyPage><Home /></LazyPage></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><LazyPage><Profile /></LazyPage></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><LazyPage><Settings /></LazyPage></ProtectedRoute>} />
      <Route path="/verify-identity" element={<ProtectedRoute><LazyPage><VerifyIdentity /></LazyPage></ProtectedRoute>} />
      <Route path="/credentials" element={<ProtectedRoute><LazyPage><Credentials /></LazyPage></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute><LazyPage><ConnectedServices /></LazyPage></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><LazyPage><Activity /></LazyPage></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><LazyPage><Documents /></LazyPage></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><LazyPage><Wallet /></LazyPage></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><LazyPage><Notifications /></LazyPage></ProtectedRoute>} />

      {/* --- Redirects & fallback --- */}
      <Route path="/" element={<Navigate to={isAuthed ? '/home' : '/login'} replace />} />
      <Route
        path="*"
        element={
          isAuthed ? (
            <ProtectedRoute><NotFound /></ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
