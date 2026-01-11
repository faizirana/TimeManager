"use client";

import { useTeamStats } from "@/lib/hooks/useTeamStats";
import { TeamStatsSkeleton } from "@/components/UI/StatsSkeleton";

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

interface TeamStatsProps {
  teamId: number;
  startDate?: string;
  endDate?: string;
}

export default function TeamStats({ teamId, startDate, endDate }: TeamStatsProps) {
  const { teamStats, loading, error } = useTeamStats({
    teamId,
    startDate,
    endDate,
  });

  if (loading) {
    return <TeamStatsSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <p className="text-red-900 dark:text-red-100">{error}</p>
      </div>
    );
  }

  if (!teamStats) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-900 dark:text-white">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 p-6 rounded-lg border border-green-200 dark:border-green-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {teamStats.team.name}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Manager: {teamStats.team.manager.name} {teamStats.team.manager.surname} (
          {teamStats.team.manager.email})
        </p>
      </div>

      {/* Aggregated stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Membres de l'équipe"
          value={teamStats.aggregated.totalMembers}
          subtitle="Nombre total de membres"
        />
        <StatsCard
          title="Heures totales"
          value={`${teamStats.aggregated.totalHours.toFixed(1)}h`}
          subtitle="Somme des heures de l'équipe"
        />
        <StatsCard
          title="Jours travaillés (moyenne)"
          value={teamStats.aggregated.averageDaysWorked.toFixed(1)}
          subtitle="Moyenne de jours par membre"
        />
        <StatsCard
          title="Moyenne par jour (équipe)"
          value={`${teamStats.aggregated.averageHoursPerDay.toFixed(1)}h`}
          subtitle="Moyenne des moyennes"
        />
      </div>

      {/* Individual member stats */}
      {teamStats.statistics && teamStats.statistics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-green-50 dark:bg-green-900 border-b border-green-200 dark:border-green-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Statistiques par membre</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Heures totales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Jours travaillés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Moyenne/jour
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {teamStats.statistics.map((memberStat) => (
                  <tr key={memberStat.user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {memberStat.user.name} {memberStat.user.surname}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {memberStat.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      {memberStat.totalHours.toFixed(1)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {memberStat.totalDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {memberStat.averageHoursPerDay.toFixed(1)}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No members message */}
      {teamStats.statistics.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
          <p className="text-yellow-900 dark:text-yellow-100">
            Aucun membre dans cette équipe ou aucune donnée disponible
          </p>
        </div>
      )}
    </div>
  );
}
