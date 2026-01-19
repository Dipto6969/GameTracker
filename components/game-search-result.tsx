"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Eye, Plus } from "lucide-react"
import GameQuickViewModal from "./game-quick-view-modal"

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
  const [showQuickView, setShowQuickView] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAdd = async () => {
    setIsAdding(true)
    await onAdd()
    setIsAdding(false)
    setIsAdded(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 8, transition: { duration: 0.2 } }}
        className="relative group"
      >
        {/* Subtle glow on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition duration-300" />
        
        <div className="relative bg-slate-900/80 rounded-lg shadow-lg p-4 flex gap-4 items-start border border-slate-700/50 group-hover:border-green-500/50 transition-all">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-green-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-green-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Clickable image area - opens quick view */}
          <motion.button
            onClick={() => setShowQuickView(true)}
            className="w-20 h-20 flex-shrink-0 bg-slate-800 rounded overflow-hidden relative cursor-pointer"
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
                  className="absolute inset-0 bg-cyan-500/40 flex items-center justify-center"
                >
                  <Eye className="w-6 h-6 text-white" />
                </motion.div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">NO IMG</div>
            )}
          </motion.button>

          {/* Game info - clickable to open quick view */}
          <button 
            onClick={() => setShowQuickView(true)}
            className="flex-grow min-w-0 text-left"
          >
            <h3 className="font-bold text-white group-hover:text-green-400 transition-colors truncate">{game.name}</h3>
            {game.released && (
              <p className="text-sm text-slate-500 font-mono">
                {new Date(game.released).getFullYear()}
              </p>
            )}
            <p className="text-xs text-cyan-500/70 mt-1 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              Click to view details →
            </p>
          </button>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* View Details Button */}
            <motion.button
              onClick={() => setShowQuickView(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 rounded font-mono text-xs transition-all flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">VIEW</span>
            </motion.button>

            {/* Add Button */}
            <motion.button
              onClick={handleAdd}
              disabled={isAdding || isAdded}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 rounded font-mono text-xs transition-all flex items-center gap-1.5 ${
                isAdded 
                  ? 'bg-green-500/30 border border-green-500 text-green-400 cursor-default'
                  : 'bg-green-500/20 hover:bg-green-500/30 disabled:bg-slate-700 border border-green-500/50 hover:border-green-400 disabled:border-slate-600 text-green-400 disabled:text-slate-500'
              }`}
            >
              {isAdding ? (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="hidden sm:inline">ADDING</span>
                </>
              ) : isAdded ? (
                <>
                  <span className="text-green-400">✓</span>
                  <span className="hidden sm:inline">ADDED</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">ADD</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <GameQuickViewModal
        gameId={game.id}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        onAddToLibrary={handleAdd}
        isInLibrary={isAdded}
      />
    </>
  )
}
