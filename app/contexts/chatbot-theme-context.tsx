"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zsivtypgrrcttzhtfjsf.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys"

const supabase = createClient(supabaseUrl, supabaseKey)

// Add a global flag to track if we've already fetched the theme
if (typeof window !== "undefined") {
  window.themeAlreadyFetched = window.themeAlreadyFetched || {}
}

interface ChatbotThemeContextType {
  primaryColor: string
  setPrimaryColor: (color: string) => void
  secondaryColor: string
  setSecondaryColor: (color: string) => void
  borderRadius: number
  setBorderRadius: (radius: number) => void
  avatarUrl: string
  setAvatarUrl: (url: string) => void
  darkMode: boolean
  setDarkMode: (isDark: boolean) => void
  saveTheme: () => Promise<void>
  isThemeLoading: boolean
  hasUnsavedChanges: boolean
  resetToLastSaved: () => void
  applyThemeToAllComponents: () => void
  forceRefetchTheme: () => Promise<void>
}

const defaultTheme = {
  primaryColor: "#3B82F6", // Default blue
  secondaryColor: "#10B981", // Default green
  borderRadius: 8,
  avatarUrl: "/images/default-avatar.png",
  darkMode: false,
}

const ChatbotThemeContext = createContext<ChatbotThemeContextType | undefined>(undefined)

