/**
 * AdminStats component.
 * Displays comprehensive statistics for admin users including:
 * - Basic counts (users, teams, timetables)
 * - Role distribution
 * - Today's activity
 * - Team health metrics
 * - Manager utilization
 *
 * @returns JSX.Element
 */
import React from "react";
import { useAdminStats } from "@/lib/hooks/useAdminStats";
import Toast from "@/components/UI/Toast";
import { Users, UsersRound, Calendar, Clock, UserCheck, AlertTriangle } from "lucide-react";

export function AdminStats() {
  const {
    totalUsers,
    totalTeams,
    totalTimetables,
    roles,
    todayRecordings,
    currentlyPresent,
    teamsWithoutTimetable,
    avgTeamSize,
    activeManagers,
    inactiveManagers,
    loading,
    error,
  } = useAdminStats();

  return (
    <div className="space-y-8 p-8">
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Show error as a toast notification if present */}
      {error && <Toast message={error} type="error" duration={4000} />}

      {/* Basic Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Vue d'ensemble
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Users stat card */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-500" size={24} />
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Utilisateurs
              </div>
            </div>
            <div className="text-4xl font-bold">{loading ? "..." : totalUsers}</div>
          </div>

          {/* Teams stat card */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <UsersRound className="text-green-500" size={24} />
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Équipes</div>
            </div>
            <div className="text-4xl font-bold">{loading ? "..." : totalTeams}</div>
          </div>

          {/* Timetables stat card */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-purple-500" size={24} />
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Horaires</div>
            </div>
            <div className="text-4xl font-bold">{loading ? "..." : totalTimetables}</div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Répartition des rôles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Managers
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {loading ? "..." : roles.managers}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Employés
            </div>
            <div className="text-3xl font-bold text-green-600">
              {loading ? "..." : roles.employees}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Admins</div>
            <div className="text-3xl font-bold text-purple-600">
              {loading ? "..." : roles.admins}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Today */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Activité du jour
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-orange-500" size={24} />
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Enregistrements aujourd'hui
              </div>
            </div>
            <div className="text-4xl font-bold">{loading ? "..." : todayRecordings}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Arrivées et départs enregistrés
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="text-green-500" size={24} />
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Employés présents
              </div>
            </div>
            <div className="text-4xl font-bold">{loading ? "..." : currentlyPresent}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Actuellement au travail
            </div>
          </div>
        </div>
      </div>

      {/* Team Health & Managers */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Santé des équipes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Taille moyenne
            </div>
            <div className="text-3xl font-bold">{loading ? "..." : avgTeamSize}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">membres par équipe</div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="text-amber-500" size={18} />
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sans horaire
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-600">
              {loading ? "..." : teamsWithoutTimetable}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">équipes</div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Managers actifs
            </div>
            <div className="text-3xl font-bold text-green-600">
              {loading ? "..." : activeManagers}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">avec équipe</div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Managers inactifs
            </div>
            <div className="text-3xl font-bold text-gray-600">
              {loading ? "..." : inactiveManagers}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">sans équipe</div>
          </div>
        </div>
      </div>
    </div>
  );
}
