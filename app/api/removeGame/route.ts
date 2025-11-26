import { deleteGame } from "@/lib/kv"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    console.log("[API] Attempting to delete game with ID:", id)

    if (!id) {
      console.log("[API] No ID provided")
      return Response.json({ error: "Game ID required" }, { status: 400 })
    }

    const deleted = await deleteGame(id)
    console.log("[API] Delete result:", deleted)
    
    if (!deleted) {
      console.log("[API] Game not found or deletion failed")
      return Response.json({ error: "Game not found" }, { status: 404 })
    }

    console.log("[API] Game deleted successfully")
    return Response.json({ success: true, message: "Game removed successfully" })
  } catch (error) {
    console.log("[API] Remove game error:", error)
    return Response.json({ error: "Failed to remove game" }, { status: 500 })
  }
}
