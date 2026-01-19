// YouTube Data API helper for fetching game trailers

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || ''
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

export async function searchGameTrailer(gameName: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    console.log('[YouTube] API key not configured')
    return null
  }

  try {
    // Search for official game trailer
    const searchQuery = `${gameName} official trailer gameplay`
    const url = `${YOUTUBE_SEARCH_URL}?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.log('[YouTube] API error:', response.status)
      return null
    }
    
    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId
      // Return embeddable YouTube URL that works in video tags
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`
    }
    
    return null
  } catch (error) {
    console.error('[YouTube] Search error:', error)
    return null
  }
}

// Client-side version (uses public API key from env)
export async function searchGameTrailerClient(gameName: string): Promise<string | null> {
  try {
    // Call our API route instead to keep API key secure
    const response = await fetch(`/api/youtube/search?game=${encodeURIComponent(gameName)}`)
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data.videoUrl || null
  } catch (error) {
    console.error('[YouTube Client] Search error:', error)
    return null
  }
}
