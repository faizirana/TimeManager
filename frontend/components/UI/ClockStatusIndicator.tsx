"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export interface ClockStatusIndicatorProps {
  /** Current clock status */
  status: "active" | "paused" | "none";
  /** Time elapsed since clock in (for tooltip) */
  elapsedTime?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Visual indicator for clock in/out status
 * Shows a pulsing dot for active clock in, dimmed for paused, hidden for none
 */
export function ClockStatusIndicator({
  status,
  elapsedTime,
  className,
}: ClockStatusIndicatorProps) {
  if (status === "none") {
    return null;
  }

  const isActive = status === "active";

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      title={isActive ? `En cours - ${elapsedTime}` : "En pause"}
    >
      {/* Pulsing dot for active status */}
      <div className="relative flex h-3 w-3 items-center justify-center">
        {isActive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            isActive ? "bg-green-500" : "bg-orange-400",
          )}
        />
      </div>

      {/* Clock icon */}
      <Clock className={cn("h-3.5 w-3.5", isActive ? "text-green-600" : "text-orange-500")} />

      {/* Elapsed time (only for active status) */}
      {isActive && elapsedTime && (
        <span className="text-xs font-medium text-green-700">{elapsedTime}</span>
      )}
    </div>
  );
}
