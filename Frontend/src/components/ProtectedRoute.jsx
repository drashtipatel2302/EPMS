import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Maps backend role values → frontend route prefix
const ROLE_TO_ROUTE = {
  'SUPER_ADMIN': 'admin',
  'ADMIN':       'admin',
  'admin':       'admin',
  'MANAGER':     'manager',
  'manager':     'manager',
  'EMPLOYEE':    'employee',
  'employee':    'employee',
  'HR':          'hr',
  'hr':          'hr',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, ready } = useAuth();
  if (!ready) return null;
  if (!token || !user) return <Navigate to="/login" replace />;

  // Normalize the user's role to a route prefix (e.g. "SUPER_ADMIN" → "admin")
  const routePrefix = ROLE_TO_ROUTE[user.role] || (user.role || '').toLowerCase();

  // allowedRoles uses route prefixes: ['admin'], ['manager'], etc.
  if (allowedRoles && !allowedRoles.includes(routePrefix)) {
    return <Navigate to={`/${routePrefix}/dashboard`} replace />;
  }

  return children;
}
