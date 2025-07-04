"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

interface ChatWindowProps {
  scrapedData: any
  onClose: () => void
}

export function ChatWindow({ scrapedData, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    })
  }

  // Enhanced auto-scroll that triggers on messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100) // Small delay to ensure DOM is updated

    return () => clearTimeout(timer)
  }, [messages, loading])

  // Auto-scroll when chat window opens
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [])

  useEffect(() => {
    const fetchInitialGreeting = async () => {
      if (messages.length === 0 && scrapedData) {
        setLoading(true)
        try {
          const websiteTitle = scrapedData.title || "Bot247"
          // Updated prompt to instruct Gemini to extract the company name
          const initialPromptContent = `Generate a concise welcome message for a chatbot on a website titled "${websiteTitle}". From this title, identify the main company or website name. The message should start with "Hello! Welcome to [Company Name],", where [Company Name] is the identified name, and then invite the user to ask questions. Keep the entire message under 50 words.`

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: initialPromptContent }],
              scrapedData,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to get initial AI greeting.")
          }

          const data = await response.json()
          setMessages([
            {
              role: "assistant",
              content: data.response,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ])
        } catch (error: any) {
          console.error("Error fetching initial greeting:", error)
          setMessages([{ role: "assistant", content: `Error: Could not load welcome message. ${error.message || ""}` }])
        } finally {
          setLoading(false)
        }
      }
    }

    fetchInitialGreeting()
  }, [scrapedData])

  const handleSendMessage = async () => {
    if (input.trim() === "") return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage], scrapedData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get AI response.")
      }

      const data = await response.json()
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } catch (error: any) {
      console.error("Error sending message to AI:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: `Error: ${error.message || "Could not get a response."}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="w-[380px] h-[600px] flex flex-col shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarImage src="/chatbot-icon.png" alt="Bot247 Avatar" />
            <AvatarFallback>B247</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-base font-semibold">Bot247</CardTitle>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg shadow-sm relative",
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center mb-1">
                      <Image src="/chatbot-icon.png" alt="Bot247 Icon" width={16} height={16} className="mr-2" />
                      <span className="font-semibold text-sm">Bot247</span>
                    </div>
                  )}
                  <ReactMarkdown className="prose dark:prose-invert max-w-none text-sm">{msg.content}</ReactMarkdown>
                  {msg.timestamp && (
                    <span
                      className={cn(
                        "absolute bottom-1 right-2 text-xs opacity-70",
                        msg.role === "user" ? "text-blue-200" : "text-gray-400 dark:text-gray-500",
                      )}
                    >
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t bg-white dark:bg-gray-800">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1 rounded-full px-4 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading}
            size="icon"
            className="rounded-full bg-gradient-to-r from-blue-400 to-green-400 text-white hover:from-blue-500 hover:to-green-500 shadow-md"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
