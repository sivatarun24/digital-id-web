import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import GuestRoute from '../components/common/GuestRoute';
import AdminRoute from '../components/common/AdminRoute';
import InstAdminRoute from '../components/common/InstAdminRoute';
import AuthScreen from '../components/auth/AuthScreen';

const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const Solutions = lazy(() => import('../pages/Solutions'));
const Verify = lazy(() => import('../pages/Verify'));
const About = lazy(() => import('../pages/About'));
const Help = lazy(() => import('../pages/Help'));

const Home = lazy(() => import('../pages/Home'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Verification = lazy(() => import('../pages/Verification'));
const Credentials = lazy(() => import('../pages/Credentials'));
const ConnectedServices = lazy(() => import('../pages/ConnectedServices'));
const Activity = lazy(() => import('../pages/Activity'));
const Wallet = lazy(() => import('../pages/Wallet'));
const Notifications = lazy(() => import('../pages/Notifications'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/Admin/Users/AdminUsers'));
const AdminUserDetail = lazy(() => import('../pages/Admin/UserDetail/AdminUserDetail'));
const AdminVerifications = lazy(() => import('../pages/Admin/Verifications/AdminVerifications'));
const AdminDocuments = lazy(() => import('../pages/Admin/Documents/AdminDocuments'));
const AdminInstitutions = lazy(() => import('../pages/Admin/Institutions/AdminInstitutions'));
const AdminInstitutionDetail = lazy(() => import('../pages/Admin/InstitutionDetail/AdminInstitutionDetail'));

// Institutional Admin pages
const InstAdminDashboard = lazy(() => import('../pages/InstAdmin/Dashboard/InstAdminDashboard'));
const InstAdminUsers = lazy(() => import('../pages/InstAdmin/Users/InstAdminUsers'));
const InstAdminUserDetail = lazy(() => import('../pages/InstAdmin/UserDetail/InstAdminUserDetail'));
const InstAdminVerifications = lazy(() => import('../pages/InstAdmin/Verifications/InstAdminVerifications'));
const InstAdminDocuments = lazy(() => import('../pages/InstAdmin/Documents/InstAdminDocuments'));

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

function RootRedirect() {
  const { isAuthed, user } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'INST_ADMIN') return <Navigate to="/inst-admin" replace />;
  return <Navigate to="/home" replace />;
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
      <Route path="/verify-email" element={<LazyPage><VerifyEmail /></LazyPage>} />
      <Route path="/reset-password" element={<LazyPage><ResetPassword /></LazyPage>} />
      <Route path="/solutions" element={<LazyPage><Solutions /></LazyPage>} />
      <Route path="/verify" element={<LazyPage><Verify /></LazyPage>} />
      <Route path="/about" element={<LazyPage><About /></LazyPage>} />
      <Route path="/help" element={<LazyPage><Help /></LazyPage>} />

      {/* --- Protected user routes --- */}
      <Route path="/home" element={<ProtectedRoute><LazyPage><Home /></LazyPage></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><LazyPage><Profile /></LazyPage></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><LazyPage><Settings /></LazyPage></ProtectedRoute>} />
      <Route path="/verification" element={<ProtectedRoute><LazyPage><Verification /></LazyPage></ProtectedRoute>} />
      <Route path="/verify-identity" element={<Navigate to="/verification" replace />} />
      <Route path="/documents" element={<Navigate to="/verification" replace />} />
      <Route path="/credentials" element={<ProtectedRoute><LazyPage><Credentials /></LazyPage></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute><LazyPage><ConnectedServices /></LazyPage></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><LazyPage><Activity /></LazyPage></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><LazyPage><Wallet /></LazyPage></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><LazyPage><Notifications /></LazyPage></ProtectedRoute>} />

      {/* --- Super Admin routes --- */}
      <Route path="/admin" element={<AdminRoute><LazyPage><AdminDashboard /></LazyPage></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><LazyPage><AdminUsers /></LazyPage></AdminRoute>} />
      <Route path="/admin/users/:id" element={<AdminRoute><LazyPage><AdminUserDetail /></LazyPage></AdminRoute>} />
      <Route path="/admin/verifications" element={<AdminRoute><LazyPage><AdminVerifications /></LazyPage></AdminRoute>} />
      <Route path="/admin/documents" element={<AdminRoute><LazyPage><AdminDocuments /></LazyPage></AdminRoute>} />
      <Route path="/admin/institutions" element={<AdminRoute><LazyPage><AdminInstitutions /></LazyPage></AdminRoute>} />
      <Route path="/admin/institutions/:id" element={<AdminRoute><LazyPage><AdminInstitutionDetail /></LazyPage></AdminRoute>} />

      {/* --- Institutional Admin routes --- */}
      <Route path="/inst-admin" element={<InstAdminRoute><LazyPage><InstAdminDashboard /></LazyPage></InstAdminRoute>} />
      <Route path="/inst-admin/users" element={<InstAdminRoute><LazyPage><InstAdminUsers /></LazyPage></InstAdminRoute>} />
      <Route path="/inst-admin/users/:id" element={<InstAdminRoute><LazyPage><InstAdminUserDetail /></LazyPage></InstAdminRoute>} />
      <Route path="/inst-admin/verifications" element={<InstAdminRoute><LazyPage><InstAdminVerifications /></LazyPage></InstAdminRoute>} />
      <Route path="/inst-admin/documents" element={<InstAdminRoute><LazyPage><InstAdminDocuments /></LazyPage></InstAdminRoute>} />

      {/* --- Redirects & fallback --- */}
      <Route path="/" element={<RootRedirect />} />
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
