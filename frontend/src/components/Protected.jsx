import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';

export function Protected({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function AdminOnly({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}