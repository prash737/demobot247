"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Download, MessageSquare, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@supabase/supabase-js"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export interface Lead {
  id: number
  created_at: string
  chatbot_id: string
  name: string
  email: string
  phone: string
  session_id: string | null
}

interface LeadsDisplayProps {
  leads: Lead[]
  title?: string
  exportEnabled?: boolean
  maxHeight?: string
  isCollapsible?: boolean
}

export default function LeadsDisplay({
  leads,
  title = "Collected Leads",
  exportEnabled = true,
  maxHeight = "400px",
  isCollapsible = false,
}: LeadsDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(!isCollapsible)

  const [selectedConversation, setSelectedConversation] = useState<{
    messages: { role: "user" | "assistant"; content: string }[]
    date: string
  } | null>(null)
  const [conversationModalOpen, setConversationModalOpen] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState(false)

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Date Collected"]
    const csvRows = [headers]

    leads.forEach((lead) => {
      const row = [
        lead.name !== "000" ? lead.name : "",
        lead.email !== "000" ? lead.email : "",
        lead.phone !== "000" ? lead.phone : "",
        new Date(lead.created_at).toLocaleString(),
      ]
      csvRows.push(row)
    })

    const csvContent = csvRows.map((row) => row.join(",")).join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `leads-export-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const fetchConversation = async (sessionId: string) => {
    setLoadingConversation(true)
    try {
      const supabase = createClient(
        "https://zsivtypgrrcttzhtfjsf.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
      )

      const { data, error } = await supabase
        .from("testing_zaps2")
        .select("messages, date_of_convo")
        .eq("session_id", sessionId)
        .single()

      if (error) {
        console.error("Error fetching conversation:", error)
        return
      }

      if (data) {
        setSelectedConversation({
          messages: data.messages || [],
          date: data.date_of_convo,
        })
        setConversationModalOpen(true)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoadingConversation(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        {isCollapsible ? (
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <CardTitle>{title}</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">{leads.length} leads</span>
          </Button>
        ) : (
          <div className="flex justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <span className="text-sm text-muted-foreground">{leads.length} leads</span>
          </div>
        )}
      </CardHeader>

      {(!isCollapsible || isExpanded) && (
        <CardContent>
          {exportEnabled && leads.length > 0 && (
            <Button variant="outline" size="sm" className="mb-4 flex items-center gap-2" onClick={exportToCSV}>
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          )}

          <ScrollArea className="h-[400px]" style={{ maxHeight: maxHeight }}>
            {leads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Session ID</th>
                      <th className="px-4 py-2 text-left">Conversation</th>
                      <th className="px-4 py-2 text-left">Collected Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-4 py-3">{lead.name !== "000" ? lead.name : "-"}</td>
                        <td className="px-4 py-3">{lead.email !== "000" ? lead.email : "-"}</td>
                        <td className="px-4 py-3">{lead.phone !== "000" ? lead.phone : "-"}</td>
                        <td className="px-4 py-3 text-sm">
                          {lead.session_id ? (
                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {lead.session_id.substring(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-gray-400">null</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!lead.session_id || loadingConversation}
                            onClick={() => lead.session_id && fetchConversation(lead.session_id)}
                            className="flex items-center gap-2"
                          >
                            {loadingConversation ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <MessageSquare className="h-3 w-3" />
                            )}
                            View Conversation
                          </Button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(lead.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500">No leads collected yet</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      )}
      <Dialog open={conversationModalOpen} onOpenChange={setConversationModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Conversation Details</DialogTitle>
            {selectedConversation && (
              <p className="text-sm text-gray-500">Date: {new Date(selectedConversation.date).toLocaleDateString()}</p>
            )}
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {selectedConversation && selectedConversation.messages.length > 0 ? (
              <div className="space-y-4">
                {selectedConversation.messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "assistant"
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      <div className="text-xs font-medium mb-1 opacity-70">
                        {message.role === "assistant" ? "Assistant" : "User"}
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages found in this conversation</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
