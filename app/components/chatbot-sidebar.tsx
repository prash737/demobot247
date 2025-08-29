"use client"
import { useRouter } from "next/navigation"
import { Layers, MessageSquare, PieChart, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/app/lib/utils"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface ChatbotSidebarProps {
  activeSection: string
}

export default function ChatbotSidebar({ activeSection }: ChatbotSidebarProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData")
    const adminData = localStorage.getItem("adminData")
    setIsLoggedIn(!!(userData || adminData))
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      // Call logout API endpoint
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.warn("Logout API call failed with status:", response.status)
        }
      } catch (apiError) {
        console.warn("Logout API call failed:", apiError)
      }

      // Clear all localStorage data
      localStorage.removeItem("userData")
      localStorage.removeItem("adminData")
      localStorage.removeItem("adminThemeSettings")
      sessionStorage.clear()

      // Show success message
      toast({
        title: "Logged out successfully",
        description: "You have been logged out successfully",
      })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)

      // Force cleanup even on error
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (storageError) {
        console.error("Error clearing storage:", storageError)
      }

      toast({
        title: "Logout completed",
        description: "You have been logged out",
        variant: "destructive",
      })

      router.push("/")
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Navigation
  const handleSectionClick = (section: string) => {
    if (section === "directive" || section === "instructions") {
      // Navigate to the instructions page
      router.push("/create-chatbot/chatbot-interface")
    } else if (section === "knowledge") {
      // Navigate to the knowledge page
      router.push("/create-chatbot/knowledge")
    } else if (section === "theme") {
      // Navigate to the theme page
      router.push("/create-chatbot/theme")
    } else if (section === "conversations") {
      router.push("/conversations")
    } else if (section === "settings") {
      router.push("/settings")
    } else if (section === "logic") {
      router.push("/logic")
    } else if (section === "analytics") {
      router.push("/dashboard") // Changed from "/analytics" to "/dashboard"
    } else if (section === "integrations") {
      router.push("/integrations")
    } else if (section === "embed") {
      router.push("/create-chatbot/embed")
    } else if (section === "profile") {
      router.push("/user-profile")
    }
  }

  return (
    <div className="w-52 border-r bg-background dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300 z-10">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h2 className="font-semibold mb-4">
            <span>Build</span>
          </h2>
          <nav className="space-y-2">
            <Button
              variant={activeSection === "directive" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm font-normal group transition-all duration-300 relative overflow-hidden"
              onClick={() => handleSectionClick("directive")}
              aria-current={activeSection === "directive" ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1 rounded mr-2 transition-all duration-300",
                  activeSection === "directive"
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-gray-700",
                )}
              >
                <Layers
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    activeSection === "directive"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-300",
                  )}
                />
              </div>
              <span className="transition-colors duration-300">Instructions</span>
              {activeSection === "directive" && (
                <div className="absolute inset-y-0 left-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r" />
              )}
            </Button>

            <Button
              variant={activeSection === "knowledge" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm font-normal group transition-all duration-300 relative overflow-hidden"
              onClick={() => handleSectionClick("knowledge")}
              aria-current={activeSection === "knowledge" ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1 rounded mr-2 transition-all duration-300",
                  activeSection === "knowledge"
                    ? "bg-indigo-100 dark:bg-indigo-900"
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-gray-700",
                )}
              >
                <MessageSquare
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    activeSection === "knowledge"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300",
                  )}
                />
              </div>
              <span className="transition-colors duration-300">Knowledge</span>
              {activeSection === "knowledge" && (
                <div className="absolute inset-y-0 left-0 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-r" />
              )}
            </Button>

            <Button
              variant={activeSection === "theme" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm font-normal group transition-all duration-300 relative overflow-hidden"
              onClick={() => handleSectionClick("theme")}
              aria-current={activeSection === "theme" ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1 rounded mr-2 transition-all duration-300",
                  activeSection === "theme"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-green-50 dark:group-hover:bg-gray-700",
                )}
              >
                <Layers
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    activeSection === "theme"
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-green-500 dark:group-hover:text-green-300",
                  )}
                />
              </div>
              <span className="transition-colors duration-300">Theme</span>
              {activeSection === "theme" && (
                <div className="absolute inset-y-0 left-0 w-1 bg-green-600 dark:bg-green-400 rounded-r" />
              )}
            </Button>
          </nav>
        </div>

        <Separator className="my-2" />

        <div className="p-4">
          <h2 className="font-semibold mb-4 flex items-center">
            <span>Review</span>
          </h2>
          <nav className="space-y-2">
            <Button
              variant={activeSection === "conversations" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm font-normal group transition-all duration-300 relative overflow-hidden"
              onClick={() => handleSectionClick("conversations")}
              aria-current={activeSection === "conversations" ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1 rounded mr-2 transition-all duration-300",
                  activeSection === "conversations"
                    ? "bg-rose-100 dark:bg-rose-900"
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-rose-50 dark:group-hover:bg-gray-700",
                )}
              >
                <MessageSquare
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    activeSection === "conversations"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-rose-500 dark:group-hover:text-rose-300",
                  )}
                />
              </div>
              <span className="transition-colors duration-300">Conversations</span>
              {activeSection === "conversations" && (
                <div className="absolute inset-y-0 left-0 w-1 bg-rose-600 dark:bg-rose-400 rounded-r" />
              )}
            </Button>

            <Button
              variant={activeSection === "analytics" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm font-normal group transition-all duration-300 relative overflow-hidden"
              onClick={() => handleSectionClick("analytics")}
              aria-current={activeSection === "analytics" ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1 rounded mr-2 transition-all duration-300",
                  activeSection === "analytics"
                    ? "bg-cyan-100 dark:bg-cyan-900"
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-cyan-50 dark:group-hover:bg-gray-700",
                )}
              >
                <PieChart
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    activeSection === "analytics"
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-300",
                  )}
                />
              </div>
              <span className="transition-colors duration-300">Analytics</span>
              {activeSection === "analytics" && (
                <div className="absolute inset-y-0 left-0 w-1 bg-cyan-600 dark:bg-cyan-400 rounded-r" />
              )}
            </Button>

            <Button
              variant={activeSection === "profile" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm font-normal group transition-all duration-300 relative overflow-hidden"
              onClick={() => handleSectionClick("profile")}
              aria-current={activeSection === "profile" ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1 rounded mr-2 transition-all duration-300",
                  activeSection === "profile"
                    ? "bg-purple-100 dark:bg-purple-900"
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-50 dark:group-hover:bg-gray-700",
                )}
              >
                <User
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    activeSection === "profile"
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-300",
                  )}
                />
              </div>
              <span className="transition-colors duration-300">Profile</span>
              {activeSection === "profile" && (
                <div className="absolute inset-y-0 left-0 w-1 bg-purple-600 dark:bg-purple-400 rounded-r" />
              )}
            </Button>
          </nav>
        </div>

        {/* Logout Button */}
        {isLoggedIn && (
          <>
            <Separator className="my-2" />
            <div className="p-4">
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="ghost"
                className="w-full justify-start text-sm font-normal group transition-all duration-300 relative overflow-hidden text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <div className="p-1 rounded mr-2 transition-all duration-300 bg-red-100 dark:bg-red-900 group-hover:bg-red-200 dark:group-hover:bg-red-800">
                  <LogOut className="h-4 w-4 transition-colors duration-300 text-red-600 dark:text-red-400" />
                </div>
                <span className="transition-colors duration-300">{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </Button>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  )
}
