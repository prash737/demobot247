"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import ChatbotHeader from "@/app/components/chatbot-header"
import ChatbotSidebar from "@/app/components/chatbot-sidebar"
import { useChatbotTheme } from "@/app/contexts/chatbot-theme-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateInsightsPDF } from "@/app/utils/pdf-generator"
import { toast } from "sonner"
import LeadsDisplay, { type Lead } from "@/app/components/leads-display"
import { supabase } from "@/app/utils/supabaseClient"
import { Users, MessageSquare, Bot } from "lucide-react" // Assuming these icons are available
import { Skeleton } from "@/components/ui/skeleton" // For loading state

// Define static colors for insights
const INSIGHT_COLORS = {
  heading: "#333333",
  conversations: "#4F46E5", // Indigo
  userQueries: "#10B981", // Emerald
  assistantResponses: "#F59E0B", // Amber
}

interface InsightsData {
  date_of_convo: string
  total_conversations: number
  total_user_queries: number
  total_assistant_responses: number
  yesterday_total_conversations: number
  yesterday_total_user_queries: number
  yesterday_total_assistant_responses: number
  conversations_change: number
  user_queries_change: number
  assistant_responses_change: number
  // Add these new properties
  total_messages: number
  yesterday_total_messages: number
  messages_change: number
}

interface InsightCardProps {
  title: string
  value: number
  previousValue: number
  icon: React.ReactNode
  description: string
}

function InsightCard({ title, value, previousValue, icon, description }: InsightCardProps) {
  const percentageChange = calculatePercentageChange(value, previousValue)
  const isPositive = value >= previousValue

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {isPositive ? "+" : ""}
            {percentageChange}
          </span>{" "}
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

function DashboardCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Helper to calculate percentage change
function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "100.0%" : "0.0%" // If previous was 0 and current is > 0, it's 100% increase
  }
  const change = ((current - previous) / previous) * 100
  return change.toFixed(1) + "%"
}

const periodOptions = [
  { value: "0", label: "Overall till now" },
  { value: "2", label: "Last 2 days" },
  { value: "7", label: "Last 7 days" },
  { value: "10", label: "Last 10 days" },
]

