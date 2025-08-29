"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminIcon } from "./admin-icons"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ExportColumn {
  key: string
  label: string
  selected: boolean
}

interface ExportOptions {
  format: "csv" | "excel" | "json" | "pdf"
  columns: ExportColumn[]
  includeHeaders: boolean
  dateRange?: {
    start: string
    end: string
  }
  filters?: Record<string, any>
}

interface AdminExportProps {
  data: any[]
  columns: Array<{ key: string; label: string }>
  filename?: string
  onExport?: (options: ExportOptions) => Promise<void>
  className?: string
}

export function AdminExport({ data, columns, filename = "export", onExport, className }: AdminExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [options, setOptions] = useState<ExportOptions>({
    format: "csv",
    columns: columns.map((col) => ({ ...col, selected: true })),
    includeHeaders: true,
  })

  const handleExport = async () => {
    if (options.columns.filter((col) => col.selected).length === 0) {
      toast({
        title: "No columns selected",
        description: "Please select at least one column to export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      if (onExport) {
        await onExport(options)
      } else {
        await performDefaultExport()
      }

      clearInterval(progressInterval)
      setExportProgress(100)

      toast({
        title: "Export completed",
        description: `Successfully exported ${data.length} records as ${options.format.toUpperCase()}.`,
      })

      setTimeout(() => {
        setIsOpen(false)
        setExportProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "An error occurred while exporting data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const performDefaultExport = async () => {
    const selectedColumns = options.columns.filter((col) => col.selected)
    const exportData = data.map((row) => {
      const filteredRow: Record<string, any> = {}
      selectedColumns.forEach((col) => {
        filteredRow[col.label] = row[col.key]
      })
      return filteredRow
    })

    switch (options.format) {
      case "csv":
        exportToCSV(exportData, selectedColumns)
        break
      case "excel":
        exportToExcel(exportData, selectedColumns)
        break
      case "json":
        exportToJSON(exportData)
        break
      case "pdf":
        exportToPDF(exportData, selectedColumns)
        break
    }
  }

  const exportToCSV = (data: any[], columns: ExportColumn[]) => {
    const headers = options.includeHeaders ? columns.map((col) => col.label).join(",") + "\n" : ""
    const csvContent = data
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col.label] || ""
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(","),
      )
      .join("\n")

    downloadFile(headers + csvContent, `${filename}.csv`, "text/csv")
  }

  const exportToExcel = async (data: any[], columns: ExportColumn[]) => {
    // For a real implementation, you'd use a library like xlsx
    // For now, we'll export as CSV with .xlsx extension
    exportToCSV(data, columns)
    // In a real app, you'd use:
    // const XLSX = await import('xlsx')
    // const worksheet = XLSX.utils.json_to_sheet(data)
    // const workbook = XLSX.utils.book_new()
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    // XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const exportToJSON = (data: any[]) => {
    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, `${filename}.json`, "application/json")
  }

  const exportToPDF = async (data: any[], columns: ExportColumn[]) => {
    // For a real implementation, you'd use a library like jsPDF
    // For now, we'll create a simple text representation
    const content = [
      options.includeHeaders ? columns.map((col) => col.label).join("\t") : "",
      ...data.map((row) => columns.map((col) => row[col.label] || "").join("\t")),
    ]
      .filter(Boolean)
      .join("\n")

    downloadFile(content, `${filename}.txt`, "text/plain")
  }

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const toggleColumn = (index: number) => {
    const newColumns = [...options.columns]
    newColumns[index].selected = !newColumns[index].selected
    setOptions({ ...options, columns: newColumns })
  }

  const selectAllColumns = (selected: boolean) => {
    const newColumns = options.columns.map((col) => ({ ...col, selected }))
    setOptions({ ...options, columns: newColumns })
  }

  const formatOptions = [
    { value: "csv", label: "CSV", icon: "fileText", description: "Comma-separated values" },
    { value: "excel", label: "Excel", icon: "fileSpreadsheet", description: "Microsoft Excel format" },
    { value: "json", label: "JSON", icon: "code", description: "JavaScript Object Notation" },
    { value: "pdf", label: "PDF", icon: "filePdf", description: "Portable Document Format" },
  ]

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className={className}>
        <AdminIcon name="download" size="sm" className="mr-2" />
        Export Data
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
          </DialogHeader>

          {isExporting ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <AdminIcon name="download" size="lg" className="mx-auto text-blue-600" />
                  <h3 className="text-lg font-medium">Exporting Data...</h3>
                  <Progress value={exportProgress} className="w-full" />
                  <p className="text-sm text-gray-500">
                    Preparing {data.length} records for export as {options.format.toUpperCase()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Export Format */}
              <div>
                <label className="text-sm font-medium mb-3 block">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setOptions({ ...options, format: format.value as any })}
                      className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors text-left ${
                        options.format === format.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                          : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <AdminIcon name={format.icon} size="sm" className="mt-0.5" />
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Columns to Export</label>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => selectAllColumns(true)}>
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => selectAllColumns(false)}>
                      Clear All
                    </Button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {options.columns.map((column, index) => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={column.selected}
                        onCheckedChange={() => toggleColumn(index)}
                        id={`column-${index}`}
                      />
                      <label htmlFor={`column-${index}`} className="text-sm cursor-pointer">
                        {column.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {options.columns.filter((col) => col.selected).length} of {options.columns.length} columns selected
                </div>
              </div>

              {/* Export Options */}
              <div>
                <label className="text-sm font-medium mb-3 block">Export Options</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={options.includeHeaders}
                      onCheckedChange={(checked) => setOptions({ ...options, includeHeaders: !!checked })}
                      id="include-headers"
                    />
                    <label htmlFor="include-headers" className="text-sm cursor-pointer">
                      Include column headers
                    </label>
                  </div>
                </div>
              </div>

              {/* Export Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Records to export:</span>
                    <span className="font-medium">{data.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Selected columns:</span>
                    <span className="font-medium">{options.columns.filter((col) => col.selected).length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Format:</span>
                    <span className="font-medium">{options.format.toUpperCase()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={options.columns.filter((col) => col.selected).length === 0}>
                  <AdminIcon name="download" size="sm" className="mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Quick export buttons for common formats
interface QuickExportProps {
  data: any[]
  columns: Array<{ key: string; label: string }>
  filename?: string
  className?: string
}

export function QuickExport({ data, columns, filename = "export", className }: QuickExportProps) {
  const quickExport = (format: "csv" | "json") => {
    const exportData = data.map((row) => {
      const filteredRow: Record<string, any> = {}
      columns.forEach((col) => {
        filteredRow[col.label] = row[col.key]
      })
      return filteredRow
    })

    if (format === "csv") {
      const headers = columns.map((col) => col.label).join(",") + "\n"
      const csvContent = exportData
        .map((row) =>
          columns
            .map((col) => {
              const value = row[col.label] || ""
              return `"${String(value).replace(/"/g, '""')}"`
            })
            .join(","),
        )
        .join("\n")

      const blob = new Blob([headers + csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${filename}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (format === "json") {
      const jsonContent = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${filename}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    toast({
      title: "Export completed",
      description: `Successfully exported ${data.length} records as ${format.toUpperCase()}.`,
    })
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Button variant="outline" size="sm" onClick={() => quickExport("csv")}>
        <AdminIcon name="fileText" size="sm" className="mr-1" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => quickExport("json")}>
        <AdminIcon name="code" size="sm" className="mr-1" />
        JSON
      </Button>
    </div>
  )
}
