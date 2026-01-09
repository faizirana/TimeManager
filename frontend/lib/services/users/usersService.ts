/**
 * @fileoverview Users Service
 *
 * This service handles all user-related API calls using the centralized API client.
 * Provides functions to fetch users from the backend.
 */

import { apiClient } from "@/lib/utils/apiClient";
import { User } from "@/lib/types/teams";
import { UserProfile, UpdateUserData } from "@/lib/types/user";

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

/**
 * Fetch current user's full profile
 *
 * @returns {Promise<UserProfile>} Current user's profile data
 * @throws {Error} If the request fails or user is not authenticated
 *
 * @example
 * ```typescript
 * try {
 *   const profile = await getCurrentUserProfile();
 *   console.log(`Welcome ${profile.name} ${profile.surname}`);
 * } catch (error) {
 *   console.error("Failed to fetch profile:", error);
 * }
 * ```
 */
export async function getCurrentUserProfile(): Promise<UserProfile> {
  return apiClient.get<UserProfile>("/auth/me");
}

/**
 * Fetch user by ID
 *
 * @param {number} id - User ID
 * @returns {Promise<UserProfile>} User profile data
 * @throws {Error} If the request fails or user is not found
 *
 * @example
 * ```typescript
 * try {
 *   const user = await getUserById(5);
 *   console.log(`User: ${user.name} ${user.surname}`);
 * } catch (error) {
 *   console.error("Failed to fetch user:", error);
 * }
 * ```
 */
export async function getUserById(id: number): Promise<UserProfile> {
  return apiClient.get<UserProfile>(`/users/${id}`);
}

/**
 * Update current user's profile
 *
 * @param {UpdateUserData} data - User data to update
 * @returns {Promise<UserProfile>} Updated user profile
 * @throws {Error} If the request fails or validation errors occur
 *
 * @example
 * ```typescript
 * try {
 *   const updated = await updateCurrentUser({
 *     name: "John",
 *     surname: "Doe",
 *     mobileNumber: "0123456789"
 *   });
 *   console.log("Profile updated successfully");
 * } catch (error) {
 *   console.error("Failed to update profile:", error);
 * }
 * ```
 */
export async function updateCurrentUser(data: UpdateUserData): Promise<UserProfile> {
  // Get current user ID from auth/me
  const currentUser = await getCurrentUserProfile();
  return apiClient.put<UserProfile>(`/users/${currentUser.id}`, data);
}
