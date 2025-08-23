"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clipboard, Check, Code, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { useChatbotTheme } from "@/app/contexts/chatbot-theme-context"
import { cn } from "@/app/lib/utils"
import ChatbotSidebar from "@/app/components/chatbot-sidebar"
import ChatbotHeader from "@/app/components/chatbot-header"
import SharedChatInterface from "@/app/components/shared-chat-interface"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zsivtypgrrcttzhtfjsf.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

export default function EmbedPage() {
  const router = useRouter()
  const { primaryColor, secondaryColor } = useChatbotTheme()
  const [chatbotId, setChatbotId] = useState("default")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [chatbotName, setChatbotName] = useState("Your Chatbot")
  const [activeSection, setActiveSection] = useState("embed")

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // In a real app, fetch the chatbot ID from the user's data
    const fetchChatbotId = async () => {
      try {
        // For demo purposes, we'll use a hardcoded ID
        // In production, you would fetch this from your database
        const userData = localStorage.getItem("userData")
        if (userData) {
          const { chatbotId, username } = JSON.parse(userData)
          if (chatbotId) {
            setChatbotId(chatbotId)
          }

          // Fetch chatbot name
          const { data, error } = await supabase
            .from("chatbot_themes")
            .select("chatbot_name")
            .eq("chatbot_id", chatbotId)
            .single()

          if (data && data.chatbot_name) {
            setChatbotName(data.chatbot_name)
          }
        } else {
          // Demo ID
          setChatbotId("demo-chatbot")
        }
      } catch (error) {
        console.error("Error fetching chatbot ID:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChatbotId()
  }, [])

  const generatePopupCode = () => {
    return `<script src="https://chatbot247.vercel.app/embed.js" data-chatbot-id="${chatbotId}"></script>`
  }

  const getEmbedCode = () => {
    return generatePopupCode()
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getEmbedCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        {!isFullscreen && <ChatbotSidebar activeSection="embed" />}

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50/30 to-green-50/30 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Embed Your Chatbot</h1>
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start">
              <div className="mr-3 mt-0.5 bg-blue-100 dark:bg-blue-800 rounded-full p-1.5">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-300">Ready to Share</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your chatbot is ready to be embedded on your website. Copy the code below and paste it into your
                  website's HTML.
                </p>
              </div>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Popup Chat Widget</CardTitle>
                <CardDescription>
                  Add a floating chat button to your website that opens the chatbot in a popup window.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Simply add the embed code to your website to display a chat button that opens the chatbot when
                  clicked.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  Embed Code
                </CardTitle>
                <CardDescription>Copy and paste this code into your website to embed the chatbot.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
                    <code>{getEmbedCode()}</code>
                  </pre>
                  <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Platform-Specific Instructions</h2>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-2">WordPress</h3>
                  <p className="mb-4">To add the chatbot to your WordPress site:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Go to your WordPress dashboard</li>
                    <li>Install and activate the "Header and Footer Scripts" plugin</li>
                    <li>Go to Settings {">"} Header and Footer Scripts</li>
                    <li>Paste the embed code in the "Scripts in Footer" section</li>
                    <li>Save changes</li>
                  </ol>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Shopify</h3>
                  <p className="mb-4">To add the chatbot to your Shopify store:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Go to your Shopify admin dashboard</li>
                    <li>Navigate to Online Store {">"} Themes</li>
                    <li>Click "Actions" and then "Edit code"</li>
                    <li>Open the theme.liquid file</li>
                    <li>Paste the embed code just before the closing &lt;/body&gt; tag</li>
                    <li>Save changes</li>
                  </ol>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Wix</h3>
                  <p className="mb-4">To add the chatbot to your Wix site:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Go to your Wix dashboard</li>
                    <li>Click on "Settings" in the left sidebar</li>
                    <li>Select "Custom Code"</li>
                    <li>Click "Add Custom Code"</li>
                    <li>Give it a name like "Bot247 Chatbot"</li>
                    <li>Paste the embed code</li>
                    <li>Set placement to "Body - end"</li>
                    <li>Click "Apply"</li>
                  </ol>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-2">HTML Website</h3>
                  <p className="mb-4">
                    For a standard HTML website, simply paste the embed code just before the closing &lt;/body&gt; tag
                    in your HTML file:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm">
                    <code>{`<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your website content -->
    
    ${getEmbedCode()}
</body>
</html>`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <SharedChatInterface isFullscreen={isFullscreen} />
      </div>
    </div>
  )
}
