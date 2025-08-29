import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zsivtypgrrcttzhtfjsf.supabase.co",
  process.env.SUPABASE_SERVICE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

export async function POST(request: NextRequest) {
  try {
    const { chatbotId, chatbotName } = await request.json()

    if (!chatbotId || !chatbotName) {
      return NextResponse.json({ error: "Missing required fields: chatbotId and chatbotName" }, { status: 400 })
    }

    // Update the chatbot name in the credentials table
    const { error: credentialsError } = await supabase
      .from("credentials")
      .update({ chatbot_name: chatbotName })
      .eq("chatbot_id", chatbotId)

    if (credentialsError) {
      console.error("Error updating credentials:", credentialsError)
      return NextResponse.json({ error: "Failed to update chatbot name in credentials" }, { status: 500 })
    }

    // Also update the chatbot name in the chatbot_themes table if it exists
    // First check if a record exists
    const { data: themeData, error: themeCheckError } = await supabase
      .from("chatbot_themes")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .maybeSingle()

    if (themeCheckError) {
      console.error("Error checking theme record:", themeCheckError)
      // Continue anyway since this is not critical
    }

    // If theme record exists, update it; otherwise create a new one
    if (themeData) {
      const { error: themeUpdateError } = await supabase
        .from("chatbot_themes")
        .update({ chatbot_name: chatbotName, updated_at: new Date().toISOString() })
        .eq("chatbot_id", chatbotId)

      if (themeUpdateError) {
        console.error("Error updating theme:", themeUpdateError)
        // Continue anyway since the main update in credentials was successful
      }
    } else {
      // Create a new theme record with default values
      const { error: themeInsertError } = await supabase.from("chatbot_themes").insert({
        chatbot_id: chatbotId,
        chatbot_name: chatbotName,
        primary_color: "#3B82F6",
        secondary_color: "#10B981",
        border_radius: 8,
        dark_mode: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (themeInsertError) {
        console.error("Error inserting theme:", themeInsertError)
        // Continue anyway since the main update in credentials was successful
      }
    }

    return NextResponse.json({ success: true, message: "Chatbot name updated successfully" })
  } catch (error) {
    console.error("Error in update-chatbot-name route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
