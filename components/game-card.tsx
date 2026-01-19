"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Trash2, CheckCircle2, Plus, Heart, Eye, Play, Pause } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import GameQuickViewModal from "./game-quick-view-modal"

interface GameCardProps {
  game: {
    _id: string
    id: number
    name: string
    background_image?: string
    released?: string
    rating?: number
    storedAt: number
    status?: "playing" | "completed" | "backlog" | "dropped" | "wishlist"
    isFavorite?: boolean
    userRating?: number
  }
  onUpdate?: (gameId: string, updates: Partial<GameCardProps["game"]>) => void
  onDelete?: (gameId: string) => void
  viewMode?: "grid" | "list"
  isSelected?: boolean
  onToggleSelection?: (id: string) => void
}

// Cyberpunk Status Colors
const statusColors = {
  playing: "status-playing",
  completed: "status-completed",
  backlog: "status-backlog",
  dropped: "status-dropped",
  wishlist: "status-wishlist",
}

const statusLabels = {
  playing: "▶ PLAYING",
  completed: "✓ CONQUERED",
  backlog: "◈ BACKLOG",
  dropped: "✕ DROPPED",
  wishlist: "★ WISHLIST",
}

export default function GameCard({ game, onUpdate, onDelete, viewMode = "grid", isSelected = false, onToggleSelection }: GameCardProps) {
  const { toast } = useToast()
  const [isRemoving, setIsRemoving] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const [videoFetchAttempted, setVideoFetchAttempted] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch video when hovered
  useEffect(() => {
    let cancelled = false
    let timeoutId: NodeJS.Timeout
    
    // Only attempt to fetch once per game
    if (isHovered && !videoUrl && !isVideoLoading && !videoFetchAttempted) {
      setIsVideoLoading(true)
      setVideoFetchAttempted(true)
      
      // Set a 8-second timeout to account for YouTube fallback
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.log('Video fetch timeout for game:', game.name)
          setIsVideoLoading(false)
        }
      }, 8000)
      
      fetch(`/api/gameDetails/${game.id}`)
        .then(res => {
          if (!res.ok) throw new Error('API error')
          return res.json()
        })
        .then(data => {
          if (!cancelled) {
            clearTimeout(timeoutId)
            console.log('Video API Response:', {
              game: game.name,
              gameId: game._id,
              success: data.success,
              movieCount: data.game?.movies?.length,
              movies: data.game?.movies,
              clip: data.game?.clip,
              firstMovie: data.game?.movies?.[0]
            })
            if (data.success && data.game) {
              const video = data.game?.movies?.[0]?.video_480 || 
                           data.game?.movies?.[0]?.video_max || 
                           data.game?.clip?.video
              if (video) {
                console.log('Video URL found:', video)
                setVideoUrl(video)
                setIsVideoLoading(false)
              } else {
                console.log('No video URL found in API response, trying YouTube fallback...')
                // Fallback to YouTube
                fetch(`/api/youtube/search?game=${encodeURIComponent(game.name)}`)
                  .then(res => res.json())
                  .then(ytData => {
                    if (!cancelled && ytData.success && ytData.videoUrl) {
                      console.log('YouTube video found:', ytData.videoUrl)
                      setVideoUrl(ytData.videoUrl)
                    } else {
                      console.log('No video found on YouTube either')
                    }
                  })
                  .catch(err => console.log('YouTube fallback error:', err))
                  .finally(() => {
                    if (!cancelled) setIsVideoLoading(false)
                  })
              }
            } else {
              console.log('API response not successful or missing game data')
              setIsVideoLoading(false)
            }
          }
        })
        .catch((err) => {
          if (!cancelled) {
            clearTimeout(timeoutId)
            console.log('Video fetch error for game:', game.name, err)
            setIsVideoLoading(false)
          }
        })
    }
    
    return () => { 
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isHovered, game.id, game.name, videoUrl, isVideoLoading, videoFetchAttempted])

  // Auto-play video after 3 seconds (Amazon-style)
  useEffect(() => {
    // Reset when hover state changes
    if (!isHovered) {
      setShowVideo(false)
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current)
        imageTimerRef.current = null
      }
      return
    }
    
    // If we have a video and we're hovering, start the timer
    if (videoUrl && isHovered && !showVideo) {
      imageTimerRef.current = setTimeout(() => {
        console.log('Auto-switching to video for:', game.name)
        setShowVideo(true)
      }, 3000)
    }
    
    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current)
        imageTimerRef.current = null
      }
    }
  }, [isHovered, videoUrl, showVideo, game.name])

  // Auto-play when video becomes visible
  useEffect(() => {
    if (showVideo && videoRef.current && !videoUrl?.includes('youtube.com')) {
      videoRef.current.play().catch((err) => {
        console.log('Video play failed:', err)
      })
    }
  }, [showVideo, videoUrl])

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowQuickView(true)
  }

  const handleRemoveGame = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsRemoving(true)
    try {
      const res = await fetch(`/api/removeGame?id=${game._id}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Success", description: `Removed "${game.name}" from your library` })
        onDelete?.(game._id)
      } else {
        toast({ title: "Error", description: "Failed to remove game", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove game", variant: "destructive" })
    } finally {
      setIsRemoving(false)
    }
  }

  const handleMarkComplete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMarking(true)
    try {
      const res = await fetch(`/api/updateGame/${game._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: game.status === "completed" ? "backlog" : "completed" }),
      })
      if (res.ok) {
        const newStatus = game.status === "completed" ? "backlog" : "completed"
        toast({
          title: "Success",
          description: `Marked as ${newStatus === "completed" ? "completed" : "backlog"}`,
        })
        onUpdate?.(game._id, { status: newStatus as any })
      } else {
        toast({ title: "Error", description: "Failed to update game", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update game", variant: "destructive" })
    } finally {
      setIsMarking(false)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await fetch(`/api/updateGame/${game._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !game.isFavorite }),
      })
      if (res.ok) {
        toast({
          title: "Success",
          description: game.isFavorite ? "Removed from favorites" : "Added to favorites",
        })
        onUpdate?.(game._id, { isFavorite: !game.isFavorite })
      } else {
        toast({ title: "Error", description: "Failed to update favorite", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update favorite", variant: "destructive" })
    }
  }

  return (
    <Link href={`/game/${game._id}`}>
      {viewMode === "list" ? (
        // List View Layout
        <motion.div
          whileHover={{ x: 4, transition: { duration: 0.2 } }}
          className="group bg-white dark:bg-neutral-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer flex gap-3 p-3 items-start"
        >
          {/* Checkbox */}
          <div className="flex-shrink-0 pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleSelection?.(game._id)
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="w-5 h-5 rounded border-slate-300 dark:border-neutral-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Game Image */}
          <div className="w-20 h-20 flex-shrink-0 bg-slate-200 dark:bg-neutral-700 rounded-lg overflow-hidden relative">
            {game.background_image ? (
              <motion.img
                src={game.background_image || "/placeholder.svg"}
                alt={game.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
            )}

            {/* Favorite Star - List View */}
            {game.isFavorite && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 text-yellow-400 text-lg drop-shadow-lg"
              >
                ⭐
              </motion.div>
            )}
          </div>

          {/* Game Info */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {game.name}
              </h3>

              <div className="mt-2 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
                {game.released && <span>{new Date(game.released).getFullYear()}</span>}

                {game.rating && (
                  <span className="flex items-center gap-1">
                    ⭐ {game.rating.toFixed(1)}
                  </span>
                )}

                {game.userRating && (
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    👤 {game.userRating}
                  </span>
                )}
              </div>
            </div>

            {/* Status Badge - List View */}
            {game.status && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`inline-flex w-fit px-2 py-1 rounded text-xs font-medium mt-2 ${statusColors[game.status] || ""}`}
              >
                {statusLabels[game.status] || game.status}
              </motion.div>
            )}
          </div>

          {/* Quick Actions - List View */}
          <div className="flex flex-col gap-1 justify-center">
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleMarkComplete(e as any)
              }}
              disabled={isMarking}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={game.status === "completed" ? "Mark as Backlog" : "Mark as Completed"}
              className={`p-2 rounded transition-all ${
                game.status === "completed"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                  : "bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-600"
              }`}
            >
              <CheckCircle2 size={18} />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleToggleFavorite(e as any)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={game.isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`p-2 rounded transition-all ${
                game.isFavorite
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                  : "bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-600"
              }`}
            >
              <Heart size={18} fill={game.isFavorite ? "currentColor" : "none"} />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleRemoveGame(e as any)
              }}
              disabled={isRemoving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Remove from library"
              className="p-2 rounded transition-all bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        // Grid View Layout - Cyberpunk Style
        <>
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="group cyber-glass cyber-card-glow rounded-lg overflow-hidden cursor-pointer h-full border border-purple-500/10 hover:border-purple-500/40"
        >
        <div className="relative overflow-hidden bg-neutral-900 h-48">
          {/* Background Image - always present */}
          {game.background_image ? (
            <>
              <motion.img
                src={game.background_image || "/placeholder.svg"}
                alt={game.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${showVideo && videoUrl ? 'opacity-0' : 'opacity-100'}`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
              
              {/* Video - fades in after 3 seconds or on hover */}
              {videoUrl && isHovered && (
                videoUrl.includes('youtube.com') ? (
                  <iframe
                    src={videoUrl}
                    className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-700 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-700 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                    muted
                    loop
                    playsInline
                    onError={(e) => {
                      console.log('Video element error:', e)
                    }}
                    onLoadStart={() => console.log('Video loading...')}
                    onCanPlay={() => console.log('Video can play')}
                  />
                )
              )}
              
              {/* Cyberpunk Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-20" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-cyan-900/20 opacity-0 group-hover:opacity-100 z-20"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              {/* HUD Corner */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
              <div className="absolute top-2 right-2 w-4 h-4 border-r border-t border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
              
              {/* Video Loading Indicator */}
              {isVideoLoading && isHovered && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-purple-500/50 border-t-purple-500 rounded-full animate-spin" />
                  <span className="text-xs text-purple-400 font-mono">LOADING...</span>
                </div>
              )}
              
              {/* Video/Image Status Label */}
              {videoUrl && isHovered && !isVideoLoading && (
                <div className={`absolute top-2 right-2 z-30 px-2 py-1 text-white text-[10px] font-mono rounded border transition-all ${
                  showVideo 
                    ? 'bg-red-500/90 border-red-400/50' 
                    : 'bg-slate-900/80 border-slate-600/50'
                }`}>
                  {showVideo ? '▶ PREVIEW' : '🖼 IMAGE'}
                </div>
              )}
              
              {/* No Video Available Message */}
              {!videoUrl && !isVideoLoading && isHovered && videoFetchAttempted && (
                <div className="absolute top-2 right-2 z-30 px-2 py-1 bg-slate-700/90 text-slate-300 text-[10px] font-mono rounded border border-slate-600/50">
                  NO PREVIEW
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">NO IMAGE</div>
          )}

          {/* Favorite Star */}
          {game.isFavorite && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 text-yellow-400 text-2xl drop-shadow-lg z-20"
            >
              ⭐
            </motion.div>
          )}

          {/* Status Badge - Cyberpunk */}
          {game.status && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold tracking-wider z-20 ${statusColors[game.status] || ""}`}
            >
              {statusLabels[game.status] || game.status}
            </motion.div>
          )}
          
          {/* Quick View Button - appears on hover */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            onClick={handleQuickView}
            className="absolute bottom-2 right-2 z-30 p-2 bg-cyan-500/80 hover:bg-cyan-400 text-white rounded transition-colors shadow-lg"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="p-4 flex flex-col h-full bg-gradient-to-b from-transparent to-black/20">
          <h3 className="font-bold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
            {game.name}
          </h3>

          <div className="mt-2 space-y-1 text-sm text-slate-400 flex-1">
            {game.released && <p className="font-mono text-xs text-slate-500">{new Date(game.released).getFullYear()}</p>}

            <div className="flex items-center gap-3">
              {game.rating && (
                <span className="flex items-center gap-1 text-yellow-500">
                  ★ {game.rating.toFixed(1)}
                </span>
              )}
              {game.userRating && (
                <span className="flex items-center gap-1 text-cyan-400 font-mono">
                  {game.userRating}/5
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-600 font-mono">
              + {new Date(game.storedAt).toLocaleDateString()}
            </p>
          </div>

          {/* View Details Button - Cyberpunk */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="mt-3 pt-3 border-t border-purple-500/20"
          >
            <span className="text-xs font-bold text-purple-400 group-hover:text-cyan-400 tracking-wider transition-colors">
              ACCESS DATA →
            </span>
          </motion.div>

          {/* Quick Action Buttons - Show on hover */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            whileHover={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-t border-slate-200 dark:border-neutral-700 flex gap-2 overflow-hidden"
          >
            {/* Mark Complete Button */}
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleMarkComplete(e as any)
              }}
              disabled={isMarking}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={game.status === "completed" ? "Mark as Backlog" : "Mark as Completed"}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                game.status === "completed"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                  : "bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-600"
              }`}
            >
              <CheckCircle2 size={14} />
              <span className="hidden sm:inline">{game.status === "completed" ? "Done" : "Finish"}</span>
            </motion.button>

            {/* Favorite Button */}
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleToggleFavorite(e as any)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={game.isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                game.isFavorite
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                  : "bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-600"
              }`}
            >
              <Heart size={14} fill={game.isFavorite ? "currentColor" : "none"} />
              <span className="hidden sm:inline">Fav</span>
            </motion.button>

            {/* Remove Button */}
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleRemoveGame(e as any)
              }}
              disabled={isRemoving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Remove from library"
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-all"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Remove</span>
            </motion.button>
          </motion.div>
        </div>
        </motion.div>
        
        {/* Quick View Modal */}
        <GameQuickViewModal
          gameId={game._id}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
          isInLibrary={true}
        />
        </>
      )}
    </Link>
  )
}
