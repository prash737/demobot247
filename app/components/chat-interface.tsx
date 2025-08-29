"use client"

import { useCallback, useState, useEffect, useRef } from "react"
import { Send, Check, Clock, AlertCircle, X } from "lucide-react" // Added Maximize, Minimize
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { processUserMessage } from "@/app/actions/process-data"
import { useChatbotTheme } from "@/app/contexts/chatbot-theme-context"
import { createClient } from "@supabase/supabase-js"
import {
  getGradientHeaderStyle,
  getUserMessageStyle,
  getSendMessageButtonStyle,
  getInputFieldStyle,
  getSuggestedQuestionButtonStyle,
  getBotMessageStyle, // Add this line
} from "./chatbot-styles" // Import the new style functions

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

// Default values
const DEFAULT_CHATBOT_NAME = "AI Assistant"
const DEFAULT_GREETING = "Hello"

// Define message type
interface Message {
  id: number
  sender: string
  content: string
  rawContent?: string // Store the raw content before processing
  timestamp: string
  isBot: boolean
  status?: "sending" | "sent" | "delivered" | "read" | "error"
}

// Define chatbot status type
type ChatbotStatus = "Active" | "Inactive" | "In progress" | "unknown"

// Function to convert markdown tables to HTML tables
function formatMarkdownTables(content: string): string {
  // Check if content contains markdown table (rows starting with |)
  if (!content.includes("|")) return content

  // Split content by lines
  const lines = content.split("\n")
  let inTable = false
  let tableContent = ""
  let formattedContent = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Check if line is part of a table
    if (line.startsWith("|") && line.endsWith("|")) {
      if (!inTable) {
        // Start of a new table
        inTable = true
        tableContent = '<div class="table-container"><table class="markdown-table"><tbody>'
      }

      // Process table row
      const cells = line.split("|").filter((cell) => cell !== "")

      // Check if this is a separator row (contains only dashes and colons)
      const isSeparator = cells.every((cell) => /^[\s\-:]+$/.test(cell.trim()))

      if (!isSeparator) {
        tableContent += "<tr>"
        cells.forEach((cell) => {
          // Determine if this is a header row (usually the first row)
          const cellType = i === 0 || (i === 2 && lines[1].includes("|-")) ? "th" : "td"
          tableContent += `<${cellType}>${cell.trim()}</${cellType}>`
        })
        tableContent += "</tr>"
      }
    } else {
      // Not a table row
      if (inTable) {
        // End of table
        tableContent += "</tbody></table></div>"
        formattedContent += tableContent
        inTable = false
        tableContent = ""
      }
      formattedContent += line + "\n"
    }
  }

  // Close table if we're still in one at the end
  if (inTable) {
    tableContent += "</tbody></table></div>"
    formattedContent += tableContent
  }

  return formattedContent
}

