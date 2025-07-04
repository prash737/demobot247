"use client"

import { usePathname } from "next/navigation"
import { Nav } from "@/app/components/nav"

export function NavbarWrapper() {
  const pathname = usePathname()

  // Don't render the navbar on the chatbot interface page
  if (pathname === "/create-chatbot/chatbot-interface") {
    return null
  }
  if (pathname === "/create-chatbot/knowledge") {
    return null
  }
  if (pathname === "/create-chatbot/theme") {
    return null
  }
  // Don't render the navbar on any embed pages
  if (pathname.startsWith("/embed/")) {
    return null
  }
  if (pathname === "/dashboard") {
    return null
  }
  if (pathname === "/conversations") {
    return null
  }
  if (pathname === "/create-chatbot/embed") {
    return null
  }
  if (pathname === "/user-profile") {
    return null
  }
  if (pathname === "/user-profile/billing") {
    return null
  }
  if (pathname === "/admin/leads") {
    return null
  }
  // Render the navbar on all other pages
  return <Nav />
}
