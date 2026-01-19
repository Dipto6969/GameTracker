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
      {/* Header */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-green-500 to-transparent" />
        <p className="text-green-400 font-mono text-sm tracking-[0.3em] uppercase mb-2">// TARGET SCANNER</p>
        <h2 className="text-3xl font-bold text-white mb-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
            ACQUIRE NEW TARGETS
          </span>
        </h2>
        <p className="text-slate-400 font-light">Scan RAWG's database and add games to your arsenal</p>
      </div>

      <SearchInput value={query} onChange={setQuery} />

      {!query && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          {/* Animated border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-green-500/30 rounded-lg opacity-50 group-hover:opacity-75 blur-sm transition duration-500" />
          
          <div className="relative bg-slate-900/80 rounded-lg p-12 text-center border border-green-500/30 backdrop-blur-sm">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-500/70" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-green-500/70" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-green-500/70" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-500/70" />
            
            {/* Scan animation */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-[scanline_3s_linear_infinite]" />
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="text-5xl mb-4 filter drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">🔍</div>
              <p className="text-green-400 text-lg font-mono">
                SCANNER READY
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Enter target name to begin scan...
              </p>
            </motion.div>
          </div>
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
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-mono text-sm">SCANNING DATABASE...</span>
            </div>
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
            className="relative bg-slate-900/80 rounded-lg p-8 text-center border border-red-500/30"
          >
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/50" />
            
            <div className="text-4xl mb-4">🚫</div>
            <p className="text-red-400 font-mono">
              NO TARGETS FOUND
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Query: "<span className="text-red-300">{query}</span>" returned zero results
            </p>
            <p className="text-slate-600 text-xs mt-1">Try a different search term</p>
          </motion.div>
        )}

        {!shouldShowLoading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative bg-slate-900/80 rounded-lg p-8 text-center border border-red-500/50"
          >
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400 font-mono font-bold">
              SCAN ERROR
            </p>
            <p className="text-red-300 text-sm mt-2">Connection to database failed</p>
            <p className="text-slate-500 text-xs mt-1">Please try again</p>
          </motion.div>
        )}

        {!shouldShowLoading && results && results.length > 0 && (
          <motion.div
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-400 font-mono text-sm">
                SCAN COMPLETE • {results.length} TARGET{results.length !== 1 ? "S" : ""} LOCATED
              </span>
            </motion.div>
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
