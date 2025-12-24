/**
 * Authentication Service
 *
 * This service handles all authentication-related API calls.
 */

import { LoginCredentials, LoginResponse, AuthenticationError } from "@/lib/types/auth";

/**
 * Base URL for auth API endpoints
 * TODO : Could be moved to env config later
 */
const AUTH_API_BASE = "/api/auth";

/**
 * Login user with email and password
 *
 * @param credentials - User email and password
 * @returns Promise with access token and user data
 * @throws AuthenticationError if login fails
 *
 * @example
 * ```ts
 * try {
 *   const { accessToken, user } = await loginUser({
 *     email: "user@example.com",
 *     password: "securePassword123"
 *   });
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     console.error(error.message);
 *   }
 * }
 * ```
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch(`${AUTH_API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // Important for cookies (refreshToken)
    });

    // Attempt to parse JSON even on error
    // to retrieve the error message from the backend
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If parsing fails, it's probably not JSON
      throw new AuthenticationError(
        "Le serveur a renvoyé une réponse invalide",
        "INVALID_RESPONSE",
      );
    }

    // HTTP error handling
    if (!response.ok) {
      throw new AuthenticationError(
        data.message ?? "Échec de l'authentification",
        data.code ?? `HTTP_${response.status}`,
      );
    }

    return data as LoginResponse;
  } catch (error) {
    // Re-throw if it's already an AuthenticationError
    if (error instanceof AuthenticationError) {
      throw error;
    }

    // Network error or other
    if (error instanceof TypeError) {
      throw new AuthenticationError("Impossible de contacter le serveur", "NETWORK_ERROR");
    }

    // Unknown error
    throw new AuthenticationError("Une erreur inattendue est survenue", "UNKNOWN_ERROR");
  }
}

/**
 * Logout current user
 *
 * @throws AuthenticationError if logout fails
 *
 * @example
 * ```ts
 * await logoutUser();
 * ```
 */
export async function logoutUser(): Promise<void> {
  try {
    const response = await fetch(`${AUTH_API_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });

    // Even if logout fails on the server side, we consider the user logged out
    // on the client side (the cookie will expire anyway)
    if (!response.ok) {
      console.warn("Logout API call failed, but continuing logout process");
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}
