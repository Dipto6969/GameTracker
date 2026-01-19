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
    return <div className="text-center text-red-400 font-mono">⚠ ANALYTICS OFFLINE</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <h2 className="text-xl font-black text-white tracking-wider">
          <span className="text-cyan-400">//</span> ANALYTICS HUB
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>

      {/* Key Metrics Cards - Cyberpunk Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="TOTAL GAMES" value={analytics.totalGames} icon="🎮" color="purple" />
        <MetricCard label="CONQUERED" value={analytics.completedGames} icon="🏆" color="cyan" subtext={`${analytics.completionRate}% MASTERY`} />
        <MetricCard label="ACTIVE" value={analytics.playingGames} icon="▶" color="green" />
        <MetricCard label="TIME LOGGED" value={`${Math.round(analytics.totalHoursPlayed)}h`} icon="⚡" color="pink" />
      </div>

      {/* Second Row - More Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="AVG RATING" value={`${analytics.averageRating}/5`} icon="★" color="yellow" />
        <MetricCard label="FAVORITES" value={analytics.favoriteCount} icon="♥" color="red" />
        <MetricCard label="BACKLOG" value={analytics.backlogGames} icon="◈" color="purple" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-glass p-6 rounded-lg border border-purple-500/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">◆</span> STATUS BREAKDOWN
          </h3>
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
              <Tooltip contentStyle={{ backgroundColor: "#0a0a0f", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "8px", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Genres Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="cyber-glass p-6 rounded-lg border border-cyan-500/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">◆</span> TOP GENRES
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.genreStats.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.2)" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#0a0a0f", border: "1px solid rgba(34, 211, 238, 0.3)", borderRadius: "8px", color: "#fff" }} />
              <Bar dataKey="count" fill="#a855f7" radius={[8, 8, 0, 0]} />
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
            className="cyber-glass p-6 rounded-lg border border-green-500/30"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">◆</span> YEARLY CONQUESTS
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.yearlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(57, 255, 20, 0.2)" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#0a0a0f", border: "1px solid rgba(57, 255, 20, 0.3)", borderRadius: "8px", color: "#fff" }} />
                <Line type="monotone" dataKey="completed" stroke="#39ff14" strokeWidth={2} dot={{ fill: "#39ff14" }} />
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
            className="cyber-glass p-6 rounded-lg border border-yellow-500/30"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-yellow-400">◆</span> HALL OF FAME
            </h3>
            <div className="space-y-3">
              {analytics.topRatedGames.map((game, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center justify-between p-3 cyber-glass rounded-lg border border-yellow-500/20 hover:border-yellow-500/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white truncate">{game.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm font-bold text-yellow-400">{game.rating.toFixed(1)}/5</span>
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
          className="cyber-glass p-6 rounded-lg border border-pink-500/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">◆</span> TIME INVESTED
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.mostPlayedGames}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 0, 255, 0.2)" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9ca3af" label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0a0a0f", border: "1px solid rgba(255, 0, 255, 0.3)", borderRadius: "8px", color: "#fff" }}
                formatter={(value) => [`${value}h`, "Hours Played"]}
              />
              <Bar dataKey="hours" fill="#ff00ff" radius={[8, 8, 0, 0]} />
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
        <StatBox label="BACKLOG" value={analytics.backlogGames} description="awaiting deployment" icon="◈" />
        <StatBox label="DROPPED" value={analytics.droppedGames} description="missions aborted" icon="✕" />
        <StatBox label="WISHLIST" value={analytics.wishlistGames} description="targets acquired" icon="★" />
      </motion.div>
    </motion.div>
  )
}

// Cyberpunk Metric Card
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
    purple: "border-purple-500/40 hover:border-purple-500/80 text-purple-400",
    cyan: "border-cyan-500/40 hover:border-cyan-500/80 text-cyan-400",
    green: "border-green-500/40 hover:border-green-500/80 text-green-400",
    pink: "border-pink-500/40 hover:border-pink-500/80 text-pink-400",
    yellow: "border-yellow-500/40 hover:border-yellow-500/80 text-yellow-400",
    red: "border-red-500/40 hover:border-red-500/80 text-red-400",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`cyber-glass p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]} transition-all cursor-default`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-black text-white">{value}</span>
      </div>
      <p className="text-xs font-bold tracking-wider">{label}</p>
      {subtext && <p className="text-[10px] opacity-60 mt-1 font-mono">{subtext}</p>}
    </motion.div>
  )
}

// Cyberpunk Stat Box
function StatBox({ label, value, description, icon }: { label: string; value: number; description: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className="cyber-glass p-4 rounded-lg border border-slate-700/50 hover:border-purple-500/50 text-center transition-all"
    >
      <div className="text-2xl mb-2 text-purple-400">{icon}</div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-xs font-bold text-purple-400 tracking-wider">{label}</p>
      <p className="text-[10px] text-slate-500 mt-1 font-mono">{description}</p>
    </motion.div>
  )
}
