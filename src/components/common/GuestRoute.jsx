import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function GuestRoute({ children }) {
  const { isAuthed, user, initializing } = useAuth();

  if (initializing) return null;

  if (isAuthed) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user?.role === 'INST_ADMIN') return <Navigate to="/inst-admin" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
}
