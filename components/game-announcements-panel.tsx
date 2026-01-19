'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Calendar, X } from 'lucide-react'
import Link from 'next/link'

interface UpcomingGame {
  id: number
  name: string
  background_image?: string
  released?: string
  rating?: number
  metacritic?: number
  genres?: Array<{ id: number; name: string }>
}

export function GameAnnouncementsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [games, setGames] = useState<UpcomingGame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  // For portal - only render on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchUpcomingGames = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/upcomingGames')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch upcoming games')
      }

      // Filter and sort by release date
      const upcoming = (data.games || [])
        .filter((game: any) => game.released)
        .sort((a: any, b: any) => new Date(a.released).getTime() - new Date(b.released).getTime())
        .slice(0, 15)

      setGames(upcoming)
      setUnreadCount(upcoming.length)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error('Error fetching upcoming games:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && games.length === 0) {
      fetchUpcomingGames()
    }
  }, [isOpen])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const getDaysUntilRelease = (dateStr: string) => {
    try {
      const releaseDate = new Date(dateStr)
      const today = new Date()
      const diffTime = releaseDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  const modalContent = (
    <>
      {/* Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-[9998]"
          />
        )}
      </AnimatePresence>

      {/* Panel Content */}
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
              className="bg-slate-900/95 backdrop-blur-sm border border-orange-500/50 rounded-xl shadow-[0_0_40px_rgba(249,115,22,0.2)] max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-orange-500" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-orange-500" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-orange-500" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-500" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-orange-500/30 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Bell className="text-orange-400" size={24} />
                  <h2 className="text-lg font-mono text-orange-400">// INCOMING TRANSMISSIONS</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-500/20 border border-transparent hover:border-red-500/50 rounded transition-colors"
                >
                  <X size={20} className="text-red-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-orange-400 font-mono">SCANNING FOR INCOMING DATA...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-red-400 mb-2 font-mono">// TRANSMISSION ERROR</p>
                      <p className="text-slate-500 text-sm font-mono">{error}</p>
                    </div>
                  </div>
                ) : games.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-slate-500 font-mono">NO INCOMING TRANSMISSIONS</p>
                  </div>
                ) : (
                  <motion.div className="space-y-3">
                    {games.map((game, idx) => {
                      const daysUntil = getDaysUntilRelease(game.released || '')
                      const isComingSoon = daysUntil && daysUntil <= 30
                      const isReleased = daysUntil && daysUntil <= 0

                      return (
                        <motion.div
                          key={game.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Link href={`/game/${game.id}`} onClick={() => setIsOpen(false)}>
                            <div className="group relative bg-slate-800/50 hover:bg-orange-500/10 border border-slate-700/50 hover:border-orange-500/50 rounded-lg overflow-hidden transition-all cursor-pointer">
                              <div className="flex gap-4 p-4">
                                {/* Game Image */}
                                <div className="shrink-0 w-24 h-24">
                                  {game.background_image ? (
                                    <img
                                      src={game.background_image}
                                      alt={game.name}
                                      className="w-full h-full object-cover rounded border border-slate-700/50 group-hover:border-orange-500/50 group-hover:scale-105 transition-all duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500 font-mono">
                                      NO IMG
                                    </div>
                                  )}
                                </div>

                                {/* Game Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h3 className="font-medium text-slate-200 line-clamp-2 group-hover:text-orange-400 transition-colors">
                                        {game.name}
                                      </h3>
                                    </div>
                                    {isComingSoon && !isReleased && (
                                      <span className="shrink-0 px-2 py-1 bg-orange-500/20 border border-orange-500/50 text-orange-400 text-xs font-mono rounded">
                                        SOON
                                      </span>
                                    )}
                                    {isReleased && (
                                      <span className="shrink-0 px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-mono rounded">
                                        LIVE
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                    <div className="flex items-center gap-1 font-mono">
                                      <Calendar size={14} />
                                      <span>{formatDate(game.released || '')}</span>
                                    </div>
                                    {daysUntil && daysUntil > 0 && (
                                      <span className="text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-2 py-1 rounded font-mono">
                                        T-{daysUntil}D
                                      </span>
                                    )}
                                  </div>

                                  {/* Genres */}
                                  {game.genres && game.genres.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {game.genres.slice(0, 2).map((genre) => (
                                        <span
                                          key={genre.id}
                                          className="text-xs bg-slate-700/50 text-slate-400 px-2 py-1 rounded font-mono"
                                        >
                                          {genre.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Rating */}
                                  {game.rating && (
                                    <div className="mt-2 text-sm font-mono">
                                      <span className="text-yellow-400">⭐ {game.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })}
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
      {/* Announcement Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-3 py-2 text-sm font-mono text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded transition-all"
        title="View game announcements and upcoming releases"
      >
        <Bell size={16} className="text-orange-400" />
        <span className="hidden sm:inline">TRANSMIT</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-red-400/50 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Render modal in portal to escape parent z-index context */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  )
}

export default GameAnnouncementsPanel
