"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { createClient } from "@supabase/supabase-js"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatbotHeader from "@/app/components/chatbot-header"
import ChatbotSidebar from "@/app/components/chatbot-sidebar"
import { useChatbotTheme } from "@/app/contexts/chatbot-theme-context"
import { cn } from "@/lib/utils"

// Updated Supabase client initialization
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<{ date_of_convo: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatbotId, setChatbotId] = useState<string | null>(null)
  const [conversationsForDate, setConversationsForDate] = useState<{
    date: string
    conversations: { id: string; created_at: string; messages: Message[] }[]
  } | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([])
  const [chatbotName, setChatbotName] = useState<string>("Your Chatbot")
  const { primaryColor, secondaryColor } = useChatbotTheme()
  const router = useRouter()
  const [chatbotGreeting, setChatbotGreeting] = useState<string>("")
  const [selectedDateInHistory, setSelectedDateInHistory] = useState<string | null>(null)

  useEffect(() => {
    const userDataStr = localStorage.getItem("userData")
    if (!userDataStr) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(userDataStr)
    setChatbotId(userData.chatbotId)

    // Get chatbot name from localStorage if available
    const storedChatbotName = localStorage.getItem("chatbotName")
    if (storedChatbotName) {
      setChatbotName(storedChatbotName)
    }
  }, [router])

  useEffect(() => {
    if (chatbotId) {
      fetchConversations()
    }
  }, [chatbotId])

  // Update selected messages whenever the selected conversation ID changes
  useEffect(() => {
    if (selectedConversationId && conversationsForDate) {
      const selectedConversation = conversationsForDate.conversations.find((conv) => conv.id === selectedConversationId)
      if (selectedConversation && selectedConversation.messages) {
        setSelectedMessages(selectedConversation.messages)
      } else {
        setSelectedMessages([])
      }
    } else {
      setSelectedMessages([])
    }
  }, [selectedConversationId, conversationsForDate])

  const fetchConversations = async () => {
    if (!chatbotId) return

    setLoading(true)
    setError(null)

    try {
      let allDates = []
      let hasMore = true
      let page = 0
      const pageSize = 1000 // Supabase's maximum limit

      // Fetch all conversation dates using pagination
      while (hasMore) {
        const { data, error: fetchError } = await supabase
          .from("testing_zaps2")
          .select("date_of_convo")
          .eq("chatbot_id", chatbotId)
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order("date_of_convo", { ascending: false })

        if (fetchError) throw fetchError

        if (data && data.length > 0) {
          allDates = [...allDates, ...data]
          // Check if we need to fetch more
          hasMore = data.length === pageSize
          page++
        } else {
          hasMore = false
        }
      }

      if (allDates.length > 0) {
        // Group by date and count occurrences
        const dateMap = new Map<string, number>()
        allDates.forEach((item) => {
          const date = item.date_of_convo
          dateMap.set(date, (dateMap.get(date) || 0) + 1)
        })

        // Convert to array of objects
        const conversationSummary = Array.from(dateMap.entries()).map(([date, count]) => ({
          date_of_convo: date,
          count,
        }))

        setConversations(conversationSummary)

        // Automatically select the most recent date and fetch its conversations
        if (conversationSummary.length > 0) {
          const mostRecentDate = conversationSummary[0].date_of_convo
          setSelectedDateInHistory(mostRecentDate)
          await fetchConversationsForDate(mostRecentDate)
        }
      } else {
        setConversations([])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch conversations")
    } finally {
      setLoading(false)
    }
  }

  // Update the handleConversationSelect function to fetch messages directly from the database
  const handleConversationSelect = async (conversationId: string) => {
    console.log("Selecting conversation:", conversationId)
    setSelectedConversationId(conversationId)

    try {
      // Fetch the specific conversation by ID directly from the database
      const { data, error } = await supabase.from("testing_zaps2").select("messages").eq("id", conversationId).single()

      if (error) {
        console.error("Error fetching conversation messages:", error)
        setSelectedMessages([])
        return
      }

      if (data && data.messages) {
        console.log("Found messages:", data.messages.length)
        setSelectedMessages(data.messages)
      } else {
        console.log("No messages found for this conversation")
        setSelectedMessages([])
      }
    } catch (error) {
      console.error("Error in handleConversationSelect:", error)
      setSelectedMessages([])
    }
  }

  const fetchConversationsForDate = async (date: string) => {
    if (!chatbotId) return null

    try {
      let allConversations = []
      let hasMore = true
      let page = 0
      const pageSize = 1000 // Supabase's maximum limit

      while (hasMore) {
        const { data, error } = await supabase
          .from("testing_zaps2")
          .select("id, messages, created_at")
          .eq("chatbot_id", chatbotId)
          .eq("date_of_convo", date)
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
          allConversations = [...allConversations, ...data]
          // Check if we need to fetch more
          hasMore = data.length === pageSize
          page++
        } else {
          hasMore = false
        }
      }

      if (allConversations.length > 0) {
        console.log("Fetched conversations for date:", date, allConversations.length)

        // Process the data to ensure messages are properly formatted
        const processedData = allConversations.map((item) => ({
          id: item.id,
          created_at: item.created_at,
          messages: Array.isArray(item.messages) ? item.messages : [],
        }))

        setConversationsForDate({
          date,
          conversations: processedData,
        })

        // Select the first conversation by default and set its messages
        setSelectedConversationId(processedData[0].id)
        setSelectedMessages(processedData[0].messages || [])

        return allConversations
      }

      return allConversations
    } catch (error) {
      console.error("Error fetching conversations for date:", error)
      return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: primaryColor }}
        ></div>
        <p className="ml-2">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <ChatbotHeader chatbotName={chatbotName} />
      <div className="flex flex-1 overflow-hidden">
        <ChatbotSidebar activeSection="conversations" />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 pb-12">
            <h1 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
              Conversations
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-16rem)]">
              <div className="lg:h-[calc(100vh-16rem)] overflow-hidden">
                {conversations.length > 0 ? (
                  <Card
                    style={{
                      borderColor: primaryColor,
                      borderWidth: "1px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      height: "calc(100% - 20px)", // Reduce height to ensure bottom is visible
                    }}
                  >
                    <CardHeader>
                      <CardTitle>Conversation History</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-hidden pb-0">
                      <ScrollArea className="h-[calc(100vh-22rem)]">
                        <div className="space-y-2 pb-4">
                          {conversations.map((conv) => (
                            <div
                              key={conv.date_of_convo}
                              className={cn(
                                "p-3 border rounded-md cursor-pointer hover:bg-gray-50",
                                selectedDateInHistory === conv.date_of_convo && "bg-gray-100",
                              )}
                              style={{
                                borderColor: selectedDateInHistory === conv.date_of_convo ? primaryColor : undefined,
                                borderWidth: selectedDateInHistory === conv.date_of_convo ? "2px" : "1px",
                              }}
                              onClick={async () => {
                                setSelectedDateInHistory(conv.date_of_convo) // Set selected date
                                await fetchConversationsForDate(conv.date_of_convo)
                              }}
                            >
                              <p className="font-medium">
                                {new Date(conv.date_of_convo).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-gray-500">
                                {conv.count} conversation{conv.count !== 1 ? "s" : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="pt-2 pb-4">
                      <div className="w-full border-t border-gray-200"></div>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card
                    style={{
                      borderColor: primaryColor,
                      borderWidth: "1px",
                      height: "calc(100% - 20px)", // Reduce height to ensure bottom is visible
                    }}
                  >
                    <CardContent className="flex items-center justify-center h-64">
                      <p className="text-xl text-gray-500">Sorry, can't find any conversations.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="lg:h-[calc(100vh-16rem)] overflow-hidden">
                <Card
                  className="flex flex-col"
                  style={{
                    borderColor: secondaryColor,
                    borderWidth: "1px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    height: "calc(100% - 20px)", // Reduce height to ensure bottom is visible
                  }}
                >
                  <CardHeader>
                    <CardTitle>{conversationsForDate ? "Conversation Preview" : "Chat Preview"}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-auto">
                    <ScrollArea className="h-full">
                      {conversationsForDate ? (
                        <div className="space-y-4">
                          <p>
                            Date:{" "}
                            {new Date(conversationsForDate.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>

                          <div className="mb-4">
                            <label
                              htmlFor="conversation-select"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Select Conversation ({conversationsForDate.conversations.length} total):
                            </label>
                            <select
                              id="conversation-select"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                              style={{
                                borderColor: primaryColor,
                                borderRadius: "0.375rem",
                                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                              }}
                              value={selectedConversationId || ""}
                              onChange={(e) => handleConversationSelect(e.target.value)}
                            >
                              {conversationsForDate.conversations.map((conv, index) => (
                                <option key={conv.id} value={conv.id}>
                                  Conversation {index + 1} - {new Date(conv.created_at).toLocaleTimeString()}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-4">
                            {selectedMessages.length > 0 ? (
                              selectedMessages.map((message, index) => (
                                <div
                                  key={index}
                                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                                >
                                  <div
                                    className={`max-w-[95%] rounded-lg p-3 break-words`}
                                    style={{
                                      backgroundColor: message.role === "assistant" ? "#f3f4f6" : primaryColor,
                                      color: message.role === "assistant" ? "black" : "white",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                                    }}
                                  >
                                    <p className="whitespace-pre-wrap">{message.content.replace(/[*#]/g, "")}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-gray-500">No messages in this conversation</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">Select a conversation to view details</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
