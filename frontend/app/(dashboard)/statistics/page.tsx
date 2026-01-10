"use client";

import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import EmployeeStats from "@/components/statistics/EmployeeStats";
import ManagerStats from "@/components/statistics/ManagerStats";

export default function StatisticsPage() {
  const { user, loading } = useProtectedRoute();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Statistiques</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analyse de vos performances et activités
        </p>
      </div>

      {/* Employee stats - always visible */}
      <EmployeeStats userId={user.id} userName={`${user.name} ${user.surname}`} />

      {/* Manager stats - only for managers */}
      {user.role === "manager" && <ManagerStats userId={user.id} />}
    </div>
  );
}
