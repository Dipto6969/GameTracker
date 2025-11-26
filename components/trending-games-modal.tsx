'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Flame } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TrendingGame {
  id: number
  name: string
  background_image?: string
  rating?: number
  released?: string
  genres?: Array<{ id: number; name: string }>
}

export function TrendingGamesModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [games, setGames] = useState<TrendingGame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // For portal - only render on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchTrendingGames = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/popularGames')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch trending games')
      }

      // Get top 20 trending games
      const trending = (data.games || []).slice(0, 20)
      setGames(trending)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error('Error fetching trending games:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    if (games.length === 0) {
      fetchTrendingGames()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleGameClick = (gameId: number) => {
    handleClose()
    router.push(`/game/${gameId}`)
  }

  // Close modal when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      handleClose()
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const modalContent = (
    <>
      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-[9998]"
          />
        )}
      </AnimatePresence>

      {/* Modal Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div 
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900">
                <div className="flex items-center gap-3">
                  <Flame className="text-orange-500" size={24} />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trending Games</h2>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Top Rated</span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-slate-200 dark:border-neutral-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">Loading trending games...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-red-600 dark:text-red-400 mb-2">Error loading games</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                  >
                    {games.map((game, idx) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <button
                          onClick={() => handleGameClick(game.id)}
                          className="group relative bg-slate-100 dark:bg-neutral-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all h-40 w-full"
                        >
                          {/* Game Image */}
                          {game.background_image ? (
                            <img
                              src={game.background_image}
                              alt={game.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              No image
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <h3 className="font-semibold text-sm line-clamp-2">{game.name}</h3>
                            {game.rating && <p className="text-xs text-yellow-300 mt-1">⭐ {game.rating.toFixed(1)}</p>}
                          </div>

                          {/* Rank Badge */}
                          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            #{idx + 1}
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return (
    <>
      {/* Trending Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        title="View trending games"
      >
        <Flame size={18} className="text-orange-500" />
        <span className="hidden sm:inline">Trending</span>
      </button>

      {/* Render modal in portal to escape parent z-index context */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  )
}

export default TrendingGamesModal
