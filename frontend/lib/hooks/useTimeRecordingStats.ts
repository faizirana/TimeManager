/**
 * useTimeRecordingStats Hook
 *
 * Manages time recording statistics with loading and error states.
 */

import { useState, useEffect } from "react";
import { getTimeRecordingStats } from "@/lib/services/timeRecording/timeRecordingService";
import { UserStatistics } from "@/lib/types/timeRecording";

interface UseTimeRecordingStatsParams {
  userId?: number;
  startDate?: string;
  endDate?: string;
}

interface UseTimeRecordingStatsReturn {
  stats: UserStatistics[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage time recording statistics
 *
 * @param params - Filter parameters for statistics
 * @returns Statistics data with loading and error states
 */
export function useTimeRecordingStats({
  userId,
  startDate,
  endDate,
}: UseTimeRecordingStatsParams = {}): UseTimeRecordingStatsReturn {
  const [stats, setStats] = useState<UserStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTimeRecordingStats({
        id_user: userId,
        start_date: startDate,
        end_date: endDate,
      });

      setStats(response.statistics);
    } catch (_err) {
      setError("Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId, startDate, endDate]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
