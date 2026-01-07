/**
 * Authentication Service
 *
 * This service handles authentication-related API calls using the centralized API client.
 * Login/logout logic is now managed by AuthContext for better state management.
 */

import { apiClient } from "@/lib/utils/apiClient";

/**
 * User information structure returned by /api/auth/me
 */
interface MeResponse {
  id: string;
  email: string;
  role: string;
}

/**
 * Get current authenticated user information
 *
 * @returns Promise with user data
 * @throws Error if not authenticated or request fails
 *
 * @example
 * ```ts
 * try {
 *   const { user } = await getCurrentUser();
 *   console.log(user.email);
 * } catch (error) {
 *   console.error("User not authenticated");
 * }
 * ```
 */
export async function getCurrentUser(): Promise<MeResponse> {
  return apiClient.get<MeResponse>("/auth/me");
}

/**
 * Check if the user has a valid access token
 *
 * @returns true if user is authenticated, false otherwise
 *
 * @example
 * ```ts
 * const isAuthenticated = await checkToken();
 * if (isAuthenticated) {
 *   // User has valid session
 * }
 * ```
 */
export async function checkToken(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}
