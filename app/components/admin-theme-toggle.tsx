"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AdminIcon } from "./admin-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ThemeSettings {
  mode: "light" | "dark" | "system"
  primaryColor: string
  fontSize: "small" | "medium" | "large"
  compactMode: boolean
  animations: boolean
}

interface AdminThemeToggleProps {
  onThemeChange: (settings: ThemeSettings) => void
  currentSettings?: ThemeSettings
  className?: string
}

export function AdminThemeToggle({ onThemeChange, currentSettings, className }: AdminThemeToggleProps) {
  const [settings, setSettings] = useState<ThemeSettings>(
    currentSettings || {
      mode: "system",
      primaryColor: "blue",
      fontSize: "medium",
      compactMode: false,
      animations: true,
    },
  )

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Apply theme changes to document
    const root = document.documentElement

    // Apply theme mode
    if (settings.mode === "dark") {
      root.classList.add("dark")
    } else if (settings.mode === "light") {
      root.classList.remove("dark")
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }

    // Apply font size
    root.style.fontSize = settings.fontSize === "small" ? "14px" : settings.fontSize === "large" ? "18px" : "16px"

    // Apply compact mode
    if (settings.compactMode) {
      root.classList.add("compact-mode")
    } else {
      root.classList.remove("compact-mode")
    }

    // Apply animations
    if (!settings.animations) {
      root.classList.add("no-animations")
    } else {
      root.classList.remove("no-animations")
    }

    // Save to localStorage
    localStorage.setItem("adminThemeSettings", JSON.stringify(settings))

    // Notify parent component
    onThemeChange(settings)
  }, [settings, onThemeChange])

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = () => {
    const defaultSettings: ThemeSettings = {
      mode: "system",
      primaryColor: "blue",
      fontSize: "medium",
      compactMode: false,
      animations: true,
    }
    setSettings(defaultSettings)
  }

  const primaryColors = [
    { value: "blue", label: "Blue", color: "bg-blue-500" },
    { value: "green", label: "Green", color: "bg-green-500" },
    { value: "purple", label: "Purple", color: "bg-purple-500" },
    { value: "red", label: "Red", color: "bg-red-500" },
    { value: "orange", label: "Orange", color: "bg-orange-500" },
    { value: "teal", label: "Teal", color: "bg-teal-500" },
  ]

  return (
    <div className={className}>
      {/* Quick Theme Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Theme settings"
      >
        <AdminIcon name={settings.mode === "dark" ? "moon" : settings.mode === "light" ? "sun" : "monitor"} size="sm" />
      </Button>

      {/* Theme Settings Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Theme Settings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <AdminIcon name="x" size="sm" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Mode */}
            <div>
              <label className="text-sm font-medium mb-2 block">Theme Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "light", label: "Light", icon: "sun" },
                  { value: "dark", label: "Dark", icon: "moon" },
                  { value: "system", label: "System", icon: "monitor" },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => updateSetting("mode", mode.value as any)}
                    className={`flex flex-col items-center p-2 rounded-md border transition-colors ${
                      settings.mode === mode.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                        : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <AdminIcon name={mode.icon} size="sm" className="mb-1" />
                    <span className="text-xs">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="text-sm font-medium mb-2 block">Primary Color</label>
              <div className="grid grid-cols-3 gap-2">
                {primaryColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateSetting("primaryColor", color.value)}
                    className={`flex items-center space-x-2 p-2 rounded-md border transition-colors ${
                      settings.primaryColor === color.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                        : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.color}`} />
                    <span className="text-xs">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="text-sm font-medium mb-2 block">Font Size</label>
              <Select value={settings.fontSize} onValueChange={(value) => updateSetting("fontSize", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Compact Mode</label>
                <p className="text-xs text-gray-500">Reduce spacing and padding</p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting("compactMode", checked)}
              />
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Animations</label>
                <p className="text-xs text-gray-500">Enable smooth transitions</p>
              </div>
              <Switch
                checked={settings.animations}
                onCheckedChange={(checked) => updateSetting("animations", checked)}
              />
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t">
              <Button variant="outline" onClick={resetToDefaults} className="w-full">
                <AdminIcon name="refresh" size="sm" className="mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// CSS for compact mode and no animations (add to globals.css)
export const themeStyles = `
.compact-mode {
  --spacing-scale: 0.75;
}

.compact-mode .p-4 {
  padding: calc(1rem * var(--spacing-scale));
}

.compact-mode .p-6 {
  padding: calc(1.5rem * var(--spacing-scale));
}

.compact-mode .gap-4 {
  gap: calc(1rem * var(--spacing-scale));
}

.compact-mode .gap-6 {
  gap: calc(1.5rem * var(--spacing-scale));
}

.no-animations * {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}
`
