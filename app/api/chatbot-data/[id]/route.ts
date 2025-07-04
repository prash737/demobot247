import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

// Make sure the API route returns all theme data
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const chatbotId = params.id

    if (!chatbotId) {
      return new Response(JSON.stringify({ error: "Chatbot ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Log the chatbot ID to help debug
    console.log(`Fetching chatbot data for chatbot ID: ${chatbotId}`)

    // Fetch chatbot data from the credentials table
    const { data: chatbotData, error: chatbotError } = await supabase
      .from("credentials")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .single()

    if (chatbotError) {
      console.error("Error fetching chatbot data:", chatbotError)
      return new Response(JSON.stringify({ error: "Failed to fetch chatbot data" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Fetch theme data from the chatbot_themes table
    const { data: themeData, error: themeError } = await supabase
      .from("chatbot_themes")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .maybeSingle() // Use maybeSingle to handle no rows gracefully

    if (themeError) {
      // Log the error but don't return it, as we can proceed with default theme data
      console.error("Error fetching theme data:", themeError)
    }

    // Return combined data
    return new Response(
      JSON.stringify({
        ...chatbotData,
        theme: themeData || null, // Return null if no theme data is found
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error in chatbot-data API route:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
