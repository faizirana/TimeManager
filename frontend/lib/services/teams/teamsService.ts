/**
 * Team Service
 *
 * Centralized service for all team-related API operations.
 * Handles team CRUD operations, member management, and statistics.
 */

import { apiClient } from "@/lib/utils/apiClient";
import { Team, TeamStatsResponse } from "@/lib/types/teams";

// ==================== QUERY OPERATIONS ====================

/**
 * Get all teams with optional filters
 *
 * @param filters - Optional filters
 * @param filters.id_user - Filter teams where user is a member
 * @param filters.id_manager - Filter teams where user is the manager
 * @returns Promise with array of teams
 *
 * @example
 * ```ts
 * // Get all teams
 * const teams = await getTeams();
 *
 * // Get teams for a specific user (as member)
 * const userTeams = await getTeams({ id_user: 2 });
 *
 * // Get teams managed by a specific manager
 * const managedTeams = await getTeams({ id_manager: 3 });
 * ```
 */
export async function getTeams(filters?: {
  id_user?: number;
  id_manager?: number;
}): Promise<Team[]> {
  const params = new URLSearchParams();

  if (filters?.id_user) {
    params.append("id_user", filters.id_user.toString());
  }

  if (filters?.id_manager) {
    params.append("id_manager", filters.id_manager.toString());
  }

  const url = `/teams${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<Team[]>(url);
}

/**
 * Get a specific team by ID
 *
 * @param id - Team ID
 * @returns Promise with team details including manager and all members
 *
 * @example
 * ```ts
 * const team = await getTeamById(1);
 * console.log(`Team: ${team.name}`);
 * console.log(`Manager: ${team.manager.name} ${team.manager.surname}`);
 * ```
 */
export async function getTeamById(id: number): Promise<Team> {
  return apiClient.get<Team>(`/teams/${id}`);
}

/**
 * Get statistics for a specific team
 *
 * @param teamId - Team ID
 * @param filters - Optional date filters
 * @param filters.start_date - Start date for statistics period (ISO string)
 * @param filters.end_date - End date for statistics period (ISO string)
 * @returns Promise with team statistics including aggregated metrics
 *
 * @example
 * ```ts
 * // Get current stats for a team
 * const stats = await getTeamStats(1);
 *
 * // Get stats for a specific period
 * const weekStats = await getTeamStats(1, {
 *   start_date: '2026-01-01T00:00:00.000Z',
 *   end_date: '2026-01-07T23:59:59.999Z'
 * });
 * ```
 */
export async function getTeamStats(
  teamId: number,
  filters?: {
    start_date?: string;
    end_date?: string;
  },
): Promise<TeamStatsResponse> {
  const params = new URLSearchParams();

  if (filters?.start_date) {
    params.append("start_date", filters.start_date);
  }

  if (filters?.end_date) {
    params.append("end_date", filters.end_date);
  }

  const url = `/teams/${teamId}/stats${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<TeamStatsResponse>(url);
}

// ==================== MUTATION OPERATIONS ====================

/**
 * Create a new team
 *
 * @param data - Team data
 * @param data.name - Team name
 * @param data.id_manager - Manager user ID (must have "manager" role)
 * @param data.id_timetable - Optional timetable ID
 * @returns Promise with created team
 *
 * @example
 * ```ts
 * const newTeam = await createTeam({
 *   name: "Team Alpha",
 *   id_manager: 5,
 *   id_timetable: 1
 * });
 * ```
 */
export async function createTeam(data: {
  name: string;
  id_manager: number;
  id_timetable?: number;
}): Promise<Team> {
  return apiClient.post<Team>("/teams", data);
}

/**
 * Update an existing team
 *
 * @param id - Team ID
 * @param data - Partial team data to update
 * @returns Promise with updated team
 *
 * @example
 * ```ts
 * const updatedTeam = await updateTeam(1, {
 *   name: "Team Alpha - Updated",
 *   id_timetable: 2
 * });
 * ```
 */
export async function updateTeam(
  id: number,
  data: Partial<{
    name: string;
    id_manager: number;
    id_timetable: number;
  }>,
): Promise<Team> {
  return apiClient.put<Team>(`/teams/${id}`, data);
}

/**
 * Delete a team
 *
 * @param id - Team ID
 * @returns Promise with success message
 *
 * @example
 * ```ts
 * await deleteTeam(1);
 * ```
 */
export async function deleteTeam(id: number): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/teams/${id}`);
}

// ==================== MEMBER MANAGEMENT ====================

/**
 * Add a user to a team
 *
 * @param teamId - Team ID
 * @param userId - User ID to add
 * @returns Promise with success message
 *
 * @example
 * ```ts
 * await addTeamMember(1, 5);
 * console.log("User added to team");
 * ```
 */
export async function addTeamMember(teamId: number, userId: number): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/teams/${teamId}/users`, {
    id_user: userId,
  });
}

/**
 * Remove a user from a team
 *
 * @param teamId - Team ID
 * @param userId - User ID to remove
 * @returns Promise with success message
 *
 * @example
 * ```ts
 * await removeTeamMember(1, 5);
 * console.log("User removed from team");
 * ```
 */
export async function removeTeamMember(
  teamId: number,
  userId: number,
): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/teams/${teamId}/users/${userId}`);
}
