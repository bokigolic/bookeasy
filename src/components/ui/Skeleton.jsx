/** Single shimmer bar */
export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return <div className={`skeleton ${rounded} ${className}`} />
}

/** Skeleton for a stat/metric card */
export function SkeletonStatCard() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-9 w-9" rounded="rounded-xl" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

/** Skeleton for a generic list row */
export function SkeletonRow() {
  return (
    <div className="card flex items-center gap-4">
      <Skeleton className="h-12 w-12 flex-shrink-0" rounded="rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-6 w-16" rounded="rounded-full" />
    </div>
  )
}

/** Skeleton for a service/feature card */
export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-10 w-10" rounded="rounded-xl" />
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-7 flex-1" />
        <Skeleton className="h-7 flex-1" />
      </div>
    </div>
  )
}
