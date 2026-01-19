'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const shortcuts = [
    { key: '?', description: 'Open command menu', icon: '❓' },
    { key: '/', description: 'Focus scanner', icon: '🔍' },
    { key: 'n', description: 'New target scan', icon: '➕' },
    { key: 'g', description: 'Go to arsenal', icon: '📚' },
    { key: 'a', description: 'Intel dossier', icon: 'ℹ️' },
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-900/95 rounded-lg shadow-2xl max-w-md w-full border border-purple-500/30"
          >
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-500" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-500" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-500" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-500" />
            
            {/* Scan effect */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-[scanline_3s_linear_infinite]" />
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white font-mono">
                <span className="text-purple-400">//</span> HOTKEYS
              </h2>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-purple-400 transition-colors font-mono"
              >
                [ESC]
              </button>
            </div>

            {/* Content */}
            <div className="relative p-6 space-y-3 max-h-96 overflow-y-auto">
              {shortcuts.map((shortcut, idx) => (
                <motion.div
                  key={shortcut.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50 hover:border-purple-500/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{shortcut.icon}</span>
                    <span className="text-sm text-slate-300 font-mono group-hover:text-purple-300 transition-colors">
                      {shortcut.description}
                    </span>
                  </div>
                  <kbd className="px-3 py-1 bg-slate-900 text-purple-400 text-sm font-mono rounded border border-purple-500/30">
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="relative px-6 py-3 bg-slate-800/50 rounded-b-lg text-center border-t border-slate-700">
              <p className="text-xs text-slate-500 font-mono">
                Press <kbd className="px-2 py-0.5 bg-slate-900 text-purple-400 rounded border border-purple-500/30 mx-1">ESC</kbd> to close
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
