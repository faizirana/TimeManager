/**
 * @fileoverview useTeamDetails Hook
 * Manages team details fetching including name, manager, and timetable
 */

import { useState, useEffect } from "react";
import { getTeamById } from "@/lib/services/teams/teamsService";
import { getTimetableById } from "@/lib/services/timetable/timetableService";
import { formatShift } from "@/lib/utils/teamTransformers";

interface UseTeamDetailsResult {
  teamName: string;
  teamShift: string;
  managerId: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage team details
 * @param teamId - The ID of the team to fetch
 * @returns Team details with loading and error states
 */
export function useTeamDetails(teamId: number): UseTeamDetailsResult {
  const [teamName, setTeamName] = useState<string>("");
  const [teamShift, setTeamShift] = useState<string>("No shift assigned");
  const [managerId, setManagerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const teamData = await getTeamById(teamId);
      setTeamName(teamData.name);
      setManagerId(teamData.id_manager);

      // Fetch timetable for team shift
      if (teamData.id_timetable) {
        try {
          const timetable = await getTimetableById(teamData.id_timetable);
          setTeamShift(formatShift(timetable.Shift_start, timetable.Shift_end));
        } catch (_e) {
          setTeamShift("Shift unavailable");
        }
      } else {
        setTeamShift("No shift assigned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
    }
  }, [teamId]);

  return {
    teamName,
    teamShift,
    managerId,
    loading,
    error,
    refetch: fetchTeamDetails,
  };
}
