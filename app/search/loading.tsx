export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-green-500/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
        </div>
        <p className="text-green-400 font-mono text-sm animate-pulse">SCANNING DATABASE...</p>
      </div>
    </div>
  )
}
