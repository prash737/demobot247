"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Upload, Trash2, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/app/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useChatbotTheme } from "@/app/contexts/chatbot-theme-context"
import SharedChatInterface from "@/app/components/shared-chat-interface"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import ChatbotSidebar from "@/app/components/chatbot-sidebar"
import ChatbotHeader from "@/app/components/chatbot-header"
import { logAuditEvent } from "@/app/utils/audit-logger"

// Add this after the imports
const pulseScaleAnimation = `
  @keyframes pulseScale {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-pulse-scale {
    animation: pulseScale 2s infinite ease-in-out;
  }
`

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

// Default theme values
const defaultTheme = {
  primaryColor: "#3B82F6", // Default blue
  secondaryColor: "#10B981", // Default green
  borderRadius: 8,
  avatarUrl: "/abstract-ai-network.png",
  darkMode: false,
}

export default function ThemePage() {
  const router = useRouter()
  const {
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
  } = useChatbotTheme()

  // State management
  const [activeSection, setActiveSection] = useState("theme")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [chatbotName, setChatbotName] = useState("Your Chatbot")
  const [greeting, setGreeting] = useState("Hello! How can I help you today?")
  const [instruction, setInstruction] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [themeLoaded, setThemeLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const initialRenderRef = useRef(true)
  // Add a state to track when to refresh the chatbot component
  const [refreshChatbot, setRefreshChatbot] = useState(0)
  // Keep alignment state for database compatibility
  const [alignment, setAlignment] = useState<"bottom-right" | "bottom-left">("bottom-right")
  // Pulsating effect state
  const [isPulsating, setIsPulsating] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Add state to track original values for change detection
  const [originalValues, setOriginalValues] = useState({
    primaryColor: "",
    secondaryColor: "",
    borderRadius: 0,
    avatarUrl: "",
    darkMode: false,
    chatbotName: "",
    greeting: "",
    instruction: "",
    alignment: "bottom-right" as "bottom-right" | "bottom-left",
    isPulsating: true,
  })

  // Add a flag to track if the avatar was explicitly changed by the user
  const [avatarExplicitlyChanged, setAvatarExplicitlyChanged] = useState(false)
  // Add a flag to track if pulsating effect was explicitly changed
  const [pulsatingExplicitlyChanged, setPulsatingExplicitlyChanged] = useState(false)

  // Fixed gradient for buttons - will not change with theme
  const fixedButtonStyle = {
    background: "linear-gradient(to right, #6366f1, #3b82f6)",
    color: "white",
  }

  // Add a new state for chatbot status
  const [chatbotStatus, setChatbotStatus] = useState<"Active" | "Inactive" | "In progress" | "unknown">("unknown")

  // Add state for embed icon avatar
  const [embedIconUrl, setEmbedIconUrl] = useState<string | null>(null)
  const [isEmbedIconUploading, setIsEmbedIconUploading] = useState(false)
  const embedIconFileInputRef = useRef<HTMLInputElement>(null)
  const [embedIconExplicitlyChanged, setEmbedIconExplicitlyChanged] = useState(false)

  // Function to check for existing embed icon
  const checkForExistingEmbedIcon = async (chatbotId: string) => {
    try {
      console.log("Checking for existing embed icon for chatbot ID:", chatbotId)

      // List files in the chatbot's folder in the embediconavatar bucket
      const { data: files, error } = await supabase.storage.from("embediconavatar").list(chatbotId)

      if (error) {
        console.error("Error listing embed icon files:", error)
        return null
      }

      console.log("Embed icon files found in bucket:", files)

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
        const { data: urlData } = supabase.storage
          .from("embediconavatar")
          .getPublicUrl(`${chatbotId}/${imageFile.name}`)

        console.log("Found existing embed icon:", urlData.publicUrl)
        return urlData.publicUrl
      } else {
        console.log("No embed icon files found in the folder")
      }

      return null
    } catch (error) {
      console.error("Error checking for existing embed icon:", error)
      return null
    }
  }

  // Fetch theme data on component mount
  useEffect(() => {
    const fetchThemeData = async () => {
      try {
        console.log("Fetching theme data...")
        await forceRefetchTheme()
        setThemeLoaded(true)
        console.log("Theme data loaded:", { primaryColor, secondaryColor, borderRadius, darkMode })
      } catch (error) {
        console.error("Error fetching theme data:", error)
        // Use default values if fetch fails
        setPrimaryColor(defaultTheme.primaryColor)
        setSecondaryColor(defaultTheme.secondaryColor)
        setBorderRadius(defaultTheme.borderRadius)
        setDarkMode(defaultTheme.darkMode)
      }
    }

    fetchThemeData()
  }, [])

  // Add this useEffect after the other useEffect hooks to fetch chatbot status
  useEffect(() => {
    const fetchChatbotStatus = async () => {
      try {
        // Get chatbot ID from localStorage
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
            }
          }
        }

        if (!chatbotId) return

        // Fetch the chatbot status from the credentials table
        const { data, error } = await supabase
          .from("credentials")
          .select("chatbot_status")
          .eq("chatbot_id", chatbotId)
          .single()

        if (error) {
          console.error("Error fetching chatbot status:", error)
          setChatbotStatus("unknown")
          return
        }

        if (data) {
          console.log("Chatbot status:", data.chatbot_status)
          setChatbotStatus(data.chatbot_status || "unknown")
        } else {
          console.log("No chatbot status found")
          setChatbotStatus("unknown")
        }
      } catch (error) {
        console.error("Error in fetchChatbotStatus:", error)
        setChatbotStatus("unknown")
      }
    }

    fetchChatbotStatus()
  }, [])

  // Add this useEffect to fetch alignment
  useEffect(() => {
    const fetchAlignment = async () => {
      try {
        // Get chatbot ID from localStorage
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
            }
          }
        }

        if (!chatbotId) return

        // Fetch the alignment from the chatbot_themes table
        const { data, error } = await supabase
          .from("chatbot_themes")
          .select("alignment")
          .eq("chatbot_id", chatbotId)
          .order("updated_at", { ascending: false })
          .limit(1)

        if (error) {
          console.error("Error fetching alignment:", error)
          return
        }

        if (data && data.length > 0 && data[0].alignment) {
          const storedAlignment = data[0].alignment
          console.log("Alignment:", storedAlignment)
          setAlignment(storedAlignment as "bottom-right" | "bottom-left")
        }
      } catch (error) {
        console.error("Error in fetchAlignment:", error)
      }
    }

    fetchAlignment()
  }, [])

  // Add this useEffect to fetch pulsating effect
  useEffect(() => {
    const fetchPulsatingEffect = async () => {
      try {
        // Get chatbot ID from localStorage
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
            }
          }
        }

        if (!chatbotId) return

        // Fetch the pulsating effect from the chatbot_themes table
        const { data, error } = await supabase
          .from("chatbot_themes")
          .select("pulsating_effect")
          .eq("chatbot_id", chatbotId)
          .order("updated_at", { ascending: false })
          .limit(1)

        if (error) {
          console.error("Error fetching pulsating effect:", error)
          return
        }

        if (data && data.length > 0) {
          const pulsatingEffect = data[0].pulsating_effect
          console.log("Pulsating effect:", pulsatingEffect)
          setIsPulsating(pulsatingEffect !== "No") // Default to true if not explicitly set to "No"
        }
      } catch (error) {
        console.error("Error in fetchPulsatingEffect:", error)
      }
    }

    fetchPulsatingEffect()
  }, [])

  // Add this useEffect to fetch embed icon
  useEffect(() => {
    const fetchEmbedIcon = async () => {
      try {
        // Get chatbot ID from localStorage
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
            }
          }
        }

        if (!chatbotId) return

        // Check for existing embed icon
        const existingEmbedIconUrl = await checkForExistingEmbedIcon(chatbotId)
        if (existingEmbedIconUrl) {
          setEmbedIconUrl(existingEmbedIconUrl)
        }
      } catch (error) {
        console.error("Error in fetchEmbedIcon:", error)
      }
    }

    fetchEmbedIcon()
  }, [])

  // Ensure theme values are applied when the component mounts
  useEffect(() => {
    // Only run this effect once on initial mount
    if (initialRenderRef.current) {
      initialRenderRef.current = false

      // Apply theme to CSS variables - only for the chatbot component
      document.documentElement.style.setProperty("--primary-color", primaryColor || defaultTheme.primaryColor)
      document.documentElement.style.setProperty("--secondary-color", secondaryColor || defaultTheme.secondaryColor)
      document.documentElement.style.setProperty("--border-radius", `${borderRadius || defaultTheme.borderRadius}px`)

      // Apply dark mode if needed
      if (darkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }

      console.log("Theme applied in theme page:", {
        primaryColor: primaryColor || defaultTheme.primaryColor,
        secondaryColor: secondaryColor || defaultTheme.secondaryColor,
        borderRadius: borderRadius || defaultTheme.borderRadius,
        avatarUrl,
        darkMode,
      })

      // Mark initial load as complete after a short delay
      setTimeout(() => {
        setInitialLoadComplete(true)
      }, 500)
    }
  }, [primaryColor, secondaryColor, borderRadius, avatarUrl, darkMode])

  // Load chatbot name, greeting, and instruction from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("chatbotName")
      const storedGreeting = localStorage.getItem("chatbotGreeting")
      const storedInstruction = localStorage.getItem("chatbotInstruction")
      const storedAlignment = localStorage.getItem("chatbotAlignment")
      const storedPulsatingEffect = localStorage.getItem("pulsatingEffect")

      if (storedName) setChatbotName(storedName)
      if (storedGreeting) setGreeting(storedGreeting)
      if (storedInstruction) setInstruction(storedInstruction)
      if (storedAlignment) setAlignment(storedAlignment as "bottom-right" | "bottom-left")
      if (storedPulsatingEffect !== null) setIsPulsating(storedPulsatingEffect === "Yes")
    }
  }, [])

  // Set preview URL when avatarUrl changes
  useEffect(() => {
    if (avatarUrl) {
      setPreviewUrl(avatarUrl)
    }
  }, [avatarUrl])

  // Fetch current theme data to store as original values for change detection
  useEffect(() => {
    const fetchCurrentThemeData = async () => {
      try {
        // Get chatbot ID from localStorage
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
            }
          }
        }

        if (!chatbotId) return

        // Fetch current theme data
        const { data, error } = await supabase
          .from("chatbot_themes")
          .select("*")
          .eq("chatbot_id", chatbotId)
          .order("updated_at", { ascending: false })
          .limit(1)

        if (error) {
          console.error("Error fetching current theme data:", error)
          return
        }

        if (data && data.length > 0) {
          const themeData = data[0]

          // Store original values for change detection
          setOriginalValues({
            primaryColor: themeData.primary_color || defaultTheme.primaryColor,
            secondaryColor: themeData.secondary_color || defaultTheme.secondaryColor,
            borderRadius: themeData.border_radius || defaultTheme.borderRadius,
            avatarUrl: themeData.avatar_url || defaultTheme.avatarUrl,
            darkMode: themeData.dark_mode || defaultTheme.darkMode,
            chatbotName: themeData.chatbot_name || "Your Chatbot",
            greeting: themeData.greeting || "Hello! How can I help you today?",
            instruction: themeData.instruction || "",
            alignment: themeData.alignment || "bottom-right",
            isPulsating: themeData.pulsating_effect !== "No",
          })
        }
      } catch (error) {
        console.error("Error in fetchCurrentThemeData:", error)
      }
    }

    fetchCurrentThemeData()
  }, [])

  // Handle color change
  const handleColorChange = (type: "primary" | "secondary", value: string) => {
    if (type === "primary") {
      setPrimaryColor(value)
      // Update CSS variable for immediate effect
      document.documentElement.style.setProperty("--primary-color", value)
    } else {
      setSecondaryColor(value)
      // Update CSS variable for immediate effect
      document.documentElement.style.setProperty("--secondary-color", value)
    }

    // Force immediate update to the chatbot preview
    setTimeout(() => {
      // Dispatch a custom event to notify the chatbot component of theme changes
      const event = new CustomEvent("themeUpdate", {
        detail: {
          primaryColor: type === "primary" ? value : primaryColor,
          secondaryColor: type === "secondary" ? value : secondaryColor,
          borderRadius,
          darkMode,
          avatarUrl,
        },
      })
      window.dispatchEvent(event)
    }, 0)
  }

  // Handle border radius change
  const handleBorderRadiusChange = (value: number) => {
    setBorderRadius(value)
    // Update CSS variable for immediate effect
    document.documentElement.style.setProperty("--border-radius", `${value}px`)

    // Force immediate update to the chatbot preview
    setTimeout(() => {
      applyThemeToAllComponents()

      // Dispatch a custom event to notify the chatbot component of theme changes
      const event = new CustomEvent("themeUpdate", {
        detail: {
          primaryColor,
          secondaryColor,
          borderRadius: value,
          darkMode,
          avatarUrl,
        },
      })
      window.dispatchEvent(event)
    }, 0)
  }

  // Handle dark mode toggle
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked)

    // Apply dark mode immediately
    if (checked) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Force immediate update to the chatbot preview
    setTimeout(() => {
      applyThemeToAllComponents()

      // Dispatch a custom event to notify the chatbot component of theme changes
      const event = new CustomEvent("themeUpdate", {
        detail: {
          primaryColor,
          secondaryColor,
          borderRadius,
          darkMode: checked,
          avatarUrl,
        },
      })
      window.dispatchEvent(event)
    }, 0)
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    try {
      setIsUploading(true)
      const file = e.target.files[0]

      // Get chatbot ID from localStorage
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
          }
        }
      }

      // If no chatbot ID found in userData, scan localStorage for any key that might contain it
      if (!chatbotId) {
        if (typeof window !== "undefined") {
          // Look for keys that might contain chatbot ID
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith("cb_") || key.includes("chatbot"))) {
              try {
                const value = localStorage.getItem(key)
                if (value) {
                  // If the value is the ID itself
                  chatbotId = value
                  console.log(`Found chatbot ID in localStorage key ${key}:`, chatbotId)
                  break
                }
              } catch (error) {
                console.error(`Error reading localStorage key ${key}:`, error)
              }
            }
          }
        }
      }

      if (!chatbotId) {
        throw new Error("Chatbot ID not available. Please save your chatbot first.")
      }

      console.log("Using chatbot ID for avatar upload:", chatbotId)

      // First, check if there are any existing files and delete them
      const { data: existingFiles, error: listError } = await supabase.storage.from("chatbotavatar").list(chatbotId)

      if (listError) {
        console.error("Error listing existing avatar files:", listError)
      } else if (existingFiles && existingFiles.length > 0) {
        // Delete existing files
        for (const existingFile of existingFiles) {
          const { error: deleteError } = await supabase.storage
            .from("chatbotavatar")
            .remove([`${chatbotId}/${existingFile.name}`])

          if (deleteError) {
            console.error("Error deleting existing avatar file:", deleteError)
          }
        }
      }

      // Upload the new file
      const fileName = `avatar-${Date.now()}.${file.name.split(".").pop()}`
      const { error: uploadError } = await supabase.storage
        .from("chatbotavatar")
        .upload(`${chatbotId}/${fileName}`, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from("chatbotavatar").getPublicUrl(`${chatbotId}/${fileName}`)

      // Update the avatar URL in the theme context
      setAvatarUrl(urlData.publicUrl)
      setPreviewUrl(urlData.publicUrl)

      // Set the flag to indicate avatar was explicitly changed
      setAvatarExplicitlyChanged(true)

      // Force immediate update to all components
      setTimeout(() => {
        applyThemeToAllComponents()
      }, 0)

      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been uploaded successfully.",
      })

      // Trigger chatbot refresh
      setRefreshChatbot((prev) => prev + 1)
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    try {
      setIsUploading(true)

      // Get the current avatar URL
      const currentAvatarUrl = avatarUrl

      // If it's the default avatar, don't try to delete it
      if (!currentAvatarUrl || currentAvatarUrl === "/abstract-ai-network.png") {
        setAvatarUrl("/abstract-ai-network.png")
        setPreviewUrl("/abstract-ai-network.png")
        return
      }

      // Extract the path from the URL
      const urlParts = currentAvatarUrl.split("chatbotavatar/")
      if (urlParts.length < 2) {
        throw new Error("Invalid avatar URL format")
      }

      const pathPart = urlParts[1]

      // Get chatbot ID from localStorage
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
          }
        }
      }

      // If no chatbot ID found in userData, scan localStorage for any key that might contain it
      if (!chatbotId) {
        if (typeof window !== "undefined") {
          // Look for keys that might contain chatbot ID
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith("cb_") || key.includes("chatbot"))) {
              try {
                const value = localStorage.getItem(key)
                if (value) {
                  // If the value is the ID itself
                  chatbotId = value
                  console.log(`Found chatbot ID in localStorage key ${key}:`, chatbotId)
                  break
                }
              } catch (error) {
                console.error(`Error reading localStorage key ${key}:`, error)
              }
            }
          }
        }
      }

      if (!chatbotId) {
        throw new Error("Chatbot ID not available. Please save your chatbot first.")
      }

      // Delete the file from Supabase Storage
      const { error } = await supabase.storage.from("chatbotavatar").remove([pathPart])

      if (error) {
        throw error
      }

      // Reset to default avatar
      setAvatarUrl("/abstract-ai-network.png")
      setPreviewUrl("/abstract-ai-network.png")

      // Set the flag to indicate avatar was explicitly changed
      setAvatarExplicitlyChanged(true)

      // Force immediate update to all components
      setTimeout(() => {
        applyThemeToAllComponents()
      }, 0)

      toast({
        title: "Avatar removed",
        description: "Your avatar has been removed successfully.",
      })

      // Trigger chatbot refresh
      setRefreshChatbot((prev) => prev + 1)
    } catch (error) {
      console.error("Error removing avatar:", error)
      toast({
        title: "Removal failed",
        description: error instanceof Error ? error.message : "Failed to remove avatar.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle embed icon upload
  const handleEmbedIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    try {
      setIsEmbedIconUploading(true)
      const file = e.target.files[0]

      // Get chatbot ID from localStorage
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
          }
        }
      }

      if (!chatbotId) {
        throw new Error("Chatbot ID not available. Please save your chatbot first.")
      }

      console.log("Using chatbot ID for embed icon upload:", chatbotId)

      // First, check if there are any existing files and delete them
      const { data: existingFiles, error: listError } = await supabase.storage.from("embediconavatar").list(chatbotId)

      if (listError) {
        console.error("Error listing existing embed icon files:", listError)
      } else if (existingFiles && existingFiles.length > 0) {
        // Delete existing files
        for (const existingFile of existingFiles) {
          const { error: deleteError } = await supabase.storage
            .from("embediconavatar")
            .remove([`${chatbotId}/${existingFile.name}`])

          if (deleteError) {
            console.error("Error deleting existing embed icon file:", deleteError)
          }
        }
      }

      // Upload the new file
      const fileName = `embed-icon-${Date.now()}.${file.name.split(".").pop()}`
      const { error: uploadError } = await supabase.storage
        .from("embediconavatar")
        .upload(`${chatbotId}/${fileName}`, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from("embediconavatar").getPublicUrl(`${chatbotId}/${fileName}`)

      // Update the embed icon URL
      setEmbedIconUrl(urlData.publicUrl)

      // Set the flag to indicate embed icon was explicitly changed
      setEmbedIconExplicitlyChanged(true)

      toast({
        title: "Embed icon uploaded",
        description: "Your embed icon has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading embed icon:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload embed icon.",
        variant: "destructive",
      })
    } finally {
      setIsEmbedIconUploading(false)
      if (embedIconFileInputRef.current) {
        embedIconFileInputRef.current.value = ""
      }
    }
  }

  // Handle embed icon removal confirmation
  const handleConfirmDeleteEmbedIcon = () => {
    setShowDeleteConfirm(true)
  }

  // Handle actual embed icon removal
  const handleRemoveEmbedIcon = async () => {
    try {
      setIsEmbedIconUploading(true)

      // Get the current embed icon URL
      const currentEmbedIconUrl = embedIconUrl

      // If there's no embed icon, don't try to delete anything
      if (!currentEmbedIconUrl) {
        setEmbedIconUrl(null)
        return
      }

      // Extract the path from the URL
      const urlParts = currentEmbedIconUrl.split("embediconavatar/")
      if (urlParts.length < 2) {
        throw new Error("Invalid embed icon URL format")
      }

      const pathPart = urlParts[1]

      // Get chatbot ID from localStorage
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
          }
        }
      }

      if (!chatbotId) {
        throw new Error("Chatbot ID not available. Please save your chatbot first.")
      }

      // Delete the file from Supabase Storage
      const { error } = await supabase.storage.from("embediconavatar").remove([pathPart])

      if (error) {
        throw error
      }

      // Reset embed icon URL
      setEmbedIconUrl(null)

      // Set the flag to indicate embed icon was explicitly changed
      setEmbedIconExplicitlyChanged(true)

      // Log the deletion to the audit log
      await logAuditEvent(chatbotId, "user", {
        embed_icon_url: { previous: currentEmbedIconUrl, current: null },
      })

      toast({
        title: "Embed icon removed",
        description: "Your embed icon has been removed successfully.",
      })
    } catch (error) {
      console.error("Error removing embed icon:", error)
      toast({
        title: "Removal failed",
        description: error instanceof Error ? error.message : "Failed to remove embed icon.",
        variant: "destructive",
      })
    } finally {
      setIsEmbedIconUploading(false)
      setShowDeleteConfirm(false)
    }
  }

  // Handle pulsating effect change
  const handlePulsatingChange = (value: boolean) => {
    setIsPulsating(value)
    setPulsatingExplicitlyChanged(true)
  }

  // Handle save
  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Get chatbot ID from localStorage
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
          }
        }
      }

      if (!chatbotId) {
        throw new Error("Chatbot ID not found")
      }

      // Fetch current theme data to compare changes
      const { data: currentThemeData, error: fetchError } = await supabase
        .from("chatbot_themes")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .order("updated_at", { ascending: false })
        .limit(1)

      // Track changes for audit log
      const changes: Record<string, { previous: any; current: any }> = {}

      // Only add fields to changes if they've actually changed
      if (currentThemeData && currentThemeData.length > 0) {
        const themeData = currentThemeData[0]

        // Only log changes for fields that have actually changed
        if (themeData.primary_color !== primaryColor) {
          changes.primary_color = { previous: themeData.primary_color, current: primaryColor }
        }

        if (themeData.secondary_color !== secondaryColor) {
          changes.secondary_color = { previous: themeData.secondary_color, current: secondaryColor }
        }

        if (themeData.border_radius !== borderRadius) {
          changes.border_radius = { previous: themeData.border_radius, current: borderRadius }
        }

        if (themeData.dark_mode !== darkMode) {
          changes.dark_mode = { previous: themeData.dark_mode, current: darkMode }
        }

        // Only log avatar_url changes if it was explicitly changed by the user
        if (avatarExplicitlyChanged) {
          const currentAvatarUrl = avatarUrl || "/abstract-ai-network.png"
          const storedAvatarUrl = themeData.avatar_url || "/abstract-ai-network.png"
          changes.avatar_url = { previous: storedAvatarUrl, current: currentAvatarUrl }
        }

        if (themeData.chatbot_name !== chatbotName) {
          changes.chatbot_name = { previous: themeData.chatbot_name, current: chatbotName }
        }

        if (themeData.greeting !== greeting) {
          changes.greeting = { previous: themeData.greeting, current: greeting }
        }

        if (themeData.instruction !== instruction) {
          changes.instruction = { previous: themeData.instruction, current: instruction }
        }

        if (themeData.alignment !== alignment) {
          changes.alignment = { previous: themeData.alignment, current: alignment }
        }

        // Only log pulsating_effect if it was explicitly changed by the user
        if (pulsatingExplicitlyChanged) {
          const currentPulsating = isPulsating ? "Yes" : "No"
          const storedPulsating = themeData.pulsating_effect || "Yes"
          changes.pulsating_effect = { previous: storedPulsating, current: currentPulsating }
        }

        // Only log embed_icon_url changes if it was explicitly changed by the user
        if (embedIconExplicitlyChanged) {
          changes.embed_icon_url = { previous: themeData.embed_icon_url || null, current: embedIconUrl }
        }
      } else {
        // For new records, log all fields as changes (previous = null)
        changes.primary_color = { previous: null, current: primaryColor }
        changes.secondary_color = { previous: null, current: secondaryColor }
        changes.border_radius = { previous: null, current: borderRadius }
        changes.dark_mode = { previous: null, current: darkMode }
        changes.avatar_url = { previous: null, current: avatarUrl || "/abstract-ai-network.png" }
        changes.chatbot_name = { previous: null, current: chatbotName }
        changes.greeting = { previous: null, current: greeting }
        changes.instruction = { previous: null, current: instruction }
        changes.alignment = { previous: null, current: alignment }
        changes.pulsating_effect = { previous: null, current: isPulsating ? "Yes" : "No" }
        changes.embed_icon_url = { previous: null, current: embedIconUrl }
      }

      // Save theme settings
      await saveTheme()

      // Save chatbot name, greeting, instruction, alignment, and pulsating effect to localStorage
      localStorage.setItem("chatbotName", chatbotName)
      localStorage.setItem("chatbotGreeting", greeting)
      localStorage.setItem("chatbotInstruction", instruction)
      localStorage.setItem("chatbotAlignment", alignment)
      localStorage.setItem("pulsatingEffect", isPulsating ? "Yes" : "No")

      if (chatbotId) {
        // Update chatbot_themes table with additional fields
        const { error } = await supabase
          .from("chatbot_themes")
          .update({
            chatbot_name: chatbotName,
            greeting: greeting,
            instruction: instruction,
            alignment: alignment,
            pulsating_effect: isPulsating ? "Yes" : "No",
            updated_at: new Date().toISOString(),
          })
          .eq("chatbot_id", chatbotId)

        if (error) {
          throw error
        }
      }

      // Log changes to audit_logs if there are any changes
      if (Object.keys(changes).length > 0) {
        await logAuditEvent(chatbotId, "user", changes)
      }

      // Apply theme to all components only once
      applyThemeToAllComponents()

      // Increment the refresh counter to trigger a reload of the chatbot component
      setRefreshChatbot((prev) => prev + 1)

      // Reset the explicit change flags after saving
      setAvatarExplicitlyChanged(false)
      setPulsatingExplicitlyChanged(false)
      setEmbedIconExplicitlyChanged(false)

      toast({
        title: "Theme saved",
        description: "Your theme settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving theme:", error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save theme settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state only during initial load
  if (isThemeLoading && !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Get the current primary and secondary colors (use defaults if not set)
  const currentPrimaryColor = primaryColor || defaultTheme.primaryColor
  const currentSecondaryColor = secondaryColor || defaultTheme.secondaryColor
  const currentBorderRadius = borderRadius || defaultTheme.borderRadius

  // Chat bubble SVG component for consistent use
  const ChatBubbleSvg = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-10 h-10"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  )

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50" : "",
      )}
    >
      <style jsx global>
        {pulseScaleAnimation}
      </style>

      {/* Top Navigation Bar - Using shared header component */}
      <ChatbotHeader chatbotName={chatbotName} isScrolled={isScrolled} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Using shared sidebar component */}
        {!isFullscreen && <ChatbotSidebar activeSection="theme" />}

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50/30 to-green-50/30 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold">Theme Customization</h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger></TooltipTrigger>
                  <TooltipContent>
                    <p>Customize your chatbot's appearance and behavior</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Tabs defaultValue="appearance" className="mb-6">
              {/* Updated width to be appropriate for 2 tabs */}
              <TabsList className="mb-4 grid grid-cols-2 w-[400px]">
                <TabsTrigger value="appearance" className="relative">
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="embed">Embed Icon</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>Customize how your chatbot looks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Chatbot Name */}
                    <div className="space-y-2">
                      <Label htmlFor="chatbot-name">Chatbot Name</Label>
                      <Input
                        id="chatbot-name"
                        value={chatbotName}
                        onChange={(e) => setChatbotName(e.target.value)}
                        placeholder="Enter your chatbot's name"
                      />
                    </div>
                    {/* Primary Color */}
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="primary-color"
                          type="color"
                          value={currentPrimaryColor}
                          onChange={(e) => handleColorChange("primary", e.target.value)}
                          onInput={(e) => handleColorChange("primary", (e.target as HTMLInputElement).value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={currentPrimaryColor}
                          onChange={(e) => handleColorChange("primary", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={currentSecondaryColor}
                          onChange={(e) => handleColorChange("secondary", e.target.value)}
                          onInput={(e) => handleColorChange("secondary", (e.target as HTMLInputElement).value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={currentSecondaryColor}
                          onChange={(e) => handleColorChange("secondary", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Border Radius */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="border-radius">Border Radius</Label>
                        <span className="text-sm text-gray-500">{currentBorderRadius}px</span>
                      </div>
                      <input
                        id="border-radius"
                        type="range"
                        min={0}
                        max={20}
                        step={1}
                        value={currentBorderRadius}
                        onChange={(e) => handleBorderRadiusChange(Number.parseInt(e.target.value))}
                        onInput={(e) => handleBorderRadiusChange(Number.parseInt((e.target as HTMLInputElement).value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>

                    {/* Avatar */}
                    <div className="space-y-2">
                      <Label>Avatar</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border">
                          {previewUrl && (
                            <img
                              src={previewUrl || "/placeholder.svg"}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <div className="relative">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              disabled={isUploading}
                            />
                            <Button type="button" variant="outline" disabled={isUploading}>
                              {isUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                                </>
                              )}
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRemoveAvatar}
                            disabled={isUploading || avatarUrl === "/abstract-ai-network.png"}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="embed">
                <Card>
                  <CardHeader>
                    <CardTitle>Embed Icon Customization</CardTitle>
                    <CardDescription>Choose how your embed icon appears on websites</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Pulsating Option */}
                      <div
                        className={`border p-6 rounded-lg cursor-pointer transition-all ${
                          isPulsating ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                        }`}
                        onClick={() => handlePulsatingChange(true)}
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div
                              className={`w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center ${
                                isPulsating ? "animate-pulse-scale" : ""
                              }`}
                            >
                              <ChatBubbleSvg />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="pulsating"
                              name="embedStyle"
                              checked={isPulsating}
                              onChange={() => handlePulsatingChange(true)}
                            />
                            <Label htmlFor="pulsating" className="font-medium">
                              Pulsating
                            </Label>
                          </div>
                          <p className="text-sm text-gray-500 text-center">
                            Icon grows and shrinks to attract attention
                          </p>
                        </div>
                      </div>

                      {/* Non-Pulsating Option */}
                      <div
                        className={`border p-6 rounded-lg cursor-pointer transition-all ${
                          !isPulsating ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                        }`}
                        onClick={() => handlePulsatingChange(false)}
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                              <ChatBubbleSvg />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="non-pulsating"
                              name="embedStyle"
                              checked={!isPulsating}
                              onChange={() => handlePulsatingChange(false)}
                            />
                            <Label htmlFor="non-pulsating" className="font-medium">
                              Non-Pulsating
                            </Label>
                          </div>
                          <p className="text-sm text-gray-500 text-center">Static icon without animation</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Custom Embed Icon</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border bg-blue-500 flex items-center justify-center">
                            {embedIconUrl ? (
                              <img
                                src={embedIconUrl || "/placeholder.svg"}
                                alt="Embed Icon"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ChatBubbleSvg />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <div className="relative">
                              <input
                                ref={embedIconFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleEmbedIconUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isEmbedIconUploading}
                              />
                              <Button type="button" variant="outline" disabled={isEmbedIconUploading}>
                                {isEmbedIconUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Icon
                                  </>
                                )}
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleConfirmDeleteEmbedIcon}
                              disabled={isEmbedIconUploading || !embedIconUrl}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Upload a custom icon for your embed button. This will replace the default chat icon.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4 mb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-1/2">
                      <Button
                        className="w-full transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={() => router.push("/create-chatbot/embed")}
                        style={fixedButtonStyle}
                        disabled={chatbotStatus !== "Active"}
                      >
                        Next: Embed Chatbot
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {chatbotStatus !== "Active" && (
                    <TooltipContent>
                      <p>Chatbot must be active to access embed options</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <Button
                className="w-1/2 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={handleSave}
                disabled={isSaving}
                style={fixedButtonStyle}
              >
                <div className="flex items-center">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save changes
                    </>
                  )}
                </div>
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              All changes are automatically applied to the preview
            </div>
          </div>
        </div>

        {/* Chat Interface - Pass the refresh counter to force rerender */}
        <SharedChatInterface isFullscreen={isFullscreen} refreshKey={refreshChatbot} />
      </div>
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this embed icon? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemoveEmbedIcon}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
