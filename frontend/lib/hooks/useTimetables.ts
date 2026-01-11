/**
 * Custom hook for managing timetables data with CRUD operations
 * Handles fetching, creating and deleting timetables with loading and error states
 *
 * @returns {Object} Timetables state and operations
 * @property {Timetable[]} timetables - Array of timetables
 * @property {boolean} loading - Loading state for fetch operations
 * @property {string | null} error - Error message if operation fails
 * @property {Function} createNewTimetable - Create a new timetable
 * @property {Function} deleteTimetableById - Delete a timetable by ID
 * @property {Function} refetch - Manually refetch timetables
 *
 * @example
 * ```tsx
 * const { timetables, loading, error, createNewTimetable, deleteTimetableById } = useTimetables();
 *
 * const handleCreate = async (data) => {
 *   await createNewTimetable(data);
 * };
 *
 * const handleDelete = async (id) => {
 *   await deleteTimetableById(id);
 * };
 * ```
 */

import { useState, useEffect, useCallback } from "react";
import {
  getTimetables,
  createTimetable,
  deleteTimetable,
} from "@/lib/services/timetable/timetableService";
import { API_ERRORS, RESOURCES } from "@/lib/types/errorMessages";

interface Timetable {
  id: number;
  Shift_start: string;
  Shift_end: string;
}

interface CreateTimetableData {
  Shift_start: string;
  Shift_end: string;
}

export function useTimetables() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all timetables
   */
  const fetchTimetables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTimetables();
      setTimetables(data);
    } catch (err) {
      console.error("Error fetching timetables:", err);
      setError(API_ERRORS.FETCH_FAILED(RESOURCES.TIMETABLES));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new timetable
   */
  const createNewTimetable = useCallback(
    async (timetableData: CreateTimetableData) => {
      try {
        const newTimetable = await createTimetable(timetableData);
        await fetchTimetables(); // Refetch to update list
        return newTimetable;
      } catch (err) {
        console.error("Error creating timetable:", err);
        throw err; // Let the caller handle the error
      }
    },
    [fetchTimetables],
  );

  /**
   * Delete a timetable
   */
  const deleteTimetableById = useCallback(
    async (timetableId: number) => {
      try {
        await deleteTimetable(timetableId);
        await fetchTimetables(); // Refetch to update list
      } catch (err) {
        console.error("Error deleting timetable:", err);
        throw err; // Let the caller handle the error
      }
    },
    [fetchTimetables],
  );

  /**
   * Manually refetch timetables
   */
  const refetch = useCallback(() => {
    fetchTimetables();
  }, [fetchTimetables]);

  // Fetch timetables on mount
  useEffect(() => {
    fetchTimetables();
  }, [fetchTimetables]);

  return {
    timetables,
    loading,
    error,
    createNewTimetable,
    deleteTimetableById,
    refetch,
  };
}
