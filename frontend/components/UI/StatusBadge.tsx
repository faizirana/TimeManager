import { ReactNode } from "react";

interface StatusBadgeProps {
  children: ReactNode;
  variant?: "inProgress" | "onPause" | "late" | "planned";
  className?: string;
}

export function StatusBadge({ children, variant = "planned", className = "" }: StatusBadgeProps) {
  const variants = {
    inProgress: "bg-green-50 text-green-700 border-green-300",
    onPause: "bg-yellow-50 text-yellow-700 border-yellow-300",
    late: "bg-red-50 text-red-700 border-red-300",
    planned: "bg-gray-50 text-gray-700 border-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
