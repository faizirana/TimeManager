/**
 * Custom React hook to fetch and aggregate admin statistics.
 * Returns the total number of users, teams, and timetables for the admin dashboard.
 * Handles loading and error states, and is safe for unmounting during async fetches.
 *
 * @returns {Object} { users, teams, timetables, loading, error }
 */
import { useEffect, useState } from "react";
import { getUsers } from "@/lib/services/users/usersService";
import { getTeams } from "@/lib/services/teams/teamsService";
import { getTimetables } from "@/lib/services/timetable/timetableService";

export function useAdminStats() {
  // State for statistics
  const [stats, setStats] = useState({ users: 0, teams: 0, timetables: 0 });
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Fetch all stats in parallel
    async function fetchStats() {
      setLoading(true);
      setError(null);

      // Fetch each resource independently to handle individual failures
      const [usersResult, teamsResult, timetablesResult] = await Promise.allSettled([
        getUsers(),
        getTeams(),
        getTimetables(),
      ]);

      // Only update state if the component is still mounted
      if (!cancelled) {
        const newStats = {
          users: usersResult.status === "fulfilled" ? usersResult.value.length : 0,
          teams: teamsResult.status === "fulfilled" ? teamsResult.value.length : 0,
          timetables: timetablesResult.status === "fulfilled" ? timetablesResult.value.length : 0,
        };
        setStats(newStats);

        // Set error if any fetch failed
        const hasError = [usersResult, teamsResult, timetablesResult].some(
          (result) => result.status === "rejected",
        );
        if (hasError) {
          setError("Échec du chargement de certaines statistiques.");
        }
      }

      if (!cancelled) setLoading(false);
    }
    fetchStats();
    // Cleanup to avoid state update on unmounted component
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...stats, loading, error };
}
