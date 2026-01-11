/**
 * Admin dashboard page.
 * Displays global admin statistics and protects access to admin users only.
 * Uses a protected route hook and redirects non-admins to the appropriate page.
 *
 * @returns JSX.Element | null
 */
"use client";
import { AdminStats } from "@/components/admin/AdminStats";
import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAdmin } from "@/lib/utils/permissions";

export default function AdminDashboardPage() {
  // Get current user and loading state from the protected route hook
  const { user, loading } = useProtectedRoute();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not admin or not authenticated
    if (!loading && (!user || !isAdmin(user.role))) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [loading, user, router]);

  // Prevent rendering if loading or not authorized
  if (loading || !user || !isAdmin(user.role)) return null;

  // Render admin statistics
  return <AdminStats />;
}
