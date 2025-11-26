"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Clock, Trash2 } from "lucide-react"
import { RecentlyViewedGame } from "@/hooks/use-recently-viewed"

interface RecentlyViewedSidebarProps {
  games: RecentlyViewedGame[]
  onClear: () => void
}

const containerVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
}

export default function RecentlyViewedSidebar({ games, onClear }: RecentlyViewedSidebarProps) {
  if (games.length === 0) {
    return null
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <motion.aside
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="hidden lg:block w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Clock size={20} className="text-blue-600 dark:text-blue-400" />
          Recently Viewed
        </h2>
        <motion.button
          onClick={onClear}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded transition-colors"
          title="Clear history"
        >
          <Trash2 size={16} className="text-slate-500 dark:text-slate-400" />
        </motion.button>
      </div>

      <motion.div variants={containerVariants} className="space-y-2">
        {games.map((game) => (
          <motion.div key={game._id} variants={itemVariants}>
            <Link href={`/game/${game._id}`}>
              <div className="group p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-neutral-600">
                <div className="flex gap-3">
                  {game.background_image && (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {game.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {formatTime(game.viewedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 pt-4 border-t border-slate-200 dark:border-neutral-700"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {games.length} game{games.length !== 1 ? "s" : ""} viewed
        </p>
      </motion.div>
    </motion.aside>
  )
}
