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
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900">
                <div className="flex items-center gap-3">
                  <Bell className="text-blue-500" size={24} />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Game Announcements</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
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
                      <p className="text-slate-600 dark:text-slate-400">Loading upcoming games...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-red-600 dark:text-red-400 mb-2">Error loading announcements</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
                    </div>
                  </div>
                ) : games.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-slate-600 dark:text-slate-400">No upcoming games at this time</p>
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
                            <div className="group relative bg-slate-50 dark:bg-neutral-700/50 hover:bg-slate-100 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-lg overflow-hidden transition-all cursor-pointer">
                              <div className="flex gap-4 p-4">
                                {/* Game Image */}
                                <div className="shrink-0 w-24 h-24">
                                  {game.background_image ? (
                                    <img
                                      src={game.background_image}
                                      alt={game.name}
                                      className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-slate-200 dark:bg-neutral-600 rounded flex items-center justify-center text-xs">
                                      No image
                                    </div>
                                  )}
                                </div>

                                {/* Game Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {game.name}
                                      </h3>
                                    </div>
                                    {isComingSoon && !isReleased && (
                                      <span className="shrink-0 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded">
                                        Soon
                                      </span>
                                    )}
                                    {isReleased && (
                                      <span className="shrink-0 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                                        Out Now
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center gap-1">
                                      <Calendar size={16} />
                                      <span>{formatDate(game.released || '')}</span>
                                    </div>
                                    {daysUntil && daysUntil > 0 && (
                                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                        {daysUntil} day{daysUntil !== 1 ? 's' : ''} away
                                      </span>
                                    )}
                                  </div>

                                  {/* Genres */}
                                  {game.genres && game.genres.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {game.genres.slice(0, 2).map((genre) => (
                                        <span
                                          key={genre.id}
                                          className="text-xs bg-slate-200 dark:bg-neutral-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                                        >
                                          {genre.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Rating */}
                                  {game.rating && (
                                    <div className="mt-2 text-sm">
                                      <span className="text-yellow-500">⭐ {game.rating.toFixed(1)}</span>
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
        className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        title="View game announcements and upcoming releases"
      >
        <Bell size={18} className="text-blue-500" />
        <span className="hidden sm:inline">Announcements</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
