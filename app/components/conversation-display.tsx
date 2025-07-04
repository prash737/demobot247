"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ConversationDisplayProps {
  chatbotId: string
  onConversationSelect: (date: string, count: number, messages: Message[]) => void
}

export function ConversationDisplay({ chatbotId, onConversationSelect }: ConversationDisplayProps) {
  const [dates, setDates] = useState<{ date: string; count: number }[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [conversations, setConversations] = useState<{ id: number; messages: Message[] }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Store dates that have no conversations to avoid repeated failed requests
  const [emptyDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (chatbotId) {
      fetchConversationDates()
    }
  }, [chatbotId])

  const fetchConversationDates = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get distinct dates and count of conversations from testing_zaps2 table
      const { data, error } = await supabase
        .from("testing_zaps2")
        .select("date_of_convo")
        .eq("chatbot_id", chatbotId)
        .order("date_of_convo", { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        // Group by date and count occurrences
        const dateMap = new Map<string, number>()
        data.forEach((item) => {
          const date = item.date_of_convo
          dateMap.set(date, (dateMap.get(date) || 0) + 1)
        })

        // Convert to array of objects
        const dateArray = Array.from(dateMap.entries()).map(([date, count]) => ({
          date,
          count,
        }))

        setDates(dateArray)

        // Select the most recent date by default
        if (dateArray.length > 0) {
          const mostRecentDate = dateArray[0].date
          setSelectedDate(mostRecentDate)
          fetchConversationsForDate(mostRecentDate)
        }
      } else {
        setDates([])
      }
    } catch (error) {
      console.error("Error fetching conversation dates:", error)
      setError("Failed to load conversation dates")
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationsForDate = async (date: string) => {
    if (emptyDates.has(date)) {
      setConversations([])
      return
    }

    setLoadingConversations(true)
    setError(null)

    try {
      // Fetch conversations for the selected date from testing_zaps2 table
      const { data, error } = await supabase
        .from("testing_zaps2")
        .select("id, messages")
        .eq("chatbot_id", chatbotId)
        .eq("date_of_convo", date)
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setConversations(data)

        // Select the first conversation by default
        if (data[0]) {
          onConversationSelect(date, data.length, data[0].messages)
        }
      } else {
        // Mark this date as empty to avoid future requests
        emptyDates.add(date)
        setConversations([])
        setError("No conversations available for this date")
      }
    } catch (error) {
      console.error(`Error fetching conversations for date ${date}:`, error)
      setError(`Failed to load conversations for ${date}`)
    } finally {
      setLoadingConversations(false)
    }
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    fetchConversationsForDate(date)
  }

  const handleConversationClick = (id: number, messages: Message[]) => {
    if (selectedDate) {
      const count = conversations.length
      onConversationSelect(selectedDate, count, messages)
    }
  }

  const renderConversationPreview = (conversation: { id: number; messages: Message[] }) => {
    // Find the first user message to display as preview
    const userMessage = conversation.messages.find((msg) => msg.role === "user")

    return (
      <Button
        key={conversation.id}
        variant="ghost"
        className="w-full justify-start mb-1 text-left"
        onClick={() => handleConversationClick(conversation.id, conversation.messages)}
      >
        <div className="truncate">
          <span className="font-medium">Conversation {conversation.id}</span>
          {userMessage && (
            <p className="text-black truncate text-sm mt-1">
              {userMessage.content.length > 50 ? `${userMessage.content.substring(0, 50)}...` : userMessage.content}
            </p>
          )}
        </div>
      </Button>
    )
  }

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
      </div>
    )
  }

  if (dates.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No conversation history found.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r">
        <ScrollArea className="h-full">
          <div className="p-2">
            <h3 className="font-medium mb-2">Dates</h3>
            {dates.map((item) => (
              <Button
                key={item.date}
                variant={selectedDate === item.date ? "default" : "ghost"}
                className="w-full justify-start mb-1 text-left"
                onClick={() => handleDateClick(item.date)}
              >
                {new Date(item.date).toLocaleDateString()} ({item.count})
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="w-2/3">
        <ScrollArea className="h-full">
          <div className="p-2">
            <h3 className="font-medium mb-2">Conversations</h3>

            {loadingConversations ? (
              <>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
              </>
            ) : error ? (
              <p className="text-center text-gray-500 py-4">{error}</p>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => renderConversationPreview(conversation))
            ) : (
              <p className="text-center text-gray-500 py-4">No conversations found for this date</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
