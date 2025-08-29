"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  RefreshCw,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { startOfMonth, differenceInDays } from "date-fns"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface InsightsJobStatus {
  error: string | null
  status: string
  job_name: string
  timestamp: string
}

interface RagJobStatus {
  job: string
  status: string
  error?: string
}

interface ScheduleEntry {
  id: number
  created_at: string
  job_status: InsightsJobStatus[]
}

interface RagScheduleEntry {
  id: number
  created_at: string
  job_status: RagJobStatus[]
}

const JobRunsPage = () => {
  const [insightsData, setInsightsData] = useState<ScheduleEntry[]>([])
  const [ragData, setRagData] = useState<RagScheduleEntry[]>([])
  const [loadingInsights, setLoadingInsights] = useState(true)
  const [loadingRag, setLoadingRag] = useState(true)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const [ragError, setRagError] = useState<string | null>(null)
  const [refreshInsights, setRefreshInsights] = useState(0)
  const [refreshRag, setRefreshRag] = useState(0)
  const router = useRouter()

  // Date filter states
  const [insightsStartDate, setInsightsStartDate] = useState("")
  const [insightsEndDate, setInsightsEndDate] = useState("")
  const [ragStartDate, setRagStartDate] = useState("")
  const [ragEndDate, setRagEndDate] = useState("")
  const [insightsFilterApplied, setInsightsFilterApplied] = useState(false)
  const [ragFilterApplied, setRagFilterApplied] = useState(false)
  const [filterError, setFilterError] = useState<string | null>(null)

  // Calculate current month RAG cost
  const calculateRagMonthlyCost = () => {
    const today = new Date()
    const firstDayOfMonth = startOfMonth(today)
    const daysInCurrentMonth = differenceInDays(today, firstDayOfMonth) + 1
    const dailyCost = 0.003
    const monthlyCost = dailyCost * daysInCurrentMonth
    return monthlyCost.toFixed(3)
  }

  // Get last 24 hours timestamp
  const getLast24HoursTimestamp = () => {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return last24Hours.toISOString()
  }

  const checkAdminAuth = useCallback(() => {
    try {
      const adminData = localStorage.getItem("adminData")
      if (!adminData) {
        router.push("/admin/login")
        return false
      }
      return true
    } catch (error) {
      console.error("Error checking admin authentication:", error)
      router.push("/admin/login")
      return false
    }
  }, [router])

  const fetchInsightsData = useCallback(async () => {
    if (!checkAdminAuth()) return

    setLoadingInsights(true)
    setInsightsError(null)
    setFilterError(null)

    try {
      let query = supabase.from("insights_schedule").select("*").order("created_at", { ascending: false })

      // Apply date filters if the filter is applied, otherwise show last 24 hours
      if (insightsFilterApplied) {
        if (insightsStartDate) {
          // Set time to beginning of day (00:00:00)
          const startDateTime = new Date(insightsStartDate)
          startDateTime.setHours(0, 0, 0, 0)
          query = query.gte("created_at", startDateTime.toISOString())
        }

        if (insightsEndDate) {
          // Set time to end of day (23:59:59)
          const endDateTime = new Date(insightsEndDate)
          endDateTime.setHours(23, 59, 59, 999)
          query = query.lte("created_at", endDateTime.toISOString())
        }
      } else {
        // Default: show only last 24 hours
        query = query.gte("created_at", getLast24HoursTimestamp())
      }

      const { data, error } = await query

      if (error) throw error

      // Log the query results for debugging
      console.log("Insights data fetched:", data?.length || 0, "records")

      if (insightsFilterApplied && data?.length === 0) {
        console.log("No insights data found for date range:", insightsStartDate, "to", insightsEndDate)
      }

      setInsightsData(data || [])
    } catch (error) {
      console.error("Error fetching insights data:", error)
      setInsightsError("Failed to fetch insights data. Please try again.")
    } finally {
      setLoadingInsights(false)
    }
  }, [checkAdminAuth, insightsFilterApplied, insightsStartDate, insightsEndDate])

  const fetchRagData = useCallback(async () => {
    if (!checkAdminAuth()) return

    setLoadingRag(true)
    setRagError(null)
    setFilterError(null)

    try {
      let query = supabase.from("rag_schedule").select("*").order("created_at", { ascending: false })

      // Apply date filters if the filter is applied, otherwise show last 24 hours
      if (ragFilterApplied) {
        if (ragStartDate) {
          // Set time to beginning of day (00:00:00)
          const startDateTime = new Date(ragStartDate)
          startDateTime.setHours(0, 0, 0, 0)
          query = query.gte("created_at", startDateTime.toISOString())
        }

        if (ragEndDate) {
          // Set time to end of day (23:59:59)
          const endDateTime = new Date(ragEndDate)
          endDateTime.setHours(23, 59, 59, 999)
          query = query.lte("created_at", endDateTime.toISOString())
        }
      } else {
        // Default: show only last 24 hours
        query = query.gte("created_at", getLast24HoursTimestamp())
      }

      const { data, error } = await query

      if (error) throw error

      // Log the query results for debugging
      console.log("RAG data fetched:", data?.length || 0, "records")

      if (ragFilterApplied && data?.length === 0) {
        console.log("No RAG data found for date range:", ragStartDate, "to", ragEndDate)
      }

      setRagData(data || [])
    } catch (error) {
      console.error("Error fetching RAG data:", error)
      setRagError("Failed to fetch RAG schedule data. Please try again.")
    } finally {
      setLoadingRag(false)
    }
  }, [checkAdminAuth, ragFilterApplied, ragStartDate, ragEndDate])

  // Initial data fetch
  useEffect(() => {
    fetchInsightsData()
  }, [fetchInsightsData, refreshInsights])

  useEffect(() => {
    fetchRagData()
  }, [fetchRagData, refreshRag])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString // Return original string if formatting fails
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "failed":
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "running":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "failed":
      case "error":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const validateDateRange = (startDate: string, endDate: string): boolean => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setFilterError("Invalid date format. Please use YYYY-MM-DD format.")
        return false
      }

      if (start > end) {
        setFilterError("Start date cannot be after end date.")
        return false
      }

      // Check if date range is too large (e.g., more than 90 days)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 90) {
        setFilterError("Date range cannot exceed 90 days.")
        return false
      }
    }

    setFilterError(null)
    return true
  }

  const applyInsightsDateFilter = () => {
    if (!validateDateRange(insightsStartDate, insightsEndDate)) {
      return
    }

    setInsightsFilterApplied(true)
    // Trigger a refresh by incrementing the refresh counter
    setRefreshInsights((prev) => prev + 1)
  }

  const clearInsightsDateFilter = () => {
    setInsightsStartDate("")
    setInsightsEndDate("")
    setInsightsFilterApplied(false)
    setFilterError(null)
    // Trigger a refresh by incrementing the refresh counter
    setRefreshInsights((prev) => prev + 1)
  }

  const applyRagDateFilter = () => {
    if (!validateDateRange(ragStartDate, ragEndDate)) {
      return
    }

    setRagFilterApplied(true)
    // Trigger a refresh by incrementing the refresh counter
    setRefreshRag((prev) => prev + 1)
  }

  const clearRagDateFilter = () => {
    setRagStartDate("")
    setRagEndDate("")
    setRagFilterApplied(false)
    setFilterError(null)
    // Trigger a refresh by incrementing the refresh counter
    setRefreshRag((prev) => prev + 1)
  }

  const manualRefreshInsights = () => {
    setRefreshInsights((prev) => prev + 1)
  }

  const manualRefreshRag = () => {
    setRefreshRag((prev) => prev + 1)
  }

  if (loadingInsights && loadingRag && !insightsData.length && !ragData.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading job run data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 pt-28 pb-16">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push("/admin")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Runs</h1>
          <p className="text-gray-600 dark:text-gray-300">
            View scheduled job status and history. Showing last 24 hours by default.
          </p>
        </div>

        {filterError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{filterError}</AlertDescription>
          </Alert>
        )}

        {/* Insights Deployment Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex items-center mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">Insights Deployment</h2>
              <Badge variant="outline" className="ml-2 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                Cost: $12.8/month
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={manualRefreshInsights}
                disabled={loadingInsights}
              >
                <RefreshCw className={`h-4 w-4 ${loadingInsights ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <div className="w-full md:w-auto">
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Filter by date
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label htmlFor="insights-start-date" className="block text-xs mb-1">
                      Start Date
                    </label>
                    <Input
                      id="insights-start-date"
                      type="date"
                      value={insightsStartDate}
                      onChange={(e) => setInsightsStartDate(e.target.value)}
                      max={insightsEndDate || undefined}
                    />
                  </div>
                  <div>
                    <label htmlFor="insights-end-date" className="block text-xs mb-1">
                      End Date
                    </label>
                    <Input
                      id="insights-end-date"
                      type="date"
                      value={insightsEndDate}
                      onChange={(e) => setInsightsEndDate(e.target.value)}
                      min={insightsStartDate || undefined}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearInsightsDateFilter}
                    disabled={!insightsFilterApplied || loadingInsights}
                  >
                    {loadingInsights && insightsFilterApplied === false ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : null}
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyInsightsDateFilter}
                    disabled={(!insightsStartDate && !insightsEndDate) || loadingInsights}
                  >
                    {loadingInsights && insightsFilterApplied ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : null}
                    Apply Filter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {insightsError ? (
            <Alert variant="destructive">
              <AlertDescription>{insightsError}</AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="h-96 overflow-auto border rounded-md">
                  <TooltipProvider>
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="px-4 py-3 text-left">ID</th>
                          <th className="px-4 py-3 text-left">Created At</th>
                          <th className="px-4 py-3 text-left">Job Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingInsights && !insightsData.length ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center">
                              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                              <p className="mt-2 text-sm text-gray-500">Loading insights data...</p>
                            </td>
                          </tr>
                        ) : insightsData.length > 0 ? (
                          insightsData.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <td className="px-4 py-3">{entry.id}</td>
                              <td className="px-4 py-3">{formatDate(entry.created_at)}</td>
                              <td className="px-4 py-3">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-8 px-2">
                                      View Jobs ({entry.job_status?.length || 0})
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-96 p-0" align="start">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className="font-medium">Job Details</h3>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Created at: {formatDate(entry.created_at)}
                                      </p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto p-4">
                                      {entry.job_status && entry.job_status.length > 0 ? (
                                        <div className="space-y-3">
                                          {entry.job_status.map((job, index) => (
                                            <div
                                              key={index}
                                              className="p-3 border border-gray-200 dark:border-gray-700 rounded-md"
                                            >
                                              <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium flex items-center">
                                                  {getStatusIcon(job.status)}
                                                  <span className="ml-2">{job.job_name}</span>
                                                </div>
                                                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                                              </div>
                                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(job.timestamp)}
                                              </div>
                                              {job.error && (
                                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded">
                                                  <strong>Error:</strong> {job.error}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                          No job status information available
                                        </div>
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>

                                <div className="mt-2 flex flex-wrap gap-1">
                                  {entry.job_status &&
                                    entry.job_status.slice(0, 3).map((job, index) => (
                                      <Tooltip key={index}>
                                        <TooltipTrigger asChild>
                                          <div
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
                                              job.status,
                                            )}`}
                                          >
                                            {getStatusIcon(job.status)}
                                            <span className="ml-1">{job.job_name.split("_").join(" ")}</span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="text-sm">
                                            <div>
                                              <strong>Job:</strong> {job.job_name}
                                            </div>
                                            <div>
                                              <strong>Status:</strong> {job.status}
                                            </div>
                                            <div>
                                              <strong>Time:</strong> {formatDate(job.timestamp)}
                                            </div>
                                            {job.error && (
                                              <div>
                                                <strong>Error:</strong> {job.error}
                                              </div>
                                            )}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  {entry.job_status && entry.job_status.length > 3 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                      +{entry.job_status.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                              {insightsFilterApplied
                                ? "No job run data found for the selected date range"
                                : "No job run data found in the last 24 hours"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RAG Scheduled Jobs Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex items-center mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">RAG Scheduled Jobs</h2>
              <div className="ml-2 flex items-center">
                <Badge variant="outline" className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Cost: $0.003/day
                </Badge>
                <Badge variant="secondary" className="ml-2 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Current Month: ${calculateRagMonthlyCost()}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="ml-2" onClick={manualRefreshRag} disabled={loadingRag}>
                <RefreshCw className={`h-4 w-4 ${loadingRag ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <div className="w-full md:w-auto">
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Filter by date
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label htmlFor="rag-start-date" className="block text-xs mb-1">
                      Start Date
                    </label>
                    <Input
                      id="rag-start-date"
                      type="date"
                      value={ragStartDate}
                      onChange={(e) => setRagStartDate(e.target.value)}
                      max={ragEndDate || undefined}
                    />
                  </div>
                  <div>
                    <label htmlFor="rag-end-date" className="block text-xs mb-1">
                      End Date
                    </label>
                    <Input
                      id="rag-end-date"
                      type="date"
                      value={ragEndDate}
                      onChange={(e) => setRagEndDate(e.target.value)}
                      min={ragStartDate || undefined}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearRagDateFilter}
                    disabled={!ragFilterApplied || loadingRag}
                  >
                    {loadingRag && ragFilterApplied === false ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : null}
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyRagDateFilter}
                    disabled={(!ragStartDate && !ragEndDate) || loadingRag}
                  >
                    {loadingRag && ragFilterApplied ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                    Apply Filter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {ragError ? (
            <Alert variant="destructive">
              <AlertDescription>{ragError}</AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="h-96 overflow-auto border rounded-md">
                  <TooltipProvider>
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="px-4 py-3 text-left">ID</th>
                          <th className="px-4 py-3 text-left">Created At</th>
                          <th className="px-4 py-3 text-left">Job Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingRag && !ragData.length ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center">
                              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                              <p className="mt-2 text-sm text-gray-500">Loading RAG data...</p>
                            </td>
                          </tr>
                        ) : ragData.length > 0 ? (
                          ragData.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <td className="px-4 py-3">{entry.id}</td>
                              <td className="px-4 py-3">{formatDate(entry.created_at)}</td>
                              <td className="px-4 py-3">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-8 px-2">
                                      View Jobs ({entry.job_status?.length || 0})
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-96 p-0" align="start">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                      <h3 className="font-medium">Job Details</h3>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Created at: {formatDate(entry.created_at)}
                                      </p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto p-4">
                                      {entry.job_status && entry.job_status.length > 0 ? (
                                        <div className="space-y-3">
                                          {entry.job_status.map((job, index) => (
                                            <div
                                              key={index}
                                              className="p-3 border border-gray-200 dark:border-gray-700 rounded-md"
                                            >
                                              <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium flex items-center">
                                                  {getStatusIcon(job.status)}
                                                  <span className="ml-2">{job.job}</span>
                                                </div>
                                                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                                              </div>
                                              {job.error && (
                                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded">
                                                  <strong>Error:</strong> {job.error}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                          No job status information available
                                        </div>
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>

                                <div className="mt-2 flex flex-wrap gap-1">
                                  {entry.job_status &&
                                    entry.job_status.slice(0, 3).map((job, index) => (
                                      <Tooltip key={index}>
                                        <TooltipTrigger asChild>
                                          <div
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
                                              job.status,
                                            )}`}
                                          >
                                            {getStatusIcon(job.status)}
                                            <span className="ml-1">{job.job.split("_").join(" ")}</span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="text-sm">
                                            <div>
                                              <strong>Job:</strong> {job.job}
                                            </div>
                                            <div>
                                              <strong>Status:</strong> {job.status}
                                            </div>
                                            {job.error && (
                                              <div>
                                                <strong>Error:</strong> {job.error}
                                              </div>
                                            )}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  {entry.job_status && entry.job_status.length > 3 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                      +{entry.job_status.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                              {ragFilterApplied
                                ? "No RAG job data found for the selected date range"
                                : "No RAG job data found in the last 24 hours"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default JobRunsPage
