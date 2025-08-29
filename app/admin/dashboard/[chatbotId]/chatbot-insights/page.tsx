"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft } from "lucide-react"
import { generateInsightsPDF } from "@/app/utils/pdf-generator"
import LeadsDisplay, { type Lead } from "@/app/components/leads-display"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

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
  total_messages: number
  yesterday_total_messages: number
  messages_change: number
}

const periodOptions = [
  { value: "0", label: "Overall till now" },
  { value: "2", label: "Last 2 days" },
  { value: "7", label: "Last 7 days" },
  { value: "10", label: "Last 10 days" },
  { value: "15", label: "Last 15 days" },
]

export default function ChatbotInsightsPage({ params }: { params: { chatbotId: string } }) {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [plots, setPlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("0")
  const [chatbotName, setChatbotName] = useState<string | null>(null)
  const [unansweredQueries, setUnansweredQueries] = useState<{ query: string; frequency: number }[]>([])
  const [totalUnansweredCount, setTotalUnansweredCount] = useState<number>(0)
  const [top10Queries, setTop10Queries] = useState<{ query: string; frequency: number }[]>([])
  const [totalChats, setTotalChats] = useState<number>(0)
  const [leads, setLeads] = useState<Lead[]>([])
  const router = useRouter()
  const chatbotId = params.chatbotId
  const [userPlan, setUserPlan] = useState("Basic")

  useEffect(() => {
    if (chatbotId) {
      fetchData("0")
      fetchChatbotName()
      fetchTotalChats()
      fetchLeads()
      fetchUserPlan()
    }
  }, [chatbotId])

  const fetchChatbotName = async () => {
    try {
      const { data, error } = await supabase
        .from("credentials")
        .select("chatbot_name")
        .eq("chatbot_id", chatbotId)
        .single()

      if (error) throw error

      if (data && data.chatbot_name) {
        setChatbotName(data.chatbot_name)
      }
    } catch (error) {
      console.error("Error fetching chatbot name:", error)
    }
  }

  const fetchTotalChats = async () => {
    try {
      const { data, error } = await supabase
        .from("credentials")
        .select("total_chats")
        .eq("chatbot_id", chatbotId)
        .single()

      if (error) throw error

      if (data && data.total_chats !== null) {
        setTotalChats(data.total_chats)
      }
    } catch (error) {
      console.error("Failed to fetch total chats:", error)
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
        const uniqueLeads = data.reduce((acc: Lead[], lead) => {
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

  const fetchData = async (period: string) => {
    if (!chatbotId) return

    setLoading(true)
    setError(null)
    setInsights(null)
    setPlots([])
    setUnansweredQueries([])
    setTotalUnansweredCount(0)
    setTop10Queries([])

    try {
      let foundDate = null
      let foundInsights = null
      const today = new Date()

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
        setLoading(false)
        return
      }

      const yesterdayDate = new Date(foundDate)
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
      const yesterdayDateStr = yesterdayDate.toISOString().split("T")[0]

      const { data: yesterdayInsights, error: yesterdayInsightsError } = await supabase
        .from("insights")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .eq("date_of_convo", yesterdayDateStr)
        .eq("period_range", period)
        .maybeSingle()

      if (yesterdayInsightsError) throw yesterdayInsightsError

      const calculatePercentageChange = (today: number, yesterday: number) => {
        if (yesterday === 0) return today > 0 ? 100 : 0
        return ((today - yesterday) / yesterday) * 100
      }

      setInsights({
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
        total_messages: (foundInsights.total_user_queries || 0) + (foundInsights.total_assistant_responses || 0),
        yesterday_total_messages:
          (yesterdayInsights?.total_user_queries || 0) + (yesterdayInsights?.total_assistant_responses || 0),
        messages_change: calculatePercentageChange(
          (foundInsights.total_user_queries || 0) + (foundInsights.total_assistant_responses || 0),
          (yesterdayInsights?.total_user_queries || 0) + (yesterdayInsights?.total_assistant_responses || 0),
        ),
      })

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
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value)
    fetchData(value)
  }

  const fetchUserPlan = async () => {
    try {
      const { data, error } = await supabase
        .from("credentials")
        .select("selected_plan")
        .eq("chatbot_id", chatbotId)
        .single()

      if (error) throw error
      if (data && data.selected_plan) {
        setUserPlan(data.selected_plan)
      }
    } catch (error) {
      console.error("Error fetching user plan:", error)
    }
  }

  const handleExportData = async () => {
    try {
      if (!insights || !chatbotName) {
        alert("No data available to export")
        return
      }

      setLoading(true)

      // Pass all relevant data to the PDF generator
      const pdfBlob = await generateInsightsPDF(
        chatbotName,
        chatbotId, // Pass chatbotId for user details
        insights,
        unansweredQueries,
        totalUnansweredCount,
        plots,
        top10Queries, // Pass top10Queries
        leads, // Pass leads
        userPlan, // Pass userPlan for usage meter
        totalChats, // Pass totalChats for usage meter
      )

      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${chatbotName.replace(/\s+/g, "-").toLowerCase()}-insights-report-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Failed to export data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <div className="flex gap-4 mb-4">
          <Button variant="outline" onClick={() => router.push("/admin")} className="flex items-center gap-2">
            Back to Admin Dashboard
          </Button>
          <Button
            onClick={() => router.push(`/admin/account/${chatbotId}/chatbot-details`)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Chatbot Details
          </Button>
        </div>
        <h1 className="text-2xl font-bold mb-4">
          Chatbot Insights Dashboard: {chatbotName ? chatbotName : `ID: ${chatbotId}`}
        </h1>

        {/* Key Metrics Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="w-full">
              <CardHeader className="py-2">
                <CardTitle className="text-base">Period</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-full text-base">
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
            {!loading && !error && insights && (
              <>
                <Card className="w-full">
                  <CardHeader className="py-2">
                    <CardTitle className="text-base">Total Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg font-bold text-blue-600">{insights.total_messages}</p>
                      {insights.messages_change !== 0 && (
                        <div
                          className={`flex items-center ${
                            insights.messages_change > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {insights.messages_change > 0 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span className="text-base font-semibold">
                            {Math.abs(insights.messages_change).toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader className="py-2">
                    <CardTitle className="text-base">Total User Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg font-bold text-green-600">{insights.total_user_queries}</p>
                      {insights.user_queries_change !== 0 && (
                        <div
                          className={`flex items-center ${
                            insights.user_queries_change > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {insights.user_queries_change > 0 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span className="text-base font-semibold">
                            {Math.abs(insights.user_queries_change).toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader className="py-2">
                    <CardTitle className="text-base">Total Assistant Responses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg font-bold text-orange-600">{insights.total_assistant_responses}</p>
                      {insights.assistant_responses_change !== 0 && (
                        <div
                          className={`flex items-center ${
                            insights.assistant_responses_change > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {insights.assistant_responses_change > 0 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span className="text-base font-semibold">
                            {Math.abs(insights.assistant_responses_change).toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Usage Meter */}
        <div className="mt-6 mb-8">
          <Card className="w-full">
            <CardHeader className="py-2">
              <CardTitle className="text-base">Monthly Conversation Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const isUnlimitedPlan = false

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

                let percentageUsed = 0
                if (userPlan === "Free Plan" || userPlan === "Basic") {
                  percentageUsed = Math.min(Math.round((totalChats / limit) * 100), 100)
                } else {
                  percentageUsed = Math.min(Math.round((totalChats / limit) * 100), 100)
                }

                let progressColor = "#4F46E5"
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
                        <span className="text-sm font-medium">{totalChats} total conversations this month</span>
                      ) : (
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
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${percentageUsed}%` }}
                        ></div>
                      </div>
                    ) : (
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

        {!loading && !error && (!insights || plots.length === 0) && (
          <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-lg font-semibold">No insights available now!</p>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-2">Check back later for updates.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <p className="mt-2 text-base">Loading data...</p>
          </div>
        )}

        {/* Visualizations Section */}
        {plots.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Analytics Visualizations</h2>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {plots.map((plot, index) => {
                  const plotName = decodeURIComponent(plot.split("/").pop()?.split(".")[0] || `Plot ${index + 1}`)
                  return (
                    <Card key={index} className="overflow-hidden flex flex-col h-[300px] sm:h-[400px] lg:h-[500px]">
                      <CardContent className="p-4 flex-grow flex flex-col justify-between">
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative aspect-[16/9] cursor-pointer hover:opacity-90 transition-opacity mb-4 plot-image-container">
                              <Image src={plot || "/placeholder.svg"} alt={plotName} fill className="object-contain" />
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl w-full p-0">
                            <div className="relative aspect-[16/9]">
                              <Image src={plot || "/placeholder.svg"} alt={plotName} fill className="object-contain" />
                            </div>
                          </DialogContent>
                        </Dialog>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{plotName}</div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Unanswered Queries Section */}
        {!loading && !error && unansweredQueries.length > 0 && (
          <div className="mt-8 mb-8">
            <h2 className="text-lg font-semibold mb-4">Unanswered Queries</h2>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Queries This Chatbot Couldn't Answer</CardTitle>
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
                        <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
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

        {/* Top 10 User Queries Section */}
        {!loading && !error && top10Queries.length > 0 && (
          <div className="mt-8 mb-8">
            <h2 className="text-lg font-semibold mb-4">Top 10 User Queries</h2>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Most Frequently Asked Questions</CardTitle>
                  <div className="text-sm text-muted-foreground">Total: {top10Queries.length}</div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {top10Queries.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center"
                      >
                        <div className="font-medium">{item.query}</div>
                        <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
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

        {/* Leads Section */}
        <div className="mt-8 mb-8">
          <h2 className="text-lg font-semibold mb-4">Collected Leads</h2>
          <Card>
            <CardContent className="p-6">
              <LeadsDisplay leads={leads} title={`Leads for ${chatbotName || chatbotId}`} maxHeight="500px" />
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Manage Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => router.push(`/admin/account/${chatbotId}/chatbot-details`)}>
                    Edit Chatbot Details
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => router.push(`/admin/dashboard/${chatbotId}`)}
                  >
                    View Conversations
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => router.push(`/admin/account/${chatbotId}/billing`)}>
                    Manage Billing
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => router.push(`/admin/account/${chatbotId}`)}
                  >
                    Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Support Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleExportData}
                    disabled={loading || !insights}
                  >
                    {loading ? "Generating..." : "Export Data"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