export function ChatbotThemeProvider({ children }: { children: React.ReactNode }) {
  // Current theme state
  const [primaryColor, setPrimaryColor] = useState(defaultTheme.primaryColor)
  const [secondaryColor, setSecondaryColor] = useState(defaultTheme.secondaryColor)
  const [borderRadius, setBorderRadius] = useState(defaultTheme.borderRadius)
  const [avatarUrl, setAvatarUrl] = useState(defaultTheme.avatarUrl)
  const [darkMode, setDarkMode] = useState(defaultTheme.darkMode)
  const [isThemeLoading, setIsThemeLoading] = useState(false) // Changed to false for SSR
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const fetchThemeRef = useRef<() => Promise<void>>()
  const isFetchingRef = useRef(false)

  // Last saved theme state (to track changes and allow reset)
  const [lastSavedTheme, setLastSavedTheme] = useState({
    primaryColor: defaultTheme.primaryColor,
    secondaryColor: defaultTheme.secondaryColor,
    borderRadius: defaultTheme.borderRadius,
    avatarUrl: defaultTheme.avatarUrl,
    darkMode: defaultTheme.darkMode,
  })

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Reset to last saved theme
  const resetToLastSaved = () => {
    setPrimaryColor(lastSavedTheme.primaryColor)
    setSecondaryColor(lastSavedTheme.secondaryColor)
    setBorderRadius(lastSavedTheme.borderRadius)
    setAvatarUrl(lastSavedTheme.avatarUrl)
    setDarkMode(lastSavedTheme.darkMode)
    setHasUnsavedChanges(false)
  }

  // Function to check for existing avatar in Supabase storage
  const checkForExistingAvatar = async (chatbotId: string) => {
    try {
      console.log("Checking for existing avatar for chatbot ID:", chatbotId)

      // List files in the chatbot's folder
      const { data: files, error } = await supabase.storage.from("chatbotavatar").list(chatbotId)

      if (error) {
        console.error("Error listing avatar files:", error)
        return null
      }

      console.log("Files found in bucket:", files)

      // Find the first image file (if any)
      const imageFile = files?.find(
        (file) =>
          file.name.endsWith(".jpg") ||
          file.name.endsWith(".jpeg") ||
          file.name.endsWith(".png") ||
          file.name.endsWith(".gif"),
      )

      if (imageFile) {
        // Get the public URL for the image
        const { data: urlData } = supabase.storage.from("chatbotavatar").getPublicUrl(`${chatbotId}/${imageFile.name}`)

        console.log("Found existing avatar:", urlData.publicUrl)
        return urlData.publicUrl
      } else {
        console.log("No image files found in the folder")
      }

      return null
    } catch (error) {
      console.error("Error checking for existing avatar:", error)
      return null
    }
  }

  // Safe database query with error handling
  const safeSupabaseQuery = async (queryFn: () => Promise<any>) => {
    try {
      return await queryFn()
    } catch (error) {
      console.error("Supabase query error:", error)
      return { data: null, error }
    }
  }

  // Update the fetchThemeSettings function with better error handling
  const fetchThemeSettings = async () => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log("Already fetching theme, skipping duplicate request")
      return
    }

    isFetchingRef.current = true
    console.log("Fetching theme settings...")
    setIsThemeLoading(true)

    try {
      // Get the chatbot ID from userData in localStorage
      let chatbotId = null

      const userDataStr = localStorage.getItem("userData")
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)
          if (userData.chatbotId) {
            chatbotId = userData.chatbotId
          }
        } catch (error) {
          console.error("Error parsing userData:", error)
        }
      }

      if (!chatbotId) {
        // If no chatbotId found, try to get it from the URL if it's an embedded chatbot
        if (window.location.pathname.includes("/embed/")) {
          const pathParts = window.location.pathname.split("/")
          const embedIdIndex = pathParts.indexOf("embed") + 1
          if (embedIdIndex > 0 && embedIdIndex < pathParts.length) {
            chatbotId = pathParts[embedIdIndex]
          }
        }
      }

      if (chatbotId) {
        // Check if we've already fetched this theme
        if (window.themeAlreadyFetched && window.themeAlreadyFetched[chatbotId]) {
          console.log(`Theme for chatbot ID ${chatbotId} already fetched, using cached data`)
          loadFromLocalStorage()
          return
        }

        console.log("Fetching theme for chatbot ID:", chatbotId)

        // Fetch theme settings from chatbot_themes table with error handling
        const { data, error } = await safeSupabaseQuery(() =>
          supabase
            .from("chatbot_themes")
            .select("*")
            .eq("chatbot_id", chatbotId)
            .order("updated_at", { ascending: false })
            .limit(1),
        )

        if (error) {
          console.error("Error fetching theme settings:", error)
          // Load from localStorage as fallback
          loadFromLocalStorage()
        } else if (data && data.length > 0) {
          // Use the most recent theme record
          const themeData = data[0]
          console.log("Theme data loaded from database:", themeData)

          // Apply theme settings from database, only using defaults for NULL values
          const loadedPrimaryColor =
            themeData.primary_color !== null ? themeData.primary_color : defaultTheme.primaryColor
          const loadedSecondaryColor =
            themeData.secondary_color !== null ? themeData.secondary_color : defaultTheme.secondaryColor
          const loadedBorderRadius =
            themeData.border_radius !== null ? themeData.border_radius : defaultTheme.borderRadius
          const loadedDarkMode = themeData.dark_mode !== null ? themeData.dark_mode : defaultTheme.darkMode

          // Always check for avatar in the chatbotavatar bucket, regardless of avatar_url in database
          let loadedAvatarUrl = defaultTheme.avatarUrl
          const existingAvatarUrl = await checkForExistingAvatar(chatbotId)
          if (existingAvatarUrl) {
            loadedAvatarUrl = existingAvatarUrl
            console.log("Using avatar from bucket:", loadedAvatarUrl)
          } else {
            console.log("No avatar found in bucket, using default:", loadedAvatarUrl)
          }

          // Update current theme state
          setPrimaryColor(loadedPrimaryColor)
          setSecondaryColor(loadedSecondaryColor)
          setBorderRadius(loadedBorderRadius)
          setAvatarUrl(loadedAvatarUrl)
          setDarkMode(loadedDarkMode)

          // Update last saved theme state
          setLastSavedTheme({
            primaryColor: loadedPrimaryColor,
            secondaryColor: loadedSecondaryColor,
            borderRadius: loadedBorderRadius,
            avatarUrl: loadedAvatarUrl,
            darkMode: loadedDarkMode,
          })

          // Reset unsaved changes flag
          setHasUnsavedChanges(false)

          // Store instruction, greeting, response_tone, and response_length in localStorage for other pages to access
          if (themeData.instruction) localStorage.setItem("chatbotInstruction", themeData.instruction)
          if (themeData.greeting) localStorage.setItem("chatbotGreeting", themeData.greeting)
          if (themeData.chatbot_name) localStorage.setItem("chatbotName", themeData.chatbot_name)
          if (themeData.response_tone) localStorage.setItem("responseTone", themeData.response_tone)
          if (themeData.response_length) localStorage.setItem("responseLength", themeData.response_length)

          // Save to localStorage for offline access
          localStorage.setItem(
            "chatbotTheme",
            JSON.stringify({
              primaryColor: loadedPrimaryColor,
              secondaryColor: loadedSecondaryColor,
              borderRadius: loadedBorderRadius,
              avatarUrl: loadedAvatarUrl,
              darkMode: loadedDarkMode,
              instruction: themeData.instruction || "",
              greeting: themeData.greeting || "",
              chatbotName: themeData.chatbot_name || "SSODL",
              responseTone: themeData.response_tone || "friendly",
              responseLength: themeData.response_length || "concise",
            }),
          )

          // Apply theme to CSS variables immediately
          document.documentElement.style.setProperty("--primary-color", loadedPrimaryColor)
          document.documentElement.style.setProperty("--secondary-color", loadedSecondaryColor)
          document.documentElement.style.setProperty("--border-radius", `${loadedBorderRadius}px`)

          // Apply dark mode if needed
          if (loadedDarkMode) {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }

          // Mark this theme as fetched
          if (window.themeAlreadyFetched) {
            window.themeAlreadyFetched[chatbotId] = true
          }
        } else {
          console.log("No theme data found for chatbot ID:", chatbotId)
          // No chatbotId found, load from localStorage or use defaults
          loadFromLocalStorage()
        }
      } else {
        // No chatbotId found, load from localStorage or use defaults
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error("Error in fetchThemeSettings:", error)
      // Fallback to localStorage
      loadFromLocalStorage()
    } finally {
      setIsThemeLoading(false)
      setIsInitialLoad(false)
      isFetchingRef.current = false
    }
  }

  // Store the fetchThemeSettings function in a ref so it can be called from other functions
  fetchThemeRef.current = fetchThemeSettings

  // Function to force a refetch of the theme
  const forceRefetchTheme = async () => {
    if (fetchThemeRef.current && !isFetchingRef.current) {
      await fetchThemeRef.current()
    }
  }

  // Update the loadFromLocalStorage function to handle instruction and greeting
  const loadFromLocalStorage = () => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("chatbotTheme")
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme)
          const loadedPrimaryColor = parsedTheme.primaryColor || defaultTheme.primaryColor
          const loadedSecondaryColor = parsedTheme.secondaryColor || defaultTheme.secondaryColor
          const loadedBorderRadius = parsedTheme.borderRadius || defaultTheme.borderRadius
          const loadedAvatarUrl = parsedTheme.avatarUrl || defaultTheme.avatarUrl
          const loadedDarkMode = parsedTheme.darkMode ?? defaultTheme.darkMode

          // Update current theme state
          setPrimaryColor(loadedPrimaryColor)
          setSecondaryColor(loadedSecondaryColor)
          setBorderRadius(loadedBorderRadius)
          setAvatarUrl(loadedAvatarUrl)
          setDarkMode(loadedDarkMode)

          // Update last saved theme state
          setLastSavedTheme({
            primaryColor: loadedPrimaryColor,
            secondaryColor: loadedSecondaryColor,
            borderRadius: loadedBorderRadius,
            avatarUrl: loadedAvatarUrl,
            darkMode: loadedDarkMode,
          })

          // Reset unsaved changes flag
          setHasUnsavedChanges(false)

          // Apply theme to CSS variables immediately
          document.documentElement.style.setProperty("--primary-color", loadedPrimaryColor)
          document.documentElement.style.setProperty("--secondary-color", loadedSecondaryColor)
          document.documentElement.style.setProperty("--border-radius", `${loadedBorderRadius}px`)

          // Apply dark mode if needed
          if (loadedDarkMode) {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }
        } catch (error) {
          console.error("Error parsing saved theme:", error)
        }
      }
    }
  }

  // Fetch theme settings from database when component mounts or user logs in
  useEffect(() => {
    // Skip during SSR
    if (typeof window === "undefined") return

    // Initial fetch of theme settings - only if not already fetching
    if (!isFetchingRef.current) {
      fetchThemeSettings()
    }

    // Set up an event listener for login events
    const handleLoginEvent = () => {
      console.log("Login event detected, applying theme from localStorage")

      // Try to apply theme from localStorage immediately
      const savedTheme = localStorage.getItem("chatbotTheme")
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme)

          // Apply theme to CSS variables immediately
          document.documentElement.style.setProperty("--primary-color", parsedTheme.primaryColor || "#3B82F6")
          document.documentElement.style.setProperty("--secondary-color", parsedTheme.secondaryColor || "#10B981")
          document.documentElement.style.setProperty("--border-radius", `${parsedTheme.borderRadius || 8}px`)

          // Apply dark mode if needed
          if (parsedTheme.darkMode) {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }

          // Update state
          setPrimaryColor(parsedTheme.primaryColor || defaultTheme.primaryColor)
          setSecondaryColor(parsedTheme.secondaryColor || defaultTheme.secondaryColor)
          setBorderRadius(parsedTheme.borderRadius || defaultTheme.borderRadius)
          setAvatarUrl(parsedTheme.avatarUrl || defaultTheme.avatarUrl)
          setDarkMode(parsedTheme.darkMode ?? defaultTheme.darkMode)

          // Update last saved theme state
          setLastSavedTheme({
            primaryColor: parsedTheme.primaryColor || defaultTheme.primaryColor,
            secondaryColor: parsedTheme.secondaryColor || defaultTheme.secondaryColor,
            borderRadius: parsedTheme.borderRadius || defaultTheme.borderRadius,
            avatarUrl: parsedTheme.avatarUrl || defaultTheme.avatarUrl,
            darkMode: parsedTheme.darkMode ?? defaultTheme.darkMode,
          })

          // Reset unsaved changes flag
          setHasUnsavedChanges(false)

          console.log("Theme applied from localStorage after login")
        } catch (error) {
          console.error("Error applying theme from localStorage:", error)
          // If there's an error, fetch theme from database
          if (!isFetchingRef.current) {
            fetchThemeSettings()
          }
        }
      } else {
        // No theme in localStorage, fetch from database
        if (!isFetchingRef.current) {
          fetchThemeSettings()
        }
      }
    }

    window.addEventListener("userLoggedIn", handleLoginEvent)

    // Also listen for route changes to ensure theme is applied
    const handleRouteChange = () => {
      console.log("Route changed, applying theme")
      applyThemeToAllComponents()
    }

    window.addEventListener("routeChangeComplete", handleRouteChange)

    // Listen for storage changes to detect login in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userData" && e.newValue && (!e.oldValue || e.newValue !== e.oldValue)) {
        console.log("User data changed in localStorage, fetching theme")
        if (!isFetchingRef.current) {
          fetchThemeSettings()
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Listen for instruction updates without affecting theme colors
    const handleInstructionUpdate = (e: CustomEvent) => {
      console.log("Instruction update event received", e.detail)
      // We don't update theme colors here, only process instruction-related settings if needed
      // This prevents theme colors from being reset when saving instructions
    }

    window.addEventListener("instructionUpdate", handleInstructionUpdate as EventListener)

    return () => {
      window.removeEventListener("userLoggedIn", handleLoginEvent)
      window.removeEventListener("routeChangeComplete", handleRouteChange)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("instructionUpdate", handleInstructionUpdate as EventListener)
    }
  }, [])

  // Check for unsaved changes whenever theme values change
  useEffect(() => {
    if (!isThemeLoading) {
      const hasChanges =
        primaryColor !== lastSavedTheme.primaryColor ||
        secondaryColor !== lastSavedTheme.secondaryColor ||
        borderRadius !== lastSavedTheme.borderRadius ||
        avatarUrl !== lastSavedTheme.avatarUrl ||
        darkMode !== lastSavedTheme.darkMode

      setHasUnsavedChanges(hasChanges)
    }
  }, [primaryColor, secondaryColor, borderRadius, avatarUrl, darkMode, isThemeLoading, lastSavedTheme])

  // Save theme to localStorage whenever it changes (but NOT to database)
  useEffect(() => {
    if (typeof window !== "undefined" && !isThemeLoading && !isInitialLoad) {
      const themeData = {
        primaryColor,
        secondaryColor,
        borderRadius,
        avatarUrl,
        darkMode,
      }

      localStorage.setItem("chatbotTheme", JSON.stringify(themeData))

      // Dispatch a custom event that the embedded iframe can listen for
      const event = new CustomEvent("themeUpdated", { detail: themeData })
      window.dispatchEvent(event)
    }
  }, [primaryColor, secondaryColor, borderRadius, avatarUrl, darkMode, isThemeLoading, isInitialLoad])

  // Update the saveTheme function with better error handling
  const saveTheme = async () => {
    try {
      // Get the chatbot ID from userData in localStorage
      let chatbotId = null

      if (typeof window !== "undefined") {
        const userDataStr = localStorage.getItem("userData")
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr)
            if (userData.chatbotId) {
              chatbotId = userData.chatbotId
            }
          } catch (error) {
            console.error("Error parsing userData:", error)
            throw new Error("Invalid user data")
          }
        }
      }

      if (!chatbotId) {
        throw new Error("No chatbot ID found")
      }

      console.log("Saving theme for chatbot:", chatbotId, {
        primaryColor,
        secondaryColor,
        borderRadius,
        avatarUrl,
        darkMode,
      })

      // First check if a record already exists with error handling
      const { data: existingThemes, error: fetchError } = await safeSupabaseQuery(() =>
        supabase.from("chatbot_themes").select("*").eq("chatbot_id", chatbotId),
      )

      if (fetchError) {
        console.error("Error checking existing theme:", fetchError)
        throw new Error(fetchError.message || "Failed to check existing theme")
      }

      let result

      if (existingThemes && existingThemes.length > 0) {
        // Update existing record - don't include avatar_url
        const { data, error } = await safeSupabaseQuery(() =>
          supabase
            .from("chatbot_themes")
            .update({
              primary_color: primaryColor,
              secondary_color: secondaryColor,
              border_radius: borderRadius,
              dark_mode: darkMode,
              updated_at: new Date().toISOString(),
            })
            .eq("chatbot_id", chatbotId)
            .select(),
        )

        if (error) {
          console.error("Error updating theme:", error)
          throw new Error(error.message || "Failed to update theme")
        }

        result = data
      } else {
        // Insert new record - don't include avatar_url
        const { data, error } = await safeSupabaseQuery(() =>
          supabase
            .from("chatbot_themes")
            .insert({
              chatbot_id: chatbotId,
              primary_color: primaryColor,
              secondary_color: secondaryColor,
              border_radius: borderRadius,
              dark_mode: darkMode,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select(),
        )

        if (error) {
          console.error("Error inserting theme:", error)
          throw new Error(error.message || "Failed to insert theme")
        }

        result = data
      }

      // Update lastSavedTheme state to match current theme
      setLastSavedTheme({
        primaryColor,
        secondaryColor,
        borderRadius,
        avatarUrl,
        darkMode,
      })

      // Reset unsaved changes flag
      setHasUnsavedChanges(false)

      console.log("Theme saved successfully:", result)
      return result
    } catch (error) {
      console.error("Error saving theme:", error)
      // Re-throw the error so the caller can handle it
      throw error instanceof Error ? error : new Error("Unknown error occurred")
    }
  }

  // Add this function after the saveTheme function
  const applyThemeToAllComponents = useCallback(() => {
    // Skip during SSR
    if (typeof window === "undefined") return

    // Apply theme to CSS variables
    document.documentElement.style.setProperty("--primary-color", primaryColor)
    document.documentElement.style.setProperty("--secondary-color", secondaryColor)
    document.documentElement.style.setProperty("--border-radius", `${borderRadius}px`)

    // Apply dark mode if needed
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Dispatch a custom event to notify all components of theme changes
    // Use a flag to prevent recursive updates
    if (!window.isProcessingThemeUpdate) {
      window.isProcessingThemeUpdate = true

      const event = new CustomEvent("themeUpdate", {
        detail: {
          primaryColor,
          secondaryColor,
          borderRadius,
          darkMode,
          avatarUrl,
        },
      })
      window.dispatchEvent(event)

      console.log("Theme applied to all components:", {
        primaryColor,
        secondaryColor,
        borderRadius,
        avatarUrl,
        darkMode,
      })

      // Reset the flag after a short delay
      setTimeout(() => {
        window.isProcessingThemeUpdate = false
      }, 50)
    }
  }, [primaryColor, secondaryColor, borderRadius, avatarUrl, darkMode])

  // Add this useEffect after the other useEffects
  useEffect(() => {
    if (typeof window !== "undefined" && !isThemeLoading && !isInitialLoad) {
      // Use a debounce to prevent rapid consecutive calls
      const timeoutId = setTimeout(() => {
        applyThemeToAllComponents()
      }, 200)

      return () => clearTimeout(timeoutId)
    }
  }, [
    primaryColor,
    secondaryColor,
    borderRadius,
    avatarUrl,
    darkMode,
    isThemeLoading,
    isInitialLoad,
    applyThemeToAllComponents,
  ])

  // Apply theme to CSS variables immediately during loading
  useEffect(() => {
    if (typeof window !== "undefined" && !isThemeLoading) {
      document.documentElement.style.setProperty("--primary-color", primaryColor)
      document.documentElement.style.setProperty("--secondary-color", secondaryColor)
      document.documentElement.style.setProperty("--border-radius", `${borderRadius}px`)

      if (darkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [isThemeLoading, primaryColor, secondaryColor, borderRadius, darkMode])

  return (
    <ChatbotThemeContext.Provider
      value={{
        primaryColor,
        setPrimaryColor,
        secondaryColor,
        setSecondaryColor,
        borderRadius,
        setBorderRadius,
        avatarUrl,
        setAvatarUrl,
        darkMode,
        setDarkMode,
        saveTheme,
        isThemeLoading,
        hasUnsavedChanges,
        resetToLastSaved,
        applyThemeToAllComponents,
        forceRefetchTheme,
      }}
    >
      {children}
    </ChatbotThemeContext.Provider>
  )
}

export function useChatbotTheme() {
  const context = useContext(ChatbotThemeContext)
  if (context === undefined) {
    // Provide fallback values instead of throwing error during SSR
    if (typeof window === "undefined") {
      return {
        primaryColor: "#3B82F6",
        setPrimaryColor: () => {},
        secondaryColor: "#10B981",
        setSecondaryColor: () => {},
        borderRadius: 8,
        setBorderRadius: () => {},
        avatarUrl: "/images/default-avatar.png",
        setAvatarUrl: () => {},
        darkMode: false,
        setDarkMode: () => {},
        saveTheme: async () => {},
        isThemeLoading: false,
        hasUnsavedChanges: false,
        resetToLastSaved: () => {},
        applyThemeToAllComponents: () => {},
        forceRefetchTheme: async () => {},
      }
    }
    throw new Error("useChatbotTheme must be used within a ChatbotThemeProvider")
  }
  return context
}
