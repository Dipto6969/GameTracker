'use client'

import { useState, useCallback } from 'react'

export interface SimilarGame {
  _id?: string
  id?: number
  name: string
  background_image?: string
  released?: string
  rating?: number
  metacritic?: number
  description?: string
  genres?: Array<{ id: number; name: string }>
  platforms?: Array<{ id: number; name: string }>
  storedAt?: number
  status?: string
  isFavorite?: boolean
  userRating?: number
  notes?: string
  tags?: string[]
  hoursPlayed?: number
  dateCompleted?: number
  matchScore?: number
  matchReasons?: string[]
  source?: 'collection' | 'popular'
}

export function useSimilarGames() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateSimilarity = (currentGame: SimilarGame, otherGame: SimilarGame): SimilarGame | null => {
    const currentId = currentGame._id || currentGame.id
    const otherId = otherGame._id || otherGame.id

    if (currentId === otherId) {
      return null // Don't include the same game
    }

    let matchScore = 0
    const matchReasons: string[] = []

    // Genre matching (strongest signal)
    if (currentGame.genres && otherGame.genres && currentGame.genres.length > 0) {
      const currentGenres = currentGame.genres.map((g) => g.name.toLowerCase())
      const otherGenres = otherGame.genres.map((g) => g.name.toLowerCase())
      const commonGenres = currentGenres.filter((g) => otherGenres.includes(g))

      if (commonGenres.length > 0) {
        const genreScore = (commonGenres.length / Math.max(currentGenres.length, otherGenres.length)) * 50
        matchScore += genreScore
        matchReasons.push(`${commonGenres.length} shared genre${commonGenres.length > 1 ? 's' : ''}`)
      }
    }

    // Platform matching
    if (currentGame.platforms && otherGame.platforms && currentGame.platforms.length > 0) {
      const currentPlatforms = currentGame.platforms.map((p) => p.name.toLowerCase())
      const otherPlatforms = otherGame.platforms.map((p) => p.name.toLowerCase())
      const commonPlatforms = currentPlatforms.filter((p) => otherPlatforms.includes(p))

      if (commonPlatforms.length > 0) {
        const platformScore = (commonPlatforms.length / Math.max(currentPlatforms.length, otherPlatforms.length)) * 30
        matchScore += platformScore
        matchReasons.push(`Available on ${commonPlatforms[0]}`)
      }
    }

    // Rating similarity (within range)
    if (currentGame.rating && otherGame.rating) {
      const ratingDiff = Math.abs(currentGame.rating - otherGame.rating)
      if (ratingDiff <= 1.5) {
        matchScore += 20
        matchReasons.push(`Similar rating (${otherGame.rating.toFixed(1)})`)
      }
    }

    // Release year proximity
    if (currentGame.released && otherGame.released) {
      const currentYear = new Date(currentGame.released).getFullYear()
      const otherYear = new Date(otherGame.released).getFullYear()
      const yearDiff = Math.abs(currentYear - otherYear)

      if (yearDiff <= 2) {
        matchScore += 10
        matchReasons.push(`Released ${otherYear}`)
      }
    }

    if (matchScore === 0 || matchReasons.length === 0) {
      return null
    }

    return {
      ...otherGame,
      matchScore: Math.min(100, Math.round(matchScore)),
      matchReasons,
    }
  }

  const findSimilarGames = useCallback(
    (currentGame: SimilarGame, allGames: SimilarGame[], limit: number = 5): SimilarGame[] => {
      const similarities = allGames
        .map((game) => calculateSimilarity(currentGame, game))
        .filter((game): game is SimilarGame => game !== null)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, limit)

      return similarities
    },
    []
  )

  const fetchPopularGames = useCallback(async (): Promise<SimilarGame[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/popularGames')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch popular games')
      }

      return (data.games || []).map((game: any) => ({
        id: game.id,
        name: game.name,
        background_image: game.background_image,
        released: game.released,
        rating: game.rating,
        metacritic: game.metacritic,
        genres: game.genres || [],
        platforms: game.platforms || [],
        description: game.description,
        source: 'popular' as const,
      }))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error('Error fetching popular games:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    findSimilarGames,
    calculateSimilarity,
    fetchPopularGames,
    isLoading,
    error,
  }
}
