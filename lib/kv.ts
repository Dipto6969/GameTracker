"use server"

import { promises as fs } from "fs"
import path from "path"

const GAMES_KEY = "games:hash:v2"
const GAMES_FILE = path.join(process.cwd(), ".games.json")

export interface StoredGame {
  _id: string
  id: number
  name: string
  background_image?: string
  released?: string
  rating?: number
  metacritic?: number
  description?: string
  genres?: Array<{ id: number; name: string }>
  platforms?: Array<{ id: number; name: string }>
  storedAt: number
  // User-added fields
  status?: "playing" | "completed" | "backlog" | "dropped" | "wishlist"
  isFavorite?: boolean
  userRating?: number // 1-5 stars
  notes?: string
  tags?: string[]
  hoursPlayed?: number // Hours spent on this game
  dateCompleted?: number // Timestamp when completed
  platforms_owned?: string[] // e.g., ["PC", "PS5", "Nintendo Switch"]
}

// Try to use Vercel KV if available, otherwise fall back to file-based storage
let kvAvailable = false
let kv: any = null

try {
  // Import Vercel KV dynamically
  const { kv: kvInstance } = require("@vercel/kv")
  kv = kvInstance
  kvAvailable = !!kv
  console.log("[KV] Vercel KV loaded successfully")
} catch (error) {
  console.log("[KV] Vercel KV not configured, using file-based storage:", error)
  kvAvailable = false
}

// File-based storage functions
async function readGamesFile(): Promise<StoredGame[]> {
  try {
    const data = await fs.readFile(GAMES_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeGamesFile(games: StoredGame[]): Promise<void> {
  await fs.writeFile(GAMES_FILE, JSON.stringify(games, null, 2))
}

// KV-based storage functions
async function addGameToKV(game: any): Promise<StoredGame> {
  const id = (game.id || game.slug || Date.now()).toString()
  const item: StoredGame = {
    ...game,
    storedAt: Date.now(),
    _id: id,
  }

  if (kvAvailable && kv) {
    try {
      console.log("[KV] Adding game to KV:", id)
      // Store as a hash/object instead of list for better retrieval
      await kv.hset(GAMES_KEY, { [id]: JSON.stringify(item) })
      console.log("[KV] Game added successfully to KV")
      return item
    } catch (error) {
      console.error("[KV] KV add operation failed:", error)
      // Fallback to file storage
      const games = await readGamesFile()
      games.unshift(item)
      await writeGamesFile(games)
      return item
    }
  } else {
    // Use file-based storage
    console.log("[KV] KV not available, using file storage")
    const games = await readGamesFile()
    games.unshift(item)
    await writeGamesFile(games)
    return item
  }
}

async function listGamesFromKV(): Promise<StoredGame[]> {
  try {
    if (kvAvailable && kv) {
      try {
        console.log("[KV] Fetching games from KV")
        const raw = await kv.hgetall(GAMES_KEY)
        console.log("[KV] Raw KV data:", raw)
        
        if (!raw || typeof raw !== 'object') {
          console.log("[KV] No games found in KV, returning empty array")
          return []
        }
        
        const games = Object.entries(raw)
          .map(([key, value]: [string, any]) => {
            try {
              const parsed = typeof value === 'string' ? JSON.parse(value) : value
              return parsed
            } catch (e) {
              console.error("[KV] Failed to parse game:", key, e)
              return null
            }
          })
          .filter(Boolean) as StoredGame[]
        
        console.log("[KV] Successfully retrieved", games.length, "games from KV")
        return games
      } catch (error) {
        console.error("[KV] KV retrieval failed:", error)
        console.log("[KV] Falling back to file storage")
        return await readGamesFile()
      }
    } else {
      // Use file-based storage
      console.log("[KV] KV not available, using file storage")
      return await readGamesFile()
    }
  } catch (error) {
    console.error("[KV] List error:", error)
    return []
  }
}

async function getGameFromKVById(id: string): Promise<StoredGame | null> {
  try {
    if (kvAvailable && kv) {
      try {
        const raw = await kv.hget(GAMES_KEY, id)
        if (!raw) return null
        return typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch (error) {
        console.error("[KV] Get from KV failed:", error)
      }
    }
    
    // Fallback: get all and find
    const all = await listGamesFromKV()
    return all.find((g) => g._id === id) || null
  } catch (error) {
    console.error("[KV] Get error:", error)
    return null
  }
}

async function updateGameInKV(id: string, updates: Partial<StoredGame>): Promise<StoredGame | null> {
  try {
    console.log("[KV] Updating game:", id, updates)
    const games = await listGamesFromKV()
    const gameIndex = games.findIndex((g) => g._id === id)
    
    if (gameIndex === -1) {
      console.log("[KV] Game not found:", id)
      return null
    }

    const updatedGame = {
      ...games[gameIndex],
      ...updates,
    }
    
    games[gameIndex] = updatedGame

    // Write back to KV
    if (kvAvailable && kv) {
      try {
        console.log("[KV] Updating game in KV:", id)
        await kv.hset(GAMES_KEY, { [id]: JSON.stringify(updatedGame) })
        console.log("[KV] Game updated successfully in KV")
      } catch (error) {
        console.error("[KV] KV update failed:", error)
        // Fallback to file
        await writeGamesFile(games)
      }
    } else {
      // Use file-based storage
      console.log("[KV] KV not available, updating file storage")
      await writeGamesFile(games)
    }
    
    return updatedGame
  } catch (error) {
    console.error("[KV] Update error:", error)
    return null
  }
}

async function deleteGameFromKV(id: string): Promise<boolean> {
  try {
    console.log("[KV] Deleting game:", id)
    
    // Delete from KV first
    if (kvAvailable && kv) {
      try {
        console.log("[KV] Deleting game from KV:", id)
        await kv.hdel(GAMES_KEY, [id])
        console.log("[KV] Game deleted successfully from KV")
        return true
      } catch (error) {
        console.error("[KV] KV delete failed:", error)
        // Fallback to file
      }
    }
    
    // Fallback: delete from file
    console.log("[KV] Deleting from file storage")
    const games = await readGamesFile()
    const gameIndex = games.findIndex((g) => g._id === id)
    
    if (gameIndex === -1) {
      console.log("[KV] Game not found in file:", id)
      return false
    }

    games.splice(gameIndex, 1)
    await writeGamesFile(games)
    return true
  } catch (error) {
    console.error("[KV] Delete error:", error)
    return false
  }
}

export const addGame = addGameToKV
export const getAllGames = listGamesFromKV
export const getGameById = getGameFromKVById
export const updateGame = updateGameInKV
export const deleteGame = deleteGameFromKV
