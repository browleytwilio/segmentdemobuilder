export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>

      {/* Identity card skeleton */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 shadow-card animate-pulse"
          >
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="mt-2 h-8 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Settings skeleton */}
      <div className="rounded-xl border bg-card shadow-card animate-pulse">
        <div className="border-b px-6 py-4">
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="px-6 py-4">
          <div className="h-4 w-48 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
