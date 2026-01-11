/**
 * useTeamStats Hook
 *
 * Manages team statistics with loading and error states.
 */

import { useState, useEffect } from "react";
import { getTeamStats } from "@/lib/services/teams/teamsService";
import { TeamStatsResponse } from "@/lib/types/teams";

interface UseTeamStatsParams {
  teamId: number;
  startDate?: string;
  endDate?: string;
}

interface UseTeamStatsReturn {
  teamStats: TeamStatsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage team statistics
 *
 * @param params - Team ID and optional date filters
 * @returns Team statistics with loading and error states
 */
export function useTeamStats({
  teamId,
  startDate,
  endDate,
}: UseTeamStatsParams): UseTeamStatsReturn {
  const [teamStats, setTeamStats] = useState<TeamStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTeamStats(teamId, {
        start_date: startDate,
        end_date: endDate,
      });

      setTeamStats(response);
    } catch (_err) {
      setError("Impossible de charger les statistiques de l'équipe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamStats();
  }, [teamId, startDate, endDate]);

  return {
    teamStats,
    loading,
    error,
    refetch: fetchTeamStats,
  };
}
