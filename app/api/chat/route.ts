import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages, scrapedData } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required." }, { status: 400 })
    }
    if (!scrapedData) {
      return NextResponse.json({ error: "Scraped data is required for context." }, { status: 400 })
    }

    // Construct the context from scrapedData
    const context = `
      You are an AI assistant that answers questions based *only* on the provided website content.
      If the answer is not found in the provided content, state that you cannot answer based on the given information.
      Do not make up information.

      --- Website Content ---
      Title: ${scrapedData.title}
      Description: ${scrapedData.description}
      Main Text: ${scrapedData.mainText}
      Headings: ${scrapedData.headings.join(", ")}
      Links (first 5): ${scrapedData.links
        .slice(0, 5)
        .map((link: any) => `${link.text} (${link.href})`)
        .join("; ")}
      Structured Data (JSON-LD): ${JSON.stringify(scrapedData.structuredData).substring(0, 1000)}...
      Canonical URL: ${scrapedData.canonicalUrl || "N/A"}
      Language: ${scrapedData.lang || "N/A"}
      Keywords: ${scrapedData.keywords || "N/A"}
      Open Graph Image: ${scrapedData.ogImage || "N/A"}
      --- End Website Content ---
    `

    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!googleApiKey) {
      return NextResponse.json(
        {
          error:
            "Google Generative AI API key is missing. Pass it using the 'apiKey' parameter or the GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
        },
        { status: 500 },
      )
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash-lite", { apiKey: googleApiKey }), // Using the specified model name
      messages: [
        { role: "system", content: context },
        ...messages, // Include previous messages for conversation history
      ],
      temperature: 0.2, // Keep it low for factual answers based on context
    })

    // Limit the response to 50 words
    let responseContent = text
    const words = responseContent.split(/\s+/)
    if (words.length > 50) {
      responseContent = words.slice(0, 50).join(" ") + "..."
    }

    return NextResponse.json({ response: responseContent })
  } catch (error: any) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: `Failed to generate response: ${error.message}` }, { status: 500 })
  }
}
