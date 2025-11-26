import { deleteGame } from "@/lib/kv"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Game ID required" }, { status: 400 })
    }

    const deleted = await deleteGame(id)
    
    if (!deleted) {
      return Response.json({ error: "Game not found" }, { status: 404 })
    }

    return Response.json({ success: true, message: "Game removed successfully" })
  } catch (error) {
    console.log("[API] Remove game error:", error)
    return Response.json({ error: "Failed to remove game" }, { status: 500 })
  }
}
