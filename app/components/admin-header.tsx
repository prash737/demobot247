"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AdminIcon } from "./admin-icons"

interface AdminHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
  actions?: React.ReactNode
}

export function AdminHeader({
  title,
  description,
  showBackButton = false,
  backButtonText = "Back",
  backButtonHref,
  actions,
}: AdminHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backButtonHref) {
      router.push(backButtonHref)
    } else {
      router.back()
    }
  }
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Actions positioned at top right */}
        {actions && <div className="flex justify-end mb-4">{actions}</div>}

        {/* Centered Page Title Section */}
        <div className="text-center space-y-3">
          {showBackButton && (
            <div className="flex justify-start mb-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <AdminIcon name="back" size="sm" className="mr-2" />
                {backButtonText}
              </Button>
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>

          {description && <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{description}</p>}
        </div>
      </div>
    </header>
  )
}
