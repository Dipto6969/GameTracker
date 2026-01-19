"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface DashboardProps {
  games: Array<{
    id: number
    name: string
    rating?: number
    genres?: Array<{ id: number; name: string }>
    released?: string
  }>
}

export default function Dashboard({ games }: DashboardProps) {
  // Calculate stats
  const totalGames = games.length
  const averageRating = games.length > 0 ? (games.reduce((sum, g) => sum + (g.rating || 0), 0) / games.length).toFixed(1) : 0

  // Genre distribution
  const genreMap: { [key: string]: number } = {}
  games.forEach((game) => {
    if (game.genres && game.genres.length > 0) {
      game.genres.forEach((genre) => {
        genreMap[genre.name] = (genreMap[genre.name] || 0) + 1
      })
    }
  })
  const genreData = Object.entries(genreMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Year distribution
  const yearMap: { [key: string]: number } = {}
  games.forEach((game) => {
    if (game.released) {
      const year = new Date(game.released).getFullYear()
      if (year && year > 1900 && year < 2100) {
        yearMap[year] = (yearMap[year] || 0) + 1
      }
    }
  })
  const yearData = Object.entries(yearMap)
    .map(([year, count]) => ({ year, count: Number(count) }))
    .sort((a, b) => Number(a.year) - Number(b.year))
    .slice(-10)

  const COLORS = ["#a855f7", "#06b6d4", "#22c55e", "#f97316", "#ec4899", "#eab308", "#3b82f6"]

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="relative bg-slate-900/80 rounded-lg p-6 border border-purple-500/50 overflow-hidden group">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500" />
          {/* Glow effect */}
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-sm font-mono text-purple-400 mb-2">// TOTAL TARGETS</p>
          <p className="text-4xl font-bold text-purple-300 font-mono">{totalGames}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="relative bg-slate-900/80 rounded-lg p-6 border border-cyan-500/50 overflow-hidden group">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />
          {/* Glow effect */}
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-sm font-mono text-cyan-400 mb-2">// AVG RATING</p>
          <p className="text-4xl font-bold text-cyan-300 font-mono">⭐ {averageRating}</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genre Pie Chart */}
        {genreData.length > 0 && (
          <motion.div variants={itemVariants} className="relative bg-slate-900/80 rounded-lg p-6 border border-purple-500/30">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500/50" />
            <h3 className="text-sm font-mono text-purple-400 mb-4">// TOP GENRES</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genreData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={80} fill="#a855f7" dataKey="value" stroke="#0f172a">
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}  
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #a855f7', borderRadius: '8px', color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Year Bar Chart */}
        {yearData.length > 0 && (
          <motion.div variants={itemVariants} className="relative bg-slate-900/80 rounded-lg p-6 border border-cyan-500/30">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />
            <h3 className="text-sm font-mono text-cyan-400 mb-4">// GAMES BY YEAR</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4', borderRadius: '8px', color: '#e2e8f0' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
