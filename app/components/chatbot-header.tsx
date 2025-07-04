"use client"

import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/app/lib/utils"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface ChatbotHeaderProps {
  chatbotName?: string
  isScrolled?: boolean
  currentPage?: string
}

export default function ChatbotHeader({
  chatbotName = "Your Chatbot",
  isScrolled: externalIsScrolled,
  currentPage,
}: ChatbotHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [pageTitle, setPageTitle] = useState("")
  const [internalIsScrolled, setInternalIsScrolled] = useState(false)

  // Use external isScrolled if provided, otherwise use internal state
  const isScrolled = externalIsScrolled !== undefined ? externalIsScrolled : internalIsScrolled

  useEffect(() => {
    setMounted(true)

    // Add scroll event listener
    const handleScroll = () => {
      setInternalIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)

    // Determine page title based on pathname if not explicitly provided
    if (!currentPage) {
      let title = "Dashboard"

      if (pathname) {
        // Extract the last part of the path and capitalize it
        const pathSegments = pathname.split("/").filter(Boolean)
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1]

          // Handle special cases and format the title
          if (lastSegment === "user-profile") {
            title = "Profile"
          } else if (lastSegment.includes("-")) {
            // Convert kebab-case to Title Case (e.g., "create-chatbot" to "Create Chatbot")
            title = lastSegment
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          } else {
            // Just capitalize the first letter
            title = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
          }
        }
      }

      setPageTitle(title)
    } else {
      setPageTitle(currentPage)
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [pathname, currentPage])

  if (!mounted) return null

  return (
    <header
      className={cn(
        "flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300",
        isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md" : "bg-white dark:bg-gray-900",
      )}
      style={{ height: "80px" }}
    >
      <div className="flex-shrink-0">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/bot247.live_logo.png"
            alt="Bot247 Logo"
            width={180}
            height={60}
            className="transition-all duration-300 h-[60px] w-auto"
            priority
          />
        </Link>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="font-medium text-gray-700 dark:text-gray-200 text-lg">{pageTitle}</h1>
      </div>

      <div className="flex items-center">{/* Logout handled by main navigation */}</div>
    </header>
  )
}
