/**
 * @fileoverview Users Service
 *
 * This service handles all user-related API calls using the centralized API client.
 * Provides functions to fetch users from the backend.
 */

import { apiClient } from "@/lib/utils/apiClient";
import { User } from "@/lib/types/teams";

/**
 * Fetch all users
 *
 * @returns {Promise<User[]>} Array of all users
 * @throws {Error} If the request fails or returns invalid data
 *
 * @example
 * ```typescript
 * try {
 *   const users = await getUsers();
 *   console.log(`Found ${users.length} users`);
 * } catch (error) {
 *   console.error("Failed to fetch users:", error);
 * }
 * ```
 */
export async function getUsers(): Promise<User[]> {
  return apiClient.get<User[]>("/users");
}
