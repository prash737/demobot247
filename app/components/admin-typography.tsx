import type React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function AdminPageTitle({ children, className }: TypographyProps) {
  return <h1 className={cn("text-2xl font-bold text-gray-900 dark:text-gray-100", className)}>{children}</h1>
}

export function AdminDescription({ children, className }: TypographyProps) {
  return <p className={cn("text-gray-600 dark:text-gray-400 mt-1", className)}>{children}</p>
}

export function AdminSectionTitle({ children, className }: TypographyProps) {
  return <h2 className={cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className)}>{children}</h2>
}

export function AdminSubtitle({ children, className }: TypographyProps) {
  return <h3 className={cn("text-base font-medium text-gray-700 dark:text-gray-300", className)}>{children}</h3>
}

export function AdminLabel({ children, className }: TypographyProps) {
  return <label className={cn("text-sm font-medium text-gray-700 dark:text-gray-300", className)}>{children}</label>
}

export function AdminText({ children, className }: TypographyProps) {
  return <p className={cn("text-sm text-gray-600 dark:text-gray-400", className)}>{children}</p>
}

export function AdminMutedText({ children, className }: TypographyProps) {
  return <p className={cn("text-xs text-gray-500 dark:text-gray-500", className)}>{children}</p>
}
