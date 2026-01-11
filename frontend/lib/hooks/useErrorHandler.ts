/**
 * Custom hook for managing error state
 * Provides centralized error handling for forms and components
 *
 * @returns {Object} Error state and handlers
 * @property {string | null} error - Current error message
 * @property {Function} setError - Set error message
 * @property {Function} clearError - Clear current error
 * @property {Function} handleError - Parse and set error from unknown source
 *
 * @example
 * ```tsx
 * const { error, setError, clearError, handleError } = useErrorHandler();
 *
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   handleError(err);
 * }
 * ```
 */

import { useState, useCallback } from "react";
import { parseFormError } from "@/lib/utils/formHelpers";

export function useErrorHandler() {
  const [error, setErrorState] = useState<string | null>(null);

  /**
   * Set error message (supports string or Error object)
   */
  const setError = useCallback((err: string | Error | null) => {
    if (err === null) {
      setErrorState(null);
    } else if (typeof err === "string") {
      setErrorState(err);
    } else {
      setErrorState(err.message);
    }
  }, []);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  /**
   * Parse error from unknown source and set error state
   */
  const handleError = useCallback((err: unknown) => {
    const message = parseFormError(err);
    setErrorState(message);
  }, []);

  return {
    error,
    setError,
    clearError,
    handleError,
  };
}
