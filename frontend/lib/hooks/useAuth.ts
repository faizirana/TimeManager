"use client";

/**
 * UI Authentication Hook
 *
 * This hook provides authentication actions for UI components.
 * It wraps the AuthContext and adds navigation logic for login/logout flows.
 *
 * Use this hook in forms and UI components that need to trigger authentication actions.
 * For accessing auth state only (user, loading), use the useAuth from AuthContext directly.
 */

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useAuthContext } from "@/lib/contexts/AuthContext";

/**
 * Authentication hook for UI components
 *
 * Provides:
 *  - handleSubmit: for logging in with form handling
 *  - logout: for logging out with navigation
 *  - loading: loading status
 *  - error: error message, if any
 *  - user: current authenticated user (from context)
 */
export function useAuth() {
  const router = useRouter();
  const { login: contextLogin, logout: contextLogout, user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Handles the form submission for user login.
   *
   * @param e - The form submission event.
   * @param email - Email of the user
   * @param password - Password of the user
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>, email: string, password: string) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await contextLogin(email, password);

      setLoading(false);

      // Navigation to the dashboard after success
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);

      // Error handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    }
  }

  /**
   * Logs out the current user and redirects to login page
   */
  async function logout() {
    setLoading(true);
    setError("");

    try {
      await contextLogout();

      setLoading(false);
      router.push("/login");
    } catch (_err) {
      // Even if logout fails, redirect anyway
      setLoading(false);
      router.push("/login");
    }
  }

  return { handleSubmit, logout, loading, error, user };
}
