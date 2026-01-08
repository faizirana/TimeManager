/**
 * @fileoverview Teams Service
 *
 * This service handles all team-related API calls using the centralized API client.
 * Provides functions to fetch teams and team details from the backend.
 */

import { apiClient } from "@/lib/utils/apiClient";
import { Team } from "@/lib/types/teams";

/**
 * Fetch all teams
 *
 * @param {number} [id_user] - Optional user ID to filter teams by user membership
 * @returns {Promise<Team[]>} Array of all teams with their managers and members
 * @throws {Error} If the request fails or returns invalid data
 *
 * @example
 * ```typescript
 * try {
 *   const teams = await getTeams();
 *   console.log(`Found ${teams.length} teams`);
 *
 *   // Filter by user
 *   const userTeams = await getTeams(userId);
 * } catch (error) {
 *   console.error("Failed to fetch teams:", error);
 * }
 * ```
 */
export async function getTeams(id_user?: number): Promise<Team[]> {
  const url = id_user ? `/teams?id_user=${id_user}` : "/teams";
  return apiClient.get<Team[]>(url);
}

/**
 * Fetch a specific team by ID
 *
 * @param {number} teamId - The ID of the team to fetch
 * @returns {Promise<Team>} Team details including manager and all members
 * @throws {Error} If the team is not found or request fails
 *
 * @example
 * ```typescript
 * try {
 *   const team = await getTeamById(1);
 *   console.log(`Team: ${team.name}`);
 *   console.log(`Manager: ${team.manager.name} ${team.manager.surname}`);
 *   console.log(`Members: ${team.members.length}`);
 * } catch (error) {
 *   console.error("Team not found:", error);
 * }
 * ```
 */
export async function getTeamById(teamId: number): Promise<Team> {
  return apiClient.get<Team>(`/teams/${teamId}`);
}

/**
 * Create a new team
 *
 * @param {Object} teamData - Team data
 * @param {string} teamData.name - Team name
 * @param {number} teamData.id_manager - Manager user ID (must have "manager" role)
 * @param {number} teamData.id_timetable - Timetable ID (required)
 * @returns {Promise<Team>} Created team details
 * @throws {Error} If creation fails or manager doesn't have manager role
 *
 * @example
 * ```typescript
 * try {
 *   const newTeam = await createTeam({
 *     name: "Team Alpha",
 *     id_manager: 5,
 *     id_timetable: 1
 *   });
 *   console.log(`Team created: ${newTeam.name}`);
 * } catch (error) {
 *   console.error("Failed to create team:", error);
 * }
 * ```
 */
export async function createTeam(teamData: {
  name: string;
  id_manager: number;
  id_timetable: number;
}): Promise<Team> {
  return apiClient.post<Team>("/teams", teamData);
}

/**
 * Update an existing team
 *
 * @param {number} teamId - The ID of the team to update
 * @param {Object} teamData - Team data to update
 * @param {string} [teamData.name] - Team name
 * @param {number} [teamData.id_manager] - Manager user ID
 * @param {number} [teamData.id_timetable] - Timetable ID
 * @returns {Promise<Team>} Updated team details
 * @throws {Error} If update fails or team not found
 *
 * @example
 * ```typescript
 * try {
 *   const updatedTeam = await updateTeam(1, {
 *     name: "Team Alpha - Updated",
 *     id_timetable: 2
 *   });
 *   console.log(`Team updated: ${updatedTeam.name}`);
 * } catch (error) {
 *   console.error("Failed to update team:", error);
 * }
 * ```
 */
export async function updateTeam(
  teamId: number,
  teamData: {
    name?: string;
    id_manager?: number;
    id_timetable?: number;
  },
): Promise<Team> {
  return apiClient.put<Team>(`/teams/${teamId}`, teamData);
}

/**
 * Add a user to a team
 *
 * @param {number} teamId - The ID of the team
 * @param {number} userId - The ID of the user to add
 * @returns {Promise<{ message: string }>} Success message
 * @throws {Error} If user is already in team or request fails
 *
 * @example
 * ```typescript
 * try {
 *   await addTeamMember(1, 5);
 *   console.log("User added to team");
 * } catch (error) {
 *   console.error("Failed to add user to team:", error);
 * }
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
 * @param {number} teamId - The ID of the team
 * @param {number} userId - The ID of the user to remove
 * @returns {Promise<{ message: string }>} Success message
 * @throws {Error} If user is not in team or request fails
 *
 * @example
 * ```typescript
 * try {
 *   await removeTeamMember(1, 5);
 *   console.log("User removed from team");
 * } catch (error) {
 *   console.error("Failed to remove user from team:", error);
 * }
 * ```
 */
export async function removeTeamMember(
  teamId: number,
  userId: number,
): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/teams/${teamId}/users/${userId}`);
}
