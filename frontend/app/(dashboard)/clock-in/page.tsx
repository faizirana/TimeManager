"use client";

import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { Skeleton } from "@/components/UI/Skeleton";
import { useTimeRecordings } from "@/lib/hooks/useTimeRecordings";

export default function ClockInPage() {
  const { user, loading } = useProtectedRoute();
  const {
    timeRecordings,
    loading: timeRecordingsLoading,
    error: TimeRecordingsError,
  } = useTimeRecordings();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>

        {/* Skeleton for personal stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>

        {/* Skeleton for manager section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    );
  }

  // Will redirect to login if not authenticated
  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pointer</h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-gray-700 dark:text-gray-300">
            Bienvenue, {user.name} {user.surname}
          </p>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user.role === "manager"
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
            }`}
          >
            {user.role === "manager" ? "Manager" : user.role}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Vos heures de travail enregistrées via le système de pointage
        </p>
        {timeRecordings.map((record) => (
          <div
            key={record.id}
            className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
          >
            <span className="text-gray-900 dark:text-white font-medium">{record.id_user}</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {new Date(record.timestamp).toLocaleDateString()}
            </span>
            <div className="flex flex-col text-right">
              <span className="text-gray-700 dark:text-gray-300">{record.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
