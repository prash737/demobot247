"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@supabase/supabase-js"
import type React from "react"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUsernameSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // First, fetch the user by username only
      const { data: userData, error: userError } = await supabase
        .from("credentials")
        .select("*")
        .eq("username", username)
        .single()

      if (userError || !userData) {
        setError("Invalid username or password")
        setIsLoading(false)
        return
      }

      // Verify the password using our API
      const verifyResponse = await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plainPassword: password,
          hashedPassword: userData.password,
        }),
      })

      let verifyResult: { isValid: boolean; message?: string }

      if (!verifyResponse.ok) {
        const contentType = verifyResponse.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          verifyResult = await verifyResponse.json()
        } else {
          const errorText = await verifyResponse.text()
          console.error("Server error (non-JSON):", errorText)
          setError("An unexpected server error occurred during password verification.")
          setIsLoading(false)
          return
        }
      } else {
        verifyResult = await verifyResponse.json()
      }

      if (!verifyResult.isValid) {
        setError(verifyResult.message || "Invalid username or password")
        setIsLoading(false)
        return
      }

      // Password is valid, proceed with login
      // Store user data in localStorage for dashboard access
      localStorage.setItem(
        "userData",
        JSON.stringify({
          username: userData.username,
          chatbotId: userData.chatbot_id,
        }),
      )

      // Set a session timestamp to track when the user logged in
      localStorage.setItem("sessionStartTime", Date.now().toString())

      // Immediately fetch theme settings for the chatbot
      try {
        console.log("Fetching theme settings immediately after login")
        const { data: themeData, error: themeError } = await supabase
          .from("chatbot_themes")
          .select("*")
          .eq("chatbot_id", userData.chatbot_id)
          .order("updated_at", { ascending: false })
          .limit(1)

        if (!themeError && themeData && themeData.length > 0) {
          // Store theme data in localStorage
          const theme = themeData[0]

          // Create a complete theme object with all attributes
          const completeTheme = {
            // Basic theme attributes
            primaryColor: theme.primary_color || "#3B82F6",
            secondaryColor: theme.secondary_color || "#10B981",
            borderRadius: theme.border_radius || 8,
            darkMode: theme.dark_mode || false,

            // Chatbot configuration attributes
            chatbotName: theme.chatbot_name || "AI Assistant",
            greeting: theme.greeting || "Hello! How can I help you today?",
            instruction: theme.instruction || "You are an AI assistant.",
            responseTone: theme.response_tone || "friendly",
            responseLength: theme.response_length || "concise",

            // UI configuration attributes
            pulsatingEffect: theme.pulsating_effect || "No",
            alignment: theme.alignment || "bottom-right",

            // Default avatar URL (will be updated if an avatar exists)
            avatarUrl: "/images/default-avatar.png",

            // Store the raw theme data for debugging
            rawThemeData: theme,
          }

          console.log("Storing complete theme in localStorage:", completeTheme)
          localStorage.setItem("chatbotTheme", JSON.stringify(completeTheme))

          // Check for avatar
          const { data: files, error: avatarError } = await supabase.storage
            .from("chatbotavatar")
            .list(userData.chatbot_id)

          if (!avatarError && files && files.length > 0) {
            const imageFile = files.find(
              (file) =>
                file.name.endsWith(".jpg") ||
                file.name.endsWith(".jpeg") ||
                file.name.endsWith(".png") ||
                file.name.endsWith(".gif"),
            )

            if (imageFile) {
              const { data: urlData } = supabase.storage
                .from("chatbotavatar")
                .getPublicUrl(`${userData.chatbot_id}/${imageFile.name}`)

              // Update the theme with avatar URL
              const currentTheme = JSON.parse(localStorage.getItem("chatbotTheme") || "{}")
              localStorage.setItem(
                "chatbotTheme",
                JSON.stringify({
                  ...currentTheme,
                  avatarUrl: urlData.publicUrl,
                }),
              )

              console.log("Updated theme with avatar URL:", urlData.publicUrl)
            }
          }

          // Store individual settings in separate localStorage items for backward compatibility
          if (theme.instruction) localStorage.setItem("chatbotInstruction", theme.instruction)
          if (theme.greeting) localStorage.setItem("chatbotGreeting", theme.greeting)
          if (theme.chatbot_name) localStorage.setItem("chatbotName", theme.chatbot_name)
          if (theme.response_tone) localStorage.setItem("responseTone", theme.response_tone)
          if (theme.response_length) localStorage.setItem("responseLength", theme.response_length)
        }
      } catch (themeError) {
        console.error("Error fetching theme:", themeError)
        // Continue with login even if theme fetch fails
      }

      // Dispatch events to notify components
      window.dispatchEvent(new Event("storage"))
      window.dispatchEvent(new CustomEvent("userLoggedIn"))
      window.dispatchEvent(
        new CustomEvent("themeUpdate", {
          detail: JSON.parse(localStorage.getItem("chatbotTheme") || "{}"),
        }),
      )

      // Conditional redirection based on user plan
      if (userData.selected_plan === "Pro" || userData.selected_plan === "Advanced") {
        router.push("/dashboard")
      } else {
        router.push("/profile")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleUsernameSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Enter your username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-blue-50/50 dark:bg-gray-800/50"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Forgot Password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-blue-50/50 dark:bg-gray-800/50"
            required
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <div>
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
            Sign Up Now
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        By continuing, you agree to Bot247's{" "}
        <Link href="/terms-of-service" className="text-blue-600 hover:underline dark:text-blue-400">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="text-blue-600 hover:underline dark:text-blue-400">
          Privacy Policy
        </Link>
        , and to receive periodic emails with updates.
      </div>
    </div>
  )
}
