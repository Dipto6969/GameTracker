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
  { value: "playing", label: "▶ ACTIVE", color: "bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30" },
  { value: "completed", label: "✓ CONQUERED", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30" },
  { value: "backlog", label: "⏳ QUEUED", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30" },
  { value: "dropped", label: "✗ DROPPED", color: "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30" },
  { value: "wishlist", label: "★ WATCHLIST", color: "bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30" },
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
      className="relative space-y-6 bg-slate-900/80 p-6 rounded-lg border border-pink-500/20"
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pink-500/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pink-500/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-pink-500/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-pink-500/50" />
      
      {/* Status Selection */}
      <div>
        <label className="block text-sm font-mono text-pink-400 mb-3">
          // STATUS
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {STATUS_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStatus(status === option.value ? "" : option.value)}
              className={`px-3 py-2 rounded text-sm font-mono transition-all border ${
                status === option.value
                  ? `${option.color} ring-1 ring-offset-1 ring-offset-slate-900`
                  : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-mono text-purple-400 mb-3">
          // RATING
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(rating === star ? 0 : star)}
              className={`text-3xl transition-all ${
                star <= rating 
                  ? "drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" 
                  : "opacity-40 hover:opacity-70"
              }`}
            >
              {star <= rating ? "⭐" : "☆"}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Favorite */}
      <div>
        <label className="block text-sm font-mono text-yellow-400 mb-3">
          // LEGENDARY STATUS
        </label>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFavorite(!isFavorite)}
          className={`px-4 py-2 rounded font-mono text-sm transition-all border ${
            isFavorite
              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
              : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600"
          }`}
        >
          {isFavorite ? "⭐ LEGENDARY" : "☆ MARK AS LEGENDARY"}
        </motion.button>
      </div>

      {/* Hours Played */}
      <div>
        <label className="block text-sm font-mono text-cyan-400 mb-3">
          // TIME INVESTED
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={hoursPlayed}
            onChange={(e) => setHoursPlayed(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="0"
            className="flex-1 px-4 py-2 bg-slate-800/50 border border-cyan-500/30 rounded text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 font-mono transition-all"
            min="0"
            step="0.5"
          />
          <span className="text-sm font-mono text-cyan-400">HOURS</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-mono">Track your time in-game</p>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSave}
        disabled={isSaving}
        className="relative w-full group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded opacity-50 group-hover:opacity-75 blur transition duration-300" />
        <div className="relative px-4 py-3 bg-slate-900 rounded font-mono text-white border border-pink-500/30 group-hover:border-purple-500/30 transition-all">
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
              SAVING...
            </span>
          ) : (
            "SAVE CHANGES"
          )}
        </div>
      </motion.button>
    </motion.div>
  )
}
