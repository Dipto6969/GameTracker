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
      {/* SVG Illustration */}
      <svg className="w-32 h-32 mb-6 text-slate-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.753 2 16.253s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z" />
      </svg>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">No Games Yet</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-sm">
        Start building your game collection! Search for your favorite games and add them to your library.
      </p>

      <Link href="/search">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          🔍 Search Games
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
      {/* SVG Illustration */}
      <svg className="w-32 h-32 mb-6 text-slate-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">No Results Found</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-sm">
        Try searching with different keywords or browse popular titles.
      </p>

      <p className="text-sm text-slate-500 dark:text-slate-500">
        💡 Tip: Use keyboard shortcut <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-neutral-700 rounded text-xs">/</kbd> to search
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
      {/* SVG Illustration */}
      <svg className="w-32 h-32 mb-6 text-slate-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">No Games Match</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-sm">
        Try adjusting your filters to see more games.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClear}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
      >
        Clear Filters
      </motion.button>
    </motion.div>
  )
}
