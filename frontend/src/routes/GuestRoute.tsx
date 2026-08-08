import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DEFAULT_SIGNED_IN_PATH } from './paths';

export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={DEFAULT_SIGNED_IN_PATH} replace />;
  }

  return <Outlet />;
}
