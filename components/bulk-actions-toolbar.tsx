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
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-slate-200 dark:border-neutral-700 p-4 z-40 max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-slate-900 dark:text-white">
            {selectedCount} selected
          </span>
          <motion.button
            onClick={onClear}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded transition-colors"
          >
            <X size={18} className="text-slate-500 dark:text-slate-400" />
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
              className="flex-1 px-2 py-1 border border-slate-300 dark:border-neutral-600 rounded text-sm bg-white dark:bg-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              onClick={handleAddTags}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Add
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
            className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded text-xs font-medium transition-colors"
            title="Mark as completed"
          >
            <CheckCircle2 size={14} />
            <span className="hidden sm:inline">Done</span>
          </motion.button>

          {/* Toggle Favorite */}
          <motion.button
            onClick={onToggleFavorite}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded text-xs font-medium transition-colors"
            title="Add to favorites"
          >
            <Heart size={14} />
            <span className="hidden sm:inline">Fav</span>
          </motion.button>

          {/* Add Tags */}
          <motion.button
            onClick={() => setShowTagInput(!showTagInput)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 rounded text-xs font-medium transition-colors"
            title="Add tags"
          >
            <Tag size={14} />
            <span className="hidden sm:inline">Tag</span>
          </motion.button>

          {/* Delete */}
          <motion.button
            onClick={onDelete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded text-xs font-medium transition-colors"
            title="Delete selected"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Del</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
