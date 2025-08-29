"use client"

// Brand colors
export const brandColors = {
  primary: "text-blue-600 dark:text-blue-400",
  secondary: "text-purple-600 dark:text-purple-400",
  accent: "text-emerald-600 dark:text-emerald-400",
}

// Status colors
export const statusColors = {
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-sky-600 dark:text-sky-400",
  default: "text-gray-600 dark:text-gray-400",
}

// Icon colors
export const iconColors = {
  ...brandColors,
  ...statusColors,
  muted: "text-gray-500 dark:text-gray-400",
  subtle: "text-gray-400 dark:text-gray-500",
  white: "text-white",
  black: "text-black dark:text-white",
}

// Badge variants
export const badgeVariants = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  inProgress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

// Get badge variant based on status
export function getBadgeVariant(status: string): string {
  const normalizedStatus = status?.toLowerCase() || "default"

  if (normalizedStatus === "active") return badgeVariants.active
  if (normalizedStatus === "in progress") return badgeVariants.inProgress
  if (normalizedStatus === "inactive") return badgeVariants.inactive
  if (normalizedStatus === "pending") return badgeVariants.pending
  if (normalizedStatus === "completed") return badgeVariants.completed
  if (normalizedStatus === "failed") return badgeVariants.failed
  if (normalizedStatus === "refunded") return badgeVariants.refunded

  return badgeVariants.default
}
