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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
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
              className="relative bg-slate-900/95 rounded-lg shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-orange-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500" />
              
              {/* Scan effect */}
              <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent animate-[scanline_3s_linear_infinite]" />
              </div>

              {/* Header */}
              <div className="relative flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/80">
                <div className="flex items-center gap-3">
                  <Flame className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]" size={24} />
                  <h2 className="text-2xl font-bold text-white font-mono">
                    <span className="text-orange-400">//</span> TRENDING TARGETS
                  </h2>
                  <span className="text-sm text-slate-500 font-mono">TOP RATED</span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-800 rounded border border-slate-700 hover:border-orange-500/50 transition-all"
                >
                  <X size={20} className="text-slate-400 hover:text-orange-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-2 border-slate-700 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-slate-400 font-mono">SCANNING TRENDING...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-red-400 mb-2 font-mono">SCAN ERROR</p>
                      <p className="text-slate-500 text-sm">{error}</p>
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
                        whileHover={{ scale: 1.03 }}
                      >
                        <button
                          onClick={() => handleGameClick(game.id)}
                          className="group relative bg-slate-800 rounded-lg overflow-hidden cursor-pointer h-40 w-full border border-slate-700/50 hover:border-orange-500/50 transition-all"
                        >
                          {/* Game Image */}
                          {game.background_image ? (
                            <img
                              src={game.background_image}
                              alt={game.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                              NO IMAGE
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          {/* Scan overlay */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 animate-[scanline_2s_linear_infinite] transition-opacity" />

                          {/* Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <h3 className="font-bold text-sm line-clamp-2 font-mono">{game.name}</h3>
                            {game.rating && <p className="text-xs text-yellow-400 mt-1 font-mono">⭐ {game.rating.toFixed(1)}</p>}
                          </div>

                          {/* Rank Badge */}
                          <div className="absolute top-2 left-2 bg-orange-500/90 text-white px-2 py-1 rounded text-xs font-mono font-bold shadow-lg border border-orange-400/50">
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
        className="flex items-center gap-2 px-3 py-2 text-sm font-mono text-slate-400 hover:text-orange-400 hover:bg-slate-800/50 rounded border border-transparent hover:border-orange-500/30 transition-all"
        title="View trending games"
      >
        <Flame size={18} className="text-orange-500" />
        <span className="hidden sm:inline">TRENDING</span>
      </button>

      {/* Render modal in portal to escape parent z-index context */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  )
}

export default TrendingGamesModal
