"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define the color option type
export interface ColorOption {
  name: string
  label: string
  primary: string
  accent: string
}

// Define the theme settings type
export interface ThemeSettings {
  themeMode: "light" | "dark" | "auto"
  selectedColor: ColorOption
  borderRoundness: "none" | "slight" | "regular" | "full"
  avatarSrc: string
  logoHeight: number
  useAvatarAsFavicon: boolean
}

// Default color options
export const colorOptions: ColorOption[] = [
  {
    name: "default",
    label: "Default",
    primary: "#6366f1", // indigo
    accent: "#f43f5e", // rose
  },
  {
    name: "black",
    label: "Black",
    primary: "#000000",
    accent: "#6366f1",
  },
  {
    name: "purple",
    label: "Purple",
    primary: "#8b5cf6",
    accent: "#f59e0b",
  },
  {
    name: "green",
    label: "Green",
    primary: "#10b981",
    accent: "#84cc16",
  },
  {
    name: "red",
    label: "Red",
    primary: "#ef4444",
    accent: "#f97316",
  },
  {
    name: "orange",
    label: "Orange",
    primary: "#f97316",
    accent: "#ec4899",
  },
]

// Default theme settings
const defaultThemeSettings: ThemeSettings = {
  themeMode: "light",
  selectedColor: colorOptions[0],
  borderRoundness: "regular",
  avatarSrc:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chatbot-avatar-default-YCGXxQnQnXvYgGxQPXbGJGKXvYTGHN.png",
  logoHeight: 34,
  useAvatarAsFavicon: true,
}

// Create the context
interface ThemeContextType {
  themeSettings: ThemeSettings
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void
  resetThemeSettings: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load theme settings from localStorage on initial render
  useEffect(() => {
    const storedSettings = localStorage.getItem("chatbotThemeSettings")
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings)
        setThemeSettings(parsedSettings)
      } catch (error) {
        console.error("Error parsing stored theme settings:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save theme settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("chatbotThemeSettings", JSON.stringify(themeSettings))
    }
  }, [themeSettings, isLoaded])

  // Apply theme mode
  useEffect(() => {
    if (!isLoaded) return

    const root = document.documentElement
    if (themeSettings.themeMode === "dark") {
      root.classList.add("dark")
    } else if (themeSettings.themeMode === "light") {
      root.classList.remove("dark")
    } else if (themeSettings.themeMode === "auto") {
      // Check system preference
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }, [themeSettings.themeMode, isLoaded])

  // Update theme settings
  const updateThemeSettings = (settings: Partial<ThemeSettings>) => {
    setThemeSettings((prev) => ({ ...prev, ...settings }))
  }

  // Reset theme settings to defaults
  const resetThemeSettings = () => {
    setThemeSettings(defaultThemeSettings)
  }

  return (
    <ThemeContext.Provider value={{ themeSettings, updateThemeSettings, resetThemeSettings }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
