"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Lead {
  id: number
  chatbot_id: string
  name: string
  email: string
  phone: string
  message: string
  created_at: string
}

interface ChatbotLeads {
  chatbot_id: string
  leads: Lead[]
  count: number
}

interface ErrorState {
  hasError: boolean
  message: string
  type: "network" | "database" | "permission" | "unknown"
}

export default function AdminLeadsPage() {
  const [chatbotLeads, setChatbotLeads] = useState<ChatbotLeads[]>([])
  const [expandedChatbots, setExpandedChatbots] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<ErrorState>({ hasError: false, message: "", type: "unknown" })
  const [totalLeads, setTotalLeads] = useState(0)
  const router = useRouter()

  // Validate admin access
  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const adminData = localStorage.getItem("adminData")
        if (!adminData) {
          console.warn("No admin data found, redirecting to admin login")
          router.push("/admin/login")
          return false
        }

        const parsedAdminData = JSON.parse(adminData)
        if (!parsedAdminData.username) {
          console.warn("Invalid admin data, redirecting to admin login")
          router.push("/admin/login")
          return false
        }

        return true
      } catch (error) {
        console.error("Error checking admin access:", error)
        router.push("/admin/login")
        return false
      }
    }

    if (!checkAdminAccess()) {
      return
    }

    fetchLeads()
  }, [router])

  const fetchLeads = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError({ hasError: false, message: "", type: "unknown" })

      // Validate Supabase connection
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Supabase configuration is missing")
      }

      console.log("Fetching leads from database...")

      const { data: leads, error: fetchError } = await supabase
        .from("collected_leads")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Database error:", fetchError)

        // Determine error type
        let errorType: ErrorState["type"] = "database"
        if (fetchError.message.includes("permission")) {
          errorType = "permission"
        } else if (fetchError.message.includes("network") || fetchError.message.includes("fetch")) {
          errorType = "network"
        }

        setError({
          hasError: true,
          message: `Database error: ${fetchError.message}`,
          type: errorType,
        })
        return
      }

      if (!leads) {
        console.warn("No leads data returned from database")
        setChatbotLeads([])
        setTotalLeads(0)
        return
      }

      console.log(`Fetched ${leads.length} total leads from database`)

      // Filter and validate leads
      const validLeads = leads.filter((lead: Lead) => {
        // Validate required fields
        if (!lead.id || !lead.chatbot_id || !lead.created_at) {
          console.warn("Invalid lead data:", lead)
          return false
        }

        // Filter leads with valid contact information
        const hasValidEmail = lead.email && lead.email !== "000" && lead.email.trim() !== ""
        const hasValidPhone = lead.phone && lead.phone !== "000" && lead.phone.trim() !== ""

        return hasValidEmail || hasValidPhone
      })

      console.log(`Filtered to ${validLeads.length} valid leads`)

      // Remove duplicates based on email or phone
      const uniqueLeads = validLeads.reduce((acc: Lead[], lead: Lead) => {
        const isDuplicate = acc.some((existingLead) => {
          const sameEmail = lead.email && lead.email !== "000" && lead.email === existingLead.email
          const samePhone = lead.phone && lead.phone !== "000" && lead.phone === existingLead.phone
          return sameEmail || samePhone
        })

        if (!isDuplicate) {
          acc.push(lead)
        } else {
          console.log("Duplicate lead filtered out:", lead.id)
        }

        return acc
      }, [])

      console.log(`After duplicate removal: ${uniqueLeads.length} unique leads`)

      // Group leads by chatbot_id
      const groupedLeads = uniqueLeads.reduce((acc: { [key: string]: Lead[] }, lead: Lead) => {
        if (!acc[lead.chatbot_id]) {
          acc[lead.chatbot_id] = []
        }
        acc[lead.chatbot_id].push(lead)
        return acc
      }, {})

      // Convert to array format and sort by lead count
      const chatbotLeadsArray = Object.entries(groupedLeads)
        .map(([chatbot_id, leads]) => ({
          chatbot_id,
          leads,
          count: leads.length,
        }))
        .sort((a, b) => b.count - a.count)

      console.log(
        `Grouped into ${chatbotLeadsArray.length} chatbots:`,
        chatbotLeadsArray.map((cb) => `${cb.chatbot_id}: ${cb.count} leads`),
      )

      setChatbotLeads(chatbotLeadsArray)
      setTotalLeads(uniqueLeads.length)
    } catch (error) {
      console.error("Error fetching leads:", error)

      let errorMessage = "An unexpected error occurred"
      let errorType: ErrorState["type"] = "unknown"

      if (error instanceof Error) {
        errorMessage = error.message
        if (error.message.includes("network") || error.message.includes("fetch")) {
          errorType = "network"
        } else if (error.message.includes("Supabase")) {
          errorType = "database"
        }
      }

      setError({
        hasError: true,
        message: errorMessage,
        type: errorType,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const toggleChatbot = useCallback((chatbotId: string) => {
    setExpandedChatbots((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(chatbotId)) {
        newExpanded.delete(chatbotId)
      } else {
        newExpanded.add(chatbotId)
      }
      return newExpanded
    })
  }, [])

  const handleLogout = useCallback(() => {
    try {
      localStorage.clear()
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
      // Force navigation even if localStorage fails
      window.location.href = "/"
    }
  }, [router])

  const handleRefresh = useCallback(() => {
    fetchLeads(true)
  }, [fetchLeads])

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }, [])

  const getErrorMessage = (error: ErrorState) => {
    switch (error.type) {
      case "network":
        return "Network connection error. Please check your internet connection and try again."
      case "database":
        return "Database connection error. Please try again later."
      case "permission":
        return "Access denied. Please check your permissions."
      default:
        return error.message || "An unexpected error occurred. Please try again."
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/images/bot247-logo.png"
                    alt="Bot247"
                    width={160}
                    height={52}
                    className="h-10 w-auto"
                    priority
                  />
                </Link>
              </div>
              <div className="flex-1 flex justify-center">
                <h1 className="text-xl font-semibold text-gray-900">Collected Leads</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={() => router.push("/admin")} variant="outline" size="sm">
                  Back to Admin
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leads...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/bot247-logo.png"
                  alt="Bot247"
                  width={160}
                  height={52}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Title - Center */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl font-semibold text-gray-900">Collected Leads</h1>
            </div>

            {/* Actions - Right */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button onClick={() => router.push("/admin")} variant="outline" size="sm">
                Back to Admin
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error.hasError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {getErrorMessage(error)}
              <Button onClick={handleRefresh} variant="outline" size="sm" className="ml-4" disabled={refreshing}>
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Stats */}
        {!error.hasError && chatbotLeads.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
                <div className="text-sm text-gray-600">Total Leads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{chatbotLeads.length}</div>
                <div className="text-sm text-gray-600">Active Chatbots</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {chatbotLeads.length > 0 ? Math.round(totalLeads / chatbotLeads.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Leads per Bot</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leads Content */}
        {!error.hasError && chatbotLeads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500 text-center mb-4">
                No leads have been collected yet. Leads will appear here once users interact with your chatbots.
              </p>
              <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : !error.hasError ? (
          <div className="space-y-4">
            {chatbotLeads.map((chatbotData) => (
              <Card key={chatbotData.chatbot_id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Chatbot Header */}
                  <div
                    className="flex items-center justify-between p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleChatbot(chatbotData.chatbot_id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleChatbot(chatbotData.chatbot_id)
                      }
                    }}
                    aria-expanded={expandedChatbots.has(chatbotData.chatbot_id)}
                    aria-controls={`chatbot-${chatbotData.chatbot_id}-content`}
                  >
                    <div className="flex items-center space-x-4">
                      {expandedChatbots.has(chatbotData.chatbot_id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Chatbot: {chatbotData.chatbot_id}</h3>
                        <p className="text-sm text-gray-500">Click to view lead details</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                      {chatbotData.count} leads
                    </Badge>
                  </div>

                  {/* Expanded Content */}
                  {expandedChatbots.has(chatbotData.chatbot_id) && (
                    <div id={`chatbot-${chatbotData.chatbot_id}-content`} className="border-t bg-gray-50">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead className="w-[200px] font-semibold">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4" aria-hidden="true" />
                                  <span>Name</span>
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold">Email</TableHead>
                              <TableHead className="font-semibold">Phone</TableHead>
                              <TableHead className="font-semibold">Message</TableHead>
                              <TableHead className="w-[180px] font-semibold">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" aria-hidden="true" />
                                  <span>Date</span>
                                </div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="bg-white">
                            {chatbotData.leads.map((lead) => (
                              <TableRow key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <TableCell className="font-medium">
                                  {lead.name && lead.name !== "000" && lead.name.trim() !== ""
                                    ? lead.name
                                    : "Anonymous"}
                                </TableCell>
                                <TableCell>
                                  {lead.email && lead.email !== "000" && lead.email.trim() !== "" ? (
                                    <a
                                      href={`mailto:${lead.email}`}
                                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 hover:underline"
                                      aria-label={`Send email to ${lead.email}`}
                                    >
                                      <span>{lead.email}</span>
                                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                    </a>
                                  ) : (
                                    <span className="text-gray-400">Not provided</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {lead.phone && lead.phone !== "000" && lead.phone.trim() !== "" ? (
                                    <a
                                      href={`tel:${lead.phone}`}
                                      className="text-blue-600 hover:text-blue-800 hover:underline"
                                      aria-label={`Call ${lead.phone}`}
                                    >
                                      {lead.phone}
                                    </a>
                                  ) : (
                                    <span className="text-gray-400">Not provided</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    {lead.message && lead.message.trim() !== "" ? (
                                      <span
                                        className="text-sm"
                                        title={lead.message}
                                        aria-label={`Message: ${lead.message}`}
                                      >
                                        {lead.message.length > 50
                                          ? `${lead.message.substring(0, 50)}...`
                                          : lead.message}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">No message</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">{formatDate(lead.created_at)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
