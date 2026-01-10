import { CardSkeleton, Skeleton, TableRowSkeleton } from "@/components/UI/Skeleton";

// Skeleton pour les cartes de statistiques individuelles
export function StatsCardSkeleton() {
  return <CardSkeleton />;
}

// Skeleton pour une grille de cartes de statistiques
export function StatsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton pour l'en-tête des statistiques d'équipe
export function TeamStatsHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 animate-pulse">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}

// Skeleton pour le tableau des statistiques d'équipe
export function TeamStatsTableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton className="h-3 w-24" />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton className="h-3 w-28" />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton className="h-3 w-28" />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton className="h-3 w-24" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Skeleton complet pour TimeRecordingStats
export function TimeRecordingStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* User info skeleton */}
        <div className="bg-gray-50 p-4 rounded-lg animate-pulse">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stats cards skeleton */}
        <StatsGridSkeleton count={3} />

        {/* Work sessions table skeleton */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <Skeleton className="h-3 w-16" />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Skeleton className="h-3 w-16" />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Skeleton className="h-3 w-16" />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Skeleton className="h-3 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={4} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton complet pour TeamStats
export function TeamStatsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Team header skeleton */}
      <TeamStatsHeaderSkeleton />

      {/* Aggregated stats skeleton */}
      <StatsGridSkeleton count={3} />

      {/* Individual member stats skeleton */}
      <TeamStatsTableSkeleton rows={4} />
    </div>
  );
}

// Skeleton pour le dashboard loading complet
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <TeamStatsSkeleton />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <TimeRecordingStatsSkeleton />
      </div>
    </div>
  );
}
