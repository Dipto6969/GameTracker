interface LoadingSkeletonProps {
  variant?: "card" | "row" | "detail"
}

const Shimmer = () => (
  <div className="absolute inset-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
)

export default function LoadingSkeleton({ variant = "card" }: LoadingSkeletonProps) {
  if (variant === "row") {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 flex gap-4 items-start overflow-hidden">
        <div className="relative w-20 h-20 bg-slate-200 dark:bg-neutral-700 rounded flex-shrink-0">
          <Shimmer />
        </div>
        <div className="flex-grow space-y-2 flex-1">
          <div className="relative h-4 bg-slate-200 dark:bg-neutral-700 rounded w-1/2">
            <Shimmer />
          </div>
          <div className="relative h-3 bg-slate-200 dark:bg-neutral-700 rounded w-1/3">
            <Shimmer />
          </div>
        </div>
        <div className="relative w-20 h-10 bg-slate-200 dark:bg-neutral-700 rounded flex-shrink-0">
          <Shimmer />
        </div>
      </div>
    )
  }

  if (variant === "detail") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="relative w-full aspect-video bg-slate-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
              <Shimmer />
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="relative h-10 bg-slate-200 dark:bg-neutral-700 rounded w-3/4 overflow-hidden">
              <Shimmer />
            </div>
            <div className="relative h-5 bg-slate-200 dark:bg-neutral-700 rounded w-1/2 overflow-hidden">
              <Shimmer />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div key={i} className="relative h-20 bg-slate-200 dark:bg-neutral-700 rounded overflow-hidden">
                  <Shimmer />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
      <div className="relative h-48 bg-slate-200 dark:bg-neutral-700 overflow-hidden">
        <Shimmer />
      </div>
      <div className="p-4 space-y-3">
        <div className="relative h-4 bg-slate-200 dark:bg-neutral-700 rounded w-2/3 overflow-hidden">
          <Shimmer />
        </div>
        <div className="relative h-3 bg-slate-200 dark:bg-neutral-700 rounded w-1/2 overflow-hidden">
          <Shimmer />
        </div>
        <div className="relative h-3 bg-slate-200 dark:bg-neutral-700 rounded w-1/3 overflow-hidden">
          <Shimmer />
        </div>
      </div>
    </div>
  )
}
