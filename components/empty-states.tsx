'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function EmptyLibraryState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Cyberpunk Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative text-8xl filter drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">🎮</div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2 font-mono">
        <span className="text-purple-400">//</span> ARSENAL EMPTY
      </h2>
      <p className="text-slate-400 mb-8 text-center max-w-sm font-light">
        Start building your game collection. Scan for targets and add them to your arsenal.
      </p>

      <Link href="/search">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded opacity-70 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative px-6 py-3 bg-slate-900 rounded font-mono text-white border border-purple-500/30">
            🔍 INITIATE SCAN
          </div>
        </motion.button>
      </Link>
    </motion.div>
  )
}

export function EmptySearchState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Cyberpunk Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
        <div className="relative text-8xl filter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">🚫</div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2 font-mono">
        <span className="text-red-400">//</span> NO TARGETS FOUND
      </h2>
      <p className="text-slate-400 mb-6 text-center max-w-sm font-light">
        Scanner returned zero results. Try different keywords or browse trending targets.
      </p>

      <p className="text-sm text-slate-500 font-mono">
        💡 Hotkey: <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-purple-400">/</kbd> to focus scanner
      </p>
    </motion.div>
  )
}

export function EmptyFilteredState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Cyberpunk Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl" />
        <div className="relative text-8xl filter drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">🔎</div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2 font-mono">
        <span className="text-yellow-400">//</span> FILTER MISMATCH
      </h2>
      <p className="text-slate-400 mb-8 text-center max-w-sm font-light">
        No games match current filter criteria. Adjust parameters to expand results.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClear}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded opacity-70 group-hover:opacity-100 blur transition duration-300" />
        <div className="relative px-6 py-3 bg-slate-900 rounded font-mono text-white border border-yellow-500/30">
          RESET FILTERS
        </div>
      </motion.button>
    </motion.div>
  )
}
