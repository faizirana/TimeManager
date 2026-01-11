/**
 * AdminStats component.
 * Displays global statistics for admin users: total users, teams, and timetables.
 * Fetches data using the useAdminStats hook and shows errors as toast notifications.
 *
 * @returns JSX.Element
 */
import React from "react";
import { useAdminStats } from "@/lib/hooks/useAdminStats";
import Toast from "@/components/UI/Toast";

export function AdminStats() {
  // Fetch admin statistics (users, teams, timetables) and loading/error state
  const { users, teams, timetables, loading, error } = useAdminStats();
  return (
    <div className="space-y-6 p-8">
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-6">Admin dashboard</h1>
      {/* Show error as a toast notification if present */}
      {error && <Toast message={error} type="error" duration={4000} />}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users stat card */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <div className="text-2xl font-semibold">Users</div>
          <div className="text-4xl font-bold mt-2">{loading ? "..." : users}</div>
        </div>
        {/* Teams stat card */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <div className="text-2xl font-semibold">Teams</div>
          <div className="text-4xl font-bold mt-2">{loading ? "..." : teams}</div>
        </div>
        {/* Timetables stat card */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <div className="text-2xl font-semibold">Timetables</div>
          <div className="text-4xl font-bold mt-2">{loading ? "..." : timetables}</div>
        </div>
      </div>
    </div>
  );
}
