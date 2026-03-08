/**
 * Lightweight RSS/Atom feed parser for gaming news.
 * No external dependencies - uses built-in fetch + regex parsing.
 */

export interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  imageUrl?: string
  source: string
}

// Gaming RSS feeds - these are FREE and work everywhere (no API key needed)
export const GAMING_RSS_FEEDS: { url: string; name: string }[] = [
  { url: "https://www.ign.com/articles.rss", name: "IGN" },
  { url: "https://www.gamespot.com/feeds/mashup/", name: "GameSpot" },
  { url: "https://kotaku.com/rss", name: "Kotaku" },
  { url: "https://www.polygon.com/rss/index.xml", name: "Polygon" },
  { url: "https://www.pcgamer.com/rss/", name: "PC Gamer" },
  { url: "https://www.eurogamer.net/feed", name: "Eurogamer" },
  { url: "https://www.rockpapershotgun.com/feed", name: "Rock Paper Shotgun" },
  { url: "https://www.destructoid.com/feed/", name: "Destructoid" },
  { url: "https://www.gamesradar.com/rss/", name: "GamesRadar+" },
  { url: "https://www.videogameschronicle.com/feed", name: "VGC" },
  { url: "https://www.pushsquare.com/feeds/latest", name: "Push Square" },
  { url: "https://www.nintendolife.com/feeds/latest", name: "Nintendo Life" },
]

function extractText(xml: string, tag: string): string {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i")
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1].trim()

  // Regular tag
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i")
  const match = xml.match(regex)
  return match ? match[1].trim().replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'") : ""
}

function extractImageFromContent(xml: string): string | undefined {
  // Try media:content or media:thumbnail
  const mediaMatch = xml.match(/url=["']([^"']+\.(jpg|jpeg|png|webp|gif)[^"']*)/i)
  if (mediaMatch) return mediaMatch[1]

  // Try enclosure
  const enclosureMatch = xml.match(/<enclosure[^>]+url=["']([^"']+)["']/i)
  if (enclosureMatch) return enclosureMatch[1]

  // Try img tag in description/content
  const imgMatch = xml.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) return imgMatch[1]

  return undefined
}

async function fetchFeed(feed: { url: string; name: string }): Promise<RSSItem[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout
    
    const response = await fetch(feed.url, {
      headers: {
        "User-Agent": "GameTracker/1.0 (News Aggregator)",
        "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml",
      },
      signal: controller.signal,
      next: { revalidate: 1800 } // 30min server-side cache
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) return []
    
    const xml = await response.text()
    
    // Parse items - works for both RSS and Atom
    const items: RSSItem[] = []
    
    // RSS <item> elements
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi
    // Atom <entry> elements
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi
    
    const matches = [...xml.matchAll(itemRegex), ...xml.matchAll(entryRegex)]
    
    for (const match of matches.slice(0, 15)) { // Max 15 items per feed
      const itemXml = match[1]
      
      const title = extractText(itemXml, "title")
      const description = extractText(itemXml, "description") || extractText(itemXml, "summary") || extractText(itemXml, "content")
      const link = extractText(itemXml, "link") || itemXml.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || ""
      const pubDate = extractText(itemXml, "pubDate") || extractText(itemXml, "published") || extractText(itemXml, "updated") || ""
      const imageUrl = extractImageFromContent(itemXml)
      
      if (title && link) {
        items.push({
          title: title.slice(0, 200), // Truncate long titles
          description: description.replace(/<[^>]+>/g, "").slice(0, 400), // Strip any remaining HTML
          link,
          pubDate,
          imageUrl,
          source: feed.name
        })
      }
    }
    
    return items
  } catch (err) {
    console.log(`[RSS] Failed to fetch ${feed.name}:`, (err as Error).message)
    return []
  }
}

/**
 * Fetch articles from multiple RSS feeds in parallel.
 * Returns deduplicated, sorted articles.
 */
export async function fetchRSSNews(feedsToUse?: typeof GAMING_RSS_FEEDS): Promise<RSSItem[]> {
  const feeds = feedsToUse || GAMING_RSS_FEEDS
  
  // Fetch all feeds in parallel
  const results = await Promise.allSettled(feeds.map(f => fetchFeed(f)))
  
  const allItems: RSSItem[] = []
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value)
    }
  }
  
  // Deduplicate by title similarity
  const seen = new Set<string>()
  const unique = allItems.filter(item => {
    // Normalize title for dedup
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  
  // Sort by date (newest first)
  unique.sort((a, b) => {
    const dateA = new Date(a.pubDate || 0).getTime()
    const dateB = new Date(b.pubDate || 0).getTime()
    return dateB - dateA
  })
  
  return unique
}
