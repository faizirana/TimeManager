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
