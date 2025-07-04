"use server"

export async function processJsonPostRequest(url: string, headers: Record<string, string> = {}, jsonBody: object) {
  console.log(`[API Call] POST ${url}`)
  console.log("[API Call] Headers:", headers)
  console.log("[API Call] Body:", jsonBody)

  try {
    // Prepare request options
    const options: RequestInit = {
      method: "POST",
      headers: {
        // Ensure Content-Type is set for JSON
        "Content-Type": "application/json",
        ...headers,
      },
      // Stringify the JSON body
      body: JSON.stringify(jsonBody),
      // Enable automatic redirect following
      redirect: "follow",
    }

    // Make the request
    const response = await fetch(url, options)
    console.log(`[API Call] Response status: ${response.status} ${response.statusText}`)
    console.log(`[API Call] Final URL: ${response.url}`)

    // Get response headers
    const responseHeaders = Object.fromEntries(response.headers.entries())

    // If we still get a redirect status (shouldn't happen with redirect: 'follow')
    if (response.status >= 300 && response.status < 400) {
      console.log(`[API Call] Manual redirect handling for: ${response.status}`)
      const redirectUrl = response.headers.get("Location")
      console.log(`[API Call] Redirect URL: ${redirectUrl}`)

      if (redirectUrl) {
        // Follow the redirect manually
        console.log(`[API Call] Following redirect to: ${redirectUrl}`)
        return await processJsonPostRequest(redirectUrl, headers, jsonBody)
      }
    }

    // Check if the response is ok
    if (!response.ok) {
      console.error(`[API Call] HTTP Error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error(`[API Call] Error body: ${errorText}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    // Clone the response before attempting to read its body
    const responseClone = response.clone()

    // Try to parse response as JSON
    try {
      const data = await response.json()
      console.log(`[API Call] Success: Received JSON response`)
      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
      }
    } catch (jsonError) {
      console.log(`[API Call] JSON parse failed, trying as text`)
      // If not JSON, return as text using the cloned response
      const text = await responseClone.text()
      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: text,
      }
    }
  } catch (error) {
    console.error("[API Call] Error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to call API")
  }
}

export async function processUserMessage(message: string, chatbotId: string, sessionId?: string) {
  // Try both URLs - with and without trailing slash
  const urls = [
    "https://ragbackend-evonix.replit.app/process-data",
    "https://ragbackend-evonix.replit.app/process-data/",
  ]

  // Validate chatbotId to ensure it's not default or empty
  if (!chatbotId || chatbotId === "default_chatbot_id") {
    console.warn("Warning: Using default chatbot ID. This may not be intended in production.")

    // Try to get chatbot ID from localStorage as a fallback
    if (typeof window !== "undefined") {
      const userDataStr = localStorage.getItem("userData")
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)
          if (userData.chatbotId && userData.chatbotId !== "default_chatbot_id") {
            chatbotId = userData.chatbotId
            console.log("Retrieved chatbot ID from localStorage:", chatbotId)
          }
        } catch (error) {
          console.error("Error parsing userData from localStorage:", error)
        }
      }
    }
  }

  // Trim the chatbotId to remove any whitespace or newline characters
  const trimmedChatbotId = chatbotId.trim()
  console.log("Using chatbot ID in processUserMessage:", trimmedChatbotId)

  // Generate dynamic user_id and session_id based on chatbot_id
  const dynamicUserId = trimmedChatbotId // Use chatbot_id as user_id

  // Generate session_id as chatbot_id + today's date (YYYY-MM-DD format)
  const today = new Date()
  const todayString = today.toISOString().split("T")[0] // Gets YYYY-MM-DD format
  const dynamicSessionId = `${trimmedChatbotId}_${todayString}`

  // Log the dynamic IDs being used
  console.log("Using dynamic user ID in processUserMessage:", dynamicUserId)
  console.log("Using dynamic session ID in processUserMessage:", dynamicSessionId)

  // Create request body with dynamic values
  const requestBody = {
    content: message,
    user_id: dynamicUserId, // Using chatbot_id as user_id
    session_id: dynamicSessionId, // Using chatbot_id + today's date as session_id
    chatbot_id: trimmedChatbotId, // Using the trimmed chatbot ID
    metadata: {
      type: "query",
      timestamp: new Date().toISOString(),
      source: "bot247_live",
    },
  }

  // Try the first URL (without trailing slash since that's what the redirect points to)
  try {
    console.log(`[API Call] Trying primary URL: ${urls[0]}`)
    return await processJsonPostRequest(urls[0], {}, requestBody)
  } catch (error) {
    console.log(`[API Call] Primary URL failed, trying fallback: ${urls[1]}`)
    console.error(`[API Call] Primary URL error:`, error)

    // Try the fallback URL
    try {
      return await processJsonPostRequest(urls[1], {}, requestBody)
    } catch (fallbackError) {
      console.error(`[API Call] Both URLs failed`)
      console.error(`[API Call] Fallback error:`, fallbackError)
      throw fallbackError
    }
  }
}
