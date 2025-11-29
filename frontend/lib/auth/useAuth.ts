"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser } from "@/lib/auth/authService";
import { AuthenticationError } from "@/lib/auth/types";

/**
 * Authentication hook: login + logout
 *
 * This hook orchestrates authentication flows and manages UI state.
 * The actual API calls are handled by authService for better testability.
 *
 * Provides:
 *  - handleSubmit: for logging in
 *  - logout: for logging out
 *  - loading: loading status
 *  - error: error message, if any
 */
export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Handles the form submission for user login.
   *
   * @param e - The form submission event.
   * @param email - Email of the user
   * @param password - Password of the user
   */
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
    email: string,
    password: string,
  ) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser({ email, password });

      setLoading(false);

      // Navigation to the dashboard after success
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);

      // Typed error handling
      if (err instanceof AuthenticationError) {
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
      await logoutUser();

      setLoading(false);
      router.push("/login");
    } catch (err) {
      // Even if logout fails, redirect anyway
      setLoading(false);
      console.error("Logout error:", err);
      router.push("/login");
    }
  }

  return { handleSubmit, logout, loading, error };
}
