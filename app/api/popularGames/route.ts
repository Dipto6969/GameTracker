import { NextResponse } from 'next/server'

const CACHE_DURATION = 3 * 60 * 60 * 1000 // 3 hours - trending changes fast
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

    // Use date range for last 30 days to capture what's trending NOW
    // ordering=-added captures games being most added to collections recently
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const todayStr = today.toISOString().split('T')[0]
    const fromStr = thirtyDaysAgo.toISOString().split('T')[0]

    // Fetch multiple signals for "trending":
    // 1. Recently released games sorted by popularity (-added)
    // 2. Games with most recent buzz (released in last 30 days, sorted by rating count)
    const [recentResponse, buzzResponse] = await Promise.all([
      fetch(
        `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&dates=${fromStr},${todayStr}&ordering=-added&page_size=30`,
        { next: { revalidate: 10800 } } // 3 hours
      ),
      fetch(
        `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&dates=${fromStr},${todayStr}&ordering=-rating&page_size=30&metacritic=1,100`,
        { next: { revalidate: 10800 } }
      )
    ])

    const recentData = recentResponse.ok ? await recentResponse.json() : { results: [] }
    const buzzData = buzzResponse.ok ? await buzzResponse.json() : { results: [] }

    // Merge and deduplicate, giving priority to "added" ordering
    const seenIds = new Set<number>()
    const merged: any[] = []

    // Interleave: take from recent first, then buzz
    const recentGames = recentData.results || []
    const buzzGames = buzzData.results || []

    for (const game of [...recentGames, ...buzzGames]) {
      if (!seenIds.has(game.id) && game.name && game.background_image) {
        seenIds.add(game.id)
        merged.push(game)
      }
    }

    cachedGames = merged.slice(0, 30)
    cacheTime = Date.now()

    return NextResponse.json({
      success: true,
      games: cachedGames,
      cached: false,
    })
  } catch (error) {
    console.error('Error fetching trending games:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending games',
        games: cachedGames,
      },
      { status: 500 }
    )
  }
}
