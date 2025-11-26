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
      className="space-y-4 bg-white dark:bg-neutral-800 p-4 rounded-lg border border-slate-200 dark:border-neutral-700"
    >
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Personal Review & Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you think about this game?"
          className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
          >
            Add
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
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-all"
      >
        {isSaving ? "Saving..." : "Save Review"}
      </motion.button>
    </motion.div>
  )
}
