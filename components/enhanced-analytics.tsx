"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AnalyticsData {
  totalGames: number
  completedGames: number
  playingGames: number
  backlogGames: number
  droppedGames: number
  wishlistGames: number
  totalHoursPlayed: number
  averageRating: number
  favoriteCount: number
  genreStats: Array<{ name: string; count: number; avgRating: number }>
  statusDistribution: Array<{ status: string; count: number }>
  yearlyStats: Array<{ year: number; completed: number }>
  topRatedGames: Array<{ name: string; rating: number }>
  mostPlayedGames: Array<{ name: string; hours: number }>
  completionRate: number
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function EnhancedAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics")
        const data = await res.json()
        setAnalytics(data)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-40 bg-slate-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
      </motion.div>
    )
  }

  if (!analytics) {
    return <div className="text-center text-slate-600 dark:text-slate-400">Failed to load analytics</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Games" value={analytics.totalGames} icon="🎮" color="blue" />
        <MetricCard label="Completed" value={analytics.completedGames} icon="✅" color="green" subtext={`${analytics.completionRate}% done`} />
        <MetricCard label="Playing Now" value={analytics.playingGames} icon="▶️" color="yellow" />
        <MetricCard label="Total Hours" value={`${Math.round(analytics.totalHoursPlayed)}h`} icon="⏱️" color="purple" />
      </div>

      {/* Second Row - More Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Average Rating" value={`${analytics.averageRating}/5`} icon="⭐" color="yellow" />
        <MetricCard label="Favorites" value={analytics.favoriteCount} icon="❤️" color="red" />
        <MetricCard label="Backlog" value={analytics.backlogGames} icon="📋" color="blue" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-slate-200 dark:border-neutral-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {analytics.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Genres Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-slate-200 dark:border-neutral-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Genres</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.genreStats.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yearly Completion Trend */}
        {analytics.yearlyStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-slate-200 dark:border-neutral-700"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Games Completed by Year</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.yearlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Top Rated Games */}
        {analytics.topRatedGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-slate-200 dark:border-neutral-700"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Top Rated Games</h3>
            <div className="space-y-3">
              {analytics.topRatedGames.map((game, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{game.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{game.rating.toFixed(1)}/5</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Most Played Games */}
      {analytics.mostPlayedGames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-slate-200 dark:border-neutral-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Most Played Games</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.mostPlayedGames}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9ca3af" label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                formatter={(value) => [`${value}h`, "Hours Played"]}
              />
              <Bar dataKey="hours" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <StatBox label="Backlog" value={analytics.backlogGames} description="games to play" icon="📋" />
        <StatBox label="Dropped" value={analytics.droppedGames} description="games abandoned" icon="⛔" />
        <StatBox label="Wishlist" value={analytics.wishlistGames} description="games wanted" icon="🎁" />
      </motion.div>
    </motion.div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  color,
  subtext,
}: {
  label: string
  value: string | number
  icon: string
  color: string
  subtext?: string
}) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    yellow: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    red: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colorClasses[color as keyof typeof colorClasses]} p-4 rounded-lg border`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-sm font-medium">{label}</p>
      {subtext && <p className="text-xs opacity-75 mt-1">{subtext}</p>}
    </motion.div>
  )
}

function StatBox({ label, value, description, icon }: { label: string; value: number; description: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-slate-200 dark:border-neutral-700 text-center"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{description}</p>
    </motion.div>
  )
}
