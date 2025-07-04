"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/app/lib/utils"
import { User, CreditCard, MessageSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AccountSidebarProps {
  activePage: string
  chatbotId: string
}

export default function AccountSidebar({ activePage, chatbotId }: AccountSidebarProps) {
  const router = useRouter()

  const menuItems = [
    {
      id: "profile",
      label: "My profile",
      icon: User,
      href: `/admin/account/${chatbotId}`,
    },

    {
      id: "billing",
      label: "Billing and usage",
      icon: CreditCard,
      href: `/admin/account/${chatbotId}/billing`,
    },

    {
      id: "chatbot-details",
      label: "Chatbot details",
      icon: MessageSquare,
      href: `/admin/account/${chatbotId}/chatbot-details`,
    },
  ]

  const handleLogout = async () => {
    try {
      // Clear admin data from localStorage
      localStorage.removeItem("adminData")

      // Call the logout API endpoint
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      toast.success("Logged out successfully")

      // Redirect to admin login page
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout. Please try again.")
    }
  }

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

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full p-3 justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  )
}
