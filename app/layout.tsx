import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ToastProvider } from "@/lib/toast-context"
import { ThemeProviderClient } from "@/components/theme-provider-client"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import ThemeSwitcher from "@/components/theme-switcher"
import TrendingGamesModal from "@/components/trending-games-modal"
import GameAnnouncementsPanel from "@/components/game-announcements-panel"
import Logo from "@/components/logo"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GAME TRACKER // DOMINATE YOUR LIBRARY",
  description: "Track your grind. Dominate the game. Your ultimate gaming command center.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${_geist.className} font-sans antialiased bg-neutral-950 cyber-noise cyber-scanlines`}>
        <ThemeProviderClient>
          <ToastProvider>
            {/* Cyberpunk Header */}
            <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-purple-500/20 shadow-lg shadow-purple-500/5">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Logo />
                <nav className="flex gap-4 items-center">
                  <a href="/" className="cyber-button px-3 py-2 rounded text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all text-sm font-bold tracking-wide">
                    LIBRARY
                  </a>
                  <a href="/search" className="cyber-button px-3 py-2 rounded text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-bold tracking-wide">
                    SEARCH
                  </a>
                  <a href="/about" className="cyber-button px-3 py-2 rounded text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition-all text-sm font-bold tracking-wide">
                    ABOUT
                  </a>
                  <div className="w-px h-6 bg-purple-500/30" />
                  <GameAnnouncementsPanel />
                  <TrendingGamesModal />
                  <ThemeSwitcher />
                  <DarkModeToggle />
                </nav>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen">{children}</main>
            
            {/* Cyberpunk Footer */}
            <footer className="border-t border-purple-500/20 py-6 mt-12">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                  <span>© 2026 GAME TRACKER // ALL SYSTEMS NOMINAL</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    ONLINE
                  </span>
                </div>
              </div>
            </footer>
          </ToastProvider>
        </ThemeProviderClient>
      </body>
    </html>
  )
}
