/**
 * LoadingState Component
 * Conditional renderer that shows loading state or content
 * Supports custom skeleton and fallback components
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether content is loading
 * @param {ReactNode} props.children - Content to show when not loading
 * @param {ReactNode} props.skeleton - Optional skeleton component
 * @param {ReactNode} props.fallback - Optional fallback component
 * @param {string} props.className - Optional CSS classes
 *
 * @example
 * ```tsx
 * <LoadingState
 *   isLoading={loading}
 *   skeleton={<TableSkeleton />}
 * >
 *   <Table data={data} />
 * </LoadingState>
 * ```
 */

import React, { ReactNode } from "react";

interface LoadingStateProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function LoadingState({
  isLoading,
  children,
  skeleton,
  fallback,
  className = "",
}: LoadingStateProps) {
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    // Default loading spinner
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
