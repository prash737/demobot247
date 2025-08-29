"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { AdminIcon } from "./admin-icons"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href: string
  isCurrent: boolean
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()

  // Skip rendering breadcrumbs on the main admin page
  if (pathname === "/admin") {
    return null
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split("/").filter(Boolean)

    // Always start with Admin
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Admin", href: "/admin", isCurrent: paths.length === 1 }]

    // Build up the breadcrumb path
    let currentPath = ""

    paths.slice(1).forEach((path, i) => {
      currentPath += `/${path}`
      const isLast = i === paths.length - 2

      // Format the label (capitalize and replace hyphens with spaces)
      const formattedLabel = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      // For dynamic routes with IDs, try to make them more readable
      const label = path.match(/^[0-9a-f]{8,}$/i) ? "Details" : formattedLabel

      breadcrumbs.push({
        label,
        href: `/admin${currentPath}`,
        isCurrent: isLast,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && <AdminIcon name="chevronRight" size="sm" className="mx-2 text-gray-400 dark:text-gray-500" />}

            <Link
              href={breadcrumb.href}
              className={cn(
                "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                breadcrumb.isCurrent
                  ? "text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-500 dark:text-gray-400",
              )}
              aria-current={breadcrumb.isCurrent ? "page" : undefined}
            >
              {breadcrumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
