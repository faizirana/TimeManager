/**
 * Time Recording Service
 *
 * This service handles time recording-related API calls.
 */

import { apiClient } from "@/lib/utils/apiClient";
import {
  TimeRecording,
  TimeRecordingStatsResponse,
  TimeRecordingFilters,
} from "@/lib/types/timeRecording";

/**
 * Get all time recordings with optional filters
 *
 * @param filters - Optional filters (id_user, start_date, end_date, type)
 * @returns Promise with array of time recordings
 *
 * @example
 * ```ts
 * // Get all recordings for a user
 * const recordings = await getTimeRecordings({ id_user: 2 });
 *
 * // Get recordings for a date range
 * const weekRecordings = await getTimeRecordings({
 *   start_date: '2026-01-01T00:00:00.000Z',
 *   end_date: '2026-01-07T23:59:59.999Z'
 * });
 * ```
 */
export async function getTimeRecordings(filters?: TimeRecordingFilters): Promise<TimeRecording[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.id_user) params.append("id_user", filters.id_user.toString());
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.type) params.append("type", filters.type);
  }

  const url = `/timerecordings${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<TimeRecording[]>(url);
}

/**
 * Get time recording statistics
 *
 * @param filters - Optional filters (id_user, start_date, end_date)
 * @returns Promise with statistics data
 *
 * @example
 * ```ts
 * // Get own statistics
 * const stats = await getTimeRecordingStats();
 *
 * // Get statistics for a specific user
 * const userStats = await getTimeRecordingStats({ id_user: 2 });
 *
 * // Get statistics for a date range
 * const weekStats = await getTimeRecordingStats({
 *   start_date: '2026-01-01T00:00:00.000Z',
 *   end_date: '2026-01-07T23:59:59.999Z'
 * });
 * ```
 */
export async function getTimeRecordingStats(
  filters?: Omit<TimeRecordingFilters, "type">,
): Promise<TimeRecordingStatsResponse> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.id_user) params.append("id_user", filters.id_user.toString());
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
  }

  const url = `/timerecordings/stats${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<TimeRecordingStatsResponse>(url);
}

/**
 * Get a specific time recording by ID
 *
 * @param id - Time recording ID
 * @returns Promise with time recording data
 */
export async function getTimeRecordingById(id: number): Promise<TimeRecording> {
  return apiClient.get<TimeRecording>(`/timerecordings/${id}`);
}

/**
 * Create a new time recording
 *
 * @param data - Time recording data
 * @returns Promise with created time recording
 *
 * @example
 * ```ts
 * const recording = await createTimeRecording({
 *   timestamp: new Date().toISOString(),
 *   type: 'Arrival',
 *   id_user: 2
 * });
 * ```
 */
export async function createTimeRecording(data: {
  timestamp: string;
  type: "Arrival" | "Departure";
  id_user: number;
}): Promise<TimeRecording> {
  return apiClient.post<TimeRecording>("/timerecordings", data);
}

/**
 * Update a time recording
 *
 * @param id - Time recording ID
 * @param data - Updated time recording data
 * @returns Promise with updated time recording
 */
export async function updateTimeRecording(
  id: number,
  data: Partial<{
    timestamp: string;
    type: "Arrival" | "Departure";
    id_user: number;
  }>,
): Promise<TimeRecording> {
  return apiClient.put<TimeRecording>(`/timerecordings/${id}`, data);
}

/**
 * Delete a time recording
 *
 * @param id - Time recording ID
 * @returns Promise with success message
 */
export async function deleteTimeRecording(id: number): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/timerecordings/${id}`);
}
