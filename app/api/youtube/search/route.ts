import { NextRequest, NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gameName = searchParams.get('game')
    
    if (!gameName) {
      return NextResponse.json({ error: 'Game name required' }, { status: 400 })
    }
    
    if (!YOUTUBE_API_KEY) {
      console.log('[YouTube API] API key not configured')
      return NextResponse.json({ error: 'YouTube API not configured' }, { status: 503 })
    }

    // Search for official game trailer
    const searchQuery = `${gameName} official trailer gameplay`
    const url = `${YOUTUBE_SEARCH_URL}?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&videoDuration=short&key=${YOUTUBE_API_KEY}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.log('[YouTube API] Search failed:', response.status)
      return NextResponse.json({ error: 'YouTube API error' }, { status: response.status })
    }
    
    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId
      const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`
      
      return NextResponse.json({ 
        success: true,
        videoUrl,
        videoId,
        source: 'youtube'
      })
    }
    
    return NextResponse.json({ success: false, message: 'No video found' })
  } catch (error) {
    console.error('[YouTube API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
