import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ROLE_HOME = {
  admin:    '/admin/dashboard',
  staff:    '/staff/dashboard',
  customer: '/dashboard',
};

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={ROLE_HOME[user?.role] || '/login'} replace />;
  }
  return <Outlet />;
};

export default RoleRoute;