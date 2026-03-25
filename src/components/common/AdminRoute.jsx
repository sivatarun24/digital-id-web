import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function AdminRoute({ children }) {
  const { user, isAuthed, initializing } = useAuth();
  if (initializing) return null;
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/home" replace />;
  return children;
}
