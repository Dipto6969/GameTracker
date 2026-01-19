'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Play, Pause, Volume2, VolumeX, Plus, ExternalLink, 
  Clock, Star, Trophy, Users, Calendar, Monitor, Gamepad2,
  Shield, Tag, ChevronLeft, ChevronRight, Loader2, Check
} from 'lucide-react'

interface GameDetails {
  id: number
  name: string
  slug: string
  description: string
  released: string
  background_image: string
  background_image_additional: string
  rating: number
  rating_top: number
  ratings_count: number
  metacritic: number
  playtime: number
  achievements_count: number
  developers: string[]
  publishers: string[]
  platforms: Array<{
    name: string
    slug: string
    released_at: string
    requirements?: { minimum?: string; recommended?: string }
  }>
  genres: string[]
  tags: string[]
  esrb_rating: string | null
  stores: Array<{ name: string; slug: string; url: string }>
  website: string
  clip: { video: string; preview: string } | null
  movies: Array<{ id: number; name: string; preview: string; video_480: string; video_max: string }>
  screenshots: string[]
  game_series_count: number
}

interface GameQuickViewModalProps {
  gameId: number | string
  isOpen: boolean
  onClose: () => void
  onAddToLibrary?: (game: any) => void
  isInLibrary?: boolean
}

