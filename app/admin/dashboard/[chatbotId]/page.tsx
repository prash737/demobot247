"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConversationDisplay } from "@/app/components/conversation-display"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import LeadsDisplay, { type Lead } from "@/app/components/leads-display"
import { AdminHeader } from "@/app/components/admin-header"

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
}

const periodOptions = [
  { value: "0", label: "Overall till now" },
  { value: "2", label: "Last 2 days" },
  { value: "7", label: "Last 7 days" },
  { value: "10", label: "Last 10 days" },
]

export default function AdminDashboardPage({ params }: { params: { chatbotId: string } }) {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [conversations, setConversations] = useState<{ date_of_conversation: string; conversation_count: number }[]>([])
  const [plots, setPlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("0")
  const [selectedConversation, setSelectedConversation] = useState<{
    date: string
    count: number
    messages: { role: "user" | "assistant"; content: string }[]
  } | null>(null)
  const [chatbotName, setChatbotName] = useState<string | null>(null)
  const router = useRouter()
  const chatbotId = params.chatbotId
  const [leads, setLeads] = useState<Lead[]>([])
  const [top10Queries, setTop10Queries] = useState<{ query: string; frequency: number }[]>([])

  useEffect(() => {
    if (chatbotId) {
      fetchData("0")
      fetchChatbotName()
      fetchLeads()
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

  const fetchData = async (period: string) => {
    if (!chatbotId) return

    setLoading(true)
    setError(null)
    setInsights(null)
    setConversations([])
    setPlots([])

    try {
      let foundDate = null
      let foundInsights = null
      const today = new Date()

      // Try to find records for up to 3 days in the past
      for (let i = 0; i < 3; i++) {
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

      // Fetch yesterday's insights
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
      })

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

      // Fetch conversation dates and counts
      const { data: conversationSummary, error: conversationSummaryError } = await supabase
        .from("display_conversations")
        .select("date_of_conversation, conversation_count")
        .eq("chatbot_id", chatbotId)
        .order("date_of_conversation", { ascending: false })

      if (conversationSummaryError) throw conversationSummaryError

      if (conversationSummary) {
        setConversations(conversationSummary)
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
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value)
    fetchData(value)
  }

  const handleConversationSelect = (
    date: string,
    count: number,
    messages: { role: "user" | "assistant"; content: string }[],
  ) => {
    setSelectedConversation({ date, count, messages })
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <AdminHeader
          title={`Dashboard - ${chatbotName ? chatbotName : `ID: ${chatbotId}`}`}
          description="View chatbot analytics, conversations, and performance metrics"
          showBackButton={true}
          backButtonText="Back to Admin Dashboard"
          backButtonHref="/admin"
        />
        <div className="mb-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4 mt-6">Insights Dashboard</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="w-full">
              <CardHeader className="py-2">
                <CardTitle className="text-base">Chatbot Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <strong>Name:</strong> {chatbotName || "N/A"}
                </p>
                <p className="text-sm">
                  <strong>ID:</strong> {chatbotId}
                </p>
              </CardContent>
            </Card>
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
                    <CardTitle className="text-base">Total Conversations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg font-bold text-blue-600">{insights.total_conversations}</p>
                      {insights.conversations_change !== 0 && (
                        <div
                          className={`flex items-center ${
                            insights.conversations_change > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {insights.conversations_change > 0 ? (
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
                            {Math.abs(insights.conversations_change).toFixed(2)}%
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

        {!loading && !error && (!insights || (!conversations.length && plots.length === 0)) && (
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

        {!loading && !error && insights && conversations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="h-[calc(60vh)] lg:h-[calc(100vh-20rem)] overflow-hidden">
              {conversations.length > 0 ? (
                <ConversationDisplay
                  conversations={conversations}
                  chatbotId={chatbotId}
                  onConversationSelect={handleConversationSelect}
                />
              ) : (
                <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg h-full flex items-center justify-center">
                  <div>
                    <p className="text-lg font-semibold mb-2">No conversations found</p>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      There are no conversations available for the selected period.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="h-[calc(60vh)] lg:h-[calc(100vh-20rem)] overflow-hidden">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{selectedConversation ? "Conversation Preview" : "Chat Preview"}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                  <ScrollArea className="h-full">
                    {selectedConversation ? (
                      <div className="space-y-4">
                        <p>
                          Date:{" "}
                          {new Date(selectedConversation.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p>Conversation: {selectedConversation.count}</p>
                        <div className="space-y-4">
                          {selectedConversation.messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`max-w-[95%] rounded-lg p-3 break-words ${
                                  message.role === "assistant"
                                    ? "bg-gray-100 dark:bg-gray-800"
                                    : "bg-blue-500 text-white"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{message.content.replace(/[*#]/g, "")}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Select a conversation to view details</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
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
                            <div className="relative flex-grow cursor-pointer hover:opacity-90 transition-opacity mb-4">
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
        {!loading && !error && top10Queries.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Top 10 User Queries</h2>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <Card>
                <CardHeader>
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
                          <div
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "rgba(16, 185, 129, 0.2)",
                              color: "#10B981",
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
          </div>
        )}
        {!loading && !error && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Collected Leads</h2>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <LeadsDisplay leads={leads} title={`Leads for ${chatbotName || chatbotId}`} maxHeight="300px" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
