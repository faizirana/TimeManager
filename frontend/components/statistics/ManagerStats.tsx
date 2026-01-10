"use client";

import { useState, useEffect } from "react";
import { useManagerStats } from "@/lib/hooks/useManagerStats";
import { getTeams } from "@/lib/services/teams/teamService";
import TeamStackedBar from "./charts/TeamStackedBar";
import PresenceHeatmap from "./charts/PresenceHeatmap";
import { Team } from "@/lib/types/teams";

interface ManagerStatsProps {
  userId: number;
}

export default function ManagerStats({ userId }: ManagerStatsProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  // Get manager's teams
  useEffect(() => {
    const fetchManagerTeams = async () => {
      try {
        setTeamsLoading(true);
        const managerTeams = await getTeams({ id_manager: userId });
        setTeams(managerTeams);
      } catch (error) {
        console.error("Error fetching manager teams:", error);
      } finally {
        setTeamsLoading(false);
      }
    };
    fetchManagerTeams();
  }, [userId]);

  // Initialize with first team when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Get last 30 days
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, loading, error } = useManagerStats(userId, selectedTeamId, startDate, endDate);

  if (teamsLoading || loading) {
    return (
      <div className="space-y-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">❌ Erreur : {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-8">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Aucune donnée d'équipe disponible pour le moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Header with team selector */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Statistiques d'Équipe</h2>

          {teams && teams.length > 1 && (
            <select
              value={selectedTeamId || "all"}
              onChange={(e) =>
                setSelectedTeamId(e.target.value === "all" ? undefined : Number(e.target.value))
              }
              className="bg-white/20 border border-white/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all">Toutes les équipes</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Total heures équipe</p>
            <p className="text-2xl font-bold">{data.totalTeamHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Moyenne/membre</p>
            <p className="text-2xl font-bold">{data.averageTeamHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Ponctualité équipe</p>
            <p className="text-2xl font-bold">{data.teamPunctualityRate.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.teamMembers && data.teamMembers.length > 0 ? (
          <TeamStackedBar data={data.teamMembers} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Heures travaillées par membre
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucune donnée disponible
            </p>
          </div>
        )}

        {data.presenceCalendar && data.presenceCalendar.length > 0 ? (
          <PresenceHeatmap data={data.presenceCalendar} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Présence de l'équipe (4 dernières semaines)
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucune donnée disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
