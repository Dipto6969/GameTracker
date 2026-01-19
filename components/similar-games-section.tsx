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
    <section className="mt-12 pt-8 border-t border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" size={24} />
        <h2 className="text-xl font-bold text-white font-mono">// SIMILAR TARGETS</h2>
        <span className="text-sm text-slate-500 font-mono">({games.length} found)</span>
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
              <div className="group relative bg-slate-900/80 rounded-lg overflow-hidden h-full border border-slate-700/50 hover:border-yellow-500/50 transition-all">
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 opacity-0 group-hover:opacity-100 blur transition duration-300 rounded-lg" />
                
                <div className="relative">
                  {/* Image */}
                  <div className="relative overflow-hidden bg-slate-800 h-32 sm:h-40">
                    {game.background_image ? (
                      <motion.img
                        src={game.background_image}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
                        NO IMAGE
                      </div>
                    )}

                    {/* Match Score Badge */}
                    <div className="absolute top-2 right-2 bg-green-500/90 text-white px-2 py-1 rounded text-xs font-mono font-bold shadow-lg border border-green-400/50">
                      {game.matchScore}%
                    </div>

                    {/* Source Badge */}
                    <div className="absolute top-2 left-2 bg-slate-900/90 text-cyan-400 px-2 py-1 rounded text-xs font-mono border border-cyan-500/30">
                      {game.source === 'popular' ? '🌟 HOT' : '📚 LIB'}
                    </div>
                    
                    {/* Scan overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 animate-[scanline_2s_linear_infinite] transition-opacity" />
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-slate-900/80">
                    <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-yellow-400 transition-colors font-mono">
                      {game.name}
                    </h3>

                    {/* Match Reasons */}
                    <div className="mt-2 space-y-1">
                      {game.matchReasons?.slice(0, 2).map((reason, idx) => (
                        <p key={idx} className="text-xs text-slate-500 line-clamp-1 font-mono">
                          ✓ {reason}
                        </p>
                      ))}
                    </div>

                    {/* Rating */}
                    {game.rating && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400 font-mono">
                        ⭐ {game.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
