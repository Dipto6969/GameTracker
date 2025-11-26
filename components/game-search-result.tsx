"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface GameSearchResultProps {
  game: {
    id: number
    name: string
    background_image?: string
    released?: string
  }
  onAdd: () => void
}

export default function GameSearchResult({ game, onAdd }: GameSearchResultProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    setIsAdding(true)
    await onAdd()
    setIsAdding(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 8, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-neutral-800 rounded-lg shadow hover:shadow-md transition-shadow p-4 flex gap-4 items-start border border-slate-200 dark:border-neutral-700"
    >
      <motion.div
        className="w-20 h-20 flex-shrink-0 bg-slate-200 dark:bg-neutral-700 rounded overflow-hidden relative group"
        whileHover={{ scale: 1.05 }}
      >
        {game.background_image ? (
          <>
            <img
              src={game.background_image || "/placeholder.svg"}
              alt={game.name}
              className="w-full h-full object-cover"
            />
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-black/30 flex items-center justify-center"
            >
              <span className="text-white text-2xl">+</span>
            </motion.div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
        )}
      </motion.div>

      <div className="flex-grow">
        <h3 className="font-semibold text-slate-900 dark:text-white">{game.name}</h3>
        {game.released && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {new Date(game.released).getFullYear()}
          </p>
        )}
      </div>

      <motion.button
        onClick={handleAdd}
        disabled={isAdding}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium flex-shrink-0 transition-all"
      >
        {isAdding ? "Adding..." : "Add"}
      </motion.button>
    </motion.div>
  )
}
