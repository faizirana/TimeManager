/**
 * @fileoverview Table sorting hook
 *
 * This hook provides table sorting functionality with support for:
 * - Ascending/descending toggle on column click
 * - Custom comparison functions for complex data types
 * - Default sorting for strings and numbers
 * - Tracking of current sort state (column and direction)
 */

import { useState } from "react";

/**
 * Custom hook for managing table sorting logic
 *
 * @template T - The type of data items in the table
 * @param {T[]} initialData - Initial array of data to sort
 * @returns {object} Sorting utilities and state
 * @returns {T[]} returns.data - Currently sorted data array
 * @returns {keyof T | null} returns.sortColumn - Currently sorted column name
 * @returns {"asc" | "desc" | null} returns.sortDirection - Current sort direction
 * @returns {function} returns.handleSort - Function to trigger sorting on a column
 *
 * @example
 * ```tsx
 * const { data, sortColumn, sortDirection, handleSort } = useTableSort(users);
 *
 * // Sort by name column (default string comparison)
 * <button onClick={() => handleSort("name")}>Sort by Name</button>
 *
 * // Sort with custom comparison
 * <button onClick={() => handleSort("shift", compareShifts)}>Sort by Shift</button>
 * ```
 */
export function useTableSort<T>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  /**
   * Handles sorting of table data by a specific column
   *
   * @param {keyof T} column - The column key to sort by
   * @param {function} [customCompare] - Optional custom comparison function
   *
   * Behavior:
   * - First click: sorts ascending
   * - Second click on same column: sorts descending
   * - Click on different column: resets to ascending
   */
  const handleSort = (column: keyof T, customCompare?: (a: T, b: T) => number) => {
    let direction: "asc" | "desc" = "asc";

    // Toggle direction if clicking on the same column
    if (sortColumn === column && sortDirection === "asc") {
      direction = "desc";
    }

    const sorted = [...data].sort((a, b) => {
      // If a custom comparison function is provided
      if (customCompare) {
        return direction === "asc" ? customCompare(a, b) : customCompare(b, a);
      }

      // Default comparison for primitive types
      const aValue = a[column];
      const bValue = b[column];

      // String comparison (case-insensitive, locale-aware)
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      // Number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // No sorting for other types
      return 0;
    });

    // Update state with sorted data and sort metadata
    setData(sorted);
    setSortColumn(column);
    setSortDirection(direction);
  };

  return { data, sortColumn, sortDirection, handleSort };
}
