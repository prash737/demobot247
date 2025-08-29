"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminIcon } from "./admin-icons"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface Widget {
  id: string
  title: string
  type: "metric" | "chart" | "list" | "progress"
  size: "small" | "medium" | "large"
  data?: any
  loading?: boolean
  error?: string
}

interface AdminDashboardWidgetsProps {
  widgets: Widget[]
  onRefreshWidget: (widgetId: string) => void
  onRemoveWidget: (widgetId: string) => void
  onAddWidget: () => void
  editable?: boolean
  className?: string
}

export function AdminDashboardWidgets({
  widgets,
  onRefreshWidget,
  onRemoveWidget,
  onAddWidget,
  editable = false,
  className,
}: AdminDashboardWidgetsProps) {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "col-span-1"
      case "medium":
        return "col-span-2"
      case "large":
        return "col-span-3"
      default:
        return "col-span-1"
    }
  }

  const renderWidgetContent = (widget: Widget) => {
    if (widget.loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )
    }

    if (widget.error) {
      return (
        <div className="flex items-center justify-center h-32 text-red-500">
          <div className="text-center">
            <AdminIcon name="alertTriangle" className="mx-auto mb-2" />
            <p className="text-sm">{widget.error}</p>
          </div>
        </div>
      )
    }

    switch (widget.type) {
      case "metric":
        return (
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{widget.data?.value || 0}</div>
            <div className="text-sm text-gray-500">{widget.data?.label || "Metric"}</div>
            {widget.data?.change && (
              <div
                className={`text-xs mt-1 ${
                  widget.data.change > 0 ? "text-green-600" : widget.data.change < 0 ? "text-red-600" : "text-gray-500"
                }`}
              >
                {widget.data.change > 0 ? "+" : ""}
                {widget.data.change}% from last period
              </div>
            )}
          </div>
        )

      case "chart":
        return (
          <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
            <AdminIcon name="analytics" className="text-gray-400" />
            <span className="ml-2 text-gray-500">Chart visualization</span>
          </div>
        )

      case "list":
        return (
          <div className="space-y-2">
            {widget.data?.items?.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="truncate">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            )) || <div className="text-center text-gray-500 py-4">No data available</div>}
          </div>
        )

      case "progress":
        return (
          <div className="space-y-3">
            {widget.data?.items?.map((item: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            )) || <div className="text-center text-gray-500 py-4">No progress data</div>}
          </div>
        )

      default:
        return <div className="text-center text-gray-500 py-8">Unknown widget type</div>
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard Widgets</h2>
        {editable && (
          <Button onClick={onAddWidget} variant="outline">
            <AdminIcon name="plus" size="sm" className="mr-2" />
            Add Widget
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget) => (
          <Card
            key={widget.id}
            className={cn(
              "relative transition-all duration-200 hover:shadow-md",
              getWidgetSizeClass(widget.size),
              draggedWidget === widget.id && "opacity-50",
            )}
            draggable={editable}
            onDragStart={() => setDraggedWidget(widget.id)}
            onDragEnd={() => setDraggedWidget(null)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
              {editable && (
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRefreshWidget(widget.id)}
                    disabled={widget.loading}
                  >
                    <AdminIcon name="refresh" size="sm" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onRemoveWidget(widget.id)}>
                    <AdminIcon name="x" size="sm" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>{renderWidgetContent(widget)}</CardContent>
          </Card>
        ))}

        {widgets.length === 0 && (
          <div className="col-span-full text-center py-12">
            <AdminIcon name="layout" className="mx-auto mb-4 text-gray-400" size="lg" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No widgets configured</h3>
            <p className="text-gray-500 mb-4">Add widgets to customize your dashboard view</p>
            {editable && (
              <Button onClick={onAddWidget}>
                <AdminIcon name="plus" size="sm" className="mr-2" />
                Add Your First Widget
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Widget configuration component
interface WidgetConfigProps {
  onSave: (widget: Partial<Widget>) => void
  onCancel: () => void
  existingWidget?: Widget
}

export function WidgetConfig({ onSave, onCancel, existingWidget }: WidgetConfigProps) {
  const [config, setConfig] = useState<Partial<Widget>>({
    title: existingWidget?.title || "",
    type: existingWidget?.type || "metric",
    size: existingWidget?.size || "small",
  })

  const widgetTypes = [
    { value: "metric", label: "Metric", icon: "analytics" },
    { value: "chart", label: "Chart", icon: "barChart" },
    { value: "list", label: "List", icon: "list" },
    { value: "progress", label: "Progress", icon: "activity" },
  ]

  const widgetSizes = [
    { value: "small", label: "Small (1 column)" },
    { value: "medium", label: "Medium (2 columns)" },
    { value: "large", label: "Large (3 columns)" },
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Widget Title</label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => setConfig({ ...config, title: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Enter widget title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Widget Type</label>
        <div className="grid grid-cols-2 gap-2">
          {widgetTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setConfig({ ...config, type: type.value as any })}
              className={cn(
                "flex items-center space-x-2 p-3 border rounded-md transition-colors",
                config.type === type.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                  : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800",
              )}
            >
              <AdminIcon name={type.icon} size="sm" />
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Widget Size</label>
        <select
          value={config.size}
          onChange={(e) => setConfig({ ...config, size: e.target.value as any })}
          className="w-full border rounded-md px-3 py-2"
        >
          {widgetSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(config)} disabled={!config.title}>
          {existingWidget ? "Update Widget" : "Add Widget"}
        </Button>
      </div>
    </div>
  )
}
