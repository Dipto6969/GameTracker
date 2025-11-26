"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import SearchInput from "@/components/search-input"
import GameSearchResult from "@/components/game-search-result"
import LoadingSkeleton from "@/components/loading-skeleton"
import { useToast } from "@/lib/toast-context"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [minimumLoadingComplete, setMinimumLoadingComplete] = useState(false)
  const { data: results, isLoading, error } = useSWR(query ? `/api/search?q=${encodeURIComponent(query)}` : null, fetcher, {
    dedupingInterval: 300,
  })
  const { addToast } = useToast()

  // Show loading state for minimum 1.5 seconds to avoid flickering
  useEffect(() => {
    if (isLoading) {
      setMinimumLoadingComplete(false)
      const timer = setTimeout(() => setMinimumLoadingComplete(true), 1500)
      return () => clearTimeout(timer)
    } else {
      setMinimumLoadingComplete(true)
    }
  }, [isLoading])

  const shouldShowLoading = isLoading && !minimumLoadingComplete

  const handleAddGame = useCallback(
    async (game: any) => {
      try {
        const response = await fetch("/api/addGame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(game),
        })

        if (response.ok) {
          addToast(`${game.name} added to your library!`, "success", 2000)
          // Dispatch custom event to notify the home page to refresh
          window.dispatchEvent(new Event("game-added"))
        } else {
          addToast("Failed to add game", "error")
        }
      } catch (error) {
        addToast("Failed to add game. Please try again.", "error")
      }
    },
    [addToast]
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Search Games</h2>
        <p className="text-slate-600 dark:text-slate-400">Find and add games to your library from RAWG's database</p>
      </div>

      <SearchInput value={query} onChange={setQuery} />

      {!query && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-12 text-center border border-blue-200 dark:border-blue-900"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-lg"
          >
            🔍 Start typing to search for games...
          </motion.p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {shouldShowLoading && query && (
          <motion.div
            key="loading"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="grid gap-4"
          >
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} variants={itemVariants}>
                <LoadingSkeleton variant="row" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!shouldShowLoading && results && results.length === 0 && query && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-slate-100 dark:bg-neutral-800 rounded-lg p-8 text-center border border-slate-200 dark:border-neutral-700"
          >
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-slate-600 dark:text-slate-400">
              No games found matching "<span className="font-semibold">{query}</span>"
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Try a different search term</p>
          </motion.div>
        )}

        {!shouldShowLoading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-100 dark:bg-red-950 rounded-lg p-8 text-center border border-red-200 dark:border-red-900"
          >
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-700 dark:text-red-300">
              Something went wrong while searching
            </p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">Please try again</p>
          </motion.div>
        )}

        {!shouldShowLoading && results && results.length > 0 && (
          <motion.div
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-slate-600 dark:text-slate-400 font-medium"
            >
              Found {results.length} game{results.length !== 1 ? "s" : ""}
            </motion.p>
            {results.map((game: any, index: number) => (
              <motion.div key={game.id} variants={itemVariants} custom={index}>
                <GameSearchResult game={game} onAdd={() => handleAddGame(game)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
