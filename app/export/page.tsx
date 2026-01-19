"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { getAllGames } from "@/lib/kv"
import { StoredGame } from "@/lib/kv"
import { FileDown, ArrowLeft, Filter, Search, Printer, Trophy, Star, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ExportPage() {
  const [games, setGames] = useState<StoredGame[]>([])
  const [filteredGames, setFilteredGames] = useState<StoredGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [genreFilter, setGenreFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")

  useEffect(() => {
    loadGames()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [games, searchQuery, statusFilter, genreFilter, ratingFilter])

  const loadGames = async () => {
    try {
      const data = await getAllGames()
      setGames(data)
      setFilteredGames(data)
    } catch (error) {
      console.error("Error loading games:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...games]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((game) => game.status === statusFilter)
    }

    // Genre filter
    if (genreFilter !== "all") {
      filtered = filtered.filter((game) =>
        game.genres?.some((g) => g.name === genreFilter)
      )
    }

    // Rating filter
    if (ratingFilter !== "all") {
      if (ratingFilter === "5") {
        filtered = filtered.filter((game) => (game.userRating || 0) === 5)
      } else if (ratingFilter === "4+") {
        filtered = filtered.filter((game) => (game.userRating || 0) >= 4)
      } else if (ratingFilter === "3+") {
        filtered = filtered.filter((game) => (game.userRating || 0) >= 3)
      }
    }

    setFilteredGames(filtered)
  }



  const handlePrint = async () => {
    try {
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default
      
      // Get the content to convert
      const element = document.getElementById('pdf-content')
      if (!element) return
      
      // Configure PDF options
      const opt = {
        margin: 0.5,
        filename: `gaming-portfolio-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }
      
      // Generate and download PDF
      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('PDF generation error:', error)
      // Fallback to print dialog
      window.print()
    }
  }

  // Get unique genres
  const allGenres = Array.from(
    new Set(
      games.flatMap((game) => game.genres?.map((g) => g.name) || [])
    )
  ).sort()

  // Calculate stats
  const stats = {
    total: filteredGames.length,
    completed: filteredGames.filter((g) => g.status === "completed").length,
    playing: filteredGames.filter((g) => g.status === "playing").length,
    backlog: filteredGames.filter((g) => g.status === "backlog").length,
    wishlist: filteredGames.filter((g) => g.status === "wishlist").length,
    avgRating:
      filteredGames.length > 0
        ? (
            filteredGames.reduce((sum, g) => sum + (g.userRating || 0), 0) /
            filteredGames.filter((g) => g.userRating).length
          ).toFixed(1)
        : "N/A",
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your game library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto" id="pdf-content">
        {/* Header - Hidden when printing */}
        <div className="mb-8 print:hidden">
          <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
                🎮 MY GAMING PORTFOLIO
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Epic Collection • Level {stats.total} • {stats.completed} Achievements Unlocked
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <Button onClick={handlePrint} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg">
                <FileDown className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Gaming Style */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-5 rounded-xl shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <p className="text-sm text-purple-100 font-semibold">LIBRARY SIZE</p>
            </div>
            <p className="text-3xl font-black text-white">{stats.total}</p>
            <p className="text-xs text-purple-200 mt-1">Games Collected</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-xl shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-300" />
              <p className="text-sm text-blue-100 font-semibold">COMPLETED</p>
            </div>
            <p className="text-3xl font-black text-white">{stats.completed}</p>
            <p className="text-xs text-blue-200 mt-1">100% Achievements</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-5 rounded-xl shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <p className="text-sm text-green-100 font-semibold">PLAYING NOW</p>
            </div>
            <p className="text-3xl font-black text-white">{stats.playing}</p>
            <p className="text-xs text-green-200 mt-1">Active Sessions</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-5 rounded-xl shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <FileDown className="w-5 h-5 text-yellow-100" />
              <p className="text-sm text-yellow-100 font-semibold">BACKLOG</p>
            </div>
            <p className="text-3xl font-black text-white">{stats.backlog}</p>
            <p className="text-xs text-yellow-200 mt-1">Next Up</p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-5 rounded-xl shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <p className="text-sm text-pink-100 font-semibold">AVG RATING</p>
            </div>
            <p className="text-3xl font-black text-white">⭐ {stats.avgRating}</p>
            <p className="text-xs text-pink-200 mt-1">Personal Score</p>
          </div>
        </div>

        {/* Filters - Hidden when printing */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-slate-200 dark:border-neutral-700 mb-8 print:hidden">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="playing">Playing</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="wishlist">Wishlist</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                Genre
              </label>
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {allGenres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                Your Rating
              </label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                  <SelectItem value="4+">⭐⭐⭐⭐ (4+)</SelectItem>
                  <SelectItem value="3+">⭐⭐⭐ (3+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No games found matching your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-700 hover:shadow-lg transition-shadow print:break-inside-avoid"
              >
                <Link href={`/game/${game.id}`} className="block print:pointer-events-none">
                  {game.background_image ? (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="w-full aspect-[3/4] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-slate-200 dark:bg-neutral-700 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">No Image</span>
                    </div>
                  )}
                </Link>

                <div className="p-3">
                  <Link href={`/game/${game.id}`} className="print:pointer-events-none">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 mb-2">
                      {game.name}
                    </h3>
                  </Link>

                  {game.status && (
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        game.status === "completed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : game.status === "playing"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : game.status === "backlog"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : game.status === "wishlist"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {game.status}
                    </span>
                  )}

                  {game.userRating && (
                    <div className="mt-2 text-yellow-500 text-xs">
                      {"⭐".repeat(game.userRating)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Print/PDF Styles - Gaming Portfolio Theme */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
            size: letter;
          }
          
          body {
            background: #0a0a0a !important;
            color: white !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .print\\:pointer-events-none {
            pointer-events: none;
          }
          
          /* Gaming-themed PDF header */
          h1 {
            font-size: 2.5rem !important;
            font-weight: 900 !important;
            background: linear-gradient(to right, #9333ea, #ec4899, #f97316) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            margin-bottom: 1rem !important;
          }
          
          /* Stat cards in print */
          [class*="gradient"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Game cards */
          img {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Dark theme for PDF */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Fix game card text colors */
          h3, .font-semibold {
            color: white !important;
          }
          
          /* Status badges - ensure text is white on colored backgrounds */
          .inline-block.px-2.py-1.rounded {
            color: white !important;
            font-weight: 600 !important;
          }
        }
      `}</style>
    </div>
  )
}