// Refine processMarkdownFormatting for better structuring and visibility
function processMarkdownFormatting(content: string): string {
  // 1. Handle code blocks first to protect their content
  content = content.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded my-2 overflow-x-auto"><code>$1</code></pre>',
  )

  // 2. Process block-level elements (headings, lists)
  // Split content into lines to process block by block
  const lines = content.split("\n")
  const processedLines: string[] = []
  let inList = false
  let listType: "ul" | "ol" | null = null

  lines.forEach((line) => {
    const trimmedLine = line.trim()

    // Check for headings
    if (trimmedLine.match(/^######\s/)) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = null
      }
      processedLines.push(`<h6 class="text-sm font-semibold mt-2 mb-1">${trimmedLine.substring(7).trim()}</h6>`)
    } else if (trimmedLine.match(/^#####\s/)) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = null
      }
      processedLines.push(`<h5 class="text-base font-semibold mt-2 mb-1">${trimmedLine.substring(6).trim()}</h5>`)
    } else if (trimmedLine.match(/^####\s/)) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = null
      }
      processedLines.push(`<h4 class="text-md font-bold mt-3 mb-1">${trimmedLine.substring(5).trim()}</h4>`)
    } else if (trimmedLine.match(/^###\s/)) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = null
      }
      processedLines.push(`<h3 class="text-lg font-bold mt-3 mb-1">${trimmedLine.substring(4).trim()}</h3>`)
    } else if (trimmedLine.match(/^##\s/)) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = null
      }
      processedLines.push(`<h2 class="text-xl font-bold mt-4 mb-2">${trimmedLine.substring(3).trim()}</h2>`)
    } else if (trimmedLine.match(/^#\s/)) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = null
      }
      processedLines.push(`<h1 class="text-2xl font-bold mt-5 mb-3">${trimmedLine.substring(2).trim()}</h1>`)
    }
    // Check for lists
    else if (trimmedLine.match(/^\s*-\s/)) {
      if (!inList || listType !== "ul") {
        if (inList) processedLines.push(`</${listType}>`)
        processedLines.push('<ul class="my-2">')
        inList = true
        listType = "ul"
      }
      processedLines.push(`<li class="ml-4">${trimmedLine.replace(/^\s*-\s*/, "").trim()}</li>`)
    } else if (trimmedLine.match(/^\s*\d+\.\s/)) {
      if (!inList || listType !== "ol") {
        if (inList) processedLines.push(`</${listType}>`)
        processedLines.push('<ol class="my-2">')
        inList = true
        listType = "ol"
      }
      processedLines.push(`<li class="ml-4 list-decimal">${trimmedLine.replace(/^\s*\d+\.\s*/, "").trim()}</li>`)
    } else {
      // If not a list item, close any open list
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = null
      }
      // Add the line as is for now, will handle paragraphs later
      processedLines.push(line)
    }
  })

  // Close any open list at the end
  if (inList) {
    processedLines.push(`</${listType}>`)
  }

  content = processedLines.join("\n")

  // 3. Process inline elements (bold, italic, links, inline code)
  content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  content = content.replace(/\*(.*?)\*/g, "<em>$1</em>")
  content = content.replace(
    /\[([^\]]+)\]$$([^)]+)$$/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>',
  )
  content = content.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">$1</code>')

  // 4. Handle paragraphs for remaining plain text lines
  // Split by newlines, and wrap non-empty, non-HTML-tag-starting lines in <p>
  content = content
    .split("\n")
    .map((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine === "") return "" // Remove empty lines
      // Check if the line already starts with a known block-level HTML tag
      if (
        trimmedLine.startsWith("<h") ||
        trimmedLine.startsWith("<ul") ||
        trimmedLine.startsWith("<ol") ||
        trimmedLine.startsWith("<pre") ||
        trimmedLine.startsWith("<table") ||
        trimmedLine.startsWith('<div class="table-container"') // For tables
      ) {
        return trimmedLine
      }
      return `<p class="my-2">${trimmedLine}</p>`
    })
    .join("")

  // Remove any empty paragraph tags that might have been created
  content = content.replace(/<p class="my-2"><\/p>/g, "")

  return content
}

// Modify the processContent function to include the hash symbol cleanup
function processContent(content: string): string {
  // First, handle markdown tables
  let processedContent = formatMarkdownTables(content)

  // Then, handle other markdown formatting
  processedContent = processMarkdownFormatting(processedContent)

  return processedContent
}

// Update the extractSuggestedQuestions function to better handle HTML formatting and properly separate questions
function extractSuggestedQuestions(content: string): string[] {
  // Clean up HTML tags and convert <br> to newlines
  const cleanedContent = content.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "")

  // Look for patterns like "Would you like to ask any further questions?" followed by numbered questions
  const followUpPattern = /Would you like to ask any further questions?\s*([\s\S]*?)(?:\n\n|$)/i
  const match = cleanedContent.match(followUpPattern)

  if (match && match[1]) {
    // Extract numbered questions (1. Question, 2. Question)
    const questionPattern = /\d+\.\s*(.*?)(?=\n\d+\.|\n\n|$)/g
    const questions: string[] = []
    let questionMatch

    while ((questionMatch = questionPattern.exec(match[1])) !== null) {
      if (questionMatch[1].trim()) {
        questions.push(questionMatch[1].trim())
      }
    }

    // If no numbered questions found, try to extract questions by line breaks
    if (questions.length === 0) {
      const lines = match[1].split("\n").filter((line) => line.trim())
      for (const line of lines) {
        // Remove any numbering at the beginning
        const cleanLine = line.replace(/^\d+\.\s*/, "").trim()
        if (cleanLine) {
          questions.push(cleanLine)
        }
      }
    }

    return questions.slice(0, 3) // Limit to 3 questions
  }

  // Alternative pattern: Look for questions directly
  const directQuestions = cleanedContent.match(/\d+\.\s*(.*?)(?=\n\d+\.|\n\n|$)/g)
  if (directQuestions) {
    return directQuestions
      .map((q) => q.replace(/^\d+\.\s*/, "").trim())
      .filter((q) => q)
      .slice(0, 3)
  }

  return []
}

// Function to filter out the "Would you like to ask any further questions?" section from the response
function filterFollowUpQuestionsSection(content: string): string {
  // Pattern to match the follow-up questions section
  const followUpPattern = /Would you like to ask any further questions\?[\s\S]*?(?:\n\n|$)/i

  // Remove the follow-up questions section
  return content.replace(followUpPattern, "")
}

