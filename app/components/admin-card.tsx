"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AdminCardProps {
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  variant?: "default" | "metric"
  headerActions?: React.ReactNode
}

export function AdminCard({ title, icon, children, className, variant = "default", headerActions }: AdminCardProps) {
  if (variant === "metric") {
    return (
      <Card className={cn("overflow-hidden border-t-4", className)}>
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("shadow-sm", className)}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
          <div className="flex items-center gap-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</CardTitle>
          </div>
          {headerActions && <div>{headerActions}</div>}
        </CardHeader>
      )}
      <CardContent className={title ? "p-6" : "p-0"}>{children}</CardContent>
    </Card>
  )
}
