import { NextRequest, NextResponse } from "next/server"
import { fetchRSSNews, type RSSItem } from "@/lib/rss-parser"

// Cache duration in seconds (30 minutes)
const CACHE_DURATION = 1800

// In-memory cache
const newsCache: Map<string, { news: NewsArticle[]; timestamp: number }> = new Map()

interface NewsArticle {
  id: string
  title: string
  description: string
  source: string
  publishedAt: string
  url: string
  imageUrl?: string
  category?: string
}

interface NewsAPIResponse {
  status: string
  totalResults: number
  articles: Array<{
    source: { id: string | null; name: string }
    author: string | null
    title: string
    description: string | null
    url: string
    urlToImage: string | null
    publishedAt: string
    content: string | null
  }>
}

// Category keyword mappings
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  release: ["release", "launch", "announced", "coming", "available now", "out now", "new game", "reveal"],
  update: ["update", "patch", "hotfix", "dlc", "expansion", "season", "version"],
  esports: ["esports", "tournament", "championship", "competitive", "league", "prize", "finals"],
  industry: ["acquisition", "layoff", "studio", "developer", "publisher", "microsoft", "sony", "nintendo", "valve", "epic"],
  review: ["review", "rating", "score", "verdict", "hands-on", "preview", "impressions"],
}

// Platform keyword mappings
const PLATFORM_KEYWORDS: Record<string, string[]> = {
  pc: ["pc", "steam", "epic games", "gog", "windows", "nvidia", "amd", "graphics card"],
  playstation: ["playstation", "ps5", "ps4", "sony", "dualsense", "psn", "playstation plus"],
  xbox: ["xbox", "series x", "series s", "game pass", "microsoft", "halo", "forza"],
  nintendo: ["nintendo", "switch", "mario", "zelda", "pokemon", "switch 2"],
  mobile: ["mobile", "ios", "android", "iphone", "ipad", "app store", "google play"],
}

// Words that indicate non-gaming content
const JUNK_KEYWORDS = [
  "nba", "nfl", "mlb", "betting", "sports", "promo code", "casino",
  "poker", "soccer", "football scores", "draft picks", "fantasy sports"
]

function getDateRangeFilter(dateRange: string): Date | null {
  const now = new Date()
  switch (dateRange) {
    case "24h": return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "30d": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default: return null
  }
}

function detectCategory(text: string): string | undefined {
  const lowerText = text.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return category
    }
  }
  return undefined
}

function matchesPlatform(text: string, platform: string): boolean {
  const lowerText = text.toLowerCase()
  const keywords = PLATFORM_KEYWORDS[platform]
  if (!keywords) return true
  return keywords.some(kw => lowerText.includes(kw))
}

function matchesCategory(article: NewsArticle, category: string): boolean {
  if (!category) return true
  const text = `${article.title} ${article.description}`.toLowerCase()
  const keywords = CATEGORY_KEYWORDS[category]
  if (!keywords) return true
  return keywords.some(kw => text.includes(kw))
}

function isJunkArticle(title: string, description: string): boolean {
  const lowTitle = title.toLowerCase()
  const lowDesc = description.toLowerCase()
  return JUNK_KEYWORDS.some(kw => lowTitle.includes(kw) || lowDesc.includes(kw))
}

function rssToNewsArticle(item: RSSItem, index: number): NewsArticle {
  return {
    id: `news-${Date.now()}-${index}`,
    title: item.title,
    description: item.description || "",
    source: item.source,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    url: item.link,
    imageUrl: item.imageUrl,
    category: detectCategory(`${item.title} ${item.description}`),
  }
}

/** Try NewsAPI first, fall back to RSS feeds if it fails */
async function fetchFromNewsAPI(apiKey: string): Promise<NewsArticle[] | null> {
  try {
    const gamingDomains = [
      "ign.com", "gamespot.com", "kotaku.com", "polygon.com", "eurogamer.net",
      "pcgamer.com", "gematsu.com", "videogameschronicle.com", "nintendolife.com",
      "pushsquare.com", "destructoid.com", "rockpapershotgun.com", "vg247.com",
      "siliconera.com", "gameinformer.com", "gamesradar.com"
    ].join(",")

    const query = encodeURIComponent(
      '"video games" OR "gaming news" OR "game release" OR "playstation" OR "xbox" OR "nintendo switch" OR "steam deck" -sports -betting -casino -poker -nfl -nba -mlb -soccer'
    )

    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const fromParam = `&from=${fromDate.toISOString().split("T")[0]}`

    const newsApiUrl = `https://newsapi.org/v2/everything?q=${query}&domains=${gamingDomains}&language=en&sortBy=publishedAt&pageSize=100${fromParam}&apiKey=${apiKey}`

    const response = await fetch(newsApiUrl, {
      headers: { "User-Agent": "GameTracker/1.0" },
    })

    if (!response.ok) {
      console.log("[NewsAPI] Failed with status:", response.status)
      return null // Signal to use RSS fallback
    }

    const data: NewsAPIResponse = await response.json()

    return data.articles
      .filter(article =>
        article.title &&
        article.description &&
        !article.title.includes("[Removed]") &&
        article.description.length > 20 &&
        !isJunkArticle(article.title, article.description || "")
      )
      .map((article, index) => ({
        id: `news-${Date.now()}-${index}`,
        title: article.title,
        description: article.description || "",
        source: article.source.name,
        publishedAt: article.publishedAt,
        url: article.url,
        imageUrl: article.urlToImage || undefined,
        category: detectCategory(`${article.title} ${article.description}`),
      }))
  } catch (err) {
    console.log("[NewsAPI] Error:", (err as Error).message)
    return null
  }
}

