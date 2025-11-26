"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { Trash2, CheckCircle2, Plus, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GameCardProps {
  game: {
    _id: string
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

const statusColors = {
  playing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  backlog: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  dropped: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  wishlist: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

const statusLabels = {
  playing: "🎮 Playing",
  completed: "✓ Completed",
  backlog: "📋 Backlog",
  dropped: "⛔ Dropped",
  wishlist: "⭐ Wishlist",
}

export default function GameCard({ game, onUpdate, onDelete, viewMode = "grid", isSelected = false, onToggleSelection }: GameCardProps) {
  const { toast } = useToast()
  const [isRemoving, setIsRemoving] = useState(false)
  const [isMarking, setIsMarking] = useState(false)

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
      const res = await fetch(`/api/updateGame?id=${game._id}`, {
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
      const res = await fetch(`/api/updateGame?id=${game._id}`, {
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
              className="p-2 rounded transition-all bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        // Grid View Layout
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group bg-white dark:bg-neutral-800 rounded-lg shadow hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full"
        >
        <div className="relative overflow-hidden bg-slate-200 dark:bg-neutral-700 h-48">
          {game.background_image ? (
            <>
              <motion.img
                src={game.background_image || "/placeholder.svg"}
                alt={game.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
              {/* Gradient Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
          )}

          {/* Favorite Star */}
          {game.isFavorite && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 text-yellow-400 text-2xl drop-shadow-lg"
            >
              ⭐
            </motion.div>
          )}

          {/* Status Badge */}
          {game.status && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${statusColors[game.status] || ""}`}
            >
              {statusLabels[game.status] || game.status}
            </motion.div>
          )}
        </div>

        <div className="p-4 flex flex-col h-full">
          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {game.name}
          </h3>

          <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400 flex-1">
            {game.released && <p>{new Date(game.released).getFullYear()}</p>}

            <div className="flex items-center gap-2">
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

            <p className="text-xs text-slate-500 dark:text-slate-500">
              Added: {new Date(game.storedAt).toLocaleDateString()}
            </p>
          </div>

          {/* View Details Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="mt-3 pt-3 border-t border-slate-200 dark:border-neutral-700"
          >
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              View Details →
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
      )}
    </Link>
  )
}
