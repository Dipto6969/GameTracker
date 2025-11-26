import { addGame } from "@/lib/kv"

export async function POST(request: Request) {
  try {
    const game = await request.json()
    if (!game.id || !game.name) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await addGame(game)
    return Response.json({ success: true, data: result })
  } catch (error) {
    console.log("[v0] Add game error:", error)
    return Response.json({ error: "Failed to add game" }, { status: 500 })
  }
}
