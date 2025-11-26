"use server"

import { promises as fs } from "fs"
import path from "path"

const GAMES_KEY = "games:list"
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
      await kv.lpush(GAMES_KEY, JSON.stringify(item))
      return item
    } catch (error) {
      console.log("[KV] KV operation failed, falling back to file storage:", error)
      const games = await readGamesFile()
      games.unshift(item)
      await writeGamesFile(games)
      return item
    }
  } else {
    // Use file-based storage
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
        const raw = await kv.lrange(GAMES_KEY, 0, 9999)
        return raw
          .map((r: string) => {
            try {
              return JSON.parse(r)
            } catch {
              return null
            }
          })
          .filter(Boolean)
      } catch (error) {
        console.log("[KV] KV operation failed, falling back to file storage:", error)
        return await readGamesFile()
      }
    } else {
      // Use file-based storage
      return await readGamesFile()
    }
  } catch (error) {
    console.error("[KV] List error:", error)
    return []
  }
}

async function getGameFromKVById(id: string): Promise<StoredGame | null> {
  try {
    const all = await listGamesFromKV()
    return all.find((g) => g._id === id) || null
  } catch (error) {
    console.error("[KV] Get error:", error)
    return null
  }
}

async function updateGameInKV(id: string, updates: Partial<StoredGame>): Promise<StoredGame | null> {
  try {
    const games = await listGamesFromKV()
    const gameIndex = games.findIndex((g) => g._id === id)
    
    if (gameIndex === -1) {
      return null
    }

    games[gameIndex] = {
      ...games[gameIndex],
      ...updates,
    }

    await writeGamesFile(games)
    return games[gameIndex]
  } catch (error) {
    console.error("[KV] Update error:", error)
    return null
  }
}

async function deleteGameFromKV(id: string): Promise<boolean> {
  try {
    const games = await listGamesFromKV()
    const gameIndex = games.findIndex((g) => g._id === id)
    
    if (gameIndex === -1) {
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
