export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header skeleton */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-l-2 border-l-muted bg-card p-4 shadow-card animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </div>
            <div className="h-8 w-14 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 min-w-0">
          <div className="h-8 w-full max-w-xs animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 shadow-card animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-24 rounded-md bg-muted" />
              <div className="h-5 w-5 rounded bg-muted" />
            </div>
            <div className="h-5 w-40 rounded bg-muted mb-2" />
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="flex items-center justify-between mt-6 pt-3 border-t">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-5 w-12 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
