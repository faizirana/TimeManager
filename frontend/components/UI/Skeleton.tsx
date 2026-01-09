import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />;
}

// Text skeleton - simule une ligne de texte
export function TextSkeleton({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} />;
}

// Card skeleton - simule une carte complète
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-md border border-gray-200", className)}>
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

// Table skeleton - simule une ligne de tableau
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4 whitespace-nowrap">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Image/Avatar skeleton
export function AvatarSkeleton({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-12 w-12 rounded-full", className)} />;
}
