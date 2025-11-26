"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Palette } from "lucide-react"
import { useState } from "react"
import { useColorTheme } from "@/hooks/use-color-theme"

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes, isLoaded } = useColorTheme()
  const [isOpen, setIsOpen] = useState(false)

  if (!isLoaded) return null

  const themeColors: Record<string, string> = {
    "light-blue": "from-blue-400 to-blue-600",
    "dark-purple": "from-purple-600 to-purple-800",
    "forest-green": "from-green-600 to-green-800",
  }

  const themeEmojis: Record<string, string> = {
    "light-blue": "🔵",
    "dark-purple": "🟣",
    "forest-green": "🟢",
  }

  return (
    <div className="relative">
      {/* Theme Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-600 transition-colors"
        title="Change color theme"
      >
        <Palette size={18} />
        <span className="hidden sm:inline text-sm font-medium">Theme</span>
      </motion.button>

      {/* Theme Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-slate-200 dark:border-neutral-700 overflow-hidden z-50"
          >
            <div className="p-2 space-y-1">
              {availableThemes.map((theme) => (
                <motion.button
                  key={theme.name}
                  onClick={() => {
                    setTheme(theme.name)
                    setIsOpen(false)
                  }}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    currentTheme === theme.name
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-lg">{themeEmojis[theme.name]}</span>
                  <span className="flex-1 text-left text-sm font-medium">{theme.label}</span>
                  {currentTheme === theme.name && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
