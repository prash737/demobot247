import { NextResponse } from "next/server"

// Replacing Python script with a simple JavaScript implementation
export async function POST(request: Request): Promise<Response> {
  try {
    const { chatbotId } = await request.json()

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
    }

    // Simple mock data instead of Python script
    const mockInsights = {
      total_conversations: 120,
      average_length: 8.5,
      common_topics: ["pricing", "features", "support"],
      sentiment: {
        positive: 65,
        neutral: 25,
        negative: 10,
      },
      peak_times: ["9:00 AM", "2:00 PM", "4:30 PM"],
    }

    return NextResponse.json(mockInsights, { status: 200 })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        error: "Invalid request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}
