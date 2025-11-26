import { searchGames } from "@/lib/rawg"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""

  if (!q.trim()) {
    return Response.json([])
  }

  try {
    const results = await searchGames(q)
    return Response.json(results)
  } catch (error) {
    console.log("[v0] Search error:", error)
    return Response.json([], { status: 500 })
  }
}
