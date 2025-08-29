"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  label: string
  render?: (value: any, row: T) => React.ReactNode
  className?: string
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
  headerActions?: React.ReactNode
  title?: string
}

export function AdminTable<T>({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyMessage = "No data available",
  className,
  headerActions,
  title,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className={cn("rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden", className)}>
      {title && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {headerActions}
        </div>
      )}
      <Table>
        <TableHeader className="bg-gray-100 dark:bg-gray-800">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={cn("font-medium", column.className)}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row: any, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={cn(
                  onRowClick ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" : "",
                  rowIndex % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900",
                )}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.key}`} className={column.className}>
                    {column.render ? column.render(row[column.key], row) : row[column.key] || "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

interface StatusBadgeProps {
  status: string
  onClick?: () => void
  className?: string
  variant?: "success" | "warning" | "destructive" | "info" | "default"
}

export function StatusBadge({ status, onClick, className, variant }: StatusBadgeProps) {
  // Auto-determine variant based on status if not provided
  const getVariant = (status: string) => {
    const statusLower = status?.toLowerCase() || ""
    if (["active", "completed", "success", "online"].includes(statusLower)) return "success"
    if (["pending", "in progress", "warning"].includes(statusLower)) return "warning"
    if (["inactive", "failed", "error", "offline"].includes(statusLower)) return "destructive"
    if (["info", "draft"].includes(statusLower)) return "info"
    return "default"
  }

  const badgeVariant = variant || getVariant(status)

  return (
    <Badge
      variant={badgeVariant}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-105",
        onClick && "hover:shadow-md",
        className,
      )}
      onClick={onClick}
    >
      {status || "Unknown"}
    </Badge>
  )
}
