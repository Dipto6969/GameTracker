"use client"

import useSWR from "swr"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import GameCard from "@/components/game-card"
import LoadingSkeleton from "@/components/loading-skeleton"
import HeroSection from "@/components/hero-section"
import EnhancedAnalytics from "@/components/enhanced-analytics"
import { EmptyLibraryState, EmptyFilteredState } from "@/components/empty-states"
import { HelpModal } from "@/components/help-modal"
import RecentlyViewedSidebar from "@/components/recently-viewed-sidebar"
import Pagination from "@/components/pagination"
import BulkActionsToolbar from "@/components/bulk-actions-toolbar"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { useBulkSelection } from "@/hooks/use-bulk-selection"
import { useGameReorder } from "@/hooks/use-game-reorder"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HomePage() {
  const {
    data: games,
    isLoading,
    error,
    mutate,
  } = useSWR("/api/listGames", fetcher, {
    refreshInterval: 0,
  })

  // Listen for game-added event and refresh the list
  useEffect(() => {
    const handleGameAdded = () => {
      mutate()
    }

    window.addEventListener("game-added", handleGameAdded)
    return () => window.removeEventListener("game-added", handleGameAdded)
  }, [mutate])

  const [sortBy, setSortBy] = useState<"recent" | "name" | "favorites">("recent")
  const [filterGenre, setFilterGenre] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [helpOpen, setHelpOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Recently viewed tracking
  const { recentlyViewed, addRecentlyViewed, clearRecentlyViewed, isLoaded } = useRecentlyViewed()
  
  // Bulk operations
  const { selectedIds, selectedCount, toggleSelection, selectAll, deselectAll, toggleAll } = useBulkSelection()
  
  // Drag and drop reordering
  const { applySavedOrder, reorderGames, isLoaded: orderLoaded } = useGameReorder()
  
  const { toast } = useToast()

  // Keyboard shortcuts
  useKeyboardShortcuts(() => setHelpOpen(true))

  // Handle Escape to close help
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHelpOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  let filteredGames = games ? [...games] : []

  // Apply saved custom order first if not sorting/filtering
  if (orderLoaded && sortBy === "recent" && !filterGenre && !filterStatus) {
    filteredGames = applySavedOrder(filteredGames)
  }

  // Apply filters
  if (filterGenre) {
    filteredGames = filteredGames.filter((game) =>
      game.genres?.some((g: { name: string }) => g.name === filterGenre)
    )
  }
  if (filterStatus) {
    filteredGames = filteredGames.filter((game) => game.status === filterStatus)
  }

  // Apply sorting
  const sortedGames = filteredGames.sort((a, b) => {
    if (sortBy === "recent") {
      return b.storedAt - a.storedAt
    }
    if (sortBy === "favorites") {
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      return b.storedAt - a.storedAt
    }
    return a.name.localeCompare(b.name)
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedGames.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedGames = sortedGames.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterGenre, filterStatus, sortBy])

  // Handle items per page change
  useEffect(() => {
    const handleItemsPerPageChange = (e: Event) => {
      const event = e as CustomEvent
      setItemsPerPage(event.detail)
      setCurrentPage(1)
    }
    window.addEventListener("itemsPerPageChange", handleItemsPerPageChange)
    return () => window.removeEventListener("itemsPerPageChange", handleItemsPerPageChange)
  }, [])

  // Bulk action handlers
  const handleBulkMarkStatus = async (status: string) => {
    if (selectedIds.length === 0) return

    try {
      const updates = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/updateGame/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      )

      if (updates.every((res) => res.ok)) {
        toast({ title: "Success", description: `Marked ${selectedIds.length} games as ${status}` })
        mutate()
        deselectAll()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update games", variant: "destructive" })
    }
  }

  const handleBulkToggleFavorite = async () => {
    if (selectedIds.length === 0) return

    try {
      const updates = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/updateGame/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isFavorite: true }),
          })
        )
      )

      if (updates.every((res) => res.ok)) {
        toast({ title: "Success", description: `Added ${selectedIds.length} games to favorites` })
        mutate()
        deselectAll()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update games", variant: "destructive" })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    if (!confirm(`Delete ${selectedIds.length} games? This cannot be undone.`)) return

    try {
      const deletes = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/removeGame?id=${id}`, { method: "DELETE" })
        )
      )

      if (deletes.every((res) => res.ok)) {
        toast({ title: "Success", description: `Deleted ${selectedIds.length} games` })
        mutate()
        deselectAll()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete games", variant: "destructive" })
    }
  }

  const handleBulkAddTags = async (newTags: string[]) => {
    if (selectedIds.length === 0) return

    try {
      const updates = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/updateGame/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags: newTags }),
          })
        )
      )

      if (updates.every((res) => res.ok)) {
        toast({ title: "Success", description: `Added tags to ${selectedIds.length} games` })
        mutate()
        deselectAll()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add tags", variant: "destructive" })
    }
  }

  // Get unique genres for filter
  const genres = new Set<string>()
  games?.forEach((game: any) => {
    game.genres?.forEach((g: { name: string }) => {
      genres.add(g.name)
    })
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
    <div className="flex gap-8">
      <div className="flex-1">
        <div className="space-y-12">
          <HeroSection />

          {/* Enhanced Analytics Dashboard */}
          {games && games.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <EnhancedAnalytics />
            </motion.div>
          )}

          {/* Library Section */}
          <motion.div
            id="library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Games</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {sortedGames?.length || 0} game{sortedGames?.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              ⊞ Grid
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              ≡ List
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setHelpOpen(true)}
              className="px-4 py-2 rounded-lg font-medium bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 transition-all"
              title="Press ? for keyboard shortcuts"
            >
              ? Help
            </motion.button>
            {sortBy === "recent" && !filterGenre && !filterStatus && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  // Reset order will be implemented later
                  toast({ title: "Order reset to default", description: "Games returned to recent order" })
                }}
                className="px-4 py-2 rounded-lg font-medium bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 transition-all text-sm"
                title="Reset to default order"
              >
                ↻ Reset Order
              </motion.button>
            )}
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Sort: Recently Added</option>
            <option value="favorites">Sort: Favorites First</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>

          {genres.size > 0 && (
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {Array.from(genres).map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
            <option value="backlog">Backlog</option>
            <option value="dropped">Dropped</option>
            <option value="wishlist">Wishlist</option>
          </select>
        </div>

        {isLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg p-4 text-red-700 dark:text-red-200">
            Error loading games. Please try again.
          </div>
        ) : !games || games.length === 0 ? (
          <EmptyLibraryState />
        ) : sortedGames.length === 0 ? (
          <EmptyFilteredState onClear={() => {
            setFilterGenre("")
            setFilterStatus("")
          }} />
        ) : (
          <>
            <motion.div
              className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {paginatedGames.map((game) => (
                <motion.div key={game._id} variants={itemVariants}>
                  <div onClick={() => addRecentlyViewed({ 
                    _id: game._id, 
                    name: game.name, 
                    background_image: game.background_image 
                  })}>
                    <GameCard 
                      game={game}
                      viewMode={viewMode}
                      onDelete={() => mutate()}
                      onUpdate={() => mutate()}
                      isSelected={selectedIds.includes(game._id)}
                      onToggleSelection={toggleSelection}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedGames.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />

            {/* Help Modal */}
            <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
          </>
        )}
          </motion.div>
        </div>
      </div>

      {/* Recently Viewed Sidebar */}
      {isLoaded && <RecentlyViewedSidebar games={recentlyViewed} onClear={clearRecentlyViewed} />}

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedCount}
        onMarkStatus={handleBulkMarkStatus}
        onToggleFavorite={handleBulkToggleFavorite}
        onDelete={handleBulkDelete}
        onAddTags={handleBulkAddTags}
        onClear={deselectAll}
      />
    </div>
  )
}
