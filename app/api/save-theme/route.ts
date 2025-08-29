import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Initialize Supabase client inside the function (not at module level)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Validate that we have the required environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Create the client inside the function
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { chatbotId, theme, chatbotName } = await request.json()

    if (!chatbotId || !theme) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Saving theme for chatbot:", chatbotId, theme)

    // Check if a theme record already exists for this chatbot
    const { data: existingTheme, error: fetchError } = await supabase
      .from("chatbot_themes")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned" which is expected if no theme exists yet
      console.error("Error fetching existing theme:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    let result

    // If chatbotName is provided, also update the chatbot name in credentials table
    if (chatbotName) {
      const { error: nameUpdateError } = await supabase
        .from("credentials")
        .update({ chatbot_name: chatbotName })
        .eq("chatbot_id", chatbotId)

      if (nameUpdateError) {
        console.error("Error updating chatbot name:", nameUpdateError)
        return NextResponse.json({ error: nameUpdateError.message }, { status: 500 })
      }
    }

    if (existingTheme) {
      // Update existing theme
      const updateData: any = {
        primary_color: theme.primaryColor,
        secondary_color: theme.secondaryColor,
        border_radius: theme.borderRadius,
        avatar_url: theme.avatarUrl,
        dark_mode: theme.darkMode,
        updated_at: new Date().toISOString(),
      }

      // Add response_tone and response_length to update if provided
      if (theme.responseTone) {
        updateData.response_tone = theme.responseTone
      }

      if (theme.responseLength) {
        updateData.response_length = theme.responseLength
      }

      // Add chatbot_name to update if provided
      if (chatbotName) {
        updateData.chatbot_name = chatbotName
      }

      result = await supabase.from("chatbot_themes").update(updateData).eq("chatbot_id", chatbotId).select()
    } else {
      // Insert new theme
      const insertData: any = {
        chatbot_id: chatbotId,
        primary_color: theme.primaryColor,
        secondary_color: theme.secondaryColor,
        border_radius: theme.borderRadius,
        avatar_url: theme.avatarUrl,
        dark_mode: theme.darkMode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add response_tone and response_length to insert if provided
      if (theme.responseTone) {
        insertData.response_tone = theme.responseTone
      }

      if (theme.responseLength) {
        insertData.response_length = theme.responseLength
      }

      // Add chatbot_name to insert if provided
      if (chatbotName) {
        insertData.chatbot_name = chatbotName
      }

      result = await supabase.from("chatbot_themes").insert(insertData).select()
    }

    if (result.error) {
      console.error("Error saving theme to database:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Theme saved successfully" })
  } catch (error) {
    console.error("Error in save-theme API route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
