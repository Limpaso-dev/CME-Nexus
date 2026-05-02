import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔒 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Role restriction (if specified)
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}