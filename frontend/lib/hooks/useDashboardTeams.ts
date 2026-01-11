/**
 * useDashboardTeams Hook
 *
 * Manages teams data for dashboard with filtering by user role.
 * Fetches both user's teams (as member) and managed teams (if manager).
 */

import { useState, useEffect } from "react";
import { getTeams } from "@/lib/services/teams/teamsService";
import { Team } from "@/lib/types/teams";

interface UseDashboardTeamsParams {
  userId?: number;
  userRole?: string;
}

interface UseDashboardTeamsReturn {
  userTeams: Team[];
  managedTeams: Team[];
  loadingUserTeams: boolean;
  loadingManagedTeams: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch teams for dashboard view
 *
 * @param params - User ID and role
 * @returns Teams data separated by membership type
 */
export function useDashboardTeams({
  userId,
  userRole,
}: UseDashboardTeamsParams = {}): UseDashboardTeamsReturn {
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [managedTeams, setManagedTeams] = useState<Team[]>([]);
  const [loadingUserTeams, setLoadingUserTeams] = useState(false);
  const [loadingManagedTeams, setLoadingManagedTeams] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserTeams = async () => {
    if (!userId) return;

    try {
      setLoadingUserTeams(true);
      setError(null);
      const teams = await getTeams({ id_user: userId });
      setUserTeams(teams);
    } catch (_err) {
      setError("Impossible de charger vos équipes");
    } finally {
      setLoadingUserTeams(false);
    }
  };

  const fetchManagedTeams = async () => {
    if (!userId || userRole !== "manager") return;

    try {
      setLoadingManagedTeams(true);
      setError(null);
      const teams = await getTeams({ id_manager: userId });
      setManagedTeams(teams);
    } catch (_err) {
      setError("Impossible de charger les équipes gérées");
    } finally {
      setLoadingManagedTeams(false);
    }
  };

  useEffect(() => {
    fetchUserTeams();
  }, [userId]);

  useEffect(() => {
    fetchManagedTeams();
  }, [userId, userRole]);

  const refetch = async () => {
    await Promise.all([fetchUserTeams(), fetchManagedTeams()]);
  };

  return {
    userTeams,
    managedTeams,
    loadingUserTeams,
    loadingManagedTeams,
    error,
    refetch,
  };
}
