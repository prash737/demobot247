"use client"

import { useState, useEffect } from "react"
import ChatInterface from "@/app/components/chat-interface"
import { useChatbotTheme } from "@/app/contexts/chatbot-theme-context"

interface SharedChatInterfaceProps {
  isFullscreen?: boolean
  refreshKey?: number // Add a refresh key prop to force rerender
}

export default function SharedChatInterface({ isFullscreen = false, refreshKey = 0 }: SharedChatInterfaceProps) {
  const { primaryColor, secondaryColor, borderRadius, avatarUrl, darkMode, isThemeLoading } = useChatbotTheme()

  const [chatbotName, setChatbotName] = useState("AI Assistant")
  const [greeting, setGreeting] = useState("Hello! How can I help you today?")
  const [instruction, setInstruction] = useState("")

  // Load chatbot name, greeting, and instruction from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("chatbotName")
      const storedGreeting = localStorage.getItem("chatbotGreeting")
      const storedInstruction = localStorage.getItem("chatbotInstruction")

      if (storedName) setChatbotName(storedName)
      if (storedGreeting) setGreeting(storedGreeting)
      if (storedInstruction) setInstruction(storedInstruction)
    }
  }, [refreshKey]) // Re-run this effect when refreshKey changes

  // Listen for theme updates
  useEffect(() => {
    const handleThemeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        const newTheme = customEvent.detail

        // If the event includes instruction-related data, update those states
        if (newTheme.chatbotName) setChatbotName(newTheme.chatbotName)
        if (newTheme.greeting) setGreeting(newTheme.greeting)
        if (newTheme.instruction) setInstruction(newTheme.instruction)
      }
    }

    window.addEventListener("themeUpdate", handleThemeUpdate)
    window.addEventListener("instructionUpdate", handleThemeUpdate)

    return () => {
      window.removeEventListener("themeUpdate", handleThemeUpdate)
      window.removeEventListener("instructionUpdate", handleThemeUpdate)
    }
  }, [])

  // If theme is still loading, show a loading state
  if (isThemeLoading) {
    return (
      <div className="border-l bg-white flex flex-col items-center justify-center" style={{ width: "380px" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading theme...</p>
      </div>
    )
  }

  // Pass theme values directly to ChatInterface
  return (
    <ChatInterface
      chatbotName={chatbotName}
      greeting={greeting}
      instruction={instruction}
      avatarUrl={avatarUrl}
      isFullscreen={isFullscreen}
      themeValues={{
        primaryColor,
        secondaryColor,
        borderRadius,
        darkMode,
      }}
      key={refreshKey} // Add a key prop to force rerender when refreshKey changes
    />
  )
}
