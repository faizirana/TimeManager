/**
 * Custom hook for filtering table data by search query
 * Supports searching across multiple fields with optional debouncing
 *
 * @template T - Type of data items
 * @param {T[]} data - Array of data to search
 * @param {(keyof T)[]} searchKeys - Array of keys to search in
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 0)
 * @returns {Object} Search state and filtered data
 * @property {string} searchQuery - Current search query
 * @property {Function} setSearchQuery - Set search query
 * @property {T[]} filteredData - Filtered data based on search query
 * @property {Function} clearSearch - Clear search query
 *
 * @example
 * ```tsx
 * const { searchQuery, setSearchQuery, filteredData } = useTableSearch(
 *   users,
 *   ['name', 'surname', 'email'],
 *   300
 * );
 *
 * <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
 * <Table data={filteredData} />
 * ```
 */

import { useState, useMemo, useEffect, useCallback } from "react";

export function useTableSearch<T>(data: T[], searchKeys: (keyof T)[], debounceMs: number = 0) {
  const [searchQuery, setSearchQueryState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  /**
   * Debounce search query if debounceMs > 0
   */
  useEffect(() => {
    if (debounceMs === 0) {
      setDebouncedQuery(searchQuery);
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery, debounceMs]);

  /**
   * Filter data based on search query
   */
  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return data;
    }

    const lowerQuery = debouncedQuery.toLowerCase();

    return data.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }, [data, debouncedQuery, searchKeys]);

  /**
   * Set search query
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  /**
   * Clear search query
   */
  const clearSearch = useCallback(() => {
    setSearchQueryState("");
    setDebouncedQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
    clearSearch,
  };
}
