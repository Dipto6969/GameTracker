'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const shortcuts = [
    { key: '?', description: 'Open this help menu', icon: '❓' },
    { key: '/', description: 'Focus search', icon: '🔍' },
    { key: 'n', description: 'Go to search (new game)', icon: '➕' },
    { key: 'g', description: 'Go to library', icon: '📚' },
    { key: 'a', description: 'Go to about', icon: 'ℹ️' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-neutral-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h2>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {shortcuts.map((shortcut, idx) => (
                <motion.div
                  key={shortcut.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{shortcut.icon}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{shortcut.description}</span>
                  </div>
                  <kbd className="px-2 py-1 bg-slate-200 dark:bg-neutral-600 text-slate-900 dark:text-white text-xs font-semibold rounded">
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-neutral-700 rounded-b-lg text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400">Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-neutral-600 rounded text-xs">Esc</kbd> to close</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
