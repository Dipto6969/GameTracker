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

  const COLORS = ["#2563eb", "#9333ea", "#7c3aed", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"]

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
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Total Games</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalGames}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Average Rating</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">⭐ {averageRating}</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genre Pie Chart */}
        {genreData.length > 0 && (
          <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-slate-200 dark:border-neutral-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Genres</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genreData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Year Bar Chart */}
        {yearData.length > 0 && (
          <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-slate-200 dark:border-neutral-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Games by Year</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
