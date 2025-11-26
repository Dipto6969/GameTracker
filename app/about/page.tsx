"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function AboutPage() {
  const features = [
    {
      icon: "🔍",
      title: "Search & Discover",
      description: "Search from thousands of games in RAWG's database and add them to your library.",
    },
    {
      icon: "📚",
      title: "Organize Your Library",
      description: "Categorize games by status (Playing, Completed, Backlog, Dropped, Wishlist).",
    },
    {
      icon: "⭐",
      title: "Rate & Review",
      description: "Give games personal ratings, write reviews, and add custom tags.",
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "View beautiful charts showing your games by genre and release year.",
    },
    {
      icon: "❤️",
      title: "Mark Favorites",
      description: "Star your favorite games and sort them to the top.",
    },
    {
      icon: "🌙",
      title: "Dark Mode",
      description: "Enjoy a dark theme optimized for comfortable late-night gaming sessions.",
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
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">About Game Tracker</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Your personal gaming companion to track, organize, and manage your video game collection.
        </p>
      </motion.div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-8 border border-blue-200 dark:border-blue-900"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          We believe gamers deserve a simple, beautiful tool to track their gaming journey. Game Tracker makes it easy
          to search for games, organize your library, write reviews, and discover insights about your gaming habits—all
          in one place.
        </p>
      </motion.div>

      {/* Features Grid */}
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
            className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-slate-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Built With</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Next.js 16",
            "React 19",
            "TypeScript",
            "Tailwind CSS",
            "Framer Motion",
            "SWR",
            "Recharts",
            "Vercel KV",
          ].map((tech, index) => (
            <motion.div
              key={tech}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg text-center font-medium"
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center space-y-4"
      >
        <p className="text-slate-600 dark:text-slate-400">Ready to start tracking your gaming library?</p>
        <Link
          href="/search"
          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg"
        >
          Start Searching
        </Link>
      </motion.div>
    </motion.div>
  )
}
