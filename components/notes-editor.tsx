"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface NotesEditorProps {
  gameId: string
  currentNotes?: string
  currentTags?: string[]
  onSave: (notes: string, tags: string[]) => Promise<void>
}

export default function NotesEditor({ gameId, currentNotes, currentTags, onSave }: NotesEditorProps) {
  // Filter to ensure only string tags (defensive programming)
  const validTags = Array.isArray(currentTags)
    ? currentTags.filter((t) => typeof t === 'string')
    : []

  const [notes, setNotes] = useState(currentNotes || "")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>(validTags)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(notes, tags)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative space-y-6 bg-slate-900/80 p-6 rounded-lg border border-cyan-500/20"
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />
      
      {/* Notes */}
      <div>
        <label className="block text-sm font-mono text-cyan-400 mb-3">
          // PERSONAL LOG
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record your thoughts on this game..."
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-none font-mono text-sm transition-all"
          rows={5}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-mono text-purple-400 mb-3">
          // TAGS
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Add tag..."
            className="flex-1 px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddTag}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 rounded font-mono text-sm transition-all"
          >
            + ADD
          </motion.button>
        </div>

        {/* Tags Display */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <motion.div
              key={tag}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/30 text-sm font-mono group"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-purple-400 hover:text-purple-200 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSave}
        disabled={isSaving}
        className="relative w-full group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded opacity-50 group-hover:opacity-75 blur transition duration-300" />
        <div className="relative px-4 py-3 bg-slate-900 rounded font-mono text-white border border-cyan-500/30 group-hover:border-purple-500/30 transition-all">
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              SAVING...
            </span>
          ) : (
            "SAVE LOG"
          )}
        </div>
      </motion.button>
    </motion.div>
  )
}
