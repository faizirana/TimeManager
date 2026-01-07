"use client";

import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";

export default function DashboardPage() {
  const { user, loading } = useProtectedRoute();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Will redirect to login if not authenticated
  if (!user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Hello World</h1>
    </div>
  );
}
