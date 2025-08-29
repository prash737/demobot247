"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/app/lib/utils"
import { User, CreditCard, LayoutDashboard, Bot, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface UserProfileSidebarProps {
  activePage: string
  chatbotId: string
}

export default function UserProfileSidebar({ activePage, chatbotId }: UserProfileSidebarProps) {
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

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/dashboard`,
    },
    {
      id: "profile",
      label: "My profile",
      icon: User,
      href: `/user-profile`,
    },
    {
      id: "chatbot",
      label: "Chatbot",
      icon: Bot,
      href: `/create-chatbot/chatbot-interface`,
    },
    {
      id: "billing",
      label: "Billing and usage",
      icon: CreditCard,
      href: `/user-profile/billing`,
    },
  ]

  return (
    <div className="md:col-span-1">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "p-3 rounded-md flex items-center gap-3 cursor-pointer",
              activePage === item.id
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Logout Button */}
        {isLoggedIn && (
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="ghost"
            className="w-full p-3 rounded-md flex items-center gap-3 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 justify-start"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
