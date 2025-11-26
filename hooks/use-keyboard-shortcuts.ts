'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts(onHelpOpen?: () => void) {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // ? - Show help
      if (e.key === '?') {
        e.preventDefault()
        onHelpOpen?.()
      }

      // / - Focus search
      if (e.key === '/') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        searchInput?.focus()
      }

      // n - New game (navigate to search)
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push('/search')
      }

      // g - Go to library
      if (e.key === 'g') {
        e.preventDefault()
        router.push('/')
      }

      // a - Go to about
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push('/about')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, onHelpOpen])
}
