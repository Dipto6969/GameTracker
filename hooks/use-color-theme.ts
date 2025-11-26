"use client"

import { useState, useEffect } from "react"
import { ThemeName, themes, defaultTheme } from "@/lib/themes"

const THEME_STORAGE_KEY = "gametracker_color_theme"

export function useColorTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(defaultTheme)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored && themes[stored as ThemeName]) {
        setCurrentTheme(stored as ThemeName)
        applyTheme(stored as ThemeName)
      } else {
        applyTheme(defaultTheme)
      }
    } catch (error) {
      console.error("Failed to load theme:", error)
      applyTheme(defaultTheme)
    }
    setIsLoaded(true)
  }, [])

  const applyTheme = (themeName: ThemeName) => {
    const theme = themes[themeName]
    const root = document.documentElement

    // Apply CSS variables
    root.style.setProperty("--color-primary", theme.colors.primary)
    root.style.setProperty("--color-secondary", theme.colors.secondary)
    root.style.setProperty("--color-accent", theme.colors.accent)
    root.style.setProperty("--color-background", theme.colors.background)
    root.style.setProperty("--color-foreground", theme.colors.foreground)
    root.style.setProperty("--color-muted", theme.colors.muted)
    root.style.setProperty("--color-border", theme.colors.border)
  }

  const setTheme = (themeName: ThemeName) => {
    try {
      setCurrentTheme(themeName)
      applyTheme(themeName)
      localStorage.setItem(THEME_STORAGE_KEY, themeName)
    } catch (error) {
      console.error("Failed to save theme:", error)
    }
  }

  return {
    currentTheme,
    setTheme,
    isLoaded,
    availableThemes: Object.values(themes),
  }
}
