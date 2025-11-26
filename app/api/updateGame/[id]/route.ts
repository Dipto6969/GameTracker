import { updateGame } from "@/lib/kv"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()

    const updatedGame = await updateGame(id, updates)
    
    if (!updatedGame) {
      return Response.json({ error: "Game not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: updatedGame })
  } catch (error) {
    console.log("[API] Update game error:", error)
    return Response.json({ error: "Failed to update game" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()

    const updatedGame = await updateGame(id, updates)
    
    if (!updatedGame) {
      return Response.json({ error: "Game not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: updatedGame })
  } catch (error) {
    console.log("[API] Update game error:", error)
    return Response.json({ error: "Failed to update game" }, { status: 500 })
  }
}
