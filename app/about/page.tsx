"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function AboutPage() {
  const features = [
    {
      icon: "🔍",
      title: "SCAN & ACQUIRE",
      description: "Search from thousands of games in RAWG's database and add them to your arsenal.",
      color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/50",
    },
    {
      icon: "📚",
      title: "ORGANIZE OPS",
      description: "Categorize games by status (Playing, Completed, Backlog, Dropped, Wishlist).",
      color: "from-purple-500/20 to-purple-600/10 border-purple-500/50",
    },
    {
      icon: "⭐",
      title: "RATE & LOG",
      description: "Give games personal ratings, write reviews, and add custom tags.",
      color: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/50",
    },
    {
      icon: "📊",
      title: "ANALYTICS HQ",
      description: "View beautiful charts showing your games by genre and release year.",
      color: "from-green-500/20 to-green-600/10 border-green-500/50",
    },
    {
      icon: "❤️",
      title: "MARK LEGENDS",
      description: "Star your favorite games and sort them to the top.",
      color: "from-pink-500/20 to-pink-600/10 border-pink-500/50",
    },
    {
      icon: "🌙",
      title: "DARK OPS MODE",
      description: "Enjoy a dark theme optimized for comfortable late-night gaming sessions.",
      color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/50",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 relative"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        
        <p className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase">// INTEL DOSSIER</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400">
            GAME TRACKER
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
          Your personal gaming command center to track, organize, and dominate your video game collection.
        </p>
        
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-cyan-500/50" />
          <div className="w-2 h-2 bg-cyan-500 rotate-45" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-cyan-500/50" />
        </div>
      </motion.div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative group"
      >
        {/* Glowing border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-lg opacity-30 group-hover:opacity-50 blur transition duration-500" />
        
        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-lg p-8 border border-cyan-500/30 backdrop-blur-sm">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />
          
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="text-cyan-400">▸</span>
            MISSION BRIEF
          </h2>
          <p className="text-slate-300 leading-relaxed">
            We believe gamers deserve a powerful, beautiful tool to track their gaming journey. Game Tracker makes it easy
            to search for games, organize your library, write reviews, and discover insights about your gaming habits—all
            in one sleek command center.
          </p>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="text-cyan-400 font-mono">//</span>
          SYSTEM CAPABILITIES
        </h2>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative bg-gradient-to-br ${feature.color} p-6 rounded-lg border backdrop-blur-sm group cursor-default`}
            >
              {/* Scan line effect */}
              <div className="absolute inset-0 overflow-hidden rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-[scanline_2s_linear_infinite]" />
              </div>
              
              <div className="text-4xl mb-3 filter drop-shadow-lg">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2 font-mono tracking-wide">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-6"
      >
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="text-purple-400 font-mono">//</span>
          TECH ARSENAL
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Next.js 16", glow: "hover:shadow-cyan-500/20" },
            { name: "React 19", glow: "hover:shadow-blue-500/20" },
            { name: "TypeScript", glow: "hover:shadow-blue-400/20" },
            { name: "Tailwind CSS", glow: "hover:shadow-teal-500/20" },
            { name: "Framer Motion", glow: "hover:shadow-pink-500/20" },
            { name: "SWR", glow: "hover:shadow-purple-500/20" },
            { name: "Recharts", glow: "hover:shadow-green-500/20" },
            { name: "Vercel KV", glow: "hover:shadow-white/20" },
          ].map((tech, index) => (
            <motion.div
              key={tech.name}
              whileHover={{ scale: 1.05, y: -2 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className={`bg-slate-800/50 border border-slate-700/50 text-slate-200 px-4 py-3 rounded-lg text-center font-mono text-sm hover:border-purple-500/50 hover:bg-slate-800 transition-all hover:shadow-lg ${tech.glow}`}
            >
              {tech.name}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center space-y-6 py-8"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="w-24 h-px bg-gradient-to-r from-transparent to-purple-500/50" />
          <p className="text-slate-400 font-light">Ready to start your mission?</p>
          <div className="w-24 h-px bg-gradient-to-l from-transparent to-purple-500/50" />
        </div>
        
        <Link
          href="/search"
          className="relative inline-block group"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg opacity-70 group-hover:opacity-100 blur transition duration-300" />
          
          <div className="relative px-8 py-3 bg-slate-900 rounded-lg font-bold text-white border border-purple-500/50 group-hover:border-cyan-500/50 transition-all">
            <span className="flex items-center gap-2">
              <span className="text-cyan-400">▸</span>
              INITIATE SCAN
              <span className="text-purple-400">◂</span>
            </span>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
