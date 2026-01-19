interface LoadingSkeletonProps {
  variant?: "card" | "row" | "detail"
}

const Shimmer = () => (
  <div className="absolute inset-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-[shimmer_2s_infinite]" />
)

export default function LoadingSkeleton({ variant = "card" }: LoadingSkeletonProps) {
  if (variant === "row") {
    return (
      <div className="bg-slate-900/80 rounded-lg p-4 flex gap-4 items-start overflow-hidden border border-slate-700/50">
        <div className="relative w-20 h-20 bg-slate-800 rounded flex-shrink-0">
          <Shimmer />
        </div>
        <div className="flex-grow space-y-2 flex-1">
          <div className="relative h-4 bg-slate-800 rounded w-1/2">
            <Shimmer />
          </div>
          <div className="relative h-3 bg-slate-800 rounded w-1/3">
            <Shimmer />
          </div>
        </div>
        <div className="relative w-20 h-10 bg-slate-800 rounded flex-shrink-0">
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
            <div className="relative w-full aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700/50">
              <Shimmer />
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-purple-500/30" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-purple-500/30" />
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="relative h-10 bg-slate-800 rounded w-3/4 overflow-hidden">
              <Shimmer />
            </div>
            <div className="relative h-5 bg-slate-800 rounded w-1/2 overflow-hidden">
              <Shimmer />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div key={i} className="relative h-20 bg-slate-800 rounded overflow-hidden border border-slate-700/50">
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
    <div className="bg-slate-900/80 rounded-lg overflow-hidden border border-slate-700/50">
      <div className="relative h-48 bg-slate-800 overflow-hidden">
        <Shimmer />
      </div>
      <div className="p-4 space-y-3">
        <div className="relative h-4 bg-slate-800 rounded w-2/3 overflow-hidden">
          <Shimmer />
        </div>
        <div className="relative h-3 bg-slate-800 rounded w-1/2 overflow-hidden">
          <Shimmer />
        </div>
        <div className="relative h-3 bg-slate-800 rounded w-1/3 overflow-hidden">
          <Shimmer />
        </div>
      </div>
    </div>
  )
}
