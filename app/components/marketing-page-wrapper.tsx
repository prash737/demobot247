"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface MarketingPageWrapperProps {
  children: ReactNode
  className?: string
}

export function MarketingPageWrapper({ children, className }: MarketingPageWrapperProps) {
  return (
    <div className={cn("relative min-h-screen flex flex-col text-gray-900 dark:text-white", className)}>
      <div className="relative z-10 flex-grow">{children}</div>
    </div>
  )
}
