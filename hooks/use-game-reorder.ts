'use client'

import { useState, useCallback, useEffect } from 'react'

export interface GameOrder {
  gameId: string
  order: number
}

const STORAGE_KEY = 'gameOrder'

export function useGameReorder() {
  const [gameOrder, setGameOrder] = useState<Map<string, number>>(new Map())
  const [isLoaded, setIsLoaded] = useState(false)

  // Load order from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: GameOrder[] = JSON.parse(stored)
        const map = new Map(parsed.map((item) => [item.gameId, item.order]))
        setGameOrder(map)
      }
      setIsLoaded(true)
    } catch (error) {
      console.error('Failed to load game order:', error)
      setIsLoaded(true)
    }
  }, [])

  // Save order to localStorage
  const saveOrder = useCallback((order: Map<string, number>) => {
    try {
      const array = Array.from(order.entries()).map(([gameId, orderIndex]) => ({
        gameId,
        order: orderIndex,
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(array))
    } catch (error) {
      console.error('Failed to save game order:', error)
    }
  }, [])

  // Reorder games
  const reorderGames = useCallback(
    <T extends { _id: string; id?: number }>(games: T[], fromIndex: number, toIndex: number): T[] => {
      const newGames = [...games]
      const [movedGame] = newGames.splice(fromIndex, 1)
      newGames.splice(toIndex, 0, movedGame)

      // Update order map
      const newOrder = new Map(gameOrder)
      newGames.forEach((game, index) => {
        const gameId = game._id || String(game.id)
        newOrder.set(gameId, index)
      })

      setGameOrder(newOrder)
      saveOrder(newOrder)

      return newGames
    },
    [gameOrder, saveOrder]
  )

  // Apply saved order to games
  const applySavedOrder = useCallback(
    <T extends { _id: string; id?: number }>(games: T[]): T[] => {
      if (gameOrder.size === 0) return games

      return [...games].sort((a, b) => {
        const aId = a._id || String(a.id)
        const bId = b._id || String(b.id)
        const aOrder = gameOrder.get(aId) ?? games.indexOf(a)
        const bOrder = gameOrder.get(bId) ?? games.indexOf(b)
        return aOrder - bOrder
      })
    },
    [gameOrder]
  )

  // Reset order to default
  const resetOrder = useCallback(() => {
    setGameOrder(new Map())
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    gameOrder,
    reorderGames,
    applySavedOrder,
    resetOrder,
    isLoaded,
  }
}
