// Theme configuration for Game Tracker
export type ThemeName = "light-blue" | "dark-purple" | "forest-green"

export interface ThemeConfig {
  name: ThemeName
  label: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
  }
}

export const themes: Record<ThemeName, ThemeConfig> = {
  "light-blue": {
    name: "light-blue",
    label: "Light Blue",
    colors: {
      primary: "oklch(0.45 0.24 262)", // Blue
      secondary: "oklch(0.97 0 0)", // Light
      accent: "oklch(0.45 0.24 262)", // Blue
      background: "oklch(0.985 0 0)", // Almost white
      foreground: "oklch(0.145 0 0)", // Almost black
      muted: "oklch(0.97 0 0)", // Light gray
      border: "oklch(0.88 0 0)", // Light border
    },
  },
  "dark-purple": {
    name: "dark-purple",
    label: "Dark Purple",
    colors: {
      primary: "oklch(0.65 0.22 262)", // Purple
      secondary: "oklch(0.25 0 0)", // Dark
      accent: "oklch(0.7 0.25 290)", // Vibrant purple
      background: "oklch(0.15 0 0)", // Very dark
      foreground: "oklch(0.95 0 0)", // Almost white
      muted: "oklch(0.35 0 0)", // Gray
      border: "oklch(0.25 0 0)", // Dark border
    },
  },
  "forest-green": {
    name: "forest-green",
    label: "Forest Green",
    colors: {
      primary: "oklch(0.45 0.15 155)", // Forest green
      secondary: "oklch(0.97 0 0)", // Light
      accent: "oklch(0.55 0.18 155)", // Bright green
      background: "oklch(0.12 0 0)", // Very dark (forest night)
      foreground: "oklch(0.95 0 0)", // Almost white
      muted: "oklch(0.4 0 0)", // Gray
      border: "oklch(0.25 0.08 155)", // Dark green border
    },
  },
}

export const defaultTheme: ThemeName = "light-blue"
