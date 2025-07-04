"use client"

import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { AdminIcon } from "./admin-icons"

export function AdminQuickNav() {
  const router = useRouter()

  const quickActions = [
    {
      icon: <AdminIcon name="userPlus" color="primary" />,
      label: "Add User",
      description: "Create new account",
      href: "/admin/add-user",
    },
    {
      icon: <AdminIcon name="users" color="success" />,
      label: "All Users",
      description: "Manage accounts",
      href: "#all-users",
    },
    {
      icon: <AdminIcon name="analytics" color="info" />,
      label: "Token Usage",
      description: "View analytics",
      href: "#token-usage",
    },
    {
      icon: <AdminIcon name="activity" color="error" />,
      label: "Job Runs",
      description: "System status",
      href: "/admin/job-runs",
    },
    {
      icon: <AdminIcon name="mail" color="warning" />, // Customer Requests button
      label: "Customer Requests",
      description: "View inquiries",
      href: "/admin/customer-requests",
    },
  ]

  const handleNavigation = (href: string) => {
    if (href.startsWith("#")) {
      const sectionId = href.substring(1)
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      } else {
        const sections = document.querySelectorAll("h2")
        const targetSection = Array.from(sections).find((section) =>
          section.textContent?.toLowerCase().includes(sectionId.replace("-", " ")),
        )
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth" })
        }
      }
    } else {
      router.push(href)
    }
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h2>
        {/* The grid-cols-5 ensures items are on the same line and distribute space evenly */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleNavigation(action.href)}
            >
              {action.icon}
              <div className="text-center">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
