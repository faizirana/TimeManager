/**
 * @fileoverview Sorting helper functions
 *
 * Provides custom comparison functions for sorting complex data types:
 * - compareShifts: Sort time shifts chronologically
 * - compareSituations: Sort situation objects alphabetically by label
 *
 * These functions are designed to work with useTableSort hook.
 */

/**
 * Comparison function to sort time shifts chronologically
 *
 * Parses shift strings in format "HH:MM - HH:MM" and compares them
 * based on their start time.
 *
 * @param {string} shiftA - First shift string (e.g., "8:00 - 16:00")
 * @param {string} shiftB - Second shift string (e.g., "9:00 - 17:00")
 * @returns {number} Negative if shiftA is earlier, positive if shiftB is earlier, 0 if equal
 *
 * @example
 * ```typescript
 * const shifts = ["14:00 - 22:00", "8:00 - 16:00", "22:00 - 6:00"];
 * shifts.sort(compareShifts);
 * // Result: ["8:00 - 16:00", "14:00 - 22:00", "22:00 - 6:00"]
 *
 * // With useTableSort
 * handleSort("shift", compareShifts);
 * ```
 */
export const compareShifts = (shiftA: string, shiftB: string): number => {
  /**
   * Helper function to extract start time from shift string
   * @param {string} shift - Shift string in format "HH:MM - HH:MM"
   * @returns {number} Total minutes from midnight (e.g., "8:30" → 510)
   */
  const getStartTime = (shift: string) => {
    const [time] = shift.split(" - ");
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes; // Convert to total minutes
  };

  return getStartTime(shiftA) - getStartTime(shiftB);
};

/**
 * Comparison function for sorting situation objects by their label
 *
 * Performs locale-aware alphabetical comparison of label properties.
 *
 * @param {object} situationA - First situation object
 * @param {string} situationA.label - Label to compare (e.g., "On Site", "Telework")
 * @param {object} situationB - Second situation object
 * @param {string} situationB.label - Label to compare
 * @returns {number} Negative if situationA comes first, positive if situationB comes first, 0 if equal
 *
 * @example
 * ```typescript
 * const situations = [
 *   { label: "Telework" },
 *   { label: "On Site" },
 *   { label: "Business Trip" }
 * ];
 * situations.sort(compareSituations);
 * // Result: [{ label: "Business Trip" }, { label: "On Site" }, { label: "Telework" }]
 *
 * // With useTableSort
 * handleSort("situation", (a, b) => compareSituations(a.situation, b.situation));
 * ```
 */
export const compareSituations = (
  situationA: { label: string },
  situationB: { label: string },
): number => {
  return situationA.label.localeCompare(situationB.label);
};
