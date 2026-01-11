/**
 * Custom hook for managing toast notifications
 * Provides centralized toast state management for success, error, and info messages
 *
 * @returns {Object} Toast state and handlers
 * @property {Object | null} toast - Current toast notification
 * @property {Function} showSuccess - Show success toast
 * @property {Function} showError - Show error toast
 * @property {Function} showInfo - Show info toast
 * @property {Function} clearToast - Clear current toast
 *
 * @example
 * ```tsx
 * const { toast, showSuccess, showError, clearToast } = useToast();
 *
 * // Show success toast
 * showSuccess("User created successfully");
 *
 * // Show error toast
 * showError("Failed to create user");
 *
 * // Render toast
 * {toast && <Toast {...toast} onClose={clearToast} />}
 * ```
 */

import { useState, useCallback } from "react";
import type { ToastType } from "@/components/UI/Toast";

interface ToastState {
  message: string;
  type: ToastType;
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  /**
   * Show success toast
   */
  const showSuccess = useCallback((message: string, duration = 5000) => {
    setToast({ message, type: "success", duration });
  }, []);

  /**
   * Show error toast
   */
  const showError = useCallback((message: string, duration = 5000) => {
    setToast({ message, type: "error", duration });
  }, []);

  /**
   * Show info toast
   */
  const showInfo = useCallback((message: string, duration = 5000) => {
    setToast({ message, type: "info", duration });
  }, []);

  /**
   * Clear current toast
   */
  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showSuccess,
    showError,
    showInfo,
    clearToast,
  };
}
