"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

export interface UseAutoLoginReturn {
  isCheckingToken: boolean;
  shouldShowAutoLoginMessage: boolean;
}

/**
 * Hook for auto-login functionality
 *
 * Checks if user is already authenticated on initial page load and redirects to dashboard.
 * Only triggers redirect on initial mount, not when user logs in via form.
 * Provides loading state and message flag for UI feedback.
 *
 * @returns Object with loading state and message flag
 *
 * @example
 * ```tsx
 * const { isCheckingToken, shouldShowAutoLoginMessage } = useAutoLogin();
 *
 * if (isCheckingToken) {
 *   return <div>Vérification...</div>;
 * }
 * ```
 */
export function useAutoLogin(): UseAutoLoginReturn {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [shouldShowAutoLoginMessage, setShouldShowAutoLoginMessage] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only check once on initial mount
    if (hasCheckedRef.current) {
      return;
    }

    // Once loading completes, check if user is authenticated
    if (!loading) {
      hasCheckedRef.current = true;

      if (user) {
        // User is already logged in (from sessionStorage), show message and redirect
        setShouldShowAutoLoginMessage(true);
        // Wait a moment to show the message before redirecting
        setTimeout(() => {
          router.push("/dashboard");
        }, 2500);
      }
    }
  }, [user, loading, router]);

  return {
    isCheckingToken: loading && !hasCheckedRef.current,
    shouldShowAutoLoginMessage,
  };
}
