import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRole, allowedRoles }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  // User is not logged in
  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    // Remove invalid authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Make sure the stored user contains a valid role
  if (!user || !user.id || !user.role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Support the existing single allowedRole
  // and multiple allowedRoles when needed.
  const hasSingleRolePermission =
    allowedRole && user.role === allowedRole;

  const hasMultipleRolePermission =
    Array.isArray(allowedRoles) &&
    allowedRoles.includes(user.role);

  const requiresRoleCheck =
    allowedRole || Array.isArray(allowedRoles);

  // User has logged in, but does not have permission
  if (
    requiresRoleCheck &&
    !hasSingleRolePermission &&
    !hasMultipleRolePermission
  ) {
    if (user.role === "customer") {
      return <Navigate to="/customer/dashboard" replace />;
    }

    if (user.role === "provider") {
      return <Navigate to="/provider/dashboard" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    // Unknown role
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;