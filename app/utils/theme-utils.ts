import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

// Create a global cache for theme fetches
if (typeof window !== "undefined") {
  window.themeAlreadyFetched = window.themeAlreadyFetched || {}
  window.themeFetchInProgress = window.themeFetchInProgress || {}
}

// Debounce function to prevent rapid consecutive calls
let debounceTimer: NodeJS.Timeout | null = null
export function debounce(func: Function, delay: number) {
  return (...args: any[]) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

// Default theme values
export const defaultTheme = {
  primaryColor: "#3B82F6", // Default blue
  secondaryColor: "#10B981", // Default green
  borderRadius: 8,
  avatarUrl: "/images/default-avatar.png",
  darkMode: false,
}

// Keep track of the last fetched chatbotId to prevent duplicate fetches
let lastFetchedChatbotId: string | null = null
let lastFetchTime = 0

// Add this function after the fetchThemeSettings function
export async function checkForExistingAvatar(chatbotId: string) {
  try {
    console.log("Checking for existing avatar for chatbot ID:", chatbotId)

    // FIXED: Corrected path structure - just use the chatbotId as the folder name
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
      // FIXED: Corrected path structure for the public URL
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

// Update the fetchThemeSettings function to include response_tone and response_length
export async function fetchThemeSettings(chatbotId: string) {
  try {
    // Check if a fetch is already in progress for this chatbot ID
    if (typeof window !== "undefined" && window.themeFetchInProgress && window.themeFetchInProgress[chatbotId]) {
      console.log(`Theme fetch already in progress for ${chatbotId}, skipping duplicate request`)
      return null
    }

    // Mark this fetch as in progress
    if (typeof window !== "undefined" && window.themeFetchInProgress) {
      window.themeFetchInProgress[chatbotId] = true
    }

    // Prevent duplicate fetches for the same chatbotId within a short time period
    const now = Date.now()
    if (lastFetchedChatbotId === chatbotId && now - lastFetchTime < 5000) {
      console.log("Skipping duplicate theme fetch for:", chatbotId)
      return null
    }

    // Check if we've already fetched this theme
    if (typeof window !== "undefined" && window.themeAlreadyFetched && window.themeAlreadyFetched[chatbotId]) {
      console.log(`Theme for chatbot ID ${chatbotId} already fetched, using cached data`)
      return null
    }

    console.log("Fetching theme for chatbot ID:", chatbotId)
    lastFetchedChatbotId = chatbotId
    lastFetchTime = now

    // Fetch theme settings from chatbot_themes table - FIXED: use limit(1) instead of single()
    const { data, error } = await supabase
      .from("chatbot_themes")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .order("updated_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching theme settings:", error)

      // Mark fetch as complete
      if (typeof window !== "undefined" && window.themeFetchInProgress) {
        window.themeFetchInProgress[chatbotId] = false
      }

      return null
    }

    if (data && data.length > 0) {
      const themeData = data[0]
      console.log("Theme data loaded from database:", themeData)

      // Always check for avatar in the chatbotavatar bucket, regardless of avatar_url in database
      let avatarUrl = defaultTheme.avatarUrl
      const existingAvatarUrl = await checkForExistingAvatar(chatbotId)
      if (existingAvatarUrl) {
        avatarUrl = existingAvatarUrl
        console.log("Using avatar from bucket:", avatarUrl)
      } else {
        console.log("No avatar found in bucket, using default:", avatarUrl)
      }

      // Mark this theme as fetched
      if (typeof window !== "undefined" && window.themeAlreadyFetched) {
        window.themeAlreadyFetched[chatbotId] = true
      }

      // Mark fetch as complete
      if (typeof window !== "undefined" && window.themeFetchInProgress) {
        window.themeFetchInProgress[chatbotId] = false
      }

      // Return theme settings from database, using defaults for NULL values
      return {
        primaryColor: themeData.primary_color !== null ? themeData.primary_color : defaultTheme.primaryColor,
        secondaryColor: themeData.secondary_color !== null ? themeData.secondary_color : defaultTheme.secondaryColor,
        borderRadius: themeData.border_radius !== null ? themeData.border_radius : defaultTheme.borderRadius,
        avatarUrl: avatarUrl,
        darkMode: themeData.dark_mode !== null ? themeData.dark_mode : defaultTheme.darkMode,
        chatbotName: themeData.chatbot_name || "AI Assistant",
        greeting: themeData.greeting || "Hello! How can I help you today?",
        instruction:
          themeData.instruction ||
          "You are an advanced educational assistant for [Organization/Institute name]. Your goal is to provide personalized, efficient, and engaging assistance to prospective students, guiding them through the admission process, academic programs, campus life, and more. Your tone is friendly, professional, and contextually aware, ensuring that users feel comfortable, respected, and supported throughout their journey.",
        responseTone: themeData.response_tone || "friendly",
        responseLength: themeData.response_length || "concise",
      }
    }

    console.log("No theme data found for chatbot ID:", chatbotId)

    // Mark this theme as fetched even though no data was found
    if (typeof window !== "undefined" && window.themeAlreadyFetched) {
      window.themeAlreadyFetched[chatbotId] = true
    }

    // Mark fetch as complete
    if (typeof window !== "undefined" && window.themeFetchInProgress) {
      window.themeFetchInProgress[chatbotId] = false
    }

    return null
  } catch (error) {
    console.error("Error in fetchThemeSettings:", error)

    // Mark fetch as complete
    if (typeof window !== "undefined" && window.themeFetchInProgress) {
      window.themeFetchInProgress[chatbotId] = false
    }

    return null
  }
}

// Function to apply theme to CSS variables
export function applyThemeToDOM(theme: {
  primaryColor: string
  secondaryColor: string
  borderRadius: number
  darkMode: boolean
}) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--primary-color", theme.primaryColor)
    document.documentElement.style.setProperty("--secondary-color", theme.secondaryColor)
    document.documentElement.style.setProperty("--border-radius", `${theme.borderRadius}px`)

    if (theme.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }
}

// Function to save theme to localStorage
export function saveThemeToLocalStorage(theme: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("chatbotTheme", JSON.stringify(theme))
  }
}

// Function to load theme from localStorage
export function loadThemeFromLocalStorage() {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("chatbotTheme")
    if (savedTheme) {
      try {
        return JSON.parse(savedTheme)
      } catch (error) {
        console.error("Error parsing saved theme:", error)
      }
    }
  }
  return null
}

// Function to dispatch theme update event
export function dispatchThemeUpdateEvent(theme: any) {
  if (typeof window !== "undefined") {
    // Ensure theme has all required properties with defaults
    const safeTheme = {
      primaryColor: theme?.primaryColor || "#3B82F6",
      secondaryColor: theme?.secondaryColor || "#10B981",
      borderRadius: theme?.borderRadius || 8,
      avatarUrl: theme?.avatarUrl || "/images/default-avatar.png",
      darkMode: theme?.darkMode || false,
      // Include other properties if they exist
      ...(theme || {}),
    }

    const event = new CustomEvent("themeUpdate", { detail: safeTheme })
    window.dispatchEvent(event)
  }
}
