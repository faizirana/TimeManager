/**
 * @fileoverview Timetable Service
 *
 * This service handles all timetable-related API calls using the centralized API client.
 * Provides functions to fetch timetables and timetable details from the backend.
 */

import { apiClient } from "@/lib/utils/apiClient";
import { Timetable } from "@/lib/types/timetable";

/**
 * Fetch a specific timetable by ID
 *
 * @param {number} timetableId - The ID of the timetable to fetch
 * @returns {Promise<Timetable>} Timetable details with shift start and end times
 * @throws {Error} If the timetable is not found or request fails
 *
 * @example
 * ```typescript
 * try {
 *   const timetable = await getTimetableById(1);
 *   console.log(`Shift: ${timetable.Shift_start} - ${timetable.Shift_end}`);
 * } catch (error) {
 *   console.error("Timetable not found:", error);
 * }
 * ```
 */
export async function getTimetableById(timetableId: number): Promise<Timetable> {
  return apiClient.get<Timetable>(`/timetables/${timetableId}`);
}
