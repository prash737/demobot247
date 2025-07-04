"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AdminIcon } from "./admin-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SearchFilter {
  field: string
  operator: string
  value: string
}

interface AdminSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void
  onClear: () => void
  searchFields: Array<{ key: string; label: string; type: "text" | "select" | "date"; options?: string[] }>
  className?: string
}

export function AdminSearch({ onSearch, onClear, searchFields, className }: AdminSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const handleSearch = () => {
    onSearch(searchQuery, filters)
  }

  const handleClear = () => {
    setSearchQuery("")
    setFilters([])
    onClear()
  }

  const addFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }])
  }

  const updateFilter = (index: number, key: keyof SearchFilter, value: string) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], [key]: value }
    setFilters(newFilters)
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const operators = [
    { value: "equals", label: "Equals" },
    { value: "contains", label: "Contains" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "greaterThan", label: "Greater than" },
    { value: "lessThan", label: "Less than" },
  ]

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Basic Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <AdminIcon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search across all fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="px-6">
              <AdminIcon name="search" size="sm" className="mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <AdminIcon name="x" size="sm" className="mr-2" />
              Clear
            </Button>
          </div>

          {/* Advanced Search Toggle */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>Advanced Search</span>
                <AdminIcon
                  name="chevronRight"
                  className={`transform transition-transform ${isAdvancedOpen ? "rotate-90" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              {/* Filters */}
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select value={filter.field} onValueChange={(value) => updateFilter(index, "field", value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {searchFields.map((field) => (
                          <SelectItem key={field.key} value={field.key}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filter.operator} onValueChange={(value) => updateFilter(index, "operator", value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, "value", e.target.value)}
                      className="flex-1"
                    />

                    <Button variant="ghost" size="sm" onClick={() => removeFilter(index)}>
                      <AdminIcon name="x" size="sm" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" onClick={addFilter} className="w-full">
                  <AdminIcon name="plus" size="sm" className="mr-2" />
                  Add Filter
                </Button>
              </div>

              {/* Active Filters Display */}
              {filters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium">Active Filters:</span>
                  {filters.map((filter, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {searchFields.find((f) => f.key === filter.field)?.label} {filter.operator} {filter.value}
                      <button onClick={() => removeFilter(index)} className="ml-1 hover:bg-gray-200 rounded">
                        <AdminIcon name="x" size="xs" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}
