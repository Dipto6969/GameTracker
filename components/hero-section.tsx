"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface HeroStats {
  totalGames: number
  completedGames: number
  totalHoursPlayed: number
  completionRate: number
}

function AnimatedCounter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = value
    const incrementTime = (duration * 1000) / end
    
    if (end === 0) return
    
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start >= end) {
        clearInterval(timer)
        setCount(end)
      }
    }, Math.max(incrementTime, 20))
    
    return () => clearInterval(timer)
  }, [value, duration])
  
  return (
    <span className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

export default function HeroSection() {
  const [stats, setStats] = useState<HeroStats | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(data => {
        setStats({
          totalGames: data.totalGames || 0,
          completedGames: data.completedGames || 0,
          totalHoursPlayed: Math.round(data.totalHoursPlayed || 0),
          completionRate: data.completionRate || 0
        })
        setIsLoaded(true)
      })
      .catch(() => setIsLoaded(true))
  }, [])

  return (
    <div className="relative overflow-hidden mb-12">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        {/* Glowing Orbs */}
        <motion.div 
          className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent"
          style={{ height: '10%' }}
          animate={{ y: ['-100%', '1000%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 cyber-glass-strong rounded-2xl border border-purple-500/20"
      >
        <div className="px-6 md:px-12 py-12 md:py-16">
          {/* HUD Corner Decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-500/50" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/50" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/50" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-500/50" />

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-purple-400 mb-4 font-mono">
              // SYSTEM ONLINE
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                TRACK YOUR GRIND.
              </span>
              <br />
              <span className="text-white neon-text-purple">
                DOMINATE THE GAME.
              </span>
            </h1>
          </motion.div>

          {/* Animated Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {/* Total Games */}
            <div className="cyber-glass rounded-lg p-4 border border-purple-500/30 group hover:border-purple-500/60 transition-all">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-purple-400 font-mono mb-1">LIBRARY</p>
              <p className="text-2xl md:text-3xl font-black text-white group-hover:neon-text-purple transition-all">
                {isLoaded && stats ? <AnimatedCounter value={stats.totalGames} /> : "—"}
              </p>
              <p className="text-[10px] text-slate-500">GAMES</p>
            </div>

            {/* Completed */}
            <div className="cyber-glass rounded-lg p-4 border border-cyan-500/30 group hover:border-cyan-500/60 transition-all">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-cyan-400 font-mono mb-1">CONQUERED</p>
              <p className="text-2xl md:text-3xl font-black text-white group-hover:neon-text-cyan transition-all">
                {isLoaded && stats ? <AnimatedCounter value={stats.completedGames} /> : "—"}
              </p>
              <p className="text-[10px] text-slate-500">COMPLETED</p>
            </div>

            {/* Hours Played */}
            <div className="cyber-glass rounded-lg p-4 border border-green-500/30 group hover:border-green-500/60 transition-all">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-green-400 font-mono mb-1">TIME LOGGED</p>
              <p className="text-2xl md:text-3xl font-black text-white">
                {isLoaded && stats ? <AnimatedCounter value={stats.totalHoursPlayed} suffix="h" /> : "—"}
              </p>
              <p className="text-[10px] text-slate-500">HOURS</p>
            </div>

            {/* Completion Rate */}
            <div className="cyber-glass rounded-lg p-4 border border-pink-500/30 group hover:border-pink-500/60 transition-all">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-pink-400 font-mono mb-1">MASTERY</p>
              <p className="text-2xl md:text-3xl font-black text-white">
                {isLoaded && stats ? <AnimatedCounter value={stats.completionRate} suffix="%" /> : "—"}
              </p>
              <div className="mt-2 h-1 cyber-progress rounded-full" style={{ '--progress': `${stats?.completionRate || 0}%` } as any} />
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/search"
              className="cyber-button inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg transition-all duration-300 border border-purple-400/30"
            >
              <span className="mr-2">🎮</span>
              SEARCH GAMES
              <span className="ml-2 opacity-50">→</span>
            </Link>
            <a
              href="#library"
              className="cyber-button inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-cyan-500/50 text-cyan-400 rounded-lg font-bold text-lg hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300"
            >
              <span className="mr-2">↓</span>
              VIEW LIBRARY
            </a>
          </motion.div>

          {/* Status Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex items-center gap-3 text-xs font-mono text-slate-500"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
              SYSTEM ACTIVE
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-purple-400">v2.0.0</span>
            <span className="text-slate-700">|</span>
            <span>READY TO DOMINATE</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
