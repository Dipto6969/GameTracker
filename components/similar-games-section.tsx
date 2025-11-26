"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { SimilarGame } from "@/hooks/use-similar-games"

interface SimilarGamesProps {
  games: SimilarGame[]
  currentGameId: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
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

export default function SimilarGamesSection({ games, currentGameId }: SimilarGamesProps) {
  if (games.length === 0) {
    return null
  }

  return (
    <section className="mt-12 pt-8 border-t border-slate-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Similar Games</h2>
        <span className="text-sm text-slate-600 dark:text-slate-400">({games.length} recommendations)</span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {games.map((game) => (
          <motion.div key={game.id || game._id} variants={itemVariants}>
            <Link href={`/game/${game.id || game._id}`}>
              <div className="group relative bg-white dark:bg-neutral-800 rounded-lg shadow hover:shadow-lg transition-all overflow-hidden h-full">
                {/* Image */}
                <div className="relative overflow-hidden bg-slate-200 dark:bg-neutral-700 h-32 sm:h-40">
                  {game.background_image ? (
                    <motion.img
                      src={game.background_image}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No image
                    </div>
                  )}

                  {/* Match Score Badge */}
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    {game.matchScore}%
                  </div>

                  {/* Source Badge */}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                    {game.source === 'popular' ? '🌟 Popular' : '📚 Library'}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {game.name}
                  </h3>

                  {/* Match Reasons */}
                  <div className="mt-2 space-y-1">
                    {game.matchReasons?.slice(0, 2).map((reason, idx) => (
                      <p key={idx} className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        ✓ {reason}
                      </p>
                    ))}
                  </div>

                  {/* Rating */}
                  {game.rating && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      ⭐ {game.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
