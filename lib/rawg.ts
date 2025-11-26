"use server"

const RAWG_BASE = "https://api.rawg.io/api"
const RAWG_KEY = process.env.RAWG_API_KEY

export interface Game {
  id: number
  name: string
  background_image?: string
  released?: string
  rating?: number
  metacritic?: number
  description?: string
  genres?: Array<{ id: number; name: string }>
}

export async function searchGames(query: string): Promise<Game[]> {
  if (!query.trim()) return []

  try {
    const url = `${RAWG_BASE}/games?key=${RAWG_KEY}&search=${encodeURIComponent(query)}&page_size=20`
    const res = await fetch(url)

    if (!res.ok) {
      console.error("[RAWG] Search failed:", res.status)
      return []
    }

    const data = await res.json()
    return data.results || []
  } catch (error) {
    console.error("[RAWG] Search error:", error)
    return []
  }
}

export async function getGameById(id: number): Promise<Game | null> {
  if (!id) return null

  try {
    const res = await fetch(`${RAWG_BASE}/games/${id}?key=${RAWG_KEY}`)

    if (!res.ok) {
      console.error("[RAWG] Fetch failed:", res.status)
      return null
    }

    return await res.json()
  } catch (error) {
    console.error("[RAWG] Fetch error:", error)
    return null
  }
}
