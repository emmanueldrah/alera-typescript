import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  // Some auth providers populate `user` asynchronously; while that happens,
  // `isAuthenticated` can temporarily be false even though we still have a token.
  // Checking for token presence prevents dashboard feature routes from bouncing.
  const hasToken = Boolean(localStorage.getItem('access_token'));
  if (!isAuthenticated && !hasToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
