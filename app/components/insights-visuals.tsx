"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface InsightsVisualsProps {
  data: {
    total_conversations: number
    total_user_queries: number
    total_assistant_responses: number
  }
}

export function InsightsVisuals({ data }: InsightsVisualsProps) {
  const chartData = {
    labels: ["Total Conversations", "Total User Queries", "Total Assistant Responses"],
    datasets: [
      {
        label: "Count",
        data: [data.total_conversations, data.total_user_queries, data.total_assistant_responses],
        backgroundColor: ["rgba(53, 162, 235, 0.5)", "rgba(75, 192, 192, 0.5)", "rgba(255, 159, 64, 0.5)"],
        borderColor: ["rgb(53, 162, 235)", "rgb(75, 192, 192)", "rgb(255, 159, 64)"],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chatbot Insights Overview",
      },
    },
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{data.total_conversations.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total User Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">{data.total_user_queries.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Assistant Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">{data.total_assistant_responses.toLocaleString()}</div>
        </CardContent>
      </Card>
      <div className="md:col-span-3">
        <Card>
          <CardContent className="pt-6">
            <Bar data={chartData} options={options} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
