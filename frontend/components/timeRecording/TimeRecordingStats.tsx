"use client";

import { useTimeRecordingStats } from "@/lib/hooks/useTimeRecordingStats";
import { TimeRecordingStatsSkeleton } from "@/components/UI/StatsSkeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

interface TimeRecordingStatsProps {
  userId?: number;
  startDate?: string;
  endDate?: string;
}

export default function TimeRecordingStats({
  userId,
  startDate,
  endDate,
}: TimeRecordingStatsProps) {
  const { stats, loading, error } = useTimeRecordingStats({
    userId,
    startDate,
    endDate,
  });

  if (loading) {
    return <TimeRecordingStatsSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <p className="text-red-900 dark:text-red-100">{error}</p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-900 dark:text-white">Aucune donnée disponible pour cette période</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats.map((userStat) => (
        <div key={userStat.user.id} className="space-y-4">
          {/* User info */}
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {userStat.user.name} {userStat.user.surname}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">{userStat.user.email}</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Heures totales"
              value={`${userStat.totalHours.toFixed(1)}h`}
              subtitle="Temps de travail total"
            />
            <StatsCard
              title="Jours travaillés"
              value={userStat.totalDays}
              subtitle="Nombre de jours uniques"
            />
            <StatsCard
              title="Moyenne par jour"
              value={`${userStat.averageHoursPerDay.toFixed(1)}h`}
              subtitle="Heures moyennes/jour"
            />
          </div>

          {/* Work sessions table */}
          {userStat.workSessions && userStat.workSessions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-green-50 dark:bg-green-900 border-b border-green-200 dark:border-green-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Sessions de travail</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Arrivée
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Départ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Heures
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {userStat.workSessions.map((session, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(session.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(session.arrival).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(session.departure).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                          {session.hours.toFixed(1)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
