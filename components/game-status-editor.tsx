"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface GameStatusEditorProps {
  gameId: string
  currentStatus?: string
  currentRating?: number
  currentFavorite?: boolean
  currentHoursPlayed?: number
  onSave: (updates: any) => Promise<void>
}

const STATUS_OPTIONS = [
  { value: "playing", label: "🎮 Playing", color: "bg-green-100 text-green-800" },
  { value: "completed", label: "✓ Completed", color: "bg-blue-100 text-blue-800" },
  { value: "backlog", label: "📋 Backlog", color: "bg-yellow-100 text-yellow-800" },
  { value: "dropped", label: "⛔ Dropped", color: "bg-red-100 text-red-800" },
  { value: "wishlist", label: "⭐ Wishlist", color: "bg-purple-100 text-purple-800" },
]

export default function GameStatusEditor({
  gameId,
  currentStatus,
  currentRating,
  currentFavorite,
  currentHoursPlayed,
  onSave,
}: GameStatusEditorProps) {
  const [status, setStatus] = useState(currentStatus || "")
  const [rating, setRating] = useState(currentRating || 0)
  const [isFavorite, setIsFavorite] = useState(currentFavorite || false)
  const [hoursPlayed, setHoursPlayed] = useState(currentHoursPlayed || 0)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        status: status || null,
        userRating: rating || null,
        isFavorite,
        hoursPlayed: hoursPlayed || 0,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 bg-white dark:bg-neutral-800 p-4 rounded-lg border border-slate-200 dark:border-neutral-700"
    >
      {/* Status Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Status
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {STATUS_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              onClick={() => setStatus(status === option.value ? "" : option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                status === option.value
                  ? `${option.color} ring-2 ring-offset-2 dark:ring-offset-neutral-800`
                  : "bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-600"
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Your Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(rating === star ? 0 : star)}
              className="text-2xl transition-transform"
            >
              {star <= rating ? "⭐" : "☆"}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Favorite */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFavorite(!isFavorite)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isFavorite
              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
              : "bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-300"
          }`}
        >
          {isFavorite ? "⭐" : "☆"} Favorite
        </motion.button>
      </div>

      {/* Hours Played */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Hours Played ⏱️
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={hoursPlayed}
            onChange={(e) => setHoursPlayed(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="0"
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.5"
          />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">hours</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Track how many hours you've spent on this game</p>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-all"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </motion.button>
    </motion.div>
  )
}
