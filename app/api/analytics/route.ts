import { getAllGames } from "@/lib/kv"

export interface AnalyticsData {
  totalGames: number
  completedGames: number
  playingGames: number
  backlogGames: number
  droppedGames: number
  wishlistGames: number
  totalHoursPlayed: number
  averageRating: number
  favoriteCount: number
  genreStats: Array<{ name: string; count: number; avgRating: number }>
  statusDistribution: Array<{ status: string; count: number }>
  yearlyStats: Array<{ year: number; completed: number }>
  topRatedGames: Array<{ name: string; rating: number }>
  mostPlayedGames: Array<{ name: string; hours: number }>
  completionRate: number
}

export async function GET() {
  try {
    const games = await getAllGames()

    // Calculate basic stats
    const totalGames = games.length
    const completedGames = games.filter((g) => g.status === "completed").length
    const playingGames = games.filter((g) => g.status === "playing").length
    const backlogGames = games.filter((g) => g.status === "backlog").length
    const droppedGames = games.filter((g) => g.status === "dropped").length
    const wishlistGames = games.filter((g) => g.status === "wishlist").length
    const favoriteCount = games.filter((g) => g.isFavorite).length

    // Calculate hours and ratings
    const totalHoursPlayed = games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0)
    const ratedGames = games.filter((g) => g.userRating)
    const averageRating = ratedGames.length > 0 ? ratedGames.reduce((sum, g) => sum + (g.userRating || 0), 0) / ratedGames.length : 0

    // Genre stats
    const genreMap = new Map<string, { count: number; ratings: number[] }>()
    games.forEach((game) => {
      game.genres?.forEach((genre) => {
        const existing = genreMap.get(genre.name) || { count: 0, ratings: [] }
        existing.count++
        if (game.userRating) {
          existing.ratings.push(game.userRating)
        }
        genreMap.set(genre.name, existing)
      })
    })

    const genreStats = Array.from(genreMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgRating: data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b) / data.ratings.length : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Status distribution
    const statusDistribution = [
      { status: "Playing", count: playingGames },
      { status: "Completed", count: completedGames },
      { status: "Backlog", count: backlogGames },
      { status: "Dropped", count: droppedGames },
      { status: "Wishlist", count: wishlistGames },
    ].filter((s) => s.count > 0)

    // Yearly stats (by release year)
    const yearMap = new Map<number, number>()
    games.forEach((game) => {
      if (game.released && game.status === "completed") {
        const year = new Date(game.released).getFullYear()
        yearMap.set(year, (yearMap.get(year) || 0) + 1)
      }
    })

    const yearlyStats = Array.from(yearMap.entries())
      .map(([year, completed]) => ({ year, completed }))
      .sort((a, b) => a.year - b.year)

    // Top rated games
    const topRatedGames = games
      .filter((g) => g.userRating && g.userRating >= 4)
      .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
      .slice(0, 5)
      .map((g) => ({ name: g.name, rating: g.userRating || 0 }))

    // Most played games
    const mostPlayedGames = games
      .filter((g) => g.hoursPlayed && g.hoursPlayed > 0)
      .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
      .slice(0, 5)
      .map((g) => ({ name: g.name, hours: g.hoursPlayed || 0 }))

    // Completion rate
    const completionRate = totalGames > 0 ? (completedGames / totalGames) * 100 : 0

    const analytics: AnalyticsData = {
      totalGames,
      completedGames,
      playingGames,
      backlogGames,
      droppedGames,
      wishlistGames,
      totalHoursPlayed,
      averageRating: Math.round(averageRating * 10) / 10,
      favoriteCount,
      genreStats,
      statusDistribution,
      yearlyStats,
      topRatedGames,
      mostPlayedGames,
      completionRate: Math.round(completionRate * 10) / 10,
    }

    return Response.json(analytics)
  } catch (error) {
    console.error("[Analytics] Error:", error)
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
