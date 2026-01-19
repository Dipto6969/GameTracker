"use client"

import { getGameById, getAllGames } from "@/lib/kv"
import { getGameById as getRawgGameById } from "@/lib/rawg"
import Link from "next/link"
import React, { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import GameStatusEditor from "@/components/game-status-editor"
import NotesEditor from "@/components/notes-editor"
import LoadingSkeleton from "@/components/loading-skeleton"
import SimilarGamesSection from "@/components/similar-games-section"
import ScreenshotUploader from "@/components/screenshot-uploader"
import ScreenshotGallery from "@/components/screenshot-gallery"
import { useToast } from "@/lib/toast-context"
import { useSimilarGames } from "@/hooks/use-similar-games"
import { Star, Clock, Trophy, Monitor, ShoppingCart, Globe, Volume2, VolumeX, ExternalLink } from "lucide-react"

interface GameData {
  _id: string
  id: number
  name: string
  background_image?: string
  released?: string
  rating?: number
  metacritic?: number
  description?: string
  genres?: Array<{ id: number; name: string }>
  status?: string
  isFavorite?: boolean
  userRating?: number
  notes?: string
  tags?: string[]
  hoursPlayed?: number
  screenshots?: string[]
  // Extended RAWG data
  playtime?: number
  achievements_count?: number
  developers?: Array<{ id: number; name: string }>
  publishers?: Array<{ id: number; name: string }>
  platforms?: Array<{ 
    platform: { id: number; name: string; slug: string }
    requirements?: { minimum?: string; recommended?: string }
  }>
  esrb_rating?: { id: number; name: string; slug: string }
  rawgTags?: Array<{ id: number; name: string; slug: string }>
  stores?: Array<{ id: number; store: { id: number; name: string; slug: string }; url?: string }>
  website?: string
  movies?: Array<{ id: number; name: string; preview: string; data: { 480?: string; max?: string } }>
  clip?: { clip: string; video: string }
  rawgScreenshots?: Array<{ id: number; image: string }>
}

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [game, setGame] = useState<GameData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingFailed, setLoadingFailed] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "status" | "notes" | "screenshots">("overview")
  const [similarGames, setSimilarGames] = useState<any[]>([])
  const [showVideo, setShowVideo] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const { addToast } = useToast()
  const { findSimilarGames, fetchPopularGames, isLoading: popularGamesLoading } = useSimilarGames()
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadGame = async () => {
      setIsLoading(true)
      setLoadingFailed(false)
      
      try {
        const { id } = await params
        // Get user data from KV (status, notes, tags, etc.)
        const storedGame = await getGameById(id)
        // Get full game data from RAWG (description, full details)
        const rawgGame = await getRawgGameById(parseInt(id))
        
        // Fetch extended game details (trailers, developers, platforms, etc.)
        let extendedData: any = null
        try {
          const extRes = await fetch(`/api/gameDetails/${id}`)
          if (extRes.ok) {
            const apiResponse = await extRes.json()
            extendedData = apiResponse.game // API returns {success, game}
            console.log('Extended game data loaded:', {
              playtime: extendedData?.playtime,
              achievements: extendedData?.achievements_count,
              platforms: extendedData?.platforms?.length,
              movies: extendedData?.movies?.length,
              screenshots: extendedData?.screenshots?.length,
              stores: extendedData?.stores?.length,
              developers: extendedData?.developers,
              publishers: extendedData?.publishers
            })
            
            // If no RAWG video, try YouTube fallback
            const hasRawgVideo = extendedData?.movies?.length > 0 || extendedData?.clip?.video
            if (!hasRawgVideo && rawgGame?.name) {
              console.log('No RAWG video for game details, trying YouTube fallback...')
              try {
                const ytRes = await fetch(`/api/youtube/search?game=${encodeURIComponent(rawgGame.name)}`)
                if (ytRes.ok) {
                  const ytData = await ytRes.json()
                  if (ytData.success && ytData.videoUrl) {
                    console.log('YouTube video found for game details:', ytData.videoUrl)
                    // Add YouTube video to extended data
                    if (!extendedData.movies) extendedData.movies = []
                    extendedData.movies.unshift({
                      id: 'youtube',
                      name: 'Official Trailer',
                      preview: '',
                      video_480: ytData.videoUrl,
                      video_max: ytData.videoUrl
                    })
                  }
                }
              } catch (ytErr) {
                console.log('YouTube fallback error:', ytErr)
              }
            }
          } else {
            console.log('Extended data API returned non-OK status:', extRes.status)
          }
        } catch (e) {
          console.log('Extended data fetch error:', e)
        }

        if (isMounted && rawgGame) {
          // Merge: use RAWG data as base, overlay user data
          // Ensure tags are always strings (in case they get stored as objects)
          const userTags = Array.isArray(storedGame?.tags)
            ? storedGame.tags.filter((t: any) => typeof t === 'string')
            : []

          const mergedGame: GameData = {
            _id: storedGame?._id || id,
            id: rawgGame.id,
            name: rawgGame.name || storedGame?.name || "",
            background_image: rawgGame.background_image || storedGame?.background_image,
            released: rawgGame.released || storedGame?.released,
            rating: rawgGame.rating || storedGame?.rating,
            metacritic: rawgGame.metacritic || storedGame?.metacritic,
            description: extendedData?.description || rawgGame.description,
            genres: rawgGame.genres || storedGame?.genres,
            status: storedGame?.status,
            isFavorite: storedGame?.isFavorite || false,
            userRating: storedGame?.userRating,
            notes: storedGame?.notes,
            tags: userTags,
            hoursPlayed: storedGame?.hoursPlayed,
            screenshots: storedGame?.screenshots || [],
            // Extended data - fix structure mismatches
            playtime: extendedData?.playtime,
            achievements_count: extendedData?.achievements_count,
            developers: extendedData?.developers?.map((name: string, idx: number) => ({ id: idx, name })),
            publishers: extendedData?.publishers?.map((name: string, idx: number) => ({ id: idx, name })),
            platforms: extendedData?.platforms?.map((p: any, idx: number) => ({
              platform: { id: idx, name: p.name, slug: p.slug },
              requirements: p.requirements
            })),
            esrb_rating: extendedData?.esrb_rating ? { id: 0, name: extendedData.esrb_rating, slug: '' } : undefined,
            rawgTags: extendedData?.tags?.map((name: string, idx: number) => ({ id: idx, name, slug: '' })),
            stores: extendedData?.stores?.map((s: any, idx: number) => ({
              id: idx,
              store: { id: idx, name: s.name, slug: s.slug },
              url: s.url
            })),
            website: extendedData?.website,
            movies: extendedData?.movies?.map((m: any) => ({
              id: m.id,
              name: m.name,
              preview: m.preview,
              data: { '480': m.video_480, max: m.video_max }
            })),
            clip: extendedData?.clip ? {
              clip: extendedData.clip.video,
              video: extendedData.clip.video
            } : undefined,
            rawgScreenshots: extendedData?.screenshots?.map((img: string, idx: number) => ({
              id: idx,
              image: img
            })),
          }
          setGame(mergedGame)
          setIsLoading(false)
        } else if (isMounted && storedGame) {
          // Fallback to stored game if RAWG fails
          // Ensure tags are always strings
          const userTags = Array.isArray(storedGame.tags)
            ? storedGame.tags.filter((t: any) => typeof t === 'string')
            : []
          setGame({ ...storedGame, tags: userTags } as GameData)
          setIsLoading(false)
        } else if (isMounted) {
          // Neither RAWG nor stored game available - this is a real "not found"
          setLoadingFailed(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error loading game:", error)
        if (isMounted) {
          setLoadingFailed(true)
          setIsLoading(false)
        }
      }
    }

    loadGame()
    return () => {
      isMounted = false
    }
  }, [params])

  // Auto-play video after 3 seconds (Amazon-style)
  useEffect(() => {
    // Reset video state when game changes
    setShowVideo(false)
    setIsMuted(true)
    
    const hasVideo = game?.movies?.[0]?.data?.max || game?.movies?.[0]?.data?.["480"] || game?.clip?.video
    console.log('Video detection:', { hasVideo, movieCount: game?.movies?.length, hasClip: !!game?.clip })
    
    if (game && hasVideo) {
      imageTimerRef.current = setTimeout(() => {
        console.log('Auto-switching to video...')
        setShowVideo(true)
      }, 3000)
    }
    
    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current)
        imageTimerRef.current = null
      }
    }
  }, [game?.id]) // Only run when game ID changes

  // Auto-play when video becomes visible
  useEffect(() => {
    if (showVideo && videoRef.current) {
      console.log('Attempting to play video...')
      videoRef.current.play().catch((err) => {
        console.log('Video play failed:', err)
      })
    }
  }, [showVideo])

  // Load similar games from both collection and popular games
  useEffect(() => {
    let isMounted = true

    const loadSimilarGames = async () => {
      if (!game) return

      try {
        // Merge current game with RAWG data for proper matching
        const currentGameWithRawg = {
          ...game,
        }

        // Get all games from both sources
        const [libraryGames, popularGamesData] = await Promise.all([
          getAllGames(),
          fetchPopularGames()
        ])

        let allComparablGames: any[] = []

        // Process library games with full RAWG data
        if (libraryGames && libraryGames.length > 0) {
          const rawgGames = await Promise.all(
            libraryGames.map(async (g) => {
              try {
                const gameId = typeof g.id === 'number' ? g.id : parseInt(g.id as any)
                if (!isNaN(gameId)) {
                  const rawgData = await getRawgGameById(gameId)
                  return { ...g, ...rawgData, source: 'collection' as const }
                }
                return { ...g, source: 'collection' as const }
              } catch {
                return { ...g, source: 'collection' as const }
              }
            })
          )
          allComparablGames.push(...rawgGames)
        }

        // Add popular games (they already have full RAWG data)
        if (popularGamesData && popularGamesData.length > 0) {
          allComparablGames.push(...popularGamesData.slice(0, 100)) // Limit to prevent too many comparisons
        }

        if (isMounted && allComparablGames.length > 0) {
          // Find top 5 similar games from combined pool
          const similar = findSimilarGames(currentGameWithRawg as any, allComparablGames, 5)
          setSimilarGames(similar)
        }
      } catch (error) {
        console.error("Error loading similar games:", error)
      }
    }

    loadSimilarGames()
    return () => {
      isMounted = false
    }
  }, [game, findSimilarGames, fetchPopularGames])

  const handleUpdateStatus = async (updates: any) => {
    if (!game) return
    try {
      // Update the game in KV
      const response = await fetch(`/api/updateGame/${game._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        setGame({ ...game, ...updates })
        addToast("Game status updated!", "success")
      } else {
        addToast("Failed to update game", "error")
      }
    } catch (error) {
      addToast("Error updating game", "error")
      console.error(error)
    }
  }

  const handleSaveNotes = async (notes: string, tags: string[]) => {
    if (!game) return
    try {
      const response = await fetch(`/api/updateGame/${game._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, tags }),
      })

      if (response.ok) {
        setGame({ ...game, notes, tags })
        addToast("Review saved!", "success")
      } else {
        addToast("Failed to save review", "error")
      }
    } catch (error) {
      addToast("Error saving review", "error")
      console.error(error)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton variant="detail" />
  }

  if (loadingFailed || !game) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-xl" />
          <div className="relative text-6xl mb-4">🎮</div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 font-mono">TARGET NOT FOUND</h2>
        <p className="text-slate-400 mb-6">
          This target doesn't exist or couldn't be loaded.
        </p>
        <Link href="/" className="text-pink-400 hover:text-pink-300 font-mono transition-colors">
          ← RETURN TO BASE
        </Link>
      </motion.div>
    )
  }

  // Get video URL for background
  const videoUrl = game.movies?.[0]?.data?.max || game.movies?.[0]?.data?.["480"] || game.clip?.video
  const isYouTubeVideo = videoUrl?.includes('youtube.com')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-0"
    >
      {/* CINEMATIC HERO SECTION - Full Width Video Background */}
      <div className="relative -mx-2 md:-mx-8 lg:-mx-12 -mt-4">
        {/* Video/Image Background - Full Width */}
        <div className="relative w-[98%] h-[85vh] min-h-[380px] max-h-[580px] overflow-hidden">
          {/* Background Image - Always present */}
          <img
            src={game.background_image || "/placeholder.svg"}
            alt={game.name}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
          />
          
          {/* Video Background - Fades in after 3 seconds */}
          {videoUrl && (
            isYouTubeVideo ? (
              <iframe
                src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1`}
                className={`absolute inset-0 w-full h-full scale-150 transition-opacity duration-1000 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={videoUrl}
                muted={isMuted}
                loop
                playsInline
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
              />
            )
          )}
          
          {/* Gradient Overlays for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-transparent h-32" />
          
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none" />
          
          {/* Glowing Border at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
          
          {/* Video Controls - Top Right */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
            {/* Video/Image Toggle Label */}
            {videoUrl && (
              <div className={`px-3 py-1.5 text-white text-xs font-mono rounded border transition-all ${
                showVideo 
                  ? 'bg-red-500/80 border-red-400/50' 
                  : 'bg-slate-900/80 border-slate-600/50'
              }`}>
                {showVideo ? '▶ TRAILER' : '🖼 IMAGE'}
              </div>
            )}
            
            {/* Mute/Unmute Button */}
            {showVideo && videoUrl && !isYouTubeVideo && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 bg-slate-900/80 rounded-full border border-slate-600/50 hover:bg-slate-800 hover:border-pink-500/50 transition-all"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                )}
              </button>
            )}
          </div>
          
          {/* Back Button - Top Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-4 z-20"
          >
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-pink-400 hover:text-pink-300 text-sm font-mono transition-all rounded border border-slate-700/50 hover:border-pink-500/50 group backdrop-blur-sm"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              RETURN TO ARSENAL
            </Link>
          </motion.div>
          
          {/* Favorite Star */}
          {game.isFavorite && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] z-20"
            >
              ⭐
            </motion.div>
          )}
          
          {/* GAME INFO OVERLAY - Bottom Left */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12 z-10">
            <div className="max-w-4xl">
              {/* Title & Release */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-pink-400 font-mono text-sm tracking-[0.3em] uppercase mb-2 drop-shadow-lg">// TARGET PROFILE</p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">{game.name}</h1>
                {game.released && (
                  <p className="text-slate-300 font-mono text-sm mb-4 drop-shadow-lg">
                    RELEASE: {new Date(game.released).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
              </motion.div>
              
              {/* Developers & Publishers */}
              {(game.developers?.length || game.publishers?.length) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-4 text-sm mb-4"
                >
                  {game.developers && game.developers.length > 0 && (
                    <div className="backdrop-blur-sm bg-slate-900/40 px-3 py-1 rounded">
                      <span className="text-slate-400 font-mono">DEVELOPER: </span>
                      <span className="text-cyan-400">{game.developers.map(d => d.name).join(', ')}</span>
                    </div>
                  )}
                  {game.publishers && game.publishers.length > 0 && (
                    <div className="backdrop-blur-sm bg-slate-900/40 px-3 py-1 rounded">
                      <span className="text-slate-400 font-mono">PUBLISHER: </span>
                      <span className="text-purple-400">{game.publishers.map(p => p.name).join(', ')}</span>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3 mb-4"
              >
                {game.rating && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-sm rounded-lg border border-cyan-500/40">
                    <Star className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                    <span className="text-xl font-bold text-cyan-300">{game.rating.toFixed(1)}</span>
                    <span className="text-xs text-cyan-400 font-mono">RAWG</span>
                  </div>
                )}
                
                {game.playtime !== undefined && game.playtime > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-500/40">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span className="text-xl font-bold text-green-300">{game.playtime}h</span>
                    <span className="text-xs text-green-400 font-mono">AVG</span>
                  </div>
                )}
                
                {game.achievements_count !== undefined && game.achievements_count > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 backdrop-blur-sm rounded-lg border border-orange-500/40">
                    <Trophy className="w-5 h-5 text-orange-400" />
                    <span className="text-xl font-bold text-orange-300">{game.achievements_count}</span>
                    <span className="text-xs text-orange-400 font-mono">TROPHIES</span>
                  </div>
                )}
                
                {game.metacritic && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-500/40">
                    <span className="text-xl font-bold text-purple-300">{game.metacritic}</span>
                    <span className="text-xs text-purple-400 font-mono">METACRITIC</span>
                  </div>
                )}
                
                {game.userRating && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-lg border border-yellow-500/40">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-bold text-yellow-300">{game.userRating}/5</span>
                    <span className="text-xs text-yellow-400 font-mono">YOUR RATING</span>
                  </div>
                )}
              </motion.div>
              
              {/* Status Badge & Genres Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-3"
              >
                {/* Status Badge */}
                {game.status && (
                  <span
                    className={`px-4 py-2 rounded font-mono text-sm border backdrop-blur-sm ${
                      game.status === "playing"
                        ? "bg-green-500/30 text-green-300 border-green-500/50"
                        : game.status === "completed"
                          ? "bg-cyan-500/30 text-cyan-300 border-cyan-500/50"
                          : game.status === "backlog"
                            ? "bg-yellow-500/30 text-yellow-300 border-yellow-500/50"
                            : game.status === "dropped"
                              ? "bg-red-500/30 text-red-300 border-red-500/50"
                              : "bg-purple-500/30 text-purple-300 border-purple-500/50"
                    }`}
                  >
                    {game.status === "playing"
                      ? "▶ ACTIVE"
                      : game.status === "completed"
                        ? "✓ CONQUERED"
                        : game.status === "backlog"
                          ? "⏳ QUEUED"
                          : game.status === "dropped"
                            ? "✗ ABANDONED"
                            : "★ WATCHLIST"}
                  </span>
                )}
                
                {/* Genres */}
                {game.genres && game.genres.length > 0 && (
                  <>
                    <span className="text-slate-500">|</span>
                    <div className="flex flex-wrap gap-2">
                      {game.genres.slice(0, 4).map((genre: any) => (
                        <span
                          key={genre.id}
                          className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded border border-pink-500/40 text-sm font-mono backdrop-blur-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section - Below Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 px-4 md:px-8 lg:px-12"
      >
        <div className="flex border-b border-slate-700/50 mb-6 overflow-x-auto backdrop-blur-sm bg-slate-900/30 rounded-t-lg">
          {(["overview", "status", "notes", "screenshots"] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-mono text-sm transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "text-pink-400 border-b-2 border-pink-500 bg-pink-500/5"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              {tab === "overview" && "📖 DATA"}
              {tab === "status" && "🎮 STATUS"}
              {tab === "notes" && "📝 LOG"}
              {tab === "screenshots" && "📸 GALLERY"}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "status" && (
            <GameStatusEditor
              gameId={game._id}
              currentStatus={game.status}
              currentRating={game.userRating}
              currentFavorite={game.isFavorite}
              currentHoursPlayed={game.hoursPlayed}
              onSave={handleUpdateStatus}
            />
          )}

          {activeTab === "notes" && (
            <NotesEditor
              gameId={game._id}
              currentNotes={game.notes}
              currentTags={game.tags}
              onSave={handleSaveNotes}
            />
          )}

          {activeTab === "screenshots" && (
            <div className="space-y-6">
              <ScreenshotUploader
                gameId={game._id}
                existingScreenshots={game.screenshots}
                onUploadComplete={(newScreenshots) => {
                  setGame({ ...game, screenshots: newScreenshots })
                }}
              />
              {game.screenshots && game.screenshots.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Gallery</h3>
                  <ScreenshotGallery screenshots={game.screenshots} gameName={game.name} />
                </div>
              )}
            </div>
          )}

          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {game.description && (
                <div className="relative bg-slate-900/80 p-6 rounded-lg border border-pink-500/20">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pink-500/50" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-pink-500/50" />
                  
                  <h3 className="text-sm font-mono text-pink-400 mb-3">// INTEL REPORT</h3>
                  <div
                    className="text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: game.description }}
                  />
                </div>
              )}
              
              {/* RAWG Screenshots Gallery */}
              {game.rawgScreenshots && game.rawgScreenshots.length > 0 && (
                <div className="relative bg-slate-900/80 p-6 rounded-lg border border-cyan-500/20">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
                  
                  <h3 className="text-sm font-mono text-cyan-400 mb-4">// SCREENSHOTS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {game.rawgScreenshots.slice(0, 8).map((screenshot, idx) => (
                      <a 
                        key={screenshot.id} 
                        href={screenshot.image} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="relative aspect-video rounded overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-colors group"
                      >
                        <img 
                          src={screenshot.image} 
                          alt={`Screenshot ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Platforms */}
              {game.platforms && game.platforms.length > 0 && (
                <div className="relative bg-slate-900/80 p-6 rounded-lg border border-green-500/20">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500/50" />
                  
                  <h3 className="text-sm font-mono text-green-400 mb-3">// PLATFORMS</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.platforms.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-2 bg-green-500/10 text-green-300 rounded border border-green-500/30 text-sm font-mono flex items-center gap-2"
                      >
                        <Monitor className="w-4 h-4" />
                        {p.platform.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* ESRB Rating */}
              {game.esrb_rating && (
                <div className="relative bg-slate-900/80 p-6 rounded-lg border border-orange-500/20">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500/50" />
                  
                  <h3 className="text-sm font-mono text-orange-400 mb-3">// ESRB RATING</h3>
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-orange-500/10 rounded border border-orange-500/30">
                    <span className="text-2xl font-bold text-orange-300">{game.esrb_rating.name.charAt(0)}</span>
                    <span className="text-orange-300 font-mono">{game.esrb_rating.name}</span>
                  </div>
                </div>
              )}

              {game.genres && game.genres.length > 0 && (
                <div className="relative bg-slate-900/80 p-6 rounded-lg border border-purple-500/20">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500/50" />
                  
                  <h3 className="text-sm font-mono text-purple-400 mb-3">// GENRES</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.genres.map((genre: any) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/30 text-sm font-mono"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* RAWG Tags */}
              {game.rawgTags && game.rawgTags.length > 0 && (
                <div className="relative bg-slate-900/80 p-6 rounded-lg border border-slate-600/20">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-500/50" />
                  
                  <h3 className="text-sm font-mono text-slate-400 mb-3">// TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.rawgTags.slice(0, 15).map((tag: any) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs font-mono"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Stores */}
              {game.stores && game.stores.length > 0 && (
                <div className="relative bg-slate-900/80 p-6 rounded-lg border border-yellow-500/20">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500/50" />
                  
                  <h3 className="text-sm font-mono text-yellow-400 mb-3">// WHERE TO BUY</h3>
                  <div className="flex flex-wrap gap-3">
                    {game.stores.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url || `https://${s.store.slug}.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-yellow-500/10 text-yellow-300 rounded border border-yellow-500/30 text-sm font-mono hover:bg-yellow-500/20 hover:border-yellow-400/50 transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {s.store.name}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Website */}
              {game.website && (
                <div className="relative bg-slate-900/80 p-6 rounded-lg border border-blue-500/20">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/50" />
                  
                  <h3 className="text-sm font-mono text-blue-400 mb-3">// OFFICIAL WEBSITE</h3>
                  <a 
                    href={game.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50 transition-colors font-mono text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    {game.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </div>
              )}

              {game.notes && (
                <div className="relative bg-slate-900/80 p-6 rounded-lg border border-cyan-500/20">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
                  
                  <h3 className="text-sm font-mono text-cyan-400 mb-3">// YOUR LOG</h3>
                  <p className="text-slate-300 mb-4">{game.notes}</p>
                  {game.tags && game.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {game.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded border border-cyan-500/30 text-sm font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!game.description && !game.genres && !game.notes && !game.platforms && !game.stores && (
                <div className="relative bg-slate-900/80 p-8 rounded-lg border border-slate-700 text-center">
                  <p className="text-slate-500 font-mono">NO ADDITIONAL DATA AVAILABLE</p>
                </div>
              )}

              {/* Similar Games Section */}
              {similarGames.length > 0 && (
                <SimilarGamesSection games={similarGames} currentGameId={game._id} />
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
