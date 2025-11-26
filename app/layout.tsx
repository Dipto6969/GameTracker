import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ToastProvider } from "@/lib/toast-context"
import { ThemeProviderClient } from "@/components/theme-provider-client"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import ThemeSwitcher from "@/components/theme-switcher"
import TrendingGamesModal from "@/components/trending-games-modal"
import GameAnnouncementsPanel from "@/components/game-announcements-panel"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Game Tracker - Track Your Gaming Library",
  description: "Search and manage your video game collection with ease",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.className} font-sans antialiased bg-white dark:bg-neutral-900`}>
        <ThemeProviderClient>
          <ToastProvider>
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-800/80 border-b border-slate-200 dark:border-neutral-700 shadow-sm backdrop-blur-sm">
              <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    GT
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Game Tracker</h1>
                </a>
                <nav className="flex gap-6 items-center">
                  <a href="/" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium">
                    📚 Library
                  </a>
                  <a href="/search" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium">
                    🔍 Search
                  </a>
                  <a href="/about" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium">
                    ℹ️ About
                  </a>
                  <GameAnnouncementsPanel />
                  <TrendingGamesModal />
                  <ThemeSwitcher />
                  <DarkModeToggle />
                </nav>
              </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen">{children}</main>
          </ToastProvider>
        </ThemeProviderClient>
      </body>
    </html>
  )
}
