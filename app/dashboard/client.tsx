"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InsightsVisuals } from "@/components/insights-visuals"
import { PlotGallery } from "@/components/plot-gallery"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export function DashboardClient() {
  const [insights, setInsights] = useState<any>(null)
  const [plots, setPlots] = useState<string[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("0")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const periods = [
    { value: "0", label: "All Time" },
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const storedData = localStorage.getItem("userData")
        if (!storedData) {
          throw new Error("User data not found")
        }

        const { chatbotId } = JSON.parse(storedData)

        // Fetch insights
        const { data: insightsData, error: insightsError } = await supabase
          .from("insights")
          .select("*")
          .eq("chatbot_id", chatbotId)
          .single()

        if (insightsError) throw insightsError

        setInsights(insightsData)

        // Fetch plots
        const { data: plotsData, error: plotsError } = await supabase.storage.from("plots").list(chatbotId)

        if (plotsError) throw plotsError

        const plotUrls = plotsData.map(
          (file) => supabase.storage.from("plots").getPublicUrl(`${chatbotId}/${file.name}`).data.publicUrl,
        )

        setPlots(plotUrls)

        // Fetch conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from("conversations")
          .select("*")
          .eq("chatbot_id", chatbotId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (conversationsError) throw conversationsError

        setConversations(conversationsData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {insights && <InsightsVisuals data={insights} />}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detailed Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <PlotGallery plots={plots} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversations.map((conversation, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Conversation {index + 1}</h3>
                  <p className="text-sm text-gray-600">Date: {new Date(conversation.created_at).toLocaleString()}</p>
                  <div className="mt-2 space-y-2">
                    {conversation.messages.map((message: any, msgIndex: number) => (
                      <div
                        key={msgIndex}
                        className={`p-2 rounded-lg ${message.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}
                      >
                        <p className="font-semibold">{message.role === "user" ? "User" : "Assistant"}</p>
                        <p>{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
