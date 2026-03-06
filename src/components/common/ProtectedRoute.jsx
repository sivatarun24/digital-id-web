import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Layout from '../layout/Layout';

export default function ProtectedRoute({ children }) {
  const { isAuthed, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return null;

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Layout>{children}</Layout>;
}
