import { NextResponse } from "next/server"
import { processUserMessage } from "@/app/actions/process-data"

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { content, chatbot_id } = body

    if (!content) {
      return NextResponse.json({ error: "Missing required field: content" }, { status: 400 })
    }

    // Forward the request to the actual API
    const response = await processUserMessage(content, chatbot_id)

    // Return the response from the API
    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Error in chat-proxy:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