export default function GameQuickViewModal({
  gameId,
  isOpen,
  onClose,
  onAddToLibrary,
  isInLibrary = false
}: GameQuickViewModalProps) {
  const [game, setGame] = useState<GameDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [currentScreenshot, setCurrentScreenshot] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(isInLibrary)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setAdded(isInLibrary)
  }, [isInLibrary])

  useEffect(() => {
    if (isOpen && gameId) {
      fetchGameDetails()
      setShowVideo(false)
    }
    
    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current)
      }
    }
  }, [isOpen, gameId])

  // Auto-play video after 3 seconds of showing image (like Amazon)
  useEffect(() => {
    if (game && (game.movies?.[0]?.video_max || game.clip?.video) && !showVideo) {
      imageTimerRef.current = setTimeout(() => {
        setShowVideo(true)
      }, 3000) // Show image for 3 seconds, then switch to video
    }
    
    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current)
      }
    }
  }, [game, showVideo])

  // Auto-play video when showVideo becomes true
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
      setIsVideoPlaying(true)
    }
  }, [showVideo])

  const fetchGameDetails = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/gameDetails/${gameId}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch game details')
      }
      
      let gameData = data.game
      
      // If no RAWG video, try YouTube fallback
      const hasRawgVideo = gameData?.movies?.length > 0 || gameData?.clip?.video
      if (!hasRawgVideo && gameData?.name) {
        console.log('[Quick View] No RAWG video, trying YouTube fallback for:', gameData.name)
        try {
          const ytRes = await fetch(`/api/youtube/search?game=${encodeURIComponent(gameData.name)}`)
          if (ytRes.ok) {
            const ytData = await ytRes.json()
            if (ytData.success && ytData.videoUrl) {
              console.log('[Quick View] YouTube video found:', ytData.videoUrl)
              // Add YouTube video to game data
              if (!gameData.movies) gameData.movies = []
              gameData.movies.unshift({
                id: 'youtube',
                name: 'Official Trailer',
                preview: '',
                video_480: ytData.videoUrl,
                video_max: ytData.videoUrl
              })
            }
          }
        } catch (ytErr) {
          console.log('[Quick View] YouTube fallback error:', ytErr)
        }
      }
      
      setGame(gameData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToLibrary = async () => {
    if (!game || added || isAdding) return
    
    setIsAdding(true)
    try {
      const gameToAdd = {
        id: game.id,
        name: game.name,
        background_image: game.background_image,
        rating: game.rating,
        released: game.released,
        genres: game.genres.map((name, idx) => ({ id: idx, name })),
        platforms: game.platforms.map((p, idx) => ({ platform: { id: idx, name: p.name } })),
        metacritic: game.metacritic
      }
      
      if (onAddToLibrary) {
        await onAddToLibrary(gameToAdd)
      } else {
        const response = await fetch('/api/addGame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game: gameToAdd })
        })
        
        if (!response.ok) throw new Error('Failed to add game')
      }
      
      setAdded(true)
    } catch (err) {
      console.error('Error adding game:', err)
    } finally {
      setIsAdding(false)
    }
  }

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const nextScreenshot = () => {
    if (game?.screenshots) {
      setCurrentScreenshot((prev) => (prev + 1) % game.screenshots.length)
    }
  }

  const prevScreenshot = () => {
    if (game?.screenshots) {
      setCurrentScreenshot((prev) => (prev - 1 + game.screenshots.length) % game.screenshots.length)
    }
  }

  const getStoreIcon = (slug: string) => {
    switch (slug) {
      case 'steam': return '🎮'
      case 'playstation-store': return '🎮'
      case 'xbox-store': return '🎮'
      case 'nintendo': return '🎮'
      case 'epic-games': return '🎮'
      case 'gog': return '🎮'
      default: return '🛒'
    }
  }

  const getESRBColor = (rating: string | null) => {
    switch (rating) {
      case 'Everyone': return 'text-green-400 border-green-500/50'
      case 'Everyone 10+': return 'text-green-400 border-green-500/50'
      case 'Teen': return 'text-yellow-400 border-yellow-500/50'
      case 'Mature': return 'text-orange-400 border-orange-500/50'
      case 'Adults Only': return 'text-red-400 border-red-500/50'
      default: return 'text-slate-400 border-slate-500/50'
    }
  }

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[9999] flex items-start justify-center overflow-hidden"
          >
            <div className="relative w-full max-w-4xl max-h-full bg-slate-900/98 border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)]">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 z-10" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500 z-10" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500 z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 z-10" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 bg-slate-800/80 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 rounded transition-colors"
              >
                <X className="w-5 h-5 text-red-400" />
              </button>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-cyan-400 font-mono animate-pulse">LOADING TARGET DATA...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                      <p className="text-red-400 font-mono mb-2">// ERROR</p>
                      <p className="text-slate-500">{error}</p>
                    </div>
                  </div>
                ) : game ? (
                  <div className="pb-8">
                    {/* Hero Section with Video/Image - Amazon style auto-play */}
                    <div className="relative h-72 md:h-96 overflow-hidden bg-slate-900">
                      {/* Background Image - always present */}
                      <img
                        src={game.background_image}
                        alt={game.name}
                        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
                      />
                      
                      {/* Video - fades in after 3 seconds */}
                      {(game.movies?.[0]?.video_max || game.clip?.video) && (
                        (game.movies?.[0]?.video_max?.includes('youtube.com') || game.clip?.video?.includes('youtube.com')) ? (
                          <iframe
                            src={game.movies?.[0]?.video_max || game.clip?.video}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            ref={videoRef}
                            src={game.movies?.[0]?.video_max || game.clip?.video}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                            muted={isMuted}
                            loop
                            playsInline
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                          />
                        )
                      )}
                      
                      {/* Video controls - only show when video is available */}
                      {(game.movies?.[0]?.video_max || game.clip?.video) && (
                        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                          <button
                            onClick={toggleVideo}
                            className="p-2 bg-slate-900/80 hover:bg-cyan-500/20 border border-cyan-500/50 rounded transition-colors"
                          >
                            {isVideoPlaying ? (
                              <Pause className="w-5 h-5 text-cyan-400" />
                            ) : (
                              <Play className="w-5 h-5 text-cyan-400" />
                            )}
                          </button>
                          <button
                            onClick={toggleMute}
                            className="p-2 bg-slate-900/80 hover:bg-cyan-500/20 border border-cyan-500/50 rounded transition-colors"
                          >
                            {isMuted ? (
                              <VolumeX className="w-5 h-5 text-cyan-400" />
                            ) : (
                              <Volume2 className="w-5 h-5 text-cyan-400" />
                            )}
                          </button>
                        </div>
                      )}
                      
                      {/* Video/Image label */}
                      {(game.movies?.[0]?.video_max || game.clip?.video) && (
                        <div className={`absolute top-4 left-4 px-3 py-1 text-white text-xs font-mono rounded border transition-all z-10 ${
                          showVideo 
                            ? 'bg-red-500/90 border-red-400/50' 
                            : 'bg-slate-900/80 border-slate-600/50'
                        }`}>
                          {showVideo ? '▶ TRAILER' : '🖼 IMAGE'}
                        </div>
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent pointer-events-none" />
                      
                      {/* Title overlay */}
                      <div className="absolute bottom-4 left-6 right-6 z-10">
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 drop-shadow-lg">{game.name}</h2>
                        <div className="flex flex-wrap gap-2">
                          {game.genres.slice(0, 4).map((genre, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs font-mono rounded">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="px-6 py-4 bg-slate-800/50 border-y border-slate-700/50 grid grid-cols-2 md:grid-cols-5 gap-4">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-lg font-bold text-yellow-400">{game.rating?.toFixed(1) || 'N/A'}</p>
                          <p className="text-xs text-slate-500 font-mono">RATING</p>
                        </div>
                      </div>
                      
                      {/* Metacritic */}
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                          game.metacritic >= 75 ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                          game.metacritic >= 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                          'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}>
                          {game.metacritic || '?'}
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-mono">METACRITIC</p>
                        </div>
                      </div>
                      
                      {/* Playtime */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-lg font-bold text-cyan-400">{game.playtime || '?'}h</p>
                          <p className="text-xs text-slate-500 font-mono">PLAYTIME</p>
                        </div>
                      </div>
                      
                      {/* Achievements */}
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-lg font-bold text-orange-400">{game.achievements_count || 0}</p>
                          <p className="text-xs text-slate-500 font-mono">ACHIEVEMENTS</p>
                        </div>
                      </div>
                      
                      {/* Reviews */}
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-lg font-bold text-purple-400">{(game.ratings_count / 1000).toFixed(1)}K</p>
                          <p className="text-xs text-slate-500 font-mono">REVIEWS</p>
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-6 py-6 space-y-6">
                      {/* Add to Library Button */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddToLibrary}
                          disabled={added || isAdding}
                          className={`flex-1 py-3 px-6 rounded font-mono font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            added
                              ? 'bg-green-500/20 border border-green-500/50 text-green-400 cursor-default'
                              : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                          }`}
                        >
                          {isAdding ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              ADDING...
                            </>
                          ) : added ? (
                            <>
                              <Check className="w-5 h-5" />
                              IN LIBRARY
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              ADD TO LIBRARY
                            </>
                          )}
                        </button>
                        
                        {game.website && (
                          <a
                            href={game.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded font-mono text-sm text-slate-300 transition-colors flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            WEBSITE
                          </a>
                        )}
                      </div>

                      {/* Developer/Publisher & Release */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 rounded p-4 border border-slate-700/50">
                          <p className="text-xs text-purple-400 font-mono mb-1">// DEVELOPER</p>
                          <p className="text-white font-medium">{game.developers?.join(', ') || 'Unknown'}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded p-4 border border-slate-700/50">
                          <p className="text-xs text-cyan-400 font-mono mb-1">// PUBLISHER</p>
                          <p className="text-white font-medium">{game.publishers?.join(', ') || 'Unknown'}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded p-4 border border-slate-700/50">
                          <p className="text-xs text-green-400 font-mono mb-1">// RELEASE DATE</p>
                          <p className="text-white font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-400" />
                            {game.released ? new Date(game.released).toLocaleDateString('en-US', { 
                              year: 'numeric', month: 'long', day: 'numeric' 
                            }) : 'TBA'}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="relative bg-slate-800/30 rounded-lg p-5 border border-slate-700/50">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500/50" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500/50" />
                        <p className="text-xs text-cyan-400 font-mono mb-3">// DESCRIPTION</p>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                          {game.description || 'No description available.'}
                        </p>
                      </div>

                      {/* Screenshots Gallery */}
                      {game.screenshots?.length > 0 && (
                        <div>
                          <p className="text-xs text-pink-400 font-mono mb-3">// SCREENSHOTS</p>
                          <div className="relative">
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700/50">
                              <img
                                src={game.screenshots[currentScreenshot]}
                                alt={`Screenshot ${currentScreenshot + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* Navigation */}
                              {game.screenshots.length > 1 && (
                                <>
                                  <button
                                    onClick={prevScreenshot}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-purple-500/20 border border-purple-500/50 rounded transition-colors"
                                  >
                                    <ChevronLeft className="w-5 h-5 text-purple-400" />
                                  </button>
                                  <button
                                    onClick={nextScreenshot}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-purple-500/20 border border-purple-500/50 rounded transition-colors"
                                  >
                                    <ChevronRight className="w-5 h-5 text-purple-400" />
                                  </button>
                                </>
                              )}
                              {/* Counter */}
                              <div className="absolute bottom-2 right-2 px-3 py-1 bg-slate-900/80 text-pink-400 text-xs font-mono rounded border border-pink-500/30">
                                {currentScreenshot + 1} / {game.screenshots.length}
                              </div>
                            </div>
                            {/* Thumbnails */}
                            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                              {game.screenshots.slice(0, 6).map((screenshot, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentScreenshot(idx)}
                                  className={`flex-shrink-0 w-20 h-12 rounded overflow-hidden border-2 transition-all ${
                                    idx === currentScreenshot
                                      ? 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                                      : 'border-slate-700 hover:border-slate-500'
                                  }`}
                                >
                                  <img src={screenshot} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Platforms */}
                      <div>
                        <p className="text-xs text-green-400 font-mono mb-3">// PLATFORMS</p>
                        <div className="flex flex-wrap gap-2">
                          {game.platforms.map((platform, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-slate-800/50 border border-green-500/30 text-green-400 text-sm font-mono rounded flex items-center gap-2"
                            >
                              {platform.slug.includes('pc') ? <Monitor className="w-4 h-4" /> : 
                               platform.slug.includes('playstation') || platform.slug.includes('xbox') ? <Gamepad2 className="w-4 h-4" /> :
                               <Gamepad2 className="w-4 h-4" />}
                              {platform.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ESRB Rating */}
                      {game.esrb_rating && (
                        <div>
                          <p className="text-xs text-orange-400 font-mono mb-3">// ESRB RATING</p>
                          <span className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border rounded font-mono ${getESRBColor(game.esrb_rating)}`}>
                            <Shield className="w-5 h-5" />
                            {game.esrb_rating}
                          </span>
                        </div>
                      )}

                      {/* Tags */}
                      {game.tags?.length > 0 && (
                        <div>
                          <p className="text-xs text-yellow-400 font-mono mb-3">// TAGS</p>
                          <div className="flex flex-wrap gap-2">
                            {game.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono rounded flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Where to Buy */}
                      {game.stores?.length > 0 && (
                        <div>
                          <p className="text-xs text-blue-400 font-mono mb-3">// WHERE TO BUY</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {game.stores.map((store, idx) => (
                              <a
                                key={idx}
                                href={store.url?.startsWith('http') ? store.url : `https://${store.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-slate-800/50 hover:bg-blue-500/10 border border-slate-700/50 hover:border-blue-500/50 rounded font-mono text-sm text-slate-300 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                              >
                                {getStoreIcon(store.slug)} {store.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Series Info */}
                      {game.game_series_count > 1 && (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded p-4">
                          <p className="text-purple-400 font-mono text-sm">
                            ⚡ This game is part of a series with <strong>{game.game_series_count}</strong> games
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
