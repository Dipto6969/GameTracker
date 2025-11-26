"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl mb-12"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 blur-3xl" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative px-6 md:px-12 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            Your Game Library
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 max-w-2xl">
            Track everything you play. Search • Save • Explore • Rate
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/search"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            🔍 Search Games
          </Link>
          <a
            href="#library"
            className="inline-flex items-center justify-center px-8 py-3 bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 dark:hover:bg-neutral-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-all duration-200"
          >
            ↓ View Library
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
}
