/**
 * @fileoverview useTeams Hook
 * Manages teams list with CRUD operations
 * Errors are handled by apiClient with intelligent logging/notifications
 */

import { useState, useEffect, useCallback } from "react";
import {
  getTeams,
  createTeam,
  updateTeam,
  addTeamMember,
  getTeamById,
  deleteTeam,
} from "@/lib/services/teams/teamsService";
import { getTimetableById } from "@/lib/services/timetable/timetableService";
import { formatShift } from "@/lib/utils/teamTransformers";
import { TeamDisplay } from "@/lib/types/teams";

interface UseTeamsResult {
  teams: TeamDisplay[];
  loading: boolean;
  error: string | null;
  createNewTeam: (teamData: {
    name: string;
    id_manager: number;
    id_timetable: number;
    memberIds: number[];
  }) => Promise<void>;
  updateExistingTeam: (
    teamId: number,
    teamData: {
      name: string;
      id_timetable: number;
    },
  ) => Promise<void>;
  deleteTeamById: (teamId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage teams list with CRUD operations
 * @param userId - Optional user ID. If provided, fetches teams for that user. If undefined, fetches all teams.
 * @returns Teams array with CRUD operations (create, update, delete) and state
 */
export function useTeams(userId?: number): UseTeamsResult {
  const [teams, setTeams] = useState<TeamDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const teamsData = await getTeams({ id_user: userId });

      // Transform API data to display format
      const displayTeams: TeamDisplay[] = await Promise.all(
        teamsData.map(async (team) => {
          let shift = "No shift assigned";

          // Fetch timetable if team has one
          if (team.id_timetable) {
            try {
              const timetable = await getTimetableById(team.id_timetable);
              shift = formatShift(timetable.Shift_start, timetable.Shift_end);
            } catch (_e) {
              shift = "Shift unavailable";
            }
          }

          return {
            id: team.id,
            name: team.name,
            shift,
            members: team.members?.length ?? 0,
            managerName: team.manager
              ? `${team.manager.name} ${team.manager.surname}`
              : "Non assigné",
          };
        }),
      );

      setTeams(displayTeams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  /**
   * Create a new team with members
   */
  const createNewTeam = async (teamData: {
    name: string;
    id_manager: number;
    id_timetable: number;
    memberIds: number[];
  }): Promise<void> => {
    try {
      const { memberIds, ...teamInfo } = teamData;

      // Create team
      const newTeam = await createTeam(teamInfo);

      // Add manager as member
      await addTeamMember(newTeam.id, teamData.id_manager);

      // Add other members
      if (memberIds.length > 0) {
        await Promise.all(memberIds.map((memberId) => addTeamMember(newTeam.id, memberId)));
      }

      // Refresh teams list
      await fetchTeams();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create team";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Update an existing team
   */
  const updateExistingTeam = async (
    teamId: number,
    teamData: {
      name: string;
      id_timetable: number;
    },
  ): Promise<void> => {
    try {
      await updateTeam(teamId, teamData);

      // Update local state optimistically
      const updatedTeam = await getTeamById(teamId);
      let shift = "No shift assigned";

      if (updatedTeam.id_timetable) {
        try {
          const timetable = await getTimetableById(updatedTeam.id_timetable);
          shift = formatShift(timetable.Shift_start, timetable.Shift_end);
        } catch (_e) {
          shift = "Shift unavailable";
        }
      }

      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId ? { ...team, name: updatedTeam.name, shift } : team,
        ),
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update team";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Delete a team by ID
   */
  const deleteTeamById = async (teamId: number): Promise<void> => {
    try {
      await deleteTeam(teamId);
      await fetchTeams();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete team";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    teams,
    loading,
    error,
    createNewTeam,
    updateExistingTeam,
    deleteTeamById,
    refetch: fetchTeams,
  };
}
