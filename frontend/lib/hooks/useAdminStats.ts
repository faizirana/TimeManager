/**
 * Custom React hook to fetch and aggregate admin statistics.
 * Returns comprehensive statistics for the admin dashboard including role distribution,
 * activity metrics, team health, and manager status.
 *
 * @returns {Object} { totalUsers, totalTeams, totalTimetables, roles, todayRecordings, currentlyPresent, teamsWithoutTimetable, avgTeamSize, activeManagers, inactiveManagers, loading, error }
 */
import { useEffect, useState } from "react";
import { getAdminStats, AdminStatsResponse } from "@/lib/services/stats/statsService";

export function useAdminStats() {
  // State for statistics
  const [stats, setStats] = useState<AdminStatsResponse>({
    totalUsers: 0,
    totalTeams: 0,
    totalTimetables: 0,
    roles: {
      managers: 0,
      employees: 0,
      admins: 0,
    },
    todayRecordings: 0,
    currentlyPresent: 0,
    teamsWithoutTimetable: 0,
    avgTeamSize: "0",
    activeManagers: 0,
    inactiveManagers: 0,
  });
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminStats();
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Échec du chargement des statistiques.");
          console.error("Error fetching admin stats:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    // Cleanup to avoid state update on unmounted component
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...stats, loading, error };
}
