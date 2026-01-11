/**
 * ErrorDisplay Component
 * Displays error messages with consistent styling
 * Supports inline and toast variants
 *
 * @component
 * @param {Object} props - Component props
 * @param {string | null} props.error - Error message to display
 * @param {'inline' | 'toast'} props.variant - Display variant (default: 'inline')
 * @param {Function} props.onDismiss - Optional dismiss handler
 * @param {string} props.className - Optional additional CSS classes
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   error={error}
 *   variant="inline"
 *   onDismiss={clearError}
 * />
 * ```
 */

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
  variant?: "inline" | "toast";
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  variant = "inline",
  onDismiss,
  className = "",
}: ErrorDisplayProps) {
  if (!error) return null;

  if (variant === "toast") {
    return (
      <div
        className={`
          fixed top-4 right-4 z-50 max-w-md
          p-4 rounded-lg shadow-lg
          bg-red-50 dark:bg-red-900/20
          border border-red-200 dark:border-red-800
          animate-in slide-in-from-top-2
          ${className}
        `}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div
      className={`
        p-3 rounded-lg
        bg-red-50 dark:bg-red-900/20
        border border-red-200 dark:border-red-800
        ${className}
      `}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
