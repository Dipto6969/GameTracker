import { NextRequest, NextResponse } from 'next/server'

const RAWG_API_KEY = process.env.RAWG_API_KEY || ''
const RAWG_BASE_URL = 'https://api.rawg.io/api'

interface GameDetails {
  id: number
  name: string
  slug: string
  description: string
  description_raw: string
  released: string
  background_image: string
  background_image_additional: string
  rating: number
  rating_top: number
  ratings_count: number
  metacritic: number
  playtime: number
  achievements_count: number
  
  // Developer/Publisher
  developers: Array<{ id: number; name: string; slug: string }>
  publishers: Array<{ id: number; name: string; slug: string }>
  
  // Platforms
  platforms: Array<{
    platform: { id: number; name: string; slug: string }
    released_at: string
    requirements?: {
      minimum?: string
      recommended?: string
    }
  }>
  
  // Genres & Tags
  genres: Array<{ id: number; name: string; slug: string }>
  tags: Array<{ id: number; name: string; slug: string; language: string }>
  
  // ESRB Rating
  esrb_rating: { id: number; name: string; slug: string } | null
  
  // Stores (where to buy)
  stores: Array<{
    id: number
    url: string
    store: { id: number; name: string; slug: string }
  }>
  
  // Website
  website: string
  
  // Media
  clip: {
    clip: string
    clips: { [key: string]: string }
    video: string
    preview: string
  } | null
  
  // Series
  game_series_count: number
}

interface Screenshot {
  id: number
  image: string
  width: number
  height: number
}

interface Movie {
  id: number
  name: string
  preview: string
  data: {
    480: string
    max: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, error: 'Game ID is required' }, { status: 400 })
    }

    // Fetch game details, screenshots, and movies in parallel
    const [gameResponse, screenshotsResponse, moviesResponse] = await Promise.all([
      fetch(`${RAWG_BASE_URL}/games/${id}?key=${RAWG_API_KEY}`),
      fetch(`${RAWG_BASE_URL}/games/${id}/screenshots?key=${RAWG_API_KEY}&page_size=10`),
      fetch(`${RAWG_BASE_URL}/games/${id}/movies?key=${RAWG_API_KEY}`)
    ])

    if (!gameResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch game details' },
        { status: gameResponse.status }
      )
    }

    const gameData: GameDetails = await gameResponse.json()
    
    let screenshots: Screenshot[] = []
    if (screenshotsResponse.ok) {
      const screenshotsData = await screenshotsResponse.json()
      screenshots = screenshotsData.results || []
    }

    let movies: Movie[] = []
    if (moviesResponse.ok) {
      const moviesData = await moviesResponse.json()
      movies = moviesData.results || []
    }

    // Format the response
    const formattedGame = {
      id: gameData.id,
      name: gameData.name,
      slug: gameData.slug,
      description: gameData.description_raw || gameData.description || '',
      released: gameData.released,
      background_image: gameData.background_image,
      background_image_additional: gameData.background_image_additional,
      
      // Ratings
      rating: gameData.rating,
      rating_top: gameData.rating_top,
      ratings_count: gameData.ratings_count,
      metacritic: gameData.metacritic,
      
      // Playtime & Achievements
      playtime: gameData.playtime,
      achievements_count: gameData.achievements_count,
      
      // Developer/Publisher
      developers: gameData.developers?.map(d => d.name) || [],
      publishers: gameData.publishers?.map(p => p.name) || [],
      
      // Platforms with requirements
      platforms: gameData.platforms?.map(p => ({
        name: p.platform.name,
        slug: p.platform.slug,
        released_at: p.released_at,
        requirements: p.requirements
      })) || [],
      
      // Genres & Tags
      genres: gameData.genres?.map(g => g.name) || [],
      tags: gameData.tags?.filter(t => t.language === 'eng').map(t => t.name).slice(0, 15) || [],
      
      // ESRB
      esrb_rating: gameData.esrb_rating?.name || null,
      
      // Stores
      stores: gameData.stores?.map(s => ({
        name: s.store.name,
        slug: s.store.slug,
        url: s.url
      })) || [],
      
      // Website
      website: gameData.website,
      
      // Video/Clip
      clip: gameData.clip ? {
        video: gameData.clip.clip || gameData.clip.video,
        preview: gameData.clip.preview
      } : null,
      
      // Movies/Trailers
      movies: movies.map(m => ({
        id: m.id,
        name: m.name,
        preview: m.preview,
        video_480: m.data?.['480'],
        video_max: m.data?.max
      })),
      
      // Screenshots
      screenshots: screenshots.map(s => s.image),
      
      // Series
      game_series_count: gameData.game_series_count || 0
    }

    return NextResponse.json({ success: true, game: formattedGame })
  } catch (error) {
    console.error('Error fetching game details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game details' },
      { status: 500 }
    )
  }
}
