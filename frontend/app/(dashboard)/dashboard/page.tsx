"use client";

import { useState, useEffect } from "react";
import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import { useDashboardTeams } from "@/lib/hooks/useDashboardTeams";
import TimeRecordingStats from "@/components/timeRecording/TimeRecordingStats";
import TeamStats from "@/components/team/TeamStats";
import { Skeleton } from "@/components/UI/Skeleton";
import { TeamStatsSkeleton } from "@/components/UI/StatsSkeleton";

export default function DashboardPage() {
  const { user, loading } = useProtectedRoute();
  const { userTeams, managedTeams, loadingUserTeams, loadingManagedTeams } = useDashboardTeams({
    userId: user?.id,
    userRole: user?.role,
  });

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Auto-select first managed team when data loads
  useEffect(() => {
    if (managedTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(managedTeams[0].id);
    }
  }, [managedTeams, selectedTeamId]);

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
          <TeamStatsSkeleton />
        </div>
      </div>
    );
  }

  // Will redirect to login if not authenticated
  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
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
          {user.role === "manager" && managedTeams.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
              Manager de {managedTeams.length} {managedTeams.length > 1 ? "équipes" : "équipe"}
            </span>
          )}
        </div>
      </div>

      {/* Personal stats - Always displayed */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Statistiques personnelles
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Vos heures de travail enregistrées via le système de pointage
        </p>

        {/* Display user's team(s) */}
        {loadingUserTeams ? (
          <Skeleton className="h-6 w-48 mb-4" />
        ) : userTeams.length > 0 ? (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-gray-900 dark:text-white font-medium">
              {user.name} {user.surname || ""} -
            </span>
            {userTeams.length === 1 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
                Équipe : {userTeams[0].name}
              </span>
            ) : (
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                Membre de {userTeams.length} équipes
              </span>
            )}
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
            {user.name} {user.surname || ""} - Aucune équipe
          </p>
        )}

        <TimeRecordingStats />
      </div>

      {/* Team stats for managers only */}
      {user.role === "manager" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Statistiques de mon équipe
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Statistiques agrégées de tous les membres de votre équipe
            </p>

            {loadingManagedTeams ? (
              <Skeleton className="h-6 w-48" />
            ) : managedTeams.length > 0 ? (
              <p className="text-gray-700 dark:text-gray-300">
                {managedTeams.length === 1
                  ? `Équipe : ${managedTeams[0].name}`
                  : `${managedTeams.length} équipes dont vous êtes manager`}
              </p>
            ) : null}
          </div>

          {/* Team selector */}
          {managedTeams.length > 1 && !loadingManagedTeams && (
            <div className="mb-4">
              <label
                htmlFor="team-selector"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Sélectionner une équipe
              </label>
              <select
                id="team-selector"
                value={selectedTeamId || ""}
                onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {managedTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loadingManagedTeams ? (
            <TeamStatsSkeleton />
          ) : managedTeams.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
              <p className="text-yellow-900 dark:text-yellow-100">
                Vous n'êtes manager d'aucune équipe
              </p>
            </div>
          ) : selectedTeamId ? (
            <TeamStats teamId={selectedTeamId} />
          ) : null}
        </div>
      )}
    </div>
  );
}
