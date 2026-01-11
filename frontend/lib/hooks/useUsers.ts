/**
 * Custom hook for managing users data with CRUD operations
 * Handles fetching, creating, updating, and deleting users with loading and error states
 *
 * @returns {Object} Users state and operations
 * @property {User[]} users - Array of users
 * @property {boolean} loading - Loading state for fetch operations
 * @property {string | null} error - Error message if operation fails
 * @property {Function} createNewUser - Create a new user
 * @property {Function} updateExistingUser - Update an existing user
 * @property {Function} deleteExistingUser - Delete a user by ID
 * @property {Function} refetch - Manually refetch users
 *
 * @example
 * ```tsx
 * const { users, loading, error, createNewUser, updateExistingUser, deleteExistingUser } = useUsers();
 *
 * const handleCreate = async (userData) => {
 *   await createNewUser(userData);
 * };
 * ```
 */

import { useState, useEffect, useCallback } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/services/users/usersService";
import { API_ERRORS, RESOURCES } from "@/lib/types/errorMessages";
import type { User } from "@/lib/types/teams";

interface CreateUserData {
  name: string;
  surname: string;
  email: string;
  role: string;
  password: string;
  mobileNumber: string;
}

interface UpdateUserData {
  name?: string;
  surname?: string;
  email?: string;
  role?: string;
  mobileNumber?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all users
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(API_ERRORS.FETCH_FAILED(RESOURCES.USERS));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new user
   */
  const createNewUser = useCallback(
    async (userData: CreateUserData) => {
      try {
        await createUser(userData);
        await fetchUsers(); // Refetch to update list
      } catch (err) {
        console.error("Error creating user:", err);
        throw err; // Let the caller handle the error
      }
    },
    [fetchUsers],
  );

  /**
   * Update an existing user
   */
  const updateExistingUser = useCallback(
    async (userId: number, userData: UpdateUserData) => {
      try {
        await updateUser(userId, userData);
        await fetchUsers(); // Refetch to update list
      } catch (err) {
        console.error("Error updating user:", err);
        throw err; // Let the caller handle the error
      }
    },
    [fetchUsers],
  );

  /**
   * Delete a user by ID
   */
  const deleteExistingUser = useCallback(
    async (userId: number) => {
      try {
        await deleteUser(userId);
        await fetchUsers(); // Refetch to update list
      } catch (err) {
        console.error("Error deleting user:", err);
        throw err; // Let the caller handle the error
      }
    },
    [fetchUsers],
  );

  /**
   * Manually refetch users
   */
  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    createNewUser,
    updateExistingUser,
    deleteExistingUser,
    refetch,
  };
}
