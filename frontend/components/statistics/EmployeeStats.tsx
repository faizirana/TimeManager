"use client";

import { useEmployeeStats } from "@/lib/hooks/useEmployeeStats";
import HoursLineChart from "./charts/HoursLineChart";
import PunctualityGauge from "./charts/PunctualityGauge";

interface EmployeeStatsProps {
  userId: number;
  userName: string;
}

export default function EmployeeStats({ userId, userName }: EmployeeStatsProps) {
  // Get last 30 days
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, loading, error } = useEmployeeStats(userId, startDate, endDate);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">❌ Erreur : {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Aucune donnée disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Mes Statistiques</h2>
        <p className="text-green-100">{userName}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-green-100 text-sm">Total heures</p>
            <p className="text-2xl font-bold">{data.totalHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Moyenne/jour</p>
            <p className="text-2xl font-bold">{data.averageHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Ponctualité</p>
            <p className="text-2xl font-bold">{data.punctualityRate.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.hoursTimeline && data.hoursTimeline.length > 0 ? (
          <HoursLineChart data={data.hoursTimeline} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Heures travaillées (30 derniers jours)
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucune donnée disponible
            </p>
          </div>
        )}

        <PunctualityGauge percentage={data.punctualityRate} />
      </div>
    </div>
  );
}
