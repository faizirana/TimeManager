"use client";

/**
 * Protected Route Hook
 *
 * Provides client-side route protection by checking authentication status
 * and redirecting unauthenticated users to the login page.
 *
 * This replaces server-side middleware authentication since access tokens
 * are stored in memory and not accessible to server-side code.
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { user, loading } = useProtectedRoute();
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (!user) return null; // Will redirect to login
 *
 *   return <DashboardContent user={user} />;
 * }
 * ```
 */

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to protect routes from unauthenticated access
 * Automatically redirects to /login if user is not authenticated
 * @returns User and loading state
 */
export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading completes to avoid race conditions
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  return { user, loading };
}
