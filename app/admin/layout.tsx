import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"

export const metadata: Metadata = {
  title: "Bot247 Admin - Dashboard",
  description: "Admin dashboard for Bot247 AI-powered customer support platform.",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster />
      <SonnerToaster />
    </>
  )
}