export default function DashboardPage() {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null)
  const [conversations, setConversations] = useState<
    { date_of_convo: string; messages: { role: string; content: string }[] }[]
  >([])
  const [plots, setPlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [chatbotId, setChatbotId] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("0")
  const [unansweredQueries, setUnansweredQueries] = useState<{ query: string; frequency: number }[]>([])
  const [top10Queries, setTop10Queries] = useState<{ query: string; frequency: number }[]>([])
  const [totalUnansweredCount, setTotalUnansweredCount] = useState<number>(0)
  const [chatbotName, setChatbotName] = useState<string>("Your Chatbot")
  const { primaryColor, secondaryColor } = useChatbotTheme()
  const [totalChats, setTotalChats] = useState<number>(0) // State for total chats
  const [selectedConversation, setSelectedConversation] = useState<{
    date: string
    count: number
    messages: { role: "user" | "assistant"; content: string }[]
  } | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const plotsContainerRef = useRef<HTMLDivElement>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [userPlan, setUserPlan] = useState<string>("Basic") // Add state for user plan

  useEffect(() => {
    const userDataStr = localStorage.getItem("userData")
    if (!userDataStr) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(userDataStr)
    setChatbotId(userData.chatbotId)

    // Get chatbot name from localStorage if available
    const storedChatbotName = localStorage.getItem("chatbotName")
    if (storedChatbotName) {
      setChatbotName(storedChatbotName)
    }

    // Get user plan from localStorage
    if (userData.selected_plan) {
      setUserPlan(userData.selected_plan)
    }
  }, [router])

  // Fetch user plan from database if not available in localStorage
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!chatbotId) return

      try {
        const { data, error } = await supabase
          .from("credentials")
          .select("selected_plan")
          .eq("chatbot_id", chatbotId)
          .single()

        if (error) {
          console.error("Error fetching user plan:", error)
          return
        }

        if (data && data.selected_plan) {
          setUserPlan(data.selected_plan)

          // Update localStorage with the latest plan
          const userDataStr = localStorage.getItem("userData")
          if (userDataStr) {
            const userData = JSON.parse(userDataStr)
            userData.selected_plan = data.selected_plan
            localStorage.setItem("userData", JSON.stringify(userData))
          }
        }
      } catch (error) {
        console.error("Failed to fetch user plan:", error)
      }
    }

    fetchUserPlan()
  }, [chatbotId])

  const fetchData = async (period: string) => {
    if (!chatbotId) return

    setLoading(true)
    setError(null)
    setInsightsData(null)
    setConversations([])
    setPlots([])
    setUnansweredQueries([])
    setTotalUnansweredCount(0)

    try {
      let foundDate = null
      let foundInsights = null
      const today = new Date()

      // Try to find records for up to 3 days in the past
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const checkDateStr = checkDate.toISOString().split("T")[0]

        const { data: checkInsights, error: checkInsightsError } = await supabase
          .from("insights")
          .select("*")
          .eq("chatbot_id", chatbotId)
          .eq("date_of_convo", checkDateStr)
          .eq("period_range", period)
          .maybeSingle()

        if (checkInsightsError) throw checkInsightsError

        if (checkInsights) {
          foundDate = checkDate
          foundInsights = checkInsights
          break
        }
      }

      if (!foundDate || !foundInsights) {
        // No records found within 3 days, keep dashboard blank
        setLoading(false)
        return
      }

      const yesterdayDate = new Date(foundDate)
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
      const yesterdayDateStr = yesterdayDate.toISOString().split("T")[0]

      // Fetch yesterday's insights
      const { data: yesterdayInsights, error: yesterdayInsightsError } = await supabase
        .from("insights")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .eq("date_of_convo", yesterdayDateStr)
        .eq("period_range", period)
        .maybeSingle()

      if (yesterdayInsightsError) throw yesterdayInsightsError

      const totalMessagesToday =
        (foundInsights.total_user_queries || 0) + (foundInsights.total_assistant_responses || 0)
      const totalMessagesYesterday =
        (yesterdayInsights?.total_user_queries || 0) + (yesterdayInsights?.total_assistant_responses || 0)

      setInsightsData({
        date_of_convo: foundDate.toISOString().split("T")[0],
        total_conversations: foundInsights.total_conversations || 0,
        total_user_queries: foundInsights.total_user_queries || 0,
        total_assistant_responses: foundInsights.total_assistant_responses || 0,
        yesterday_total_conversations: yesterdayInsights?.total_conversations || 0,
        yesterday_total_user_queries: yesterdayInsights?.total_user_queries || 0,
        yesterday_total_assistant_responses: yesterdayInsights?.total_assistant_responses || 0,
        conversations_change: calculatePercentageChange(
          foundInsights.total_conversations || 0,
          yesterdayInsights?.total_conversations || 0,
        ),
        user_queries_change: calculatePercentageChange(
          foundInsights.total_user_queries || 0,
          yesterdayInsights?.total_user_queries || 0,
        ),
        assistant_responses_change: calculatePercentageChange(
          foundInsights.total_assistant_responses || 0,
          yesterdayInsights?.total_assistant_responses || 0,
        ),
        // Add these new properties
        total_messages: totalMessagesToday,
        yesterday_total_messages: totalMessagesYesterday,
        messages_change: calculatePercentageChange(totalMessagesToday, totalMessagesYesterday),
      })

      // Process unanswered queries if they exist in the insights data
      if (foundInsights.unanswered_queries) {
        try {
          const unansweredData =
            typeof foundInsights.unanswered_queries === "string"
              ? JSON.parse(foundInsights.unanswered_queries)
              : foundInsights.unanswered_queries

          if (unansweredData && unansweredData.queries) {
            const queriesArray = Object.entries(unansweredData.queries).map(([query, frequency]) => ({
              query,
              frequency: frequency as number,
            }))

            // Sort by frequency (highest first)
            queriesArray.sort((a, b) => b.frequency - a.frequency)

            setUnansweredQueries(queriesArray)
            setTotalUnansweredCount(unansweredData.total_count || queriesArray.length)
          } else {
            setUnansweredQueries([])
            setTotalUnansweredCount(0)
          }
        } catch (error) {
          console.error("Error parsing unanswered queries:", error)
          setUnansweredQueries([])
          setTotalUnansweredCount(0)
        }
      } else {
        setUnansweredQueries([])
        setTotalUnansweredCount(0)
      }

      // Process top 10 queries if they exist in the insights data
      if (foundInsights.top_user_queries) {
        try {
          const top10Data =
            typeof foundInsights.top_user_queries === "string"
              ? JSON.parse(foundInsights.top_user_queries)
              : foundInsights.top_user_queries

          if (top10Data && top10Data.queries) {
            const queriesArray = Object.entries(top10Data.queries).map(([query, frequency]) => ({
              query,
              frequency: frequency as number,
            }))

            // Sort by frequency (highest first)
            queriesArray.sort((a, b) => b.frequency - a.frequency)

            setTop10Queries(queriesArray)
          } else {
            setTop10Queries([])
          }
        } catch (error) {
          console.error("Error parsing top 10 queries:", error)
          setTop10Queries([])
        }
      } else {
        setTop10Queries([])
      }

      // Fetch conversation dates and messages
      const { data: conversationData, error: conversationError } = await supabase
        .from("testing_zaps2")
        .select("date_of_convo, messages")
        .eq("chatbot_id", chatbotId)
        .order("date_of_convo", { ascending: false })

      if (conversationError) throw conversationError

      if (conversationData) {
        setConversations(conversationData)
      }

      // Fetch plots
      const { data: plotFiles, error: plotsError } = await supabase.storage
        .from("plots")
        .list(`${chatbotId}/${foundDate.toISOString().split("T")[0]}/${period}`)

      if (plotsError) throw plotsError

      if (plotFiles && plotFiles.length > 0) {
        const plotUrls = plotFiles.map(
          (file) =>
            supabase.storage
              .from("plots")
              .getPublicUrl(`${chatbotId}/${foundDate.toISOString().split("T")[0]}/${period}/${file.name}`).data
              .publicUrl,
        )
        setPlots(plotUrls)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch data")
      setInsightsData(null)
      setConversations([])
      setPlots([])
    } finally {
      setLoading(false)
    }
  }

  const fetchLeads = async () => {
    if (!chatbotId) return

    try {
      const { data, error } = await supabase
        .from("collected_leads")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .or("email.neq.000,phone.neq.000")
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data) {
        // Process leads to remove duplicates
        const uniqueLeads = data.reduce((acc: Lead[], lead) => {
          // Check if lead with same email or phone already exists
          const isDuplicate = acc.some(
            (existingLead) =>
              (lead.email !== "000" && lead.email === existingLead.email) ||
              (lead.phone !== "000" && lead.phone === existingLead.phone),
          )

          if (!isDuplicate) {
            acc.push(lead)
          }
          return acc
        }, [])

        setLeads(uniqueLeads)
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
    }
  }

  useEffect(() => {
    if (chatbotId) {
      fetchData("0")
      fetchLeads()
    }
  }, [chatbotId])

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value)
    fetchData(value)
  }

  useEffect(() => {
    const fetchTotalChats = async () => {
      if (!chatbotId) return

      try {
        const { data, error } = await supabase
          .from("credentials")
          .select("total_chats")
          .eq("chatbot_id", chatbotId)
          .single()

        if (error) {
          console.error("Error fetching total chats:", error)
          return
        }

        if (data && data.total_chats !== null) {
          setTotalChats(data.total_chats)
        }
      } catch (error) {
        console.error("Failed to fetch total chats:", error)
      }
    }

    fetchTotalChats()
  }, [chatbotId])

  // Function to handle PDF generation and download
  const handleExportData = async () => {
    if (!insightsData || generatingPDF) return

    try {
      setGeneratingPDF(true)
      toast.info("Generating PDF report, please wait...")

      // Ensure all images are loaded before generating PDF
      if (plots.length > 0) {
        toast.info("Processing visualization images...", { duration: 2000 })
      }

      // Generate the PDF using the utility function
      const pdfBlob = await generateInsightsPDF(
        chatbotName,
        chatbotId, // Pass chatbotId
        insightsData,
        unansweredQueries,
        totalUnansweredCount,
        plots,
        top10Queries, // Pass top10Queries
        leads, // Pass leads
        userPlan, // Pass userPlan
        totalChats, // Pass totalChats
      )

      // Create a download link for the PDF
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${chatbotName.replace(/\s+/g, "-")}-insights-report-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("PDF report generated successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF report")
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (!chatbotId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Log userPlan and totalChats for debugging
  console.log("Dashboard - Current userPlan:", userPlan)
  console.log("Dashboard - Current totalChats:", totalChats)

  return (
    <div className="flex h-screen flex-col">
      <ChatbotHeader currentPage="Dashboard" />
      <div className="flex flex-1 overflow-hidden">
        <ChatbotSidebar activeSection="analytics" />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <div
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
              style={{ borderColor: primaryColor, borderWidth: "1px" }}
            >
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold mt-6" style={{ color: INSIGHT_COLORS.heading }}>
                  Dashboard
                </h2>
                <Button
                  onClick={handleExportData}
                  disabled={generatingPDF || loading || !insightsData}
                  className="flex items-center gap-2"
                >
                  {generatingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="w-full hover:shadow-lg transition-all duration-200">
                  <CardHeader className="py-2">
                    <CardTitle className="text-base" style={{ color: INSIGHT_COLORS.heading }}>
                      Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                      <SelectTrigger className="w-full text-base" style={{ borderColor: primaryColor }}>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                {!loading && !error && insightsData && (
                  <>
                    {/* Total Conversations Card - Moved to first position */}
                    <InsightCard
                      title="Total Conversations"
                      value={insightsData.total_conversations}
                      previousValue={insightsData.yesterday_total_conversations}
                      icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
                      description="from last month"
                    />

                    {/* Total Messages Card - Moved to second position */}
                    <InsightCard
                      title="Total Messages"
                      value={insightsData.total_messages}
                      previousValue={insightsData.yesterday_total_messages}
                      icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
                      description="from last month"
                    />

                    {/* Total User Queries Card */}
                    <InsightCard
                      title="Total User Queries"
                      value={insightsData.total_user_queries}
                      previousValue={insightsData.yesterday_total_user_queries}
                      icon={<Users className="h-4 w-4 text-muted-foreground" />}
                      description="from last month"
                    />

                    {/* Total Assistant Responses Card */}
                    <InsightCard
                      title="Total Assistant Responses"
                      value={insightsData.total_assistant_responses}
                      previousValue={insightsData.yesterday_total_assistant_responses}
                      icon={<Bot className="h-4 w-4 text-muted-foreground" />}
                      description="from last month"
                    />
                  </>
                )}
              </div>
            </div>

            {!loading && !error && insightsData && (
              <div className="mt-6">
                <Card className="w-full" style={{ borderColor: secondaryColor, borderWidth: "1px" }}>
                  <CardHeader className="py-2">
                    <CardTitle className="text-base" style={{ color: INSIGHT_COLORS.heading }}>
                      Monthly Conversation Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Check if user is on Pro or Advanced plan
                      const isUnlimitedPlan = false

                      // Set limit based on plan (only for Basic)
                      const limit =
                        userPlan === "Free Plan"
                          ? 50
                          : userPlan === "Basic"
                            ? 200
                            : userPlan === "Pro"
                              ? 1500
                              : userPlan === "Advanced"
                                ? 4000
                                : Number.POSITIVE_INFINITY

                      // Calculate percentage used (only for Basic)
                      let percentageUsed = 0
                      if (userPlan === "Free Plan" || userPlan === "Basic") {
                        percentageUsed = Math.min(Math.round((totalChats / limit) * 100), 100)
                      } else {
                        // For Pro/Advanced, just show a static progress bar (no percentage)
                        percentageUsed = Math.min(Math.round((totalChats / limit) * 100), 100) // Static value for visual indication only
                      }

                      // Determine color based on usage (only for Basic plan)
                      let progressColor = "#4F46E5" // Default indigo color
                      let textColor = "#4F46E5"

                      if (userPlan === "Free Plan" || userPlan === "Basic") {
                        if (percentageUsed >= 90) {
                          progressColor = "rgb(239, 68, 68)"
                          textColor = "rgb(185, 28, 28)"
                        } else if (percentageUsed >= 75) {
                          progressColor = "rgb(245, 158, 11)"
                          textColor = "rgb(180, 83, 9)"
                        }
                      }

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            {isUnlimitedPlan ? (
                              // For Pro/Advanced users, only show total conversations
                              <span className="text-sm font-medium">{totalChats} total conversations this month</span>
                            ) : (
                              // For Basic, show limit and remaining
                              <>
                                <span className="text-sm font-medium">
                                  {totalChats} / {limit} conversations
                                </span>
                                <span className="text-sm font-bold" style={{ color: textColor }}>
                                  {limit - totalChats} remaining
                                </span>
                              </>
                            )}
                          </div>

                          {isUnlimitedPlan ? (
                            // For Pro/Advanced, show a simple progress indicator without percentage
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${percentageUsed}%` }}
                              ></div>
                            </div>
                          ) : (
                            // For Basic, show the regular progress bar
                            <Progress
                              value={percentageUsed}
                              className="h-2 w-full"
                              indicatorClassName="transition-all duration-300"
                              style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                              indicatorStyle={{ backgroundColor: progressColor }}
                            />
                          )}

                          <p className="text-xs text-gray-500 mt-1">
                            {userPlan === "Free Plan"
                              ? "Free Plan: 50 conversations/month"
                              : userPlan === "Basic"
                                ? "Basic Plan: 200 conversations/month"
                                : userPlan === "Pro"
                                  ? "Pro Plan: 1500 conversations/month"
                                  : "Advanced Plan: 4000 conversations/month"}
                          </p>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}

            {!loading && !error && (!insightsData || (!conversations.length && plots.length === 0)) && (
              <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg mt-8">
                <p className="text-lg font-semibold">No data available now!</p>
                <p className="text-base text-gray-600 dark:text-gray-400 mt-2">Check back later for updates.</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div
                  className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: primaryColor }}
                ></div>
                <p className="mt-2 text-base">Loading data...</p>
              </div>
            )}

            {plots.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4" style={{ color: INSIGHT_COLORS.heading }}>
                  Analytics Visualizations
                </h2>
                <div
                  className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
                  style={{ borderColor: primaryColor, borderWidth: "1px" }}
                  ref={plotsContainerRef}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    {plots.map((plot, index) => {
                      const plotName = decodeURIComponent(plot.split("/").pop()?.split(".")[0] || `Plot ${index + 1}`)
                      return (
                        <Card key={index} className="overflow-hidden flex flex-col h-[300px] sm:h-[400px] lg:h-[500px]">
                          <CardContent className="p-4 flex-grow flex flex-col justify-between">
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="relative flex-grow cursor-pointer hover:opacity-90 transition-opacity mb-4 plot-image-container">
                                  <Image
                                    src={plot || "/placeholder.svg"}
                                    alt={plotName}
                                    fill
                                    className="object-contain plot-image"
                                    crossOrigin="anonymous"
                                  />
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-5xl w-full p-0">
                                <div className="relative aspect-[16/9]">
                                  <Image
                                    src={plot || "/placeholder.svg"}
                                    alt={plotName}
                                    fill
                                    className="object-contain"
                                    crossOrigin="anonymous"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">{plotName}</div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
            {!loading && !error && unansweredQueries.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4" style={{ color: INSIGHT_COLORS.heading }}>
                  Unanswered Queries
                </h2>
                <Card style={{ borderColor: secondaryColor, borderWidth: "1px" }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle style={{ color: INSIGHT_COLORS.heading }}>
                        Queries Your Chatbot Couldn't Answer
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">Total: {totalUnansweredCount}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {unansweredQueries.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center"
                          >
                            <div className="font-medium">{item.query}</div>
                            <div
                              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${INSIGHT_COLORS.conversations}20`,
                                color: INSIGHT_COLORS.conversations,
                              }}
                            >
                              {item.frequency} {item.frequency === 1 ? "time" : "times"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
            {!loading && !error && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4" style={{ color: INSIGHT_COLORS.heading }}>
                  Collected Leads
                </h2>
                <LeadsDisplay leads={leads} title="Customer Leads" maxHeight="500px" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
