"use client"

import { getGameById, getAllGames } from "@/lib/kv"
import { getGameById as getRawgGameById } from "@/lib/rawg"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GameStatusEditor from "@/components/game-status-editor"
import NotesEditor from "@/components/notes-editor"
import LoadingSkeleton from "@/components/loading-skeleton"
import SimilarGamesSection from "@/components/similar-games-section"
import { useToast } from "@/lib/toast-context"
import { useSimilarGames } from "@/hooks/use-similar-games"

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
}

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [game, setGame] = useState<GameData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingFailed, setLoadingFailed] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "status" | "notes">("overview")
  const [similarGames, setSimilarGames] = useState<any[]>([])
  const { addToast } = useToast()
  const { findSimilarGames, fetchPopularGames, isLoading: popularGamesLoading } = useSimilarGames()

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
            description: rawgGame.description,
            genres: rawgGame.genres || storedGame?.genres,
            status: storedGame?.status,
            isFavorite: storedGame?.isFavorite || false,
            userRating: storedGame?.userRating,
            notes: storedGame?.notes,
            tags: userTags,
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
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Game not found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          This game doesn't exist or couldn't be loaded.
        </p>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          ← Back to library
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
          ← Back to library
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-1"
        >
          {game.background_image ? (
            <div className="relative group">
              <img
                src={game.background_image || "/placeholder.svg"}
                alt={game.name}
                className="w-full h-auto rounded-lg shadow-xl group-hover:shadow-2xl transition-shadow"
              />
              {game.isFavorite && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-4 right-4 text-4xl drop-shadow-lg"
                >
                  ⭐
                </motion.div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-slate-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
              No image available
            </div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{game.name}</h1>
            {game.released && (
              <p className="text-slate-600 dark:text-slate-400">
                Released: {new Date(game.released).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {game.rating && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">RAWG Rating</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">⭐ {game.rating.toFixed(1)}</p>
              </motion.div>
            )}

            {game.metacritic && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Metacritic</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{game.metacritic}</p>
              </motion.div>
            )}

            {game.userRating && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Your Rating</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">⭐ {game.userRating}/5</p>
              </motion.div>
            )}
          </div>

          {/* Status Badge */}
          {game.status && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block"
            >
              <span
                className={`px-4 py-2 rounded-full font-medium text-sm ${
                  game.status === "playing"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : game.status === "completed"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : game.status === "backlog"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : game.status === "dropped"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                }`}
              >
                {game.status === "playing"
                  ? "🎮 Playing"
                  : game.status === "completed"
                    ? "✓ Completed"
                    : game.status === "backlog"
                      ? "📋 Backlog"
                      : game.status === "dropped"
                        ? "⛔ Dropped"
                        : "⭐ Wishlist"}
              </span>
            </motion.div>
          )}

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <div className="flex border-b border-slate-200 dark:border-neutral-700 mb-6">
          {(["overview", "status", "notes"] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm transition-all ${
                activeTab === tab
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              {tab === "overview" && "📖 Overview"}
              {tab === "status" && "🎮 Status & Rating"}
              {tab === "notes" && "📝 Review & Notes"}
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

          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {game.description && (
                <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-slate-200 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Description</h3>
                  <div
                    className="text-slate-700 dark:text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: game.description }}
                  />
                </div>
              )}

              {game.genres && game.genres.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-slate-200 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.genres.map((genre: any) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {game.notes && (
                <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-slate-200 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Your Review</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">{game.notes}</p>
                  {game.tags && game.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {game.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!game.description && !game.genres && !game.notes && (
                <div className="bg-slate-50 dark:bg-neutral-800 p-6 rounded-lg border border-slate-200 dark:border-neutral-700 text-center text-slate-600 dark:text-slate-400">
                  <p>No additional information available for this game.</p>
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
