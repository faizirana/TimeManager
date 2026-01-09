import { ReactNode } from "react";

interface RoleBadgeProps {
  children: ReactNode;
}

export function RoleBadge({ children }: RoleBadgeProps) {
  return <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{children}</span>;
}
