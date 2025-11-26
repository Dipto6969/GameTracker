import { getAllGames } from "@/lib/kv"

export async function GET() {
  try {
    const games = await getAllGames()
    return Response.json(games)
  } catch (error) {
    console.log("[v0] List games error:", error)
    return Response.json([], { status: 500 })
  }
}
