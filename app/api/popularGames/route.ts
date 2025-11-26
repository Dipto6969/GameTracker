import { NextResponse } from 'next/server'

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
let cachedGames: any[] = []
let cacheTime = 0

export async function GET() {
  try {
    // Check if cache is still valid
    if (cachedGames.length > 0 && Date.now() - cacheTime < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        games: cachedGames,
        cached: true,
      })
    }

    // Fetch top-rated games from RAWG API
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&ordering=-rating&page_size=500&populate=true`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    )

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`)
    }

    const data = await response.json()
    cachedGames = data.results || []
    cacheTime = Date.now()

    return NextResponse.json({
      success: true,
      games: cachedGames,
      cached: false,
    })
  } catch (error) {
    console.error('Error fetching popular games:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch popular games',
        games: cachedGames, // Return cached games even if fetch fails
      },
      { status: 500 }
    )
  }
}
