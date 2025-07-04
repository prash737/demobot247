"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ChatbotLeads, Lead } from "./types"

interface LeadsDisplayProps {
  chatbotLeads: ChatbotLeads[]
}

export default function LeadsDisplay({ chatbotLeads }: LeadsDisplayProps) {
  const [expandedChatbots, setExpandedChatbots] = useState<Set<string>>(new Set())

  const toggleChatbot = (chatbotId: string) => {
    const newExpanded = new Set(expandedChatbots)
    if (newExpanded.has(chatbotId)) {
      newExpanded.delete(chatbotId)
    } else {
      newExpanded.add(chatbotId)
    }
    setExpandedChatbots(newExpanded)
  }

  return (
    <div className="space-y-3">
      {chatbotLeads.map(({ chatbot_id, leads }) => (
        <Card key={chatbot_id} className="overflow-hidden border border-gray-200 shadow-sm bg-white">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 text-left h-auto rounded-none"
            onClick={() => toggleChatbot(chatbot_id)}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {expandedChatbots.has(chatbot_id) ? (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-gray-900 text-base">Chatbot: {chatbot_id}</span>
                <span className="text-sm text-gray-500">Click to view details</span>
              </div>
            </div>
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              <span className="text-sm font-medium">{leads.length} leads</span>
            </div>
          </Button>

          {expandedChatbots.has(chatbot_id) && (
            <CardContent className="pt-0 pb-6 px-6 border-t border-gray-100">
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-full">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                          Collected Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {leads.map((lead: Lead, index: number) => (
                        <tr
                          key={lead.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index !== leads.length - 1 ? "border-b border-gray-100" : ""
                          }`}
                        >
                          <td className="px-4 py-4 text-sm text-gray-900">{lead.name !== "000" ? lead.name : "-"}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{lead.email !== "000" ? lead.email : "-"}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{lead.phone !== "000" ? lead.phone : "-"}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {new Date(lead.created_at).toLocaleDateString()} at{" "}
                            {new Date(lead.created_at).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {chatbotLeads.length === 0 && (
        <Card className="p-12 text-center bg-white border border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600">Leads will appear here once customers interact with your chatbots</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