async function fetchFromRSS(): Promise<NewsArticle[]> {
  console.log("[RSS] Fetching from RSS feeds...")
  const rssItems = await fetchRSSNews()

  return rssItems
    .filter(item =>
      item.title &&
      item.description.length > 10 &&
      !isJunkArticle(item.title, item.description)
    )
    .map(rssToNewsArticle)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10)

    const keyword = searchParams.get("keyword") || ""
    const dateRange = searchParams.get("dateRange") || "all"
    const category = searchParams.get("category") || ""
    const platform = searchParams.get("platform") || ""
    const sortBy = searchParams.get("sortBy") || "newest"
    const refresh = searchParams.get("refresh") === "true"

    const baseCacheKey = "gaming-news"
    const now = Date.now()

    // Check cache first
    const cached = newsCache.get(baseCacheKey)
    let allNews: NewsArticle[] = []

    if (!refresh && cached && now - cached.timestamp < CACHE_DURATION * 1000) {
      allNews = cached.news
    } else {
      const apiKey = process.env.NEWS_API_KEY

      // Strategy: Try NewsAPI first, fall back to RSS if it fails
      if (apiKey) {
        const newsApiResult = await fetchFromNewsAPI(apiKey)
        if (newsApiResult && newsApiResult.length > 0) {
          allNews = newsApiResult
          console.log(`[News] Got ${allNews.length} articles from NewsAPI`)
        }
      }

      // Fallback to RSS feeds (always works, no API key needed)
      if (allNews.length === 0) {
        allNews = await fetchFromRSS()
        console.log(`[News] Got ${allNews.length} articles from RSS feeds`)
      }

      // Update cache if we got results
      if (allNews.length > 0) {
        newsCache.set(baseCacheKey, { news: allNews, timestamp: now })
      } else if (cached) {
        // Use stale cache if we got nothing
        allNews = cached.news
      }
    }

    // Apply filters
    let filteredNews = [...allNews]

    // Keyword filter
    if (keyword) {
      const keywordLower = keyword.toLowerCase()
      filteredNews = filteredNews.filter(
        article =>
          article.title.toLowerCase().includes(keywordLower) ||
          article.description.toLowerCase().includes(keywordLower) ||
          article.source.toLowerCase().includes(keywordLower)
      )
    }

    // Date range filter
    const dateThreshold = getDateRangeFilter(dateRange)
    if (dateThreshold) {
      filteredNews = filteredNews.filter(article => new Date(article.publishedAt) >= dateThreshold)
    }

    // Category filter
    if (category) {
      filteredNews = filteredNews.filter(article => matchesCategory(article, category))
    }

    // Platform filter
    if (platform) {
      filteredNews = filteredNews.filter(article =>
        matchesPlatform(`${article.title} ${article.description}`, platform)
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "oldest":
        filteredNews.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
        break
      case "relevance":
        if (keyword) {
          const keywordLower = keyword.toLowerCase()
          filteredNews.sort((a, b) => {
            const aScore = (a.title.toLowerCase().includes(keywordLower) ? 2 : 0) +
              (a.description.toLowerCase().includes(keywordLower) ? 1 : 0)
            const bScore = (b.title.toLowerCase().includes(keywordLower) ? 2 : 0) +
              (b.description.toLowerCase().includes(keywordLower) ? 1 : 0)
            return bScore - aScore
          })
        }
        break
      case "newest":
      default:
        filteredNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        break
    }

    // Paginate
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedNews = filteredNews.slice(startIndex, endIndex)

    return NextResponse.json(
      {
        news: paginatedNews,
        totalResults: filteredNews.length,
        page,
        pageSize,
        hasMore: endIndex < filteredNews.length,
        cached: !refresh && cached !== undefined && now - (cached?.timestamp || 0) < CACHE_DURATION * 1000,
        filters: { keyword, dateRange, category, platform, sortBy },
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        },
      }
    )
  } catch (error) {
    console.error("Gaming news API error:", error)

    // Return any cached data on error
    const anyCached = newsCache.values().next().value
    if (anyCached) {
      return NextResponse.json({
        news: anyCached.news.slice(0, 12),
        totalResults: anyCached.news.length,
        page: 1,
        pageSize: 12,
        hasMore: anyCached.news.length > 12,
        cached: true,
      })
    }

    return NextResponse.json({ error: "Internal server error", message: String(error) }, { status: 500 })
  }
}
