import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function GuestRoute({ children }) {
  const { isAuthed, initializing } = useAuth();

  if (initializing) return null;

  if (isAuthed) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
