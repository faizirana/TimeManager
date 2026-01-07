"use client";
/**
 * Authentication Context Provider
 *
 * Manages user authentication state using in-memory token storage with sessionStorage backup.
 * This approach provides protection against XSS attacks while maintaining session across page refreshes.
 *
 * Security features:
 * - Access token stored in memory (React state)
 * - sessionStorage backup for page refresh persistence
 * - Automatic token refresh on 401 responses
 * - Automatic logout on refresh failure
 * - Integration with centralized API client
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { login, loading } = useAuth();
 *
 *   const handleLogin = async () => {
 *     await login('user@example.com', 'password');
 *   };
 * }
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/utils/apiClient";

/**
 * User information structure
 */
interface User {
  email: string;
  name: string;
  surname: string;
}

/**
 * Authentication context value shape
 */
interface AuthContextType {
  /** Currently authenticated user (null if not authenticated) */
  user: User | null;
  /** Current access token (null if not authenticated) */
  accessToken: string | null;
  /** Loading state for async operations */
  loading: boolean;
  /** Login function */
  login: (email: string, password: string) => Promise<void>;
  /** Logout function */
  logout: () => Promise<void>;
  /** Manually refresh access token using refresh token cookie */
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * sessionStorage key for persisting auth session across page refreshes
 * Note: sessionStorage is cleared when browser tab is closed (more secure than localStorage)
 */
const SESSION_STORAGE_KEY = "auth_session";

/**
 * Authentication Provider Component
 * Should be wrapped around the entire application in the root layout
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user data from API and update state
   * @param token - Access token to use for authentication
   * @returns true if successful, false otherwise
   */
  const fetchAndSetUser = useCallback(async (token: string): Promise<boolean> => {
    try {
      // Get user ID from /api/auth/me
      const meResponse = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!meResponse.ok) {
        return false;
      }

      const meData = await meResponse.json();

      // Get full user data from /api/users/:id
      const userResponse = await fetch(`/api/users/${meData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        return false;
      }

      const userData = await userResponse.json();

      const data = {
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
      };

      setUser(data);
      return true;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return false;
    }
  }, []);

  /**
   * Restore session from sessionStorage on mount and verify token validity
   * This allows users to maintain their session across page refreshes
   */
  useEffect(() => {
    const restoreSession = async () => {
      const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        try {
          const { token } = JSON.parse(storedSession);

          // Try to restore session with stored token
          setAccessToken(token);
          const success = await fetchAndSetUser(token);

          if (!success) {
            // Token invalid or expired, try to refresh
            const refreshResponse = await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "include",
            });

            if (refreshResponse.ok) {
              // Refresh successful, get new token and user data
              const refreshData = await refreshResponse.json();
              const newToken = refreshData.accessToken;

              setAccessToken(newToken);
              const refreshSuccess = await fetchAndSetUser(newToken);
              if (!refreshSuccess) {
                // Failed to get user data with new token, clear session
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
                setAccessToken(null);
              }
            } else {
              // Refresh failed, clear invalid session
              sessionStorage.removeItem(SESSION_STORAGE_KEY);
              setAccessToken(null);
            }
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  /**
   * Persist session to sessionStorage whenever auth state changes
   * This creates a backup that survives page refreshes but not browser closure
   */
  useEffect(() => {
    if (accessToken && user) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token: accessToken, user }));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [accessToken, user]);

  /**
   * Refresh access token using the refresh token stored in httpOnly cookie
   * Called automatically by apiClient when receiving 401 responses
   * @returns New access token or null if refresh failed
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Critical: sends httpOnly refresh token cookie
      });

      if (!response.ok) {
        throw new Error("Refresh failed");
      }

      const data = await response.json();
      const newToken = data.accessToken;

      // Update access token in state
      setAccessToken(newToken);

      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Auto-logout on refresh failure for security
      await logout();
      return null;
    }
  }, []);

  /**
   * Configure API client with token getter and refresh logic
   * This enables automatic Bearer token injection and refresh handling
   */
  useEffect(() => {
    apiClient.setTokenGetter(() => accessToken);
    apiClient.setRefreshTokenFunction(refreshAccessToken);
    apiClient.setUnauthorizedHandler(() => {
      logout();
    });
  }, [accessToken, refreshAccessToken]);

  /**
   * Login function - authenticates user and stores tokens
   * @param email - User email
   * @param password - User password
   * @throws Error if login fails
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        // Call login endpoint
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include", // Critical: receives httpOnly refresh token cookie
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message ?? "Login failed");
        }

        const data = await response.json();

        // Store access token in memory
        setAccessToken(data.accessToken);

        // Fetch and set user information using the new token
        const success = await fetchAndSetUser(data.accessToken);

        if (!success) {
          throw new Error("Failed to fetch user information");
        }
      } catch (error) {
        console.error("Login error:", error);
        // Clear any partial state on error
        setAccessToken(null);
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchAndSetUser],
  );

  /**
   * Logout function - clears tokens and user state
   * Calls backend logout endpoint to invalidate refresh token
   */
  const logout = useCallback(async () => {
    try {
      // Call backend logout to invalidate refresh token
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth state
      setAccessToken(null);
      setUser(null);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 * @throws Error if used outside of AuthProvider
 * @returns Authentication context value
 *
 * @example
 * ```tsx
 * const { user, login, logout } = useAuth();
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
