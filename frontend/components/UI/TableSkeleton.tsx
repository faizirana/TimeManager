/**
 * Table Skeleton Loader Component
 *
 * Displays an animated skeleton placeholder while table data is loading.
 *
 * @example
 * ```tsx
 * {loading ? (
 *   <TableSkeleton rows={5} columns={3} />
 * ) : (
 *   <Table>...</Table>
 * )}
 * ```
 */

interface TableSkeletonProps {
  /** Number of skeleton rows to display */
  rows?: number;
  /** Number of columns in the table */
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 3 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4">
        <div className="flex gap-6">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1">
              <div className="h-4 bg-[var(--muted)] rounded-full w-24"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-[var(--border)] px-6 py-5">
          <div className="flex gap-6">
            {Array.from({ length: columns }).map((__, colIndex) => (
              <div key={colIndex} className="flex-1">
                <div className="h-4 bg-[var(--surface-hover)] rounded-full w-full max-w-[200px]"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
