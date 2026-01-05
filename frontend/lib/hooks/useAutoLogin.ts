"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkToken } from "@/lib/services/auth/authService";

export interface UseAutoLoginReturn {
  isCheckingToken: boolean;
  shouldShowAutoLoginMessage: boolean;
}

/**
 * Hook for auto-login functionality
 *
 * Checks if a valid token exists on mount and redirects to dashboard if authenticated.
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
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [shouldShowAutoLoginMessage, setShouldShowAutoLoginMessage] = useState(false);

  useEffect(() => {
    async function verifyExistingToken() {
      try {
        const hasValidToken = await checkToken();

        if (hasValidToken) {
          setShouldShowAutoLoginMessage(true);
          // Wait a moment to show the message before redirecting
          setTimeout(() => {
            router.push("/dashboard");
          }, 2500);
        } else {
          setIsCheckingToken(false);
        }
      } catch (error) {
        console.error("Auto-login check failed:", error);
        setIsCheckingToken(false);
      }
    }

    verifyExistingToken();
  }, [router]);

  return {
    isCheckingToken,
    shouldShowAutoLoginMessage,
  };
}
