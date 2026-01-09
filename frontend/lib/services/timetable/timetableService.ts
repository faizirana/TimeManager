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

/**
 * Fetch all timetables
 *
 * @returns {Promise<Timetable[]>} Array of all timetables
 * @throws {Error} If the request fails
 *
 * @example
 * ```typescript
 * try {
 *   const timetables = await getTimetables();
 *   console.log(`Found ${timetables.length} timetables`);
 * } catch (error) {
 *   console.error("Failed to fetch timetables:", error);
 * }
 * ```
 */
export async function getTimetables(): Promise<Timetable[]> {
  return apiClient.get<Timetable[]>("/timetables");
}

/**
 * Create a new timetable
 *
 * @param {Object} timetableData - Timetable data
 * @param {string} timetableData.Shift_start - Start time (HH:mm format)
 * @param {string} timetableData.Shift_end - End time (HH:mm format)
 * @returns {Promise<Timetable>} Created timetable
 * @throws {Error} If creation fails
 *
 * @example
 * ```typescript
 * try {
 *   const newTimetable = await createTimetable({
 *     Shift_start: "09:00",
 *     Shift_end: "17:00"
 *   });
 * } catch (error) {
 *   console.error("Failed to create timetable:", error);
 * }
 * ```
 */
export async function createTimetable(timetableData: {
  Shift_start: string;
  Shift_end: string;
}): Promise<Timetable> {
  return apiClient.post<Timetable>("/timetables", timetableData);
}
