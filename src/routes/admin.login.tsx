import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/admin-session";

export { clearAdminToken, getAdminToken, setAdminToken };

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginRedirectPage,
});

function AdminLoginRedirectPage() {
  const token = getAdminToken();

  useEffect(() => {
    // If token exists, user is already admin authenticated
    if (token) {
      window.location.href = "/admin";
    } else {
      window.location.href = "/login";
    }
  }, [token]);

  if (token) {
    return <Navigate to="/admin" />;
  }

  return <Navigate to="/login" />;
}
