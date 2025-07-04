"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ChatbotButtonProps {
  className?: string
  onClick: () => void
  children?: React.ReactNode // To allow custom icon/image
}

export function ChatbotButton({ className, onClick, children }: ChatbotButtonProps) {
  return (
    <Button
      variant="ghost" // Use ghost variant for transparent background
      size="icon"
      className={cn(
        "relative h-14 w-14 rounded-full shadow-lg overflow-hidden p-0", // Removed bg-green-500, added p-0 for image to fill
        "animate-pulse-slow", // Custom pulsating animation
        className,
      )}
      aria-label="Open chatbot"
      onClick={onClick}
    >
      {/* Ensure the image fills the button and is rounded */}
      {children || (
        <Image
          src="/placeholder.svg"
          alt="Chatbot Icon"
          width={56} // Match button size
          height={56} // Match button size
          className="rounded-full object-contain" // Ensure image is rounded and covers
        />
      )}
      <span className="sr-only">Open Chatbot</span>
    </Button>
  )
}
