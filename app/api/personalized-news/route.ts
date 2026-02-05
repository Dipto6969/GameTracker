import { NextRequest, NextResponse } from "next/server"
import { getAllGames } from "@/lib/kv"

// Cache duration in seconds
const CACHE_DURATION = 3600

// Personalized news cache
const personalizedCache: Map<string, { news: PersonalizedNewsResponse; timestamp: number }> = new Map()

interface NewsArticle {
  id: string
  title: string
  description: string
  source: string
  publishedAt: string
  url: string
  imageUrl?: string
  category?: string
  matchReason?: string // Why this article was recommended
  relevanceScore?: number
}

interface PersonalizedNewsResponse {
  forYou: NewsArticle[]
  upcoming2026: UpcomingGame[]
  userGenres: string[]
  userGames: string[]
}

interface UpcomingGame {
  title: string
  releaseWindow: string
  genres: string[]
  platforms: string[]
  description: string
  imageUrl?: string
  matchScore: number // How well it matches user taste
}

// 2026 Anticipated Games Database - curated list
const UPCOMING_2026_GAMES: UpcomingGame[] = [
  {
    title: "Fable",
    releaseWindow: "2026",
    genres: ["RPG", "Action", "Adventure", "Fantasy"],
    platforms: ["Xbox Series X|S", "PC"],
    description: "A reimagined entry in the beloved Fable franchise from Playground Games, featuring a vast open world and signature humor.",
    imageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmb.jpg",
    matchScore: 0
  },
  {
    title: "Resident Evil 9: Requiem",
    releaseWindow: "2026",
    genres: ["Horror", "Survival", "Action", "Shooter"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "The next chapter in the legendary survival horror franchise, continuing the Winters saga.",
    matchScore: 0
  },
  {
    title: "Marvel's Wolverine",
    releaseWindow: "2026",
    genres: ["Action", "Adventure", "Superhero"],
    platforms: ["PS5", "PC"],
    description: "Insomniac Games' take on the legendary X-Men mutant, featuring brutal combat and an emotional story.",
    matchScore: 0
  },
  {
    title: "Tides of Annihilation",
    releaseWindow: "2026",
    genres: ["Action", "Adventure", "Sci-Fi"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "A new ambitious action-adventure IP from a major studio.",
    matchScore: 0
  },
  {
    title: "007: First Light",
    releaseWindow: "2026",
    genres: ["Action", "Shooter", "Stealth", "Spy"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "An original James Bond story from IO Interactive, the creators of Hitman.",
    matchScore: 0
  },
  {
    title: "Ghost of Yotei",
    releaseWindow: "2026",
    genres: ["Action", "Adventure", "Open World", "Samurai"],
    platforms: ["PS5"],
    description: "The sequel to Ghost of Tsushima, set in the shadow of Mount Yotei in 1603 Japan.",
    matchScore: 0
  },
  {
    title: "Death Stranding 2: On the Beach",
    releaseWindow: "2026",
    genres: ["Action", "Adventure", "Sci-Fi", "Open World"],
    platforms: ["PS5", "PC"],
    description: "Hideo Kojima's follow-up to Death Stranding, continuing Sam Bridges' journey.",
    matchScore: 0
  },
  {
    title: "Mafia: The Old Country",
    releaseWindow: "2026",
    genres: ["Action", "Adventure", "Crime", "Open World"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "A return to the origins of the Mafia franchise, set in early 1900s Sicily.",
    matchScore: 0
  },
  {
    title: "Borderlands 4",
    releaseWindow: "2026",
    genres: ["Shooter", "RPG", "Looter", "Co-op"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "The next entry in Gearbox's looter-shooter franchise with billions of guns.",
    matchScore: 0
  },
  {
    title: "Doom: The Dark Ages",
    releaseWindow: "2026",
    genres: ["Shooter", "Action", "FPS", "Horror"],
    platforms: ["PS5", "Xbox Series X|S", "PC", "Nintendo Switch 2"],
    description: "A medieval prequel to Doom Eternal, featuring the Doom Slayer's origins.",
    matchScore: 0
  },
  {
    title: "Metroid Prime 4: Beyond",
    releaseWindow: "2026",
    genres: ["Action", "Adventure", "Metroidvania", "Sci-Fi"],
    platforms: ["Nintendo Switch 2"],
    description: "The long-awaited return of Samus Aran in a new first-person adventure.",
    matchScore: 0
  },
  {
    title: "The Outer Worlds 2",
    releaseWindow: "2026",
    genres: ["RPG", "Sci-Fi", "Shooter", "Open World"],
    platforms: ["Xbox Series X|S", "PC"],
    description: "Obsidian's follow-up to their satirical sci-fi RPG.",
    matchScore: 0
  },
  {
    title: "Assassin's Creed Shadows",
    releaseWindow: "2025-2026",
    genres: ["Action", "Adventure", "Open World", "Stealth", "Samurai"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "Assassin's Creed set in feudal Japan with two playable protagonists.",
    matchScore: 0
  },
  {
    title: "Judas",
    releaseWindow: "2026",
    genres: ["Shooter", "RPG", "Sci-Fi", "Narrative"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "Ken Levine's spiritual successor to BioShock, set on a dying starship.",
    matchScore: 0
  },
  {
    title: "Avowed",
    releaseWindow: "2025-2026",
    genres: ["RPG", "Action", "Fantasy", "Open World"],
    platforms: ["Xbox Series X|S", "PC"],
    description: "Obsidian's first-person fantasy RPG set in the Pillars of Eternity universe.",
    matchScore: 0
  },
  {
    title: "Crimson Desert",
    releaseWindow: "2026",
    genres: ["Action", "Adventure", "RPG", "Open World", "Fantasy"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "An action-adventure RPG from Pearl Abyss featuring stunning visuals and brutal combat.",
    matchScore: 0
  },
  {
    title: "Monster Hunter Wilds",
    releaseWindow: "2025-2026",
    genres: ["Action", "RPG", "Co-op", "Monster Hunter"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "The next major Monster Hunter entry with seamless open zones and new monsters.",
    matchScore: 0
  },
  {
    title: "Elden Ring: Nightreign",
    releaseWindow: "2025-2026",
    genres: ["Action", "RPG", "Souls-like", "Co-op"],
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    description: "A standalone co-op roguelike experience set in the Elden Ring universe.",
    matchScore: 0
  },
  {
    title: "GTA 6",
    releaseWindow: "2025-2026",
    genres: ["Action", "Adventure", "Open World", "Crime"],
    platforms: ["PS5", "Xbox Series X|S"],
    description: "Rockstar's next Grand Theft Auto, set in Vice City with dual protagonists.",
    matchScore: 0
  },
  {
    title: "Intergalactic: The Heretic Prophet",
    releaseWindow: "2026+",
    genres: ["Action", "Adventure", "Sci-Fi"],
    platforms: ["PS5"],
    description: "Naughty Dog's new sci-fi IP featuring bounty hunter Jordan A. Mun.",
    matchScore: 0
  }
]

// Genre synonyms for better matching
const GENRE_SYNONYMS: Record<string, string[]> = {
  "action": ["action", "hack and slash", "beat em up"],
  "rpg": ["rpg", "role-playing", "jrpg", "action rpg", "role playing"],
  "shooter": ["shooter", "fps", "third-person shooter", "tps"],
  "adventure": ["adventure", "action-adventure"],
  "horror": ["horror", "survival horror", "psychological horror"],
  "open world": ["open world", "sandbox", "exploration"],
  "fantasy": ["fantasy", "high fantasy", "dark fantasy"],
  "sci-fi": ["sci-fi", "science fiction", "space", "cyberpunk"],
  "stealth": ["stealth", "tactical", "espionage"],
  "co-op": ["co-op", "multiplayer", "cooperative"],
  "racing": ["racing", "driving", "simulation"],
  "fighting": ["fighting", "beat em up", "combat"],
  "puzzle": ["puzzle", "brain teaser", "logic"],
  "platformer": ["platformer", "platform", "2d platformer", "3d platformer"],
  "strategy": ["strategy", "rts", "turn-based", "tactics"],
  "sports": ["sports", "simulation", "arcade sports"],
  "simulation": ["simulation", "sim", "management"],
  "indie": ["indie", "independent"],
  "souls-like": ["souls-like", "soulsborne", "difficult", "action rpg"],
}

// Curated gaming domains
const GAMING_DOMAINS = [
  "ign.com", "gamespot.com", "kotaku.com", "polygon.com", "eurogamer.net",
  "pcgamer.com", "gematsu.com", "videogameschronicle.com", "nintendolife.com",
  "pushsquare.com", "destructoid.com", "rockpapershotgun.com", "vg247.com",
  "siliconera.com", "gameinformer.com", "gamesradar.com"
]

function normalizeGenre(genre: string): string {
  const lower = genre.toLowerCase().trim()
  for (const [canonical, synonyms] of Object.entries(GENRE_SYNONYMS)) {
    if (synonyms.some(s => lower.includes(s) || s.includes(lower))) {
      return canonical
    }
  }
  return lower
}

function calculateMatchScore(upcomingGame: UpcomingGame, userGenres: string[]): number {
  const normalizedUserGenres = userGenres.map(normalizeGenre)
  const normalizedGameGenres = upcomingGame.genres.map(normalizeGenre)
  
  let score = 0
  for (const gameGenre of normalizedGameGenres) {
    if (normalizedUserGenres.includes(gameGenre)) {
      score += 25 // Each matching genre adds 25 points
    }
  }
  
  // Cap at 100
  return Math.min(score, 100)
}

function calculateArticleRelevance(
  article: { title: string; description: string },
  userGameNames: string[],
  userGenres: string[]
): { score: number; reason: string } {
  const titleLower = article.title.toLowerCase()
  const descLower = (article.description || "").toLowerCase()
  const fullText = `${titleLower} ${descLower}`
  
  // Check for exact game matches (highest priority)
  for (const gameName of userGameNames) {
    const gameNameLower = gameName.toLowerCase()
    // Check for game name or significant part of it (for sequels, etc.)
    const words = gameNameLower.split(/\s+/).filter(w => w.length > 3)
    
    if (fullText.includes(gameNameLower)) {
      return { score: 100, reason: `About ${gameName}` }
    }
    
    // Check for partial matches (e.g., "Elden Ring" matches "Elden Ring DLC")
    if (words.length > 0 && words.every(w => fullText.includes(w))) {
      return { score: 80, reason: `Related to ${gameName}` }
    }
  }
  
  // Check for genre keywords
  const normalizedUserGenres = userGenres.map(normalizeGenre)
  let genreScore = 0
  let matchedGenre = ""
  
  for (const genre of normalizedUserGenres) {
    const synonyms = GENRE_SYNONYMS[genre] || [genre]
    for (const synonym of synonyms) {
      if (fullText.includes(synonym)) {
        genreScore += 15
        matchedGenre = genre
      }
    }
  }
  
  if (genreScore > 0) {
    return { 
      score: Math.min(genreScore, 60), 
      reason: `${matchedGenre.toUpperCase()} genre you play` 
    }
  }
  
  return { score: 0, reason: "" }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const refresh = searchParams.get("refresh") === "true"
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    
    const apiKey = process.env.NEWS_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "NEWS_API_KEY not configured" },
        { status: 500 }
      )
    }

    const now = Date.now()
    const cacheKey = "personalized"
    const cached = personalizedCache.get(cacheKey)
    
    // Return cached if fresh and not refreshing
    if (!refresh && cached && (now - cached.timestamp) < CACHE_DURATION * 1000) {
      return NextResponse.json(cached.news)
    }

    // 1. Fetch user's library
    let userGames: Array<{ name: string; genres: Array<{ name: string }> }> = []
    try {
      const games = await getAllGames()
      userGames = games.map(g => ({
        name: g.name,
        genres: g.genres || []
      }))
    } catch (err) {
      console.log("Could not fetch user games:", err)
    }

    // 2. Extract unique genres and game names
    const userGenres: string[] = []
    const userGameNames: string[] = []
    
    for (const game of userGames) {
      userGameNames.push(game.name)
      for (const genre of game.genres) {
        if (!userGenres.includes(genre.name)) {
          userGenres.push(genre.name)
        }
      }
    }

    // 3. Build personalized search query
    // Include user's game names (up to 5 most recent) and genres
    const topGames = userGameNames.slice(0, 5)
    const topGenres = userGenres.slice(0, 3)
    
    // Build query terms
    const queryTerms: string[] = [
      '"video games"',
      '"game release"',
      ...topGames.map(g => `"${g}"`),
      ...topGenres.map(g => g.toLowerCase())
    ]
    
    const query = encodeURIComponent(
      queryTerms.join(" OR ") + " -sports -betting -casino -poker -nfl -nba -mlb"
    )
    
    const domains = GAMING_DOMAINS.join(",")
    
    // Calculate date range (last 14 days for personalized)
    const fromDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const fromParam = `&from=${fromDate.toISOString().split('T')[0]}`
    
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${query}&domains=${domains}&language=en&sortBy=publishedAt&pageSize=100${fromParam}&apiKey=${apiKey}`
    
    const response = await fetch(newsApiUrl, {
      headers: { "User-Agent": "GameTracker/1.0" },
      next: { revalidate: refresh ? 0 : CACHE_DURATION }
    })

    let articles: NewsArticle[] = []
    
    if (response.ok) {
      const data = await response.json()
      
      // Transform and score articles
      articles = data.articles
        .filter((article: any) => {
          const lowTitle = article.title?.toLowerCase() || ""
          const lowDesc = article.description?.toLowerCase() || ""
          
          // Filter out junk
          const isJunk = 
            !article.title || 
            !article.description ||
            article.title.includes("[Removed]") ||
            lowTitle.includes("nba") ||
            lowTitle.includes("nfl") ||
            lowTitle.includes("betting") ||
            lowTitle.includes("promo code")
          
          return !isJunk && article.description.length > 20
        })
        .map((article: any, index: number) => {
          const { score, reason } = calculateArticleRelevance(
            { title: article.title, description: article.description },
            userGameNames,
            userGenres
          )
          
          return {
            id: `pnews-${Date.now()}-${index}`,
            title: article.title,
            description: article.description || "",
            source: article.source.name,
            publishedAt: article.publishedAt,
            url: article.url,
            imageUrl: article.urlToImage || undefined,
            matchReason: reason,
            relevanceScore: score
          }
        })
    } else if (cached) {
      // Use cached data on error
      return NextResponse.json(cached.news)
    }
    
    // 4. Sort by relevance score, then by date
    const forYouArticles = articles
      .filter(a => (a.relevanceScore || 0) > 0)
      .sort((a, b) => {
        const scoreDiff = (b.relevanceScore || 0) - (a.relevanceScore || 0)
        if (scoreDiff !== 0) return scoreDiff
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
      .slice(0, limit)

    // 5. Calculate upcoming game matches
    const upcoming2026 = UPCOMING_2026_GAMES
      .map(game => ({
        ...game,
        matchScore: calculateMatchScore(game, userGenres)
      }))
      .filter(game => game.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8)

    const responseData: PersonalizedNewsResponse = {
      forYou: forYouArticles,
      upcoming2026,
      userGenres,
      userGames: userGameNames
    }

    // Update cache
    personalizedCache.set(cacheKey, {
      news: responseData,
      timestamp: now
    })

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
      }
    })

  } catch (error) {
    console.error("Personalized news error:", error)
    
    const cached = personalizedCache.get("personalized")
    if (cached) {
      return NextResponse.json(cached.news)
    }
    
    return NextResponse.json(
      { error: "Failed to fetch personalized news" },
      { status: 500 }
    )
  }
}
