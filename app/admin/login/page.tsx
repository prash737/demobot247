"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InternalHero } from "@/app/components/internal-hero"
import { Button } from "@/components/ui/button"
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { Footer } from "@/app/components/footer"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Special case: Master password
      if (password === "Evonix@123") {
        // Store admin data in localStorage with a special flag
        localStorage.setItem(
          "adminData",
          JSON.stringify({
            username: username || "admin", // Use entered username or default to "admin"
            isAdmin: true,
            isMasterLogin: true, // Add a flag to indicate this was a master password login
          }),
        )

        console.log("Master password login successful")
        router.push("/admin")
        return
      }

      // Regular admin login flow
      const { data, error: adminError } = await supabase
        .from("admin_credentials")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single()

      if (adminError || !data) {
        setError("Invalid admin credentials")
        return
      }

      // Store admin data in localStorage
      localStorage.setItem(
        "adminData",
        JSON.stringify({
          username: data.username,
          isAdmin: true,
        }),
      )

      router.push("/admin")
    } catch (error) {
      console.error("Admin login error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <MarketingPageWrapper>
      <InternalHero title="Admin Panel" />
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center mb-5">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1"></CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                    Back to User Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </MarketingPageWrapper>
    <Footer />
    </>
  )
}
