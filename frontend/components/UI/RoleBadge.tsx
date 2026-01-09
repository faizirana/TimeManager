import { ReactNode } from "react";

interface RoleBadgeProps {
  children: ReactNode;
  variant?: "admin" | "manager" | "employee" | "user";
  className?: string;
}

export function RoleBadge({ children, variant = "user", className = "" }: RoleBadgeProps) {
  const variants = {
    admin:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-800",
    manager:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-800",
    employee:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    user: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
