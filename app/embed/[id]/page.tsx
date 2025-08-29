"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ChatInterface from "@/app/components/chat-interface"
import { ChatbotThemeProvider } from "@/app/contexts/chatbot-theme-context"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

export default function EmbedPage() {
  const params = useParams()
  const chatbotId = params.id as string
  const [chatbotName, setChatbotName] = useState("AI Assistant")
  const [greeting, setGreeting] = useState("Hello! How can I help you today?")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChatbotData = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching chatbot data for ID:", chatbotId)

        // Fetch chatbot data from the database
        const { data, error } = await supabase.from("chatbot_themes").select("*").eq("chatbot_id", chatbotId).single()

        if (error) {
          console.error("Error fetching chatbot data:", error)
        } else if (data) {
          console.log("Theme data loaded for chatbot interface:", data)

          // Set chatbot name and greeting from the data
          if (data.chatbot_name) {
            setChatbotName(data.chatbot_name)
          }

          if (data.greeting) {
            setGreeting(data.greeting)
          }

          // Store in localStorage for other components to access
          if (data.instruction) localStorage.setItem("chatbotInstruction", data.instruction)
          if (data.greeting) localStorage.setItem("chatbotGreeting", data.greeting)
          if (data.chatbot_name) localStorage.setItem("chatbotName", data.chatbot_name)
        }
      } catch (error) {
        console.error("Error in fetchChatbotData:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (chatbotId) {
      // Only fetch once when chatbotId is available
      fetchChatbotData()
    } else {
      setIsLoading(false)
    }
    // Only re-run if chatbotId changes
  }, [chatbotId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 ml-3">Loading chatbot...</p>
      </div>
    )
  }

  return (
    <ChatbotThemeProvider>
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ChatInterface chatbotName={chatbotName} greeting={greeting} chatbotId={chatbotId} isFullscreen={true} />
      </div>
    </ChatbotThemeProvider>
  )
}
