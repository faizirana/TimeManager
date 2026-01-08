/**
 * @fileoverview Timetable types
 *
 * Provides type definitions for timetable/shift management:
 * - Timetable: Work shift schedule with start and end times
 */

/**
 * Timetable (work shift) information
 *
 * @interface Timetable
 * @property {number} id - Unique timetable identifier
 * @property {string} Shift_start - Shift start time (format: "HH:MM")
 * @property {string} Shift_end - Shift end time (format: "HH:MM")
 *
 * @example
 * ```typescript
 * const timetable: Timetable = {
 *   id: 1,
 *   Shift_start: "08:00",
 *   Shift_end: "16:00"
 * };
 * ```
 */
export interface Timetable {
  id: number;
  Shift_start: string;
  Shift_end: string;
}
