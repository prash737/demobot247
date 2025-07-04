"use client"

import { useState, useEffect } from "react"
import { Info, Layers, RefreshCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/app/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { toast } from "@/components/ui/use-toast"
import { useChatbotTheme } from "@/app/contexts/chatbot-theme-context"
import SharedChatInterface from "@/app/components/shared-chat-interface"
import ChatbotSidebar from "@/app/components/chatbot-sidebar"
import ChatbotHeader from "@/app/components/chatbot-header"
import { logAuditEvent } from "@/app/utils/audit-logger"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

// Default instruction value
const DEFAULT_INSTRUCTION =
  "You are an advanced AI assistant for [Organization/Institute name]. Your goal is to provide personalized, efficient, and engaging assistance to users, guiding them through various processes, services, and information. Your tone is friendly, professional, and contextually aware, ensuring that users feel comfortable, respected, and supported throughout their journey."

export default function OptimizedChatbotInterface() {
  const router = useRouter()
  const { darkMode, setDarkMode } = useChatbotTheme()

  // State management
  const [activeSection, setActiveSection] = useState("directive")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [chatbotName, setChatbotName] = useState("AI Assistant")
  const [directive, setDirective] = useState(DEFAULT_INSTRUCTION)
  const [greeting, setGreeting] = useState("Hello! How can I help you today?")
  const [tone, setTone] = useState("professional")
  const [responseLength, setResponseLength] = useState("concise")
  const [greetingType, setGreetingType] = useState("static")
  const [model, setModel] = useState("gpt4o-mini")
  const [temperature, setTemperature] = useState(70)
  const [isSaving, setIsSaving] = useState(false)
  const [fallbackMessage, setFallbackMessage] = useState("Oops I am not able to get context to answer your query!")
  // Add a new state for chatbot status
  const [chatbotStatus, setChatbotStatus] = useState<"Active" | "Inactive" | "In progress" | "unknown">("unknown")
  // Add a state to track when to refresh the chatbot component
  const [refreshChatbot, setRefreshChatbot] = useState(0)

  // Effects
  useEffect(() => {
    // Apply theme
    const root = document.documentElement
    if (darkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [darkMode])

  // Check if user is logged in
  useEffect(() => {
    // No login verification needed during development
    console.log("Chatbot interface loaded in development mode")
  }, [])

  // Save chatbot name to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatbotName", chatbotName)
    }
  }, [chatbotName])

  // Load chatbot name from localStorage on component mount
  useEffect(() => {
    // Load chatbot name from localStorage on component mount
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("chatbotName")
      if (savedName) {
        setChatbotName(savedName)
      }

      // Load instruction from localStorage
      const savedInstruction = localStorage.getItem("chatbotInstruction")
      if (savedInstruction) {
        setDirective(savedInstruction)
      }

      // Load greeting from localStorage
      const savedGreeting = localStorage.getItem("chatbotGreeting")
      if (savedGreeting) {
        setGreeting(savedGreeting)
      }
    }
  }, [])

  // Load fallback message from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFallbackMessage = localStorage.getItem("chatbotFallbackMessage")
      if (savedFallbackMessage) {
        setFallbackMessage(savedFallbackMessage)
      }
    }
  }, [])

  // Fetch theme data from Supabase when component mounts
  useEffect(() => {
    const fetchThemeData = async () => {
      try {
        // Get the chatbot ID from userData in localStorage
        let chatbotId = null

        if (typeof window !== "undefined") {
          const userDataStr = localStorage.getItem("userData")
          if (userDataStr) {
            const userData = JSON.parse(userDataStr)
            if (userData.chatbotId) {
              chatbotId = userData.chatbotId
            }
          }
        }

        if (!chatbotId) return

        // Fetch the theme data from the chatbot_themes table
        const { data, error } = await supabase.from("chatbot_themes").select("*").eq("chatbot_id", chatbotId).single()

        if (error) {
          console.error("Error fetching theme data:", error)
          return
        }

        if (data) {
          console.log("Theme data loaded for chatbot interface:", data)

          // Set instruction and greeting from database if they exist
          if (data.instruction !== null) {
            setDirective(data.instruction)
            localStorage.setItem("chatbotInstruction", data.instruction)
          }

          if (data.greeting !== null) {
            setGreeting(data.greeting)
            localStorage.setItem("chatbotGreeting", data.greeting)
          }

          if (data.chatbot_name !== null) {
            setChatbotName(data.chatbot_name)
            localStorage.setItem("chatbotName", data.chatbot_name)
          }

          // Set response tone if it exists
          if (data.response_tone !== null) {
            setTone(data.response_tone)
          }

          // Set response length if it exists
          if (data.response_length !== null) {
            setResponseLength(data.response_length)
          }

          // Set fallback message if it exists
          if (data.fallback_message !== null) {
            setFallbackMessage(data.fallback_message)
            localStorage.setItem("chatbotFallbackMessage", data.fallback_message)
          }
        }
      } catch (error) {
        console.error("Error in fetchThemeData:", error)
      }
    }

    fetchThemeData()
  }, [])

  // Add this function to handle updating the chatbot name
  const handleUpdateChatbotName = async () => {
    if (!chatbotName.trim()) {
      toast({
        title: "Error",
        description: "Chatbot name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      // Get the chatbot ID from userData in localStorage
      let chatbotId = "default_chatbot_id"

      if (typeof window !== "undefined") {
        const userDataStr = localStorage.getItem("userData")
        if (userDataStr) {
          const userData = JSON.parse(userDataStr)
          if (userData.chatbotId) {
            chatbotId = userData.chatbotId
          }
        }
      }

      const response = await fetch("/api/update-chatbot-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbotId,
          chatbotName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update chatbot name")
      }

      toast({
        title: "Success",
        description: "Chatbot name updated successfully",
      })

      // Trigger chatbot refresh
      setRefreshChatbot((prev) => prev + 1)
    } catch (error) {
      console.error("Error updating chatbot name:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update chatbot name",
        variant: "destructive",
      })
    }
  }

  // Add this effect to fetch the chatbot name when the component mounts
  useEffect(() => {
    const fetchChatbotName = async () => {
      try {
        // Get the chatbot ID from userData in localStorage
        let chatbotId = null

        if (typeof window !== "undefined") {
          const userDataStr = localStorage.getItem("userData")
          if (userDataStr) {
            const userData = JSON.parse(userDataStr)
            if (userData.chatbotId) {
              chatbotId = userData.chatbotId
            }
          }
        }

        if (!chatbotId) return

        // Fetch the chatbot name from the credentials table
        const { data, error } = await supabase
          .from("credentials")
          .select("chatbot_name")
          .eq("chatbot_id", chatbotId)
          .single()

        if (error) throw error

        if (data && data.chatbot_name) {
          setChatbotName(data.chatbot_name)
        }
      } catch (error) {
        console.error("Error fetching chatbot name:", error)
      }
    }

    fetchChatbotName()
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

  // Navigation
  const handleSectionClick = (section: string) => {
    if (section === "directive" || section === "instructions") {
      // Already on the instructions page
      setActiveSection("directive")
    } else if (section === "knowledge") {
      // Navigate to the knowledge page
      router.push("/create-chatbot/knowledge")
    } else if (section === "theme") {
      // Navigate to the theme page
      router.push("/create-chatbot/theme")
    } else if (section === "conversations") {
      window.location.href = "/conversations"
    } else if (section === "analytics") {
      window.location.href = "/analytics"
    } else {
      setActiveSection(section)
    }
  }

  // Save chatbot configuration
  const handleSaveChanges = async () => {
    setIsSaving(true)

    try {
      // Get the chatbot ID from userData in localStorage or use a default
      let chatbotId = "dev_chatbot_id"

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

      // First check if a theme record already exists for this chatbot
      const { data: existingTheme, error: fetchError } = await supabase
        .from("chatbot_themes")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is the error code for "no rows returned" which is expected if no theme exists yet
        console.error("Error fetching existing theme:", fetchError)
        throw fetchError
      }

      // Track changes for audit log
      const changes: Record<string, { previous: any; current: any }> = {}

      if (existingTheme) {
        if (existingTheme.instruction !== directive) {
          changes.instruction = { previous: existingTheme.instruction, current: directive }
        }
        if (existingTheme.greeting !== greeting) {
          changes.greeting = { previous: existingTheme.greeting, current: greeting }
        }
        if (existingTheme.chatbot_name !== chatbotName) {
          changes.chatbot_name = { previous: existingTheme.chatbot_name, current: chatbotName }
        }
        if (existingTheme.response_tone !== tone) {
          changes.response_tone = { previous: existingTheme.response_tone, current: tone }
        }
        if (existingTheme.response_length !== responseLength) {
          changes.response_length = { previous: existingTheme.response_length, current: responseLength }
        }
        if (existingTheme.fallback_message !== fallbackMessage) {
          changes.fallback_message = { previous: existingTheme.fallback_message, current: fallbackMessage }
        }
      } else {
        // For new records, log all fields as changes (previous = null)
        changes.instruction = { previous: null, current: directive }
        changes.greeting = { previous: null, current: greeting }
        changes.chatbot_name = { previous: null, current: chatbotName }
        changes.response_tone = { previous: null, current: tone }
        changes.response_length = { previous: null, current: responseLength }
        changes.fallback_message = { previous: null, current: fallbackMessage }
      }

      // Prepare the update data - ONLY instruction-related fields
      const updateData: any = {
        instruction: directive,
        greeting: greeting,
        chatbot_name: chatbotName,
        response_tone: tone,
        response_length: responseLength,
        fallback_message: fallbackMessage,
        updated_at: new Date().toISOString(),
      }

      const insertData: any = {
        chatbot_id: chatbotId,
        instruction: directive,
        greeting: greeting,
        chatbot_name: chatbotName,
        response_tone: tone,
        response_length: responseLength,
        fallback_message: fallbackMessage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (existingTheme) {
        // Update existing theme with ONLY instruction-related fields
        const { error: themeUpdateError } = await supabase
          .from("chatbot_themes")
          .update(updateData)
          .eq("chatbot_id", chatbotId)

        if (themeUpdateError) throw themeUpdateError
      } else {
        // Insert new theme with ONLY instruction-related fields
        // For a new record, we need to include the chatbot_id
        const { error: themeInsertError } = await supabase.from("chatbot_themes").insert(insertData)

        if (themeInsertError) throw themeInsertError
      }

      // Log changes to audit_logs if there are any changes
      if (Object.keys(changes).length > 0) {
        await logAuditEvent(chatbotId, "user", changes)
      }

      // Update localStorage for instruction-related settings only
      localStorage.setItem("chatbotInstruction", directive)
      localStorage.setItem("chatbotGreeting", greeting)
      localStorage.setItem("chatbotName", chatbotName)
      localStorage.setItem("responseTone", tone)
      localStorage.setItem("responseLength", responseLength)
      localStorage.setItem("chatbotFallbackMessage", fallbackMessage)

      // Get the current theme colors from localStorage to include in the event
      const currentTheme = {
        primaryColor: localStorage.getItem("primaryColor") || "#3B82F6",
        secondaryColor: localStorage.getItem("secondaryColor") || "#10B981",
        borderRadius: Number.parseInt(localStorage.getItem("borderRadius") || "8"),
        avatarUrl: localStorage.getItem("avatarUrl") || "/abstract-ai-network.png",
        darkMode: localStorage.getItem("darkMode") === "true",
      }

      // Dispatch event with BOTH instruction settings AND current theme colors
      const themeData = {
        ...currentTheme,
        instruction: directive,
        greeting: greeting,
        chatbotName: chatbotName,
        responseTone: tone,
        responseLength: responseLength,
        fallbackMessage: fallbackMessage,
      }

      // Dispatch a custom event that only updates instruction-related settings
      window.dispatchEvent(new CustomEvent("instructionUpdate", { detail: themeData }))

      // Increment the refresh counter to trigger a reload of the chatbot component
      setRefreshChatbot((prev) => prev + 1)

      // Show success message
      toast({
        title: "Success",
        description: "Chatbot settings saved successfully",
      })

      setTimeout(() => {
        setIsSaving(false)
      }, 1500)
    } catch (error) {
      console.error("Error saving chatbot settings:", error)
      toast({
        title: "Error",
        description: "Failed to save chatbot settings",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50" : "",
      )}
    >
      {/* Top Navigation Bar */}
      <ChatbotHeader chatbotName={chatbotName} isScrolled={isScrolled} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {!isFullscreen && <ChatbotSidebar activeSection="directive" />}

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50/30 to-green-50/30 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold flex items-center">
                <span>Chatbot Instructions</span>
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger></TooltipTrigger>
                  <TooltipContent>
                    <p>Configure your chatbot's behavior and appearance</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Tabs defaultValue="directive" className="mb-6">
              <TabsList className="mb-4 grid grid-cols-3 lg:w-[600px]">
                <TabsTrigger value="directive" className="relative">
                  Directive
                </TabsTrigger>
                <TabsTrigger value="greeting">Greeting</TabsTrigger>
                <TabsTrigger value="fallback">Fallback</TabsTrigger>
              </TabsList>

              <TabsContent value="directive" className="space-y-4">
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="font-medium">Directive</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Define the purpose and behavior of your chatbot</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Card className="border dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="border-b p-3 flex items-center justify-between dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
                        <Layers className="h-4 w-4 mr-2" />
                        Pop out
                      </Button>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-b-md">
                      <div className="font-medium mb-2">Objective:</div>
                      <Textarea
                        className="min-h-[150px] resize-none focus-visible:ring-2 dark:bg-gray-800"
                        value={directive}
                        onChange={(e) => setDirective(e.target.value)}
                      />

                      <div className="mt-4 space-y-3">
                        <div>
                          <Label htmlFor="tone" className="text-sm font-medium">
                            Tone
                          </Label>
                          <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger id="tone" className="w-full mt-1">
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="response-length" className="text-sm font-medium">
                            Response Length
                          </Label>
                          <Select value={responseLength} onValueChange={setResponseLength}>
                            <SelectTrigger id="response-length" className="w-full mt-1">
                              <SelectValue placeholder="Select response length" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="concise">Concise (50-100 words)</SelectItem>
                              <SelectItem value="detailed">Detailed (150-300 words)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="greeting" className="space-y-4">
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="font-medium">Greeting</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Set the initial message your chatbot will send</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Card className="border dark:border-gray-700 shadow-sm">
                    <div className="p-4">
                      <div className="mb-4">
                        <Label htmlFor="greeting-message" className="text-sm font-medium">
                          Greeting Message
                        </Label>
                        <Textarea
                          id="greeting-message"
                          className="min-h-[150px] mt-1 dark:border-gray-700 dark:bg-gray-800"
                          value={greeting}
                          onChange={(e) => setGreeting(e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="fallback" className="space-y-4">
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="font-medium">Fallback Message</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            This message is shown when the chatbot cannot find a relevant answer
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Card className="border dark:border-gray-700 shadow-sm">
                    <div className="p-4">
                      <div className="mb-4">
                        <Label htmlFor="fallback-message" className="text-sm font-medium">
                          Fallback Message
                        </Label>
                        <Textarea
                          id="fallback-message"
                          className="min-h-[150px] mt-1 dark:border-gray-700 dark:bg-gray-800"
                          value={fallbackMessage}
                          onChange={(e) => setFallbackMessage(e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4 mb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-1/2">
                      <Button
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={() => router.push("/create-chatbot/embed")}
                        disabled={chatbotStatus !== "Active"}
                      >
                        Embed Chatbot
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
                className="w-1/2 bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                <div className="flex items-center">
                  {isSaving ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
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
              All changes are automatically saved as drafts
            </div>
          </div>
        </div>

        {/* Chat Interface - Pass the refresh counter to force rerender */}
        <SharedChatInterface isFullscreen={isFullscreen} refreshKey={refreshChatbot} />
      </div>
    </div>
  )
}
