import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

// Update the GET function to include response_tone and response_length in the response
export async function GET(request: NextRequest) {
  try {
    // Get chatbot ID from query parameter
    const searchParams = request.nextUrl.searchParams
    const chatbotId = searchParams.get("id")

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
    }

    // Fetch chatbot configuration from Supabase
    const { data: configData, error: configError } = await supabase
      .from("chatbot_configurations")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .single()

    if (configError) {
      console.error("Error fetching chatbot configuration:", configError)
      return NextResponse.json({ error: "Failed to fetch chatbot configuration" }, { status: 500 })
    }

    // Fetch user data to get chatbot name
    const { data: userData, error: userError } = await supabase
      .from("credentials")
      .select("chatbot_name")
      .eq("chatbot_id", chatbotId)
      .single()

    if (userError) {
      console.error("Error fetching user data:", userError)
    }

    // Get theme settings from the database
    const { data: themeData, error: themeError } = await supabase
      .from("chatbot_themes")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .single()

    // Format the theme data to match our frontend structure
    let formattedTheme = {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      borderRadius: 8,
      avatarUrl: "/abstract-ai-network.png",
      darkMode: false,
      responseTone: "friendly",
      responseLength: "concise",
    }

    if (themeData) {
      formattedTheme = {
        primaryColor: themeData.primary_color || formattedTheme.primaryColor,
        secondaryColor: themeData.secondary_color || formattedTheme.secondaryColor,
        borderRadius: themeData.border_radius || formattedTheme.borderRadius,
        avatarUrl: themeData.avatar_url || formattedTheme.avatarUrl,
        darkMode: themeData.dark_mode || formattedTheme.darkMode,
        responseTone: themeData.response_tone || formattedTheme.responseTone,
        responseLength: themeData.response_length || formattedTheme.responseLength,
      }
    }

    // Get allowed embed domains from the database
    const { data: domainData, error: domainError } = await supabase
      .from("embed_domains")
      .select("domains")
      .eq("chatbot_id", chatbotId)
      .single()

    // Check if the request is coming from an allowed domain
    const referer = request.headers.get("referer")
    let isAllowedDomain = true // Default to true if no domains are specified

    if (domainData?.domains?.links && domainData.domains.links.length > 0) {
      isAllowedDomain = false // Set to false if domains are specified but don't match

      if (referer) {
        try {
          const refererUrl = new URL(referer)
          const refererOrigin = refererUrl.origin

          // Check if the referer origin is in the allowed domains list
          isAllowedDomain = domainData.domains.links.some((domain: string) => {
            try {
              const domainUrl = new URL(domain)
              return domainUrl.origin === refererOrigin
            } catch (e) {
              return false
            }
          })
        } catch (e) {
          console.error("Error parsing referer URL:", e)
        }
      }
    }

    // If not allowed and not in development, return an error
    if (!isAllowedDomain && process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "This domain is not authorized to embed this chatbot" }, { status: 403 })
    }

    // Combine all data
    const responseData = {
      ...configData,
      name: configData?.name || userData?.chatbot_name || "Bot247", // Prioritize the name from configuration
      theme: formattedTheme,
    }

    // Set CORS headers to allow embedding on any domain
    return NextResponse.json(responseData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error) {
    console.error("Error in chatbot-config API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  // Handle CORS preflight requests
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  )
}
