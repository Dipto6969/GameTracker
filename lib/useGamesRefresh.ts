import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useGamesRefresh() {
  const router = useRouter()

  const triggerRefresh = () => {
    // Refresh the page to show newly added game
    router.refresh()
  }

  return { triggerRefresh }
}