// Function to get theme data from localStorage
function getThemeFromLocalStorage() {
  if (typeof window === "undefined") return null

  try {
    const themeData = localStorage.getItem("chatbotTheme")
    if (!themeData) return null

    return JSON.parse(themeData)
  } catch (error) {
    console.error("Error parsing theme from localStorage:", error)
    return null
  }
}

// Update the ChatInterfaceProps interface to include themeValues and new handlers
interface ChatInterfaceProps {
  chatbotName: string
  greeting: string
  instruction?: string
  avatarUrl?: string
  chatbotId?: string
  isFullscreen?: boolean
  themeValues?: {
    primaryColor: string
    secondaryColor: string
    borderRadius: number
    darkMode: boolean
  }
  onMinimize?: () => void // New prop for minimize button
  onClose?: () => void // New prop for close button
}

// Update the function signature to include the new themeValues prop
export default function ChatInterface({
  chatbotName = DEFAULT_CHATBOT_NAME,
  greeting = DEFAULT_GREETING,
  instruction,
  avatarUrl,
  chatbotId,
  isFullscreen = false,
  themeValues,
  onMinimize, // Destructure new prop
  onClose, // Destructure new prop
}: ChatInterfaceProps) {
  // Get theme from context - IMPORTANT: This must be at the top level of the component
  const {
    primaryColor: contextPrimaryColor,
    secondaryColor: contextSecondaryColor,
    borderRadius: contextBorderRadius,
    avatarUrl: themeAvatarUrl,
    darkMode: contextDarkMode,
    isThemeLoading,
    forceRefetchTheme,
  } = useChatbotTheme()

  // Use direct props if available, otherwise fall back to context values
  const primaryColor = themeValues?.primaryColor || contextPrimaryColor
  const secondaryColor = themeValues?.secondaryColor || contextSecondaryColor
  const borderRadius = themeValues?.borderRadius || contextBorderRadius
  const darkMode = themeValues?.darkMode !== undefined ? themeValues.darkMode : contextDarkMode

  // Get initial theme data from localStorage before component mounts
  const initialThemeData = typeof window !== "undefined" ? getThemeFromLocalStorage() : null

  // State management
  const [actualChatbotId, setActualChatbotId] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null)
  const [streamingIndex, setStreamingIndex] = useState(0)
  const [fullResponse, setFullResponse] = useState<string>("")
  const [hasFetchedChatbotId, setHasFetchedChatbotId] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [chatbotStatus, setChatbotStatus] = useState<ChatbotStatus>("unknown")
  const [isInitializing, setIsInitializing] = useState(true)
  const [themeDataFromDB, setThemeDataFromDB] = useState<any>(null)
  const [hasAppliedDBTheme, setHasAppliedDBTheme] = useState(false)

  // Initialize with values from localStorage if available, otherwise use props
  const [localChatbotName, setLocalChatbotName] = useState<string>(
    initialThemeData?.chatbotName || chatbotName || DEFAULT_CHATBOT_NAME,
  )
  const [localGreeting, setLocalGreeting] = useState<string>(initialThemeData?.greeting || greeting || DEFAULT_GREETING)
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string>(
    initialThemeData?.avatarUrl || avatarUrl || "/images/default-avatar.png",
  )
  const [pulsatingEffect, setPulsatingEffect] = useState<string>(initialThemeData?.pulsatingEffect || "No")
  const [alignment, setAlignment] = useState<string>(initialThemeData?.alignment || "bottom-right")

  // Process the greeting message with markdown
  const processedGreeting = processContent(localGreeting || DEFAULT_GREETING)

  // Initialize messages state with the processed greeting
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: localChatbotName,
      content: processedGreeting,
      rawContent: localGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isBot: true,
      status: "read",
    },
  ])

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const initialRenderRef = useRef(true)
  const hasInitialFetchRef = useRef(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const themeInitializedRef = useRef(false)
  const hasLoggedStateRef = useRef(false)

  // Function to directly fetch theme data from the database
  const fetchThemeDataFromDB = useCallback(async (id: string) => {
    if (!id || id === "dev_chatbot_id") return null

    try {
      console.log("Directly fetching theme data from database for chatbot ID:", id)
      const { data, error } = await supabase
        .from("chatbot_themes")
        .select("*")
        .eq("chatbot_id", id)
        .order("updated_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error fetching theme data from database:", error)
        return null
      }

      if (data && data.length > 0) {
        console.log("Theme data loaded from database:", data[0])
        return data[0]
      }

      return null
    } catch (error) {
      console.error("Exception fetching theme data from database:", error)
      return null
    }
  }, [])

  // Function to apply theme data from the database
  const applyThemeDataFromDB = useCallback(
    (themeData: any) => {
      if (!themeData) return false

      console.log("Applying theme data from database:", {
        chatbot_name: themeData.chatbot_name,
        greeting: themeData.greeting ? themeData.greeting.substring(0, 30) + "..." : "undefined",
      })

      // Update local state with values from the database
      if (themeData.chatbot_name) {
        setLocalChatbotName(themeData.chatbot_name)
      }

      if (themeData.greeting) {
        setLocalGreeting(themeData.greeting)
      }

      if (themeData.pulsating_effect) {
        setPulsatingEffect(themeData.pulsating_effect)
      }

      if (themeData.alignment) {
        setAlignment(themeData.alignment)
      }

      // Update the first message with the new values
      setMessages((prev) => {
        if (prev.length > 0) {
          return [
            {
              ...prev[0],
              sender: themeData.chatbot_name || localChatbotName,
              content: processContent(themeData.greeting || localGreeting),
              rawContent: themeData.greeting || localGreeting,
            },
            ...prev.slice(1),
          ]
        }
        return prev
      })

      return true
    },
    [localChatbotName, localGreeting],
  )

  // Function to load chatbot settings from localStorage
  const loadChatbotSettingsFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        // Try to get chatbot settings from localStorage
        const savedTheme = localStorage.getItem("chatbotTheme")
        if (savedTheme) {
          const parsedTheme = JSON.parse(savedTheme)

          console.log("Loading theme from localStorage:", {
            chatbotName: parsedTheme.chatbotName || "not set",
            greeting: parsedTheme.greeting ? parsedTheme.greeting.substring(0, 30) + "..." : "not set",
            avatarUrl: parsedTheme.avatarUrl || "not set",
            pulsatingEffect: parsedTheme.pulsatingEffect || "not set",
            alignment: parsedTheme.alignment || "not set",
          })

          // Update local state with values from localStorage
          if (parsedTheme.chatbotName) {
            setLocalChatbotName(parsedTheme.chatbotName)
          }

          if (parsedTheme.greeting) {
            setLocalGreeting(parsedTheme.greeting)
          }

          // Only set avatar URL from localStorage if no avatar URL is provided as a prop
          if (parsedTheme.avatarUrl && !avatarUrl) {
            setLocalAvatarUrl(parsedTheme.avatarUrl)
          }

          // Set additional UI configuration
          if (parsedTheme.pulsatingEffect) {
            setPulsatingEffect(parsedTheme.pulsatingEffect)
          }

          if (parsedTheme.alignment) {
            setAlignment(parsedTheme.alignment)
          }

          // Update the first message with the new values
          setMessages((prev) => {
            if (prev.length > 0) {
              return [
                {
                  ...prev[0],
                  sender: parsedTheme.chatbotName || localChatbotName,
                  content: processContent(parsedTheme.greeting || localGreeting),
                  rawContent: parsedTheme.greeting || localGreeting,
                },
                ...prev.slice(1),
              ]
            }
            return prev
          })

          console.log("Loaded chatbot settings from localStorage:", {
            chatbotName: parsedTheme.chatbotName,
            greeting: parsedTheme.greeting ? parsedTheme.greeting.substring(0, 30) + "..." : "undefined",
            avatarUrl: parsedTheme.avatarUrl,
            pulsatingEffect: parsedTheme.pulsatingEffect,
            alignment: parsedTheme.alignment,
          })

          return true
        }
      } catch (error) {
        console.error("Error loading chatbot settings from localStorage:", error)
      }
    }
    return false
  }, [localChatbotName, localGreeting, avatarUrl])

  // Log props to verify they're being received correctly
  useEffect(() => {
    console.log("ChatInterface props:", {
      chatbotName,
      greeting: greeting ? greeting.substring(0, 50) + "..." : "undefined",
      instruction: instruction ? instruction.substring(0, 50) + "..." : "undefined",
      avatarUrl: avatarUrl || "default",
      chatbotId,
    })
  }, [chatbotName, greeting, instruction, avatarUrl, chatbotId])

  // Initialize component with settings from localStorage
  useEffect(() => {
    // Try to load settings from localStorage first
    const loaded = loadChatbotSettingsFromLocalStorage()

    // If we couldn't load from localStorage, use props
    if (!loaded) {
      setLocalChatbotName(chatbotName || DEFAULT_CHATBOT_NAME)
      setLocalGreeting(greeting || DEFAULT_GREETING)
    }

    // Always prioritize the avatar URL from props if it exists
    if (avatarUrl) {
      console.log("Using avatar URL from props:", avatarUrl)
      setLocalAvatarUrl(avatarUrl)
    } else if (!loaded) {
      setLocalAvatarUrl("/images/default-avatar.png")
    }

    // Set initialization complete
    setIsInitializing(false)
  }, [chatbotName, greeting, avatarUrl, loadChatbotSettingsFromLocalStorage])

  // Get chatbot ID from localStorage or credentials table
  useEffect(() => {
    const fetchChatbotId = async () => {
      try {
        // First check if chatbotId was passed as a prop
        if (chatbotId && chatbotId !== "default_chatbot_id") {
          console.log("Using chatbot ID from props:", chatbotId)
          setActualChatbotId(chatbotId)
          setHasFetchedChatbotId(true)
          return
        }

        // Next try to get it from localStorage userData
        if (typeof window !== "undefined") {
          const userDataStr = localStorage.getItem("userData")
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr)
              console.log("UserData from localStorage:", userData)
              if (userData.chatbotId && userData.chatbotId !== "default_chatbot_id") {
                console.log("Using chatbot ID from localStorage userData:", userData.chatbotId)
                setActualChatbotId(userData.chatbotId)
                setHasFetchedChatbotId(true)
                return
              }

              // If we have username but no valid chatbotId, save the username for later query
              if (userData.username) {
                setUsername(userData.username)
              }
            } catch (error) {
              console.error("Error parsing userData from localStorage:", error)
            }
          }

          // Also try to get username from localStorage directly
          const usernameFromStorage = localStorage.getItem("username")
          if (usernameFromStorage && !username) {
            setUsername(usernameFromStorage)
          }
        }

        // If we have a username, try to get the chatbot ID from the credentials table
        if (username) {
          console.log("Fetching chatbot ID for username:", username)
          const { data, error } = await supabase
            .from("credentials")
            .select("chatbot_id")
            .eq("username", username)
            .single()

          if (error) {
            console.error("Error fetching chatbot ID from credentials:", error)
          } else if (data && data.chatbot_id) {
            console.log("Using chatbot ID from credentials table:", data.chatbot_id)
            setActualChatbotId(data.chatbot_id)

            // Save to localStorage for future use
            if (typeof window !== "undefined") {
              try {
                const userDataStr = localStorage.getItem("userData")
                if (userDataStr) {
                  const userData = JSON.parse(userDataStr)
                  userData.chatbotId = data.chatbot_id
                  localStorage.setItem("userData", JSON.stringify(userData))
                  console.log("Updated userData in localStorage with chatbot ID")
                }
              } catch (error) {
                console.error("Error updating userData in localStorage:", error)
              }
            }
            setHasFetchedChatbotId(true)
            return
          }
        }

        // If we still don't have a chatbot ID, use a fallback
        console.log("Using fallback chatbot ID")
        setActualChatbotId("dev_chatbot_id")
        setHasFetchedChatbotId(true)
      } catch (error) {
        console.error("Error in fetchChatbotId:", error)
        setActualChatbotId("dev_chatbot_id")
        setHasFetchedChatbotId(true)
      }
    }

    fetchChatbotId()
  }, [chatbotId, username])

  // Fetch theme data from database when chatbot ID is available
  useEffect(() => {
    const fetchAndApplyThemeData = async () => {
      if (!actualChatbotId || hasAppliedDBTheme) return

      try {
        const themeData = await fetchThemeDataFromDB(actualChatbotId)
        if (themeData) {
          setThemeDataFromDB(themeData)
          const applied = applyThemeDataFromDB(themeData)
          if (applied) {
            setHasAppliedDBTheme(true)
            console.log("Successfully applied theme data from database")
          }
        }
      } catch (error) {
        console.error("Error in fetchAndApplyThemeData:", error)
      }
    }

    if (actualChatbotId) {
      fetchAndApplyThemeData()
    }
  }, [actualChatbotId, fetchThemeDataFromDB, applyThemeDataFromDB, hasAppliedDBTheme])

  // Fetch chatbot status when chatbot ID is available
  useEffect(() => {
    const fetchChatbotStatus = async () => {
      if (!actualChatbotId || actualChatbotId === "dev_chatbot_id") {
        // For development mode, assume the chatbot is active
        setChatbotStatus("Active")
        return
      }

      try {
        console.log("Fetching chatbot status for ID:", actualChatbotId)
        const { data, error } = await supabase
          .from("credentials")
          .select("chatbot_status")
          .eq("chatbot_id", actualChatbotId)
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

    if (actualChatbotId) {
      fetchChatbotStatus()
    }
  }, [actualChatbotId])

  // Effects
  useEffect(() => {
    // Scroll to bottom when messages change with a slight delay to ensure content is rendered
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [messages])

  // Update first message when chatbot name or greeting changes
  useEffect(() => {
    if (!isInitializing && (localChatbotName !== chatbotName || localGreeting !== greeting)) {
      console.log("Updating first message with:", {
        chatbotName: localChatbotName,
        greeting: localGreeting.substring(0, 50) + "...",
      })

      const processedGreeting = processContent(localGreeting)
      setMessages((prev) => {
        if (prev.length > 0) {
          return [
            {
              ...prev[0],
              sender: localChatbotName,
              content: processedGreeting,
              rawContent: localGreeting,
            },
            ...prev.slice(1),
          ]
        }
        return prev
      })
    }
  }, [localChatbotName, localGreeting, chatbotName, greeting, isInitializing])

  // Listen for theme updates
  useEffect(() => {
    const handleThemeUpdate = (event: Event) => {
      // Safely check if event is a CustomEvent and has detail property
      const customEvent = event as CustomEvent
      if (!customEvent.detail) {
        console.warn("Theme update event received without detail property")
        return
      }

      // Add a check to prevent unnecessary re-renders
      const newTheme = customEvent.detail

      // Safely check if newTheme has the expected properties
      if (typeof newTheme === "object") {
        // Update local state with values from the theme update
        if (newTheme.chatbotName) {
          console.log("Updating chatbot name from event:", newTheme.chatbotName)
          setLocalChatbotName(newTheme.chatbotName)
        }
        if (newTheme.greeting) {
          console.log("Updating greeting from event:", newTheme.greeting.substring(0, 30) + "...")
          setLocalGreeting(newTheme.greeting)
        }
        if (newTheme.avatarUrl) {
          console.log("Updating avatar URL from event:", newTheme.avatarUrl)
          setLocalAvatarUrl(newTheme.avatarUrl)
        }
        if (newTheme.pulsatingEffect) {
          setPulsatingEffect(newTheme.pulsatingEffect)
        }
        if (newTheme.alignment) {
          setAlignment(newTheme.alignment)
        }

        console.log("Theme update event received in ChatInterface:", newTheme)
      } else {
        console.warn("Theme update event received with invalid detail structure:", newTheme)
      }
    }

    window.addEventListener("themeUpdate", handleThemeUpdate)
    return () => {
      window.removeEventListener("themeUpdate", handleThemeUpdate)
    }
  }, [])

  // Log theme values to verify they're being received correctly
  useEffect(() => {
    // Only log on initial render or significant changes
    if (initialRenderRef.current) {
      initialRenderRef.current = false
      console.log("Theme values in ChatInterface:", {
        primaryColor,
        secondaryColor,
        borderRadius,
        avatarUrl: themeAvatarUrl,
        darkMode,
      })
    }
  }, [primaryColor, secondaryColor, borderRadius, themeAvatarUrl, darkMode])

  // Force refetch theme only once when component mounts
  useEffect(() => {
    // Only fetch theme once on initial mount if we don't have direct theme values
    const initialFetch = async () => {
      if (!hasInitialFetchRef.current && !themeValues) {
        hasInitialFetchRef.current = true
        try {
          await forceRefetchTheme()
          console.log("Initial theme fetch completed")
          // After fetching theme, try to load chatbot settings again
          loadChatbotSettingsFromLocalStorage()
          themeInitializedRef.current = true
        } catch (error) {
          console.error("Error fetching theme:", error)
        }
      }
    }

    initialFetch()
  }, [forceRefetchTheme, themeValues, loadChatbotSettingsFromLocalStorage])

  // Determine if we should render the full component
  useEffect(() => {
    // If we have direct theme values from props, we can render immediately after fetching chatbot ID
    if (themeValues) {
      if (hasFetchedChatbotId) {
        setShouldRender(true)
      }
    } else if (!isThemeLoading && hasFetchedChatbotId) {
      // Otherwise wait for theme context to load
      setShouldRender(true)
    }
  }, [isThemeLoading, hasFetchedChatbotId, themeValues])

  // Update the logging effect to prevent infinite logging
  useEffect(() => {
    if (!isInitializing && !hasLoggedStateRef.current) {
      console.log("Current chatbot state:", {
        localChatbotName,
        localGreeting: localGreeting ? localGreeting.substring(0, 30) + "..." : "undefined",
        localAvatarUrl,
        pulsatingEffect,
        alignment,
        themeDataFromDB: themeDataFromDB ? "loaded" : "not loaded",
        hasAppliedDBTheme,
      })
      hasLoggedStateRef.current = true
    }
  }, [
    localChatbotName,
    localGreeting,
    localAvatarUrl,
    pulsatingEffect,
    alignment,
    themeDataFromDB,
    hasAppliedDBTheme,
    isInitializing,
  ])

  // Handlers
  const handleSendMessage = async (content: string) => {
    // Check if chatbot is active before sending message
    if (chatbotStatus !== "Active") {
      console.log("Cannot send message: Chatbot is not active")
      return
    }

    if (!content.trim()) return

    // Clear suggested questions when user sends a new message
    setSuggestedQuestions([])

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      sender: "You",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isBot: false,
      status: "sending",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Update status to sent after a delay
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" as const } : msg)))
    }, 500)

    // Simulate bot typing
    setIsTyping(true)

    try {
      // Log the chatbot ID being used
      console.log("Sending message with chatbot ID:", actualChatbotId)

      // Call the external API with the actual chatbot ID
      const response = await processUserMessage(content, actualChatbotId)

      // Update status to delivered
      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "delivered" as const } : msg)),
      )

      // Extract the response content
      let responseContent = ""
      if (response && response.data) {
        // Check if the response contains a chat_response field
        if (typeof response.data === "string") {
          responseContent = response.data
        } else if (typeof response.data === "object") {
          // If the response has a chat_response field, use that
          if (response.data.chat_response) {
            responseContent = response.data.chat_response
          } else {
            // Fallback to other fields if chat_response doesn't exist
            responseContent = response.data.response || response.data.content || JSON.stringify(response.data, null, 2)
          }
        }
      } else {
        responseContent = "I'm sorry, I couldn't process your request at this time."
      }

      // Truncate response to 50 words
      const words = responseContent.split(/\s+/)
      if (words.length > 50) {
        responseContent = words.slice(0, 50).join(" ") + "..."
      }

      // Extract suggested follow-up questions from raw content
      const questions = extractSuggestedQuestions(responseContent)
      setSuggestedQuestions(questions)

      // Filter out the "Would you like to ask any further questions?" section from the response
      // This removes the follow-up questions section from the main response
      responseContent = filterFollowUpQuestionsSection(responseContent)

      // Create bot message with empty content initially
      const botMessageId = Date.now() + 1
      const botMessage: Message = {
        id: botMessageId,
        sender: localChatbotName,
        content: "", // Start with empty content
        rawContent: responseContent, // Store the raw content
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isBot: true,
        status: "sent",
      }

      // Stop typing indicator and add empty bot message
      setIsTyping(false)
      setMessages((prev) => [...prev, botMessage])

      // Set up streaming effect with raw content
      setFullResponse(responseContent)
      setStreamingMessageId(botMessageId)
      setStreamingIndex(0)
      setStreamingMessage("")
      setIsStreaming(true)

      // Update status to read after a delay
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "read" as const } : msg)),
        )
      }, 1000)
    } catch (error) {
      console.error("Error calling API:", error)

      // Stop typing
      setIsTyping(false)

      // Add error message
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: localChatbotName,
        content: processContent("I'm sorry, there was an error processing your request. Please try again later."),
        rawContent: "I'm sorry, there was an error processing your request. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isBot: true,
        status: "error",
      }

      setMessages((prev) => [...prev, errorMessage])

      // Update user message status
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" as const } : msg)))
    }
  }

  // Effect for streaming the message character by character
  useEffect(() => {
    if (isStreaming && streamingMessageId !== null) {
      if (streamingIndex < fullResponse.length) {
        const timer = setTimeout(() => {
          // Add the next character to the streaming message
          const newStreamingMessage = streamingMessage + fullResponse.charAt(streamingIndex)
          setStreamingMessage(newStreamingMessage)
          setStreamingIndex((prev) => prev + 1)

          // Update the message in the messages array with processed content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? {
                    ...msg,
                    content: processContent(newStreamingMessage),
                    rawContent: newStreamingMessage,
                  }
                : msg,
            ),
          )
        }, 1) // Fast streaming speed

        return () => clearTimeout(timer)
      } else {
        // Streaming complete
        setIsStreaming(false)
        setStreamingMessageId(null)

        // Make sure the final message is fully processed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamingMessageId
              ? {
                  ...msg,
                  content: processContent(fullResponse),
                  rawContent: fullResponse,
                }
              : msg,
          ),
        )
      }
    }
  }, [isStreaming, streamingIndex, fullResponse, streamingMessageId, streamingMessage])

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return timestamp
  }

  // Get styles from the new utility file
  const headerStyle = getGradientHeaderStyle({ primaryColor, secondaryColor, borderRadius })
  const userMessageStyle = getUserMessageStyle({ borderRadius })
  const sendButtonStyle = getSendMessageButtonStyle({ primaryColor, secondaryColor, borderRadius })
  const inputFieldStyle = getInputFieldStyle({ primaryColor, borderRadius })
  const suggestedQuestionButtonStyle = getSuggestedQuestionButtonStyle({ primaryColor })
  const botMessageStyle = getBotMessageStyle({ borderRadius })

  // Show a loading state if the theme is still loading or chatbot ID is not fetched
  if (!shouldRender || isInitializing) {
    return (
      <div
        className="border border-gray-200 rounded-lg bg-white flex flex-col items-center justify-center shadow-md"
        style={{
          width: isFullscreen ? "100%" : "380px",
          height: "600px",
          margin: "auto", // Center horizontally
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading chatbot...</p>
      </div>
    )
  }

  // Check if chatbot is inactive or in progress
  const isChatbotDisabled = chatbotStatus !== "Active"

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white transition-colors duration-300 flex flex-col shadow-md overflow-hidden"
      style={{
        width: isFullscreen ? "100%" : "380px",
        height: "600px",
        margin: "auto", // Center horizontally
      }}
    >
      {/* Header with gradient background */}
      <div className="p-4 flex items-center" style={headerStyle}>
        <Avatar className="h-12 w-12 mr-3 border-2 border-white">
          {" "}
          {/* Reduced size and margin */}
          <AvatarImage src={localAvatarUrl || "/placeholder.svg"} alt={localChatbotName} />
          <AvatarFallback className="bg" alt={localChatbotName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            {localChatbotName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-white flex items-center">
          {/* Buttons here */}
          <div className="flex space-x-1 mr-2 z-10">
            {/* Removed onMinimize button */}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
                aria-label="Close Chatbot"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{localChatbotName}</h2> {/* Reduced font size */}
            <p className="text-white/80">Online</p>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50"
        style={{ height: "calc(600px - 180px)" }}
      >
        {/* Chatbot status notification */}
        {isChatbotDisabled && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-amber-700 text-sm">
              {chatbotStatus === "In progress"
                ? "Your chatbot is still being set up. Please upload the docs and urls for your chatbot and wait !."
                : "Your chatbot is currently inactive and cannot respond to messages.Please upload docs/urls to provide knowledge base to make your chatbot active !"}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="mb-6">
            {message.isBot ? (
              <div className="flex">
                <Avatar className="h-10 w-10 mr-3 mt-1 flex-shrink-0">
                  <AvatarImage src={localAvatarUrl || "/placeholder.svg"} alt={localChatbotName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs">
                    {localChatbotName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[85%]">
                  <div className="font-bold mb-1">{message.sender}</div>
                  <div className="bg-white p-4 rounded-lg shadow-sm" style={botMessageStyle}>
                    <div
                      className="text-gray-800"
                      dangerouslySetInnerHTML={{
                        __html:
                          message.content +
                          (streamingMessageId === message.id ? '<span class="animate-pulse">▋</span>' : ""),
                      }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1 pr-2">{formatTimestamp(message.timestamp)}</div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[85%]">
                  <div className="p-4 rounded-lg shadow-sm text-right" style={userMessageStyle}>
                    <div className="text-gray-800 text-left">{message.content}</div>
                  </div>
                  <div className="flex items-center justify-end text-xs text-gray-500 mt-1 pl-2">
                    {message.status === "sending" && <Clock className="h-3 w-3 mr-1" />}
                    {message.status === "sent" && <Check className="h-3 w-3 mr-1" />}
                    {message.status === "delivered" && (
                      <div className="flex">
                        <Check className="h-3 w-3" />
                        <Check className="h-3 w-3 -ml-1" />
                      </div>
                    )}
                    {message.status === "read" && (
                      <div className="flex text-blue-500">
                        <Check className="h-3 w-3" />
                        <Check className="h-3 w-3 -ml-1" />
                      </div>
                    )}
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {suggestedQuestions.length > 0 && !isChatbotDisabled && (
          <div className="flex flex-col items-center gap-2 mb-4 mt-2 px-4">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm shadow-sm hover:bg-gray-50 transition-colors duration-200 w-auto max-w-full"
                style={suggestedQuestionButtonStyle}
              >
                <span className="whitespace-normal text-left">{question}</span>
              </button>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="flex mb-6">
            <Avatar className="h-10 w-10 mr-3 mt-1">
              <AvatarImage src={localAvatarUrl || "/placeholder.svg"} alt={localChatbotName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs">
                {localChatbotName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold mb-1">{localChatbotName}</div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white">
        <form
          className="relative flex items-center"
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage(inputValue)
          }}
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isChatbotDisabled ? "Chatbot is not available" : "Your message"}
            className="pr-12 py-3 border-gray-300 focus:ring-2 focus:border-transparent"
            style={inputFieldStyle}
            disabled={isChatbotDisabled}
          />
          <div className="absolute right-1">
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 hover:opacity-90"
              style={sendButtonStyle}
              disabled={!inputValue.trim() || isChatbotDisabled}
            >
              <Send className="h-5 w-5 text-white" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
