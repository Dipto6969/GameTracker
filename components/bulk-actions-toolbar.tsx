"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trash2, CheckCircle2, Heart, Tag, X } from "lucide-react"
import { useState } from "react"

interface BulkActionsToolbarProps {
  selectedCount: number
  onMarkStatus: (status: string) => void
  onToggleFavorite: () => void
  onDelete: () => void
  onAddTags: (tags: string[]) => void
  onClear: () => void
}

export default function BulkActionsToolbar({
  selectedCount,
  onMarkStatus,
  onToggleFavorite,
  onDelete,
  onAddTags,
  onClear,
}: BulkActionsToolbarProps) {
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagInput, setTagInput] = useState("")

  if (selectedCount === 0) {
    return null
  }

  const handleAddTags = () => {
    if (tagInput.trim()) {
      const tags = tagInput.split(",").map((t) => t.trim())
      onAddTags(tags)
      setTagInput("")
      setShowTagInput(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-purple-500/50 p-4 z-40 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-purple-400 text-sm">
            // {selectedCount} TARGETS SELECTED
          </span>
          <motion.button
            onClick={onClear}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 hover:bg-red-500/20 border border-transparent hover:border-red-500/50 rounded transition-colors"
          >
            <X size={16} className="text-red-400" />
          </motion.button>
        </div>

        {/* Tag Input */}
        {showTagInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex gap-2"
          >
            <input
              type="text"
              placeholder="Add tags (comma-separated)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTags()
              }}
              autoFocus
              className="flex-1 px-3 py-1.5 border border-purple-500/50 rounded text-sm bg-slate-800/80 text-purple-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
            />
            <motion.button
              onClick={handleAddTags}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 rounded text-sm font-mono transition-colors"
            >
              ADD
            </motion.button>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Mark Completed */}
          <motion.button
            onClick={() => onMarkStatus("completed")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded text-xs font-mono transition-colors"
            title="Mark as completed"
          >
            <CheckCircle2 size={14} />
            <span className="hidden sm:inline">DONE</span>
          </motion.button>

          {/* Toggle Favorite */}
          <motion.button
            onClick={onToggleFavorite}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded text-xs font-mono transition-colors"
            title="Add to favorites"
          >
            <Heart size={14} />
            <span className="hidden sm:inline">FAV</span>
          </motion.button>

          {/* Add Tags */}
          <motion.button
            onClick={() => setShowTagInput(!showTagInput)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 rounded text-xs font-mono transition-colors"
            title="Add tags"
          >
            <Tag size={14} />
            <span className="hidden sm:inline">TAG</span>
          </motion.button>

          {/* Delete */}
          <motion.button
            onClick={onDelete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded text-xs font-mono transition-colors"
            title="Delete selected"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">DEL</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
