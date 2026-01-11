/**
 * @fileoverview Admin Stats Service
 *
 * This service handles API calls for admin statistics.
 */

import { apiClient } from "@/lib/utils/apiClient";

export interface AdminStatsResponse {
  totalUsers: number;
  totalTeams: number;
  totalTimetables: number;
  roles: {
    managers: number;
    employees: number;
    admins: number;
  };
  todayRecordings: number;
  currentlyPresent: number;
  teamsWithoutTimetable: number;
  avgTeamSize: string;
  activeManagers: number;
  inactiveManagers: number;
}

/**
 * Fetch comprehensive admin statistics
 *
 * @returns {Promise<AdminStatsResponse>} Complete admin statistics
 * @throws {Error} If the request fails or returns invalid data
 */
export async function getAdminStats(): Promise<AdminStatsResponse> {
  return apiClient.get<AdminStatsResponse>("/stats/admin");
}
