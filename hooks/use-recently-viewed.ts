import { useState, useEffect } from "react"

export interface RecentlyViewedGame {
  _id: string
  name: string
  background_image?: string
  viewedAt: number
}

const STORAGE_KEY = "gametracker_recently_viewed"
const MAX_ITEMS = 5

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedGame[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setRecentlyViewed(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load recently viewed:", error)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage when updated
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed))
      } catch (error) {
        console.error("Failed to save recently viewed:", error)
      }
    }
  }, [recentlyViewed, isLoaded])

  const addRecentlyViewed = (game: Omit<RecentlyViewedGame, "viewedAt">) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((g) => g._id !== game._id)
      // Add to front with current timestamp
      const updated = [
        { ...game, viewedAt: Date.now() },
        ...filtered,
      ]
      // Keep only MAX_ITEMS
      return updated.slice(0, MAX_ITEMS)
    })
  }

  const clearRecentlyViewed = () => {
    setRecentlyViewed([])
  }

  return {
    recentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed,
    isLoaded,
  }
}
