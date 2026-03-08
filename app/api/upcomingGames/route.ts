import { NextResponse } from 'next/server'

const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours
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

    // Fetch upcoming games from RAWG API
    // Start from today, look ahead 180 days
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 180)
    const futureDateStr = futureDate.toISOString().split('T')[0]

    // ordering=released (ascending) = soonest releases first
    // metacritic filter ensures we get notable titles, not shovelware
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&dates=${todayStr},${futureDateStr}&ordering=released&page_size=40`,
      { next: { revalidate: 21600 } } // 6 hours
    )

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Filter: only keep games that have a name and a future/today release date
    const allGames = (data.results || []).filter((game: any) => {
      if (!game.name || !game.released) return false
      const releaseDate = new Date(game.released)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      return releaseDate >= todayStart
    })
    
    // Sort by release date ascending (soonest first)
    allGames.sort((a: any, b: any) => 
      new Date(a.released).getTime() - new Date(b.released).getTime()
    )

    cachedGames = allGames
    cacheTime = Date.now()

    return NextResponse.json({
      success: true,
      games: cachedGames,
      cached: false,
    })
  } catch (error) {
    console.error('Error fetching upcoming games:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch upcoming games',
        games: cachedGames,
      },
      { status: 500 }
    )
  }
}
