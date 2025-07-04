"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { StorageError } from "@supabase/storage-js"
import { AdminHeader } from "@/app/components/admin-header"
import { AdminQuickNav } from "@/app/components/admin-quick-nav"
import { AdminCard } from "@/app/components/admin-card"
import { AdminTable, StatusBadge } from "@/app/components/admin-table"
import { AdminIcon } from "@/app/components/admin-icons"
import { AdminSearch } from "@/app/components/admin-search"
import { AdminBulkActions, BulkSelectCheckbox } from "@/app/components/admin-bulk-actions"
import { WidgetConfig } from "@/app/components/admin-dashboard-widgets"
import { AdminExport, QuickExport } from "@/app/components/admin-export"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zsivtypgrrcttzhtfjsf.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

// Helper function to subtract days from a date
const subDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

interface UserData {
  created_at: string
  chatbot_id: string
  selected_plan: string | null
  selected_domain: string | null
  chatbot_status: string
  chatbot_name?: string
  payment_status?: string
  chat_limit?: string
}

interface FileData {
  name: string
  url: string
}

interface LogEntry {
  content: string
}

interface Lead {
  id: number
  created_at: string
  chatbot_id: string
  name: string
  email: string
  phone: string
}

interface ChatbotLeads {
  chatbot_id: string
  leads: Lead[]
}

interface TokenUsage {
  id: number
  created_at: string
  chatbot_id: string
  input_tokens: number
  output_tokens: number
}

interface DocumentData {
  id: number
  document_id: string
  document_name: string
  created_at: string
}

interface Widget {
  id: string
  title: string
  type: "metric" | "chart" | "list" | "progress"
  size: "small" | "medium" | "large"
  data?: any
  loading?: boolean
  error?: string
}

interface SearchFilter {
  field: string
  operator: string
  value: string
}

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Core state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data state
  const [allUsers, setAllUsers] = useState<UserData[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [chatbotLeads, setChatbotLeads] = useState<ChatbotLeads[]>([])

  // Loading states
  const [loadingAllUsers, setLoadingAllUsers] = useState(false)
  const [loadingTokenUsage, setLoadingTokenUsage] = useState(false)
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [loadingCustomerStats, setLoadingCustomerStats] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [loadingHeatmap, setLoadingHeatmap] = useState(false)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [filteredTokenUsage, setFilteredTokenUsage] = useState<TokenUsage[]>([])

  // Bulk actions state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  // Customer stats state - REAL DATA ONLY
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [todayCustomers, setTodayCustomers] = useState(0)
  const [last7DaysCustomers, setLast7DaysCustomers] = useState(0)
  const [last10DaysCustomers, setLast10DaysCustomers] = useState(0)
  const [last30DaysCustomers, setLast30DaysCustomers] = useState(0)
  const [activeCustomers, setActiveCustomers] = useState(0)
  const [totalTokensUsed, setTotalTokensUsed] = useState(0)
  const [totalLeads, setTotalLeads] = useState(0)

  // Dialog and UI state
  const [widgetConfigOpen, setWidgetConfigOpen] = useState(false)
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [userLogsDialogOpen, setUserLogsDialogOpen] = useState(false)
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false)
  const [addDocDialogOpen, setAddDocDialogOpen] = useState(false)
  const [addUrlsDialogOpen, setAddUrlsDialogOpen] = useState(false)

  // Selected data state
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [selectedUserFiles, setSelectedUserFiles] = useState<FileData[]>([])
  const [selectedUserLinks, setSelectedUserLinks] = useState<string[]>([])
  const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null)
  const [selectedChatbotDocuments, setSelectedChatbotDocuments] = useState<DocumentData[]>([])
  const [selectedLogDate, setSelectedLogDate] = useState<string | null>(null)
  const [selectedLogEntry, setSelectedLogEntry] = useState<LogEntry | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Status tracking state
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingChatbotStatus, setEditingChatbotStatus] = useState<string | null>(null)
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<string | null>(null)
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const [uploadingUrls, setUploadingUrls] = useState(false)

  // Error states
  const [userLogsError, setUserLogsError] = useState<string | null>(null)
  const [documentsError, setDocumentsError] = useState<string | null>(null)

  // Upload tracking state
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const [uploadStatus, setUploadStatus] = useState<Record<string, "success" | "error" | null>>({})

  // Misc state
  const [userLogDates, setUserLogDates] = useState<Array<any>>([])
  const [expandedChatbots, setExpandedChatbots] = useState<Set<string>>(new Set())
  const [urlsText, setUrlsText] = useState("")
  const [heatmapData, setHeatmapData] = useState<number[][]>(
    Array(7)
      .fill(0)
      .map(() => Array(24).fill(0)),
  )

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMountedRef = useRef(true)

  // Helper function for admin authentication
  const checkAdminAuth = useCallback(() => {
    try {
      const adminData = localStorage.getItem("adminData")
      if (!adminData) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the admin panel.",
          variant: "destructive",
        })
        router.push("/admin/login")
        return false
      }
      return true
    } catch (error) {
      console.error("Error checking admin auth:", error)
      toast({
        title: "Authentication Error",
        description: "An error occurred during authentication. Please try logging in again.",
        variant: "destructive",
      })
      router.push("/admin/login")
      return false
    }
  }, [router, toast])

  const handleDownload = async (chatbotId: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from("files_uploaded").download(`${chatbotId}/${fileName}`)

      if (error) throw error

      const blob = new Blob([data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      })
    }
  }

  const toggleChatbot = (chatbotId: string) => {
    const newExpanded = new Set(expandedChatbots)
    if (newExpanded.has(chatbotId)) {
      newExpanded.delete(chatbotId)
    } else {
      newExpanded.add(chatbotId)
    }
    setExpandedChatbots(newExpanded)
  }

  // Data fetching functions - REAL DATA ONLY
  const fetchAllData = useCallback(async () => {
    if (!isMountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      await Promise.all([fetchAllUsers(), fetchTokenUsage(), fetchLeads(), fetchCustomerStats(), generateHeatmapData()])
      // Initialize widgets with REAL data after fetching
      if (isMountedRef.current) {
        initializeWidgets()
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      if (isMountedRef.current) {
        setError("Failed to load dashboard data")
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        })
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [toast])

  const fetchLeads = useCallback(async () => {
    if (!checkAdminAuth() || !isMountedRef.current) return

    setLoadingLeads(true)
    try {
      const { data: leadsData, error } = await supabase
        .from("collected_leads")
        .select("*")
        .or("email.neq.000,phone.neq.000")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Process leads to remove duplicates
      const uniqueLeads = leadsData.reduce((acc: Lead[], lead: Lead) => {
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

      if (isMountedRef.current) {
        setLeads(uniqueLeads)
        setTotalLeads(uniqueLeads.length)

        // Group leads by chatbot_id
        const chatbotLeadsMap = uniqueLeads.reduce((acc: { [key: string]: Lead[] }, lead: Lead) => {
          if (!acc[lead.chatbot_id]) {
            acc[lead.chatbot_id] = []
          }
          acc[lead.chatbot_id].push(lead)
          return acc
        }, {})

        // Convert to array format for component
        const groupedLeads = Object.entries(chatbotLeadsMap).map(([chatbot_id, leads]) => ({
          chatbot_id,
          leads,
        }))

        setChatbotLeads(groupedLeads)
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to fetch leads data",
          variant: "destructive",
        })
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingLeads(false)
      }
    }
  }, [checkAdminAuth, toast])

  const fetchAllUsers = useCallback(async () => {
    if (!isMountedRef.current) return

    setLoadingAllUsers(true)
    try {
      // Fetch all users from credentials table
      const { data, error } = await supabase
        .from("credentials")
        .select("created_at, chatbot_id, selected_plan, chatbot_status, chatbot_name, payment_status, chat_limit")
        .order("created_at", { ascending: false })

      if (error) throw error

      const userData = data || []

      if (isMountedRef.current) {
        setAllUsers(userData)
        setUsers(userData) // Set users to all users for now

        // Calculate active customers from real data
        const activeCount = userData.filter((user) => user.chatbot_status === "active").length
        setActiveCustomers(activeCount)

        // Initialize filtered users if no search is active
        if (!searchQuery) {
          setFilteredUsers(userData)
        }
      }
    } catch (error) {
      console.error("Error fetching all users:", error)
      // IMPORTANT: If no data is shown, check the browser console for detailed error messages,
      // especially regarding Supabase Row Level Security (RLS) policies.
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to fetch users data. Check browser console for details.",
          variant: "destructive",
        })
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingAllUsers(false)
      }
    }
  }, [searchQuery, toast])

  const fetchTokenUsage = useCallback(async () => {
    if (!isMountedRef.current) return

    setLoadingTokenUsage(true)
    try {
      const { data, error } = await supabase
        .from("chat_tokens")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000)

      if (error) throw error

      const tokenData = data || []

      if (isMountedRef.current) {
        setTokenUsage(tokenData)

        // Calculate total tokens used from real data
        const totalTokens = tokenData.reduce((sum, token) => sum + token.input_tokens + token.output_tokens, 0)
        setTotalTokensUsed(totalTokens)

        // Initialize filtered token usage if no search is active
        if (!searchQuery) {
          setFilteredTokenUsage(tokenData)
        }
      }
    } catch (error) {
      console.error("Error fetching token usage:", error)
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to fetch token usage data",
          variant: "destructive",
        })
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingTokenUsage(false)
      }
    }
  }, [searchQuery, toast])

  const fetchCustomerStats = useCallback(async () => {
    if (!isMountedRef.current) return

    setLoadingCustomerStats(true)
    try {
      // Get all customers with their creation dates
      const { data: allCustomersData, error: allError } = await supabase
        .from("credentials")
        .select("created_at")
        .order("created_at", { ascending: false })

      if (allError) throw allError

      const allCustomers = allCustomersData || []
      const totalCount = allCustomers.length

      if (isMountedRef.current) {
        setTotalCustomers(totalCount)

        // Calculate time-based statistics
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const last7DaysStart = subDays(now, 7)
        const last10DaysStart = subDays(now, 10)
        const last30DaysStart = subDays(now, 30)

        let todayCount = 0
        let last7Count = 0
        let last10Count = 0
        let last30Count = 0

        allCustomers.forEach((customer) => {
          const createdAt = new Date(customer.created_at)

          if (createdAt >= todayStart) {
            todayCount++
          }
          if (createdAt >= last7DaysStart) {
            last7Count++
          }
          if (createdAt >= last10DaysStart) {
            last10Count++
          }
          if (createdAt >= last30DaysStart) {
            last30Count++
          }
        })

        setTodayCustomers(todayCount)
        setLast7DaysCustomers(last7Count)
        setLast10DaysCustomers(last10Count)
        setLast30DaysCustomers(last30Count)
      }
    } catch (error) {
      console.error("Error fetching customer stats:", error)
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to fetch customer statistics",
          variant: "destructive",
        })
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingCustomerStats(false)
      }
    }
  }, [toast])

  // Initialize widgets with REAL data only
  const initializeWidgets = useCallback(() => {
    if (!isMountedRef.current) return

    const defaultWidgets: Widget[] = [
      {
        id: "today-signups",
        title: "Today",
        type: "metric",
        size: "small",
        data: {
          value: todayCustomers,
          label: "Today",
        },
      },
      {
        id: "total-users",
        title: "Total Customers",
        type: "metric",
        size: "small",
        data: {
          value: totalCustomers,
          label: "Total Customers",
        },
      },
      {
        id: "last-7-days",
        title: "Last 7 Days",
        type: "metric",
        size: "small",
        data: {
          value: last7DaysCustomers,
          label: "Last 7 Days",
        },
      },
      {
        id: "last-10-days",
        title: "Last 10 Days",
        type: "metric",
        size: "small",
        data: {
          value: last10DaysCustomers,
          label: "Last 10 Days",
        },
      },
      {
        id: "last-30-days",
        title: "Last 30 Days",
        type: "metric",
        size: "small",
        data: {
          value: last30DaysCustomers,
          label: "Last 30 Days",
        },
      },
    ]
    setWidgets(defaultWidgets)
  }, [totalCustomers, todayCustomers, last7DaysCustomers, last10DaysCustomers, last30DaysCustomers])

  const generateHeatmapData = useCallback(async () => {
    if (!isMountedRef.current) return

    setLoadingHeatmap(true)
    try {
      // Initialize empty heatmap data (7 days x 24 hours)
      const heatmap = Array(7)
        .fill(0)
        .map(() => Array(24).fill(0))

      // Get all users with their creation timestamps
      const { data, error } = await supabase.from("credentials").select("created_at")

      if (error) throw error

      // Process each user's creation timestamp
      data.forEach((user) => {
        const date = new Date(user.created_at)
        const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
        const hour = date.getHours()

        // Increment the count for this day and hour
        heatmap[dayOfWeek][hour]++
      })

      if (isMountedRef.current) {
        setHeatmapData(heatmap)
      }
    } catch (error) {
      console.error("Error generating heatmap data:", error)
      if (isMountedRef.current) {
        toast({
          title: "Heatmap Error",
          description: "Failed to generate signup heatmap data",
          variant: "destructive",
        })
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingHeatmap(false)
      }
    }
  }, [toast])

  const fetchUserFiles = async (user: UserData) => {
    if (!user || !user.chatbot_id) {
      toast({
        title: "Error",
        description: "Invalid user data",
        variant: "destructive",
      })
      return
    }

    setLoadingFiles(true)
    setSelectedUserFiles([])
    setSelectedUserLinks([])

    try {
      const { data: filesData, error: filesError } = await supabase.storage.from("files_uploaded").list(user.chatbot_id)

      if (filesError) {
        console.error("Error listing files:", filesError)
        throw filesError
      }

      if (!filesData) {
        console.error("No files data returned")
        throw new Error("No files data returned")
      }

      const fileData: FileData[] = filesData
        .filter((file) => file.name !== "links.json")
        .map((file) => ({
          name: file.name,
          url: supabase.storage.from("files_uploaded").getPublicUrl(`${user.chatbot_id}/${file.name}`).data.publicUrl,
        }))

      setSelectedUserFiles(fileData)

      const linksFile = filesData.find((f) => f.name === "links.json")
      if (linksFile) {
        try {
          const { data: linksData, error: linksError } = await supabase.storage
            .from("files_uploaded")
            .download(`${user.chatbot_id}/links.json`)

          if (linksError) {
            console.error("Error downloading links.json:", linksError)
            throw linksError
          }

          if (!linksData) {
            console.error("No links data returned")
            throw new Error("No links data returned")
          }

          const links = JSON.parse(await linksData.text())
          setSelectedUserLinks(Array.isArray(links) ? links : [])
        } catch (error) {
          console.error("Error parsing links.json:", error)
          setSelectedUserLinks([])
        }
      }
    } catch (error) {
      console.error("Error fetching user files:", error)
      toast({
        title: "Error",
        description: "Failed to fetch user files",
        variant: "destructive",
      })
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleUserClick = async (user: UserData) => {
    setSelectedUser(user)
    setDialogOpen(true)
    await fetchUserFiles(user)
  }

  const handleSearch = (query: string, filters: SearchFilter[]) => {
    setSearchQuery(query)
    setSearchTerm(query)

    try {
      // Filter users
      let filtered = allUsers
      if (query) {
        filtered = filtered.filter(
          (user) =>
            user.chatbot_id.toLowerCase().includes(query.toLowerCase()) ||
            (user.chatbot_name && user.chatbot_name.toLowerCase().includes(query.toLowerCase())) ||
            (user.selected_plan && user.selected_plan.toLowerCase().includes(query.toLowerCase())),
        )
      }

      // Apply additional filters
      filters.forEach((filter) => {
        if (filter.field && filter.value) {
          filtered = filtered.filter((user) => {
            const fieldValue = user[filter.field as keyof UserData]
            if (!fieldValue) return false

            switch (filter.operator) {
              case "equals":
                return fieldValue.toString().toLowerCase() === filter.value.toLowerCase()
              case "contains":
                return fieldValue.toString().toLowerCase().includes(filter.value.toLowerCase())
              case "startsWith":
                return fieldValue.toString().toLowerCase().startsWith(filter.value.toLowerCase())
              case "endsWith":
                return fieldValue.toString().toLowerCase().endsWith(filter.value.toLowerCase())
              default:
                return true
            }
          })
        }
      })

      setFilteredUsers(filtered)

      // Filter token usage
      const filteredTokens = tokenUsage.filter((token) => token.chatbot_id.toLowerCase().includes(query.toLowerCase()))
      setFilteredTokenUsage(filteredTokens)
    } catch (error) {
      console.error("Error in search:", error)
      toast({
        title: "Search Error",
        description: "Failed to filter results. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchTerm("")
    setFilteredUsers(allUsers)
    setFilteredTokenUsage(tokenUsage)
  }

  // Bulk action functions
  const handleSelectAllUsers = (selected: boolean) => {
    try {
      const displayUsers = searchQuery ? filteredUsers : allUsers
      if (selected) {
        setSelectedUserIds(displayUsers.map((user) => user.chatbot_id))
      } else {
        setSelectedUserIds([])
      }
    } catch (error) {
      console.error("Error selecting users:", error)
      toast({
        title: "Selection Error",
        description: "Failed to select users. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelectUser = (id: string, selected: boolean) => {
    try {
      if (selected) {
        setSelectedUserIds((prev) => [...prev, id])
      } else {
        setSelectedUserIds((prev) => prev.filter((userId) => userId !== id))
      }
    } catch (error) {
      console.error("Error selecting user:", error)
      toast({
        title: "Selection Error",
        description: "Failed to select user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    try {
      switch (actionId) {
        case "activate":
          await bulkUpdateStatus(selectedIds, "active")
          break
        case "deactivate":
          await bulkUpdateStatus(selectedIds, "inactive")
          break
        case "delete":
          await bulkDeleteUsers(selectedIds)
          break
        case "export":
          await bulkExportUsers(selectedIds)
          break
        default:
          console.warn(`Unknown bulk action: ${actionId}`)
          toast({
            title: "Unknown Action",
            description: `The action "${actionId}" is not recognized.`,
            variant: "destructive",
          })
      }
    } catch (error) {
      console.error("Bulk action error:", error)
      toast({
        title: "Bulk Action Failed",
        description: "Failed to execute bulk action. Please try again.",
        variant: "destructive",
      })
    }
  }

  const bulkUpdateStatus = async (userIds: string[], status: string) => {
    try {
      const { error } = await supabase.from("credentials").update({ chatbot_status: status }).in("chatbot_id", userIds)

      if (error) throw error

      // Update local state
      setAllUsers((prev) =>
        prev.map((user) => (userIds.includes(user.chatbot_id) ? { ...user, chatbot_status: status } : user)),
      )
      setFilteredUsers((prev) =>
        prev.map((user) => (userIds.includes(user.chatbot_id) ? { ...user, chatbot_status: status } : user)),
      )
      setUsers((prev) =>
        prev.map((user) => (userIds.includes(user.chatbot_id) ? { ...user, chatbot_status: status } : user)),
      )

      // Clear selection
      setSelectedUserIds([])

      toast({
        title: "Bulk update completed",
        description: `Updated ${userIds.length} users to ${status}`,
      })
    } catch (error) {
      console.error("Bulk update error:", error)
      throw error
    }
  }

  const bulkDeleteUsers = async (userIds: string[]) => {
    try {
      const { error } = await supabase.from("credentials").delete().in("chatbot_id", userIds)

      if (error) throw error

      // Update local state
      setAllUsers((prev) => prev.filter((user) => !userIds.includes(user.chatbot_id)))
      setFilteredUsers((prev) => prev.filter((user) => !userIds.includes(user.chatbot_id)))
      setUsers((prev) => prev.filter((user) => !userIds.includes(user.chatbot_id)))

      // Clear selection
      setSelectedUserIds([])

      toast({
        title: "Bulk delete completed",
        description: `Deleted ${userIds.length} users`,
      })
    } catch (error) {
      console.error("Bulk delete error:", error)
      throw error
    }
  }

  const bulkExportUsers = async (userIds: string[]) => {
    try {
      const usersToExport = allUsers.filter((user) => userIds.includes(user.chatbot_id))
      const csvContent = [
        "Chatbot ID,Name,Plan,Status,Created At",
        ...usersToExport.map(
          (user) =>
            `${user.chatbot_id},${user.chatbot_name || ""},${user.selected_plan || ""},${user.chatbot_status},${user.created_at}`,
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export completed",
        description: `Exported ${usersToExport.length} users successfully`,
      })
    } catch (error) {
      console.error("Bulk export error:", error)
      throw error
    }
  }

  // Widget functions
  const handleRefreshWidget = async (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((widget) => (widget.id === widgetId ? { ...widget, loading: true, error: undefined } : widget)),
    )

    try {
      // Refresh with real data
      await fetchAllData()

      toast({
        title: "Widget refreshed",
        description: "Widget data has been updated with latest information",
      })
    } catch (error) {
      console.error("Widget refresh error:", error)
      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === widgetId ? { ...widget, loading: false, error: "Failed to refresh" } : widget,
        ),
      )
    }
  }

  const handleRemoveWidget = (widgetId: string) => {
    try {
      setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId))
      toast({
        title: "Widget removed",
        description: "Widget has been removed from dashboard",
      })
    } catch (error) {
      console.error("Widget removal error:", error)
      toast({
        title: "Error",
        description: "Failed to remove widget",
        variant: "destructive",
      })
    }
  }

  const handleAddWidget = () => {
    setEditingWidget(null)
    setWidgetConfigOpen(true)
  }

  const handleSaveWidget = (config: Partial<Widget>) => {
    try {
      if (editingWidget) {
        // Update existing widget
        setWidgets((prev) => prev.map((widget) => (widget.id === editingWidget.id ? { ...widget, ...config } : widget)))
        toast({
          title: "Widget updated",
          description: "Widget configuration has been updated",
        })
      } else {
        // Add new widget
        const newWidget: Widget = {
          id: `widget-${Date.now()}`,
          title: config.title || "New Widget",
          type: config.type || "metric",
          size: config.size || "small",
          data: { value: 0, label: "No data" },
        }
        setWidgets((prev) => [...prev, newWidget])
        toast({
          title: "Widget added",
          description: "New widget has been added to dashboard",
        })
      }
      setWidgetConfigOpen(false)
      setEditingWidget(null)
    } catch (error) {
      console.error("Widget save error:", error)
      toast({
        title: "Error",
        description: "Failed to save widget configuration",
        variant: "destructive",
      })
    }
  }

  // Theme functions

  const handleLogout = async () => {
    try {
      // Show loading state
      const logoutButton = document.querySelector("[data-logout-btn]")
      if (logoutButton) {
        logoutButton.textContent = "Logging out..."
        logoutButton.disabled = true
      }

      // Call logout API endpoint if it exists
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      } catch (apiError) {
        // API call failed, but continue with client-side logout
        console.warn("Logout API call failed:", apiError)
      }

      // Clear all admin-related data from localStorage
      localStorage.removeItem("adminData")
      localStorage.removeItem("adminThemeSettings")

      // Clear any other admin-related session data
      sessionStorage.clear()

      // Show success message
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel",
      })

      // Redirect to admin login page
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)

      // Even if there's an error, still try to clear data and redirect
      try {
        localStorage.removeItem("adminData")
        localStorage.removeItem("adminThemeSettings")
        sessionStorage.clear()
      } catch (storageError) {
        console.error("Error clearing storage:", storageError)
      }

      toast({
        title: "Logout Error",
        description: "There was an issue logging out, but you've been redirected to login",
        variant: "destructive",
      })

      // Force redirect even if there was an error
      router.push("/admin/login")
    }
  }

  const handleStatusChange = async (chatbotId: string, newStatus: string) => {
    if (!chatbotId) {
      toast({
        title: "Error",
        description: "Invalid chatbot ID",
        variant: "destructive",
      })
      return
    }

    setUpdatingStatus(chatbotId)
    try {
      const { error } = await supabase
        .from("credentials")
        .update({ chatbot_status: newStatus })
        .eq("chatbot_id", chatbotId)

      if (error) throw error

      // Update all relevant state
      setUsers(users.map((user) => (user.chatbot_id === chatbotId ? { ...user, chatbot_status: newStatus } : user)))
      setAllUsers(
        allUsers.map((user) => (user.chatbot_id === chatbotId ? { ...user, chatbot_status: newStatus } : user)),
      )
      setFilteredUsers(
        filteredUsers.map((user) => (user.chatbot_id === chatbotId ? { ...user, chatbot_status: newStatus } : user)),
      )

      toast({
        title: "Status updated",
        description: `Chatbot status has been updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update chatbot status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleTableChatbotStatusChange = async (chatbotId: string, newStatus: string) => {
    if (!chatbotId) {
      toast({
        title: "Error",
        description: "Invalid chatbot ID",
        variant: "destructive",
      })
      return
    }

    setEditingChatbotStatus(chatbotId)
    try {
      const { error } = await supabase
        .from("credentials")
        .update({ chatbot_status: newStatus })
        .eq("chatbot_id", chatbotId)

      if (error) throw error

      // Update all relevant state
      setAllUsers(
        allUsers.map((user) => (user.chatbot_id === chatbotId ? { ...user, chatbot_status: newStatus } : user)),
      )
      setFilteredUsers(
        filteredUsers.map((user) => (user.chatbot_id === chatbotId ? { ...user, chatbot_status: newStatus } : user)),
      )
      setUsers(users.map((user) => (user.chatbot_id === chatbotId ? { ...user, chatbot_status: newStatus } : user)))

      toast({
        title: "Status updated",
        description: `Chatbot status has been updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating chatbot status:", error)
      toast({
        title: "Error",
        description: "Failed to update chatbot status",
        variant: "destructive",
      })
    } finally {
      setEditingChatbotStatus(null)
    }
  }

  const handlePaymentStatusChange = async (chatbotId: string, newStatus: string) => {
    if (!chatbotId) {
      toast({
        title: "Error",
        description: "Invalid chatbot ID",
        variant: "destructive",
      })
      return
    }

    setEditingPaymentStatus(chatbotId)
    try {
      const { error } = await supabase
        .from("credentials")
        .update({ payment_status: newStatus })
        .eq("chatbot_id", chatbotId)

      if (error) throw error

      // Update all relevant state
      setAllUsers(
        allUsers.map((user) => (user.chatbot_id === chatbotId ? { ...user, payment_status: newStatus } : user)),
      )
      setFilteredUsers(
        filteredUsers.map((user) => (user.chatbot_id === chatbotId ? { ...user, payment_status: newStatus } : user)),
      )

      toast({
        title: "Payment status updated",
        description: `Payment status has been updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      })
    } finally {
      setEditingPaymentStatus(null)
    }
  }

  const handleUserLogsClick = async (chatbotId: string) => {
    if (!chatbotId) {
      toast({
        title: "Error",
        description: "Invalid chatbot ID",
        variant: "destructive",
      })
      return
    }

    setLoadingLogs(true)
    setUserLogsDialogOpen(true)
    setUserLogDates([])
    setUserLogsError(null)

    try {
      // Get the public URL for the user_log.json file
      const { data: publicUrlData } = supabase.storage.from("user_logs").getPublicUrl(`${chatbotId}/user_log.json`)

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for the log file")
      }

      // Fetch the file using the public URL
      const response = await fetch(publicUrlData.publicUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const logContent = await response.text()
      const logs = JSON.parse(logContent)

      // Sort logs by timestamp in descending order
      logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setUserLogDates(logs)
    } catch (error) {
      console.error("Error fetching user logs:", error)
      setUserLogsError("Failed to fetch user logs. The log file might not exist yet.")
      toast({
        title: "Error",
        description: "Failed to fetch user logs. The log file might not exist yet.",
        variant: "destructive",
      })
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleLogDownload = async (chatbotId: string, fileName: string) => {
    if (!chatbotId || !fileName) {
      toast({
        title: "Error",
        description: "Invalid chatbot ID or file name",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if the file exists before attempting to download
      const { data: fileExists, error: fileCheckError } = await supabase.storage.from("user_logs").list(`${chatbotId}`)

      if (fileCheckError) {
        console.error("Error checking file existence:", fileCheckError)
        throw fileCheckError
      }

      if (!fileExists || !fileExists.some((file) => file.name === fileName)) {
        throw new Error(`File not found: ${fileName}`)
      }

      const { data, error } = await supabase.storage.from("user_logs").download(`${chatbotId}/${fileName}`)

      if (error) {
        console.error("Supabase download error:", error)
        throw error
      }

      if (!data) {
        throw new Error("No data received from storage")
      }

      const blob = new Blob([data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Log file downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading log file:", error)
      let errorMessage = "Failed to download log file"
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleLogDateSelect = async (date: string) => {
    if (!date || !selectedUser?.chatbot_id) {
      toast({
        title: "Error",
        description: "Invalid date or chatbot ID",
        variant: "destructive",
      })
      return
    }

    setSelectedLogDate(date)
    setLoadingLogs(true)
    setSelectedLogEntry(null)

    try {
      const fileName = `${date}.json`
      const { data, error } = await supabase.storage
        .from("user_logs")
        .download(`${selectedUser.chatbot_id}/${fileName}`)

      if (error) {
        console.error("Error downloading log file:", error)
        throw error
      }

      if (!data) {
        throw new Error("No data returned from storage")
      }

      const text = await data.text()
      if (!text) {
        throw new Error("Empty log file")
      }

      setSelectedLogEntry({ content: text })
    } catch (error) {
      console.error("Error fetching log entry:", error)

      let errorMessage = "Failed to fetch log entry"
      if (error instanceof StorageError) {
        errorMessage += `: ${error.message}`
      } else if (error instanceof Error) {
        errorMessage += `: ${error.message}`
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleViewDetails = (chatbotId: string) => {
    if (!chatbotId) {
      toast({
        title: "Error",
        description: "Invalid chatbot ID",
        variant: "destructive",
      })
      return
    }
    router.push(`/admin/account/${chatbotId}`)
  }

  const handleViewDashboard = (chatbotId: string) => {
    if (!chatbotId) {
      toast({
        title: "Error",
        description: "Invalid chatbot ID",
        variant: "destructive",
      })
      return
    }
    router.push(`/admin/dashboard/${chatbotId}`)
  }

  const handleViewDocuments = async (chatbotId: string) => {
    if (!chatbotId) {
      toast({
        title: "Error",
        description: "Invalid chatbot ID",
        variant: "destructive",
      })
      return
    }

    setSelectedChatbotId(chatbotId)
    setDocumentsDialogOpen(true)
    setLoadingDocuments(true)
    setDocumentsError(null)
    setSelectedChatbotDocuments([])

    try {
      const { data, error } = await supabase
        .from("documents")
        .select("id, document_id, document_name, created_at")
        .eq("chatbot_id", chatbotId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setSelectedChatbotDocuments(data || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
      setDocumentsError("Failed to fetch documents")
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      })
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleDocumentUpload = async () => {
    if (!selectedChatbotId || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "No files selected or invalid chatbot ID",
        variant: "destructive",
      })
      return
    }

    setUploadingDocs(true)

    try {
      // Create a FormData object
      const formData = new FormData()
      formData.append("chatbotId", selectedChatbotId)

      // Append each file to the FormData
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })

      // Send the files to your API endpoint
      const response = await fetch("/api/upload-documents", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload documents")
      }

      toast({
        title: "Success",
        description: `${selectedFiles.length} document(s) uploaded successfully`,
      })

      // Refresh the documents list
      if (selectedChatbotId) {
        handleViewDocuments(selectedChatbotId)
      }

      // Clear the selected files
      setSelectedFiles([])
      setAddDocDialogOpen(false)
    } catch (error) {
      console.error("Error uploading documents:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload documents",
        variant: "destructive",
      })
    } finally {
      setUploadingDocs(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!selectedChatbotId || !urlsText.trim()) {
      toast({
        title: "Error",
        description: "No URLs provided or invalid chatbot ID",
        variant: "destructive",
      })
      return
    }

    setUploadingUrls(true)

    try {
      // Parse URLs (one per line)
      const urls = urlsText
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      if (urls.length === 0) {
        throw new Error("No valid URLs provided")
      }

      // Send the URLs to your API endpoint
      const response = await fetch("/api/process-urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbotId: selectedChatbotId,
          urls,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to process URLs")
      }

      toast({
        title: "Success",
        description: `${urls.length} URL(s) processed successfully`,
      })

      // Refresh the documents list
      if (selectedChatbotId) {
        handleViewDocuments(selectedChatbotId)
      }

      // Clear the URLs text
      setUrlsText("")
      setAddUrlsDialogOpen(false)
    } catch (error) {
      console.error("Error processing URLs:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process URLs",
        variant: "destructive",
      })
    } finally {
      setUploadingUrls(false)
    }
  }

  const renderHeatmap = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const hours = Array.from({ length: 24 }, (_, i) => i)

    // Find the maximum value in the heatmap for color scaling
    const maxValue = Math.max(...heatmapData.flat())

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex">
            <div className="w-12"></div>
            {hours.map((hour) => (
              <div key={hour} className="w-8 text-xs text-center text-gray-500">
                {hour}
              </div>
            ))}
          </div>
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center">
              <div className="w-12 text-xs font-medium text-gray-500">{day}</div>
              {hours.map((hour) => {
                const value = heatmapData[dayIndex][hour]
                const intensity = maxValue > 0 ? (value / maxValue) * 100 : 0
                return (
                  <div
                    key={hour}
                    className="w-8 h-8 m-px rounded"
                    style={{
                      backgroundColor: `rgba(37, 99, 235, ${intensity / 100})`,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                    title={`${day} ${hour}:00 - ${value} users`}
                  >
                    {value > 0 && (
                      <div className="flex items-center justify-center h-full text-xs font-medium text-white">
                        {value}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Effect for initialization
  useEffect(() => {
    isMountedRef.current = true

    if (!checkAdminAuth()) return

    // Initialize data
    fetchAllData()

    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, [checkAdminAuth, fetchAllData])

  // Use filtered data or fallback to original data
  const displayUsers = searchQuery ? filteredUsers : allUsers
  const displayTokenUsage = searchQuery ? filteredTokenUsage : tokenUsage

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Search fields configuration
  const searchFields = [
    { key: "chatbot_id", label: "Chatbot ID", type: "text" as const },
    { key: "chatbot_name", label: "Chatbot Name", type: "text" as const },
    { key: "selected_plan", label: "Plan", type: "select" as const, options: ["Free", "Basic", "Pro", "Enterprise"] },
    { key: "chatbot_status", label: "Status", type: "select" as const, options: ["active", "inactive", "pending"] },
    { key: "payment_status", label: "Payment Status", type: "select" as const, options: ["paid", "pending", "failed"] },
  ]

  // Bulk actions configuration
  const bulkActions = [
    {
      id: "activate",
      label: "Activate",
      icon: "checkCircle",
      variant: "default" as const,
    },
    {
      id: "deactivate",
      label: "Deactivate",
      icon: "xCircle",
      variant: "outline" as const,
    },
    {
      id: "export",
      label: "Export",
      icon: "download",
      variant: "outline" as const,
    },
    {
      id: "delete",
      label: "Delete",
      icon: "delete",
      variant: "destructive" as const,
      requiresConfirmation: true,
      confirmationMessage: "Are you sure you want to delete the selected users? This action cannot be undone.",
    },
  ]

  // Table columns configuration
  const userColumns = [
    {
      key: "select",
      label: "",
      render: (_: any, row: UserData) => (
        <BulkSelectCheckbox
          id={row.chatbot_id}
          checked={selectedUserIds.includes(row.chatbot_id)}
          onCheckedChange={(checked) => handleSelectUser(row.chatbot_id, checked)}
        />
      ),
    },
    {
      key: "chatbot_id",
      label: "Chatbot ID",
      render: (value: string) => <span className="font-mono text-xs">{value}</span>,
    },
    {
      key: "chatbot_name",
      label: "Name",
      render: (value: string) => value || "—",
    },
    {
      key: "created_at",
      label: "Created",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "selected_plan",
      label: "Plan",
      render: (value: string) => <StatusBadge status={value || "Free"} />,
    },
    {
      key: "chatbot_status",
      label: "Status",
      render: (value: string, row: UserData) => (
        <div className="flex items-center space-x-2">
          {editingChatbotStatus === row.chatbot_id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <select
              value={value || "pending"}
              onChange={(e) => handleTableChatbotStatusChange(row.chatbot_id, e.target.value)}
              className="text-sm border rounded p-1"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </div>
      ),
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (value: string, row: UserData) => (
        <div className="flex items-center space-x-2">
          {editingPaymentStatus === row.chatbot_id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <select
              value={value || "pending"}
              onChange={(e) => handlePaymentStatusChange(row.chatbot_id, e.target.value)}
              className="text-sm border rounded p-1"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: UserData) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetails(row.chatbot_id)
            }}
            title="View Details"
          >
            <AdminIcon name="edit" size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDashboard(row.chatbot_id)
            }}
            title="View Dashboard"
          >
            <AdminIcon name="analytics" size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDocuments(row.chatbot_id)
            }}
            title="View Documents"
          >
            <AdminIcon name="fileText" size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleUserLogsClick(row.chatbot_id)
            }}
            title="View Logs"
          >
            <AdminIcon name="activity" size="sm" />
          </Button>
        </div>
      ),
    },
  ]

  const tokenColumns = [
    {
      key: "chatbot_id",
      label: "Chatbot ID",
      render: (value: string) => <span className="font-mono text-xs">{value}</span>,
    },
    {
      key: "created_at",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      key: "input_tokens",
      label: "Input Tokens",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "output_tokens",
      label: "Output Tokens",
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: "total",
      label: "Total Tokens",
      render: (_: any, row: TokenUsage) => (row.input_tokens + row.output_tokens).toLocaleString(),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 light">
      <AdminHeader
        title="Admin Dashboard"
        description="Manage users, view analytics, and monitor system performance"
        actions={<div className="flex items-center space-x-2"></div>}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminQuickNav />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Customer Insights Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <AdminIcon name="calendar" className="mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Customer Insights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <AdminCard className="border-t-4 border-t-blue-600">
              <div className="text-center">
                {loadingCustomerStats ? (
                  <div className="h-16 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">{todayCustomers}</h3>
                    <p className="text-sm text-gray-500">Today</p>
                  </>
                )}
              </div>
            </AdminCard>

            <AdminCard className="border-t-4 border-t-green-600">
              <div className="text-center">
                {loadingCustomerStats ? (
                  <div className="h-16 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">{totalCustomers}</h3>
                    <p className="text-sm text-gray-500">Total Customers</p>
                  </>
                )}
              </div>
            </AdminCard>

            <AdminCard className="border-t-4 border-t-amber-600">
              <div className="text-center">
                {loadingCustomerStats ? (
                  <div className="h-16 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">{last7DaysCustomers}</h3>
                    <p className="text-sm text-gray-500">Last 7 Days</p>
                  </>
                )}
              </div>
            </AdminCard>

            <AdminCard className="border-t-4 border-t-purple-600">
              <div className="text-center">
                {loadingCustomerStats ? (
                  <div className="h-16 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">{last10DaysCustomers}</h3>
                    <p className="text-sm text-gray-500">Last 10 Days</p>
                  </>
                )}
              </div>
            </AdminCard>

            <AdminCard className="border-t-4 border-t-indigo-600">
              <div className="text-center">
                {loadingCustomerStats ? (
                  <div className="h-16 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">{last30DaysCustomers}</h3>
                    <p className="text-sm text-gray-500">Last 30 Days</p>
                  </>
                )}
              </div>
            </AdminCard>
          </div>
        </div>

        {/* Registration Activity Heatmap */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <AdminIcon name="clock" className="mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Registration Activity Heatmap</h2>
          </div>
          <AdminCard className="border-0 shadow-lg">
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                This heatmap shows customer registration activity by day of week and hour of day. Darker cells indicate
                higher registration activity.
              </p>
              {loadingHeatmap ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                renderHeatmap()
              )}
            </div>
          </AdminCard>
        </div>

        {/* Advanced Search */}
        <AdminSearch onSearch={handleSearch} onClear={handleClearSearch} searchFields={searchFields} className="mb-6" />

        {/* All Users Section */}
        <div className="mb-8" id="all-users">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Users</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <AdminCard className="border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <QuickExport
                  data={displayUsers}
                  columns={userColumns.filter((col) => col.key !== "select" && col.key !== "actions")}
                  filename="users-export"
                />
                <AdminExport
                  data={displayUsers}
                  columns={userColumns.filter((col) => col.key !== "select" && col.key !== "actions")}
                  filename="users-detailed-export"
                />
              </div>
            </div>
            <div className="space-y-4">
              <AdminBulkActions
                selectedItems={selectedUserIds}
                onSelectAll={handleSelectAllUsers}
                onSelectItem={handleSelectUser}
                totalItems={displayUsers.length}
                actions={bulkActions}
                onExecuteAction={handleBulkAction}
                isAllSelected={selectedUserIds.length === displayUsers.length && displayUsers.length > 0}
              />

              <AdminTable
                columns={userColumns}
                data={displayUsers}
                loading={loadingAllUsers}
                emptyMessage="No users found"
                onRowClick={(row) => handleUserClick(row)}
              />
            </div>
          </AdminCard>
        </div>

        {/* Token Usage Section */}
        <div className="mb-8" id="token-usage">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Token Usage</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <AdminCard className="border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <QuickExport data={displayTokenUsage} columns={tokenColumns} filename="token-usage-export" />
            </div>
            <AdminTable
              columns={tokenColumns}
              data={displayTokenUsage}
              loading={loadingTokenUsage}
              emptyMessage="No token usage data found"
            />
          </AdminCard>
        </div>

        {/* Job Runs Section */}

        {/* User Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Chatbot ID</h3>
                    <p className="mt-1 font-mono">{selectedUser.chatbot_id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                    <p className="mt-1">{new Date(selectedUser.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Selected Plan</h3>
                    <p className="mt-1">{selectedUser.selected_plan || "Free"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Selected Domain</h3>
                    <p className="mt-1">{selectedUser.selected_domain || "—"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-1 flex items-center space-x-2">
                      {updatingStatus === selectedUser.chatbot_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <select
                          value={selectedUser.chatbot_status || "pending"}
                          onChange={(e) => handleStatusChange(selectedUser.chatbot_id, e.target.value)}
                          className="border rounded p-1"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Files</h3>
                  {loadingFiles ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : selectedUserFiles.length === 0 ? (
                    <p className="text-gray-500">No files found</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUserFiles.map((file) => (
                        <div
                          key={file.name}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-2">
                            <AdminIcon name="fileText" size="sm" />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(selectedUser.chatbot_id, file.name)}
                          >
                            <AdminIcon name="download" size="sm" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Links</h3>
                  {loadingFiles ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : selectedUserLinks.length === 0 ? (
                    <p className="text-gray-500">No links found</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUserLinks.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <AdminIcon name="link" size="sm" />
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate max-w-[400px]"
                            >
                              {link}
                            </a>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => window.open(link, "_blank")}>
                            <AdminIcon name="external" size="sm" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => handleUserLogsClick(selectedUser.chatbot_id)}>
                    <AdminIcon name="activity" size="sm" className="mr-2" />
                    View Logs
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => handleViewDetails(selectedUser.chatbot_id)}>
                      <AdminIcon name="edit" size="sm" className="mr-2" />
                      Account Details
                    </Button>
                    <Button onClick={() => handleViewDashboard(selectedUser.chatbot_id)}>
                      <AdminIcon name="analytics" size="sm" className="mr-2" />
                      View Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* User Logs Dialog */}
        <Dialog open={userLogsDialogOpen} onOpenChange={setUserLogsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Logs</DialogTitle>
            </DialogHeader>

            {loadingLogs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : userLogsError ? (
              <Alert variant="destructive">
                <AlertDescription>{userLogsError}</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 border-r pr-4">
                  <h3 className="font-medium mb-2">Log Dates</h3>
                  {userLogDates.length === 0 ? (
                    <p className="text-gray-500">No logs found</p>
                  ) : (
                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                      {userLogDates.map((log: any, index: number) => (
                        <Button
                          key={index}
                          variant={selectedLogDate === log.date ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleLogDateSelect(log.date)}
                        >
                          <AdminIcon
                            name="calendar"
                            size="sm"
                            className="mr-2"
                            color={selectedLogDate === log.date ? "white" : undefined}
                          />
                          {log.date}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Log Content</h3>
                    {selectedLogDate && selectedUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogDownload(selectedUser.chatbot_id, `${selectedLogDate}.json`)}
                      >
                        <AdminIcon name="download" size="sm" className="mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                  {!selectedLogEntry ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-500 h-[400px] flex items-center justify-center">
                      Select a log date to view content
                    </div>
                  ) : (
                    <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs h-[400px] overflow-y-auto">
                      {selectedLogEntry.content}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Documents Dialog */}
        <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chatbot Documents</DialogTitle>
            </DialogHeader>

            <div className="flex justify-end space-x-2 mb-4">
              <Button variant="outline" onClick={() => setAddUrlsDialogOpen(true)}>
                <AdminIcon name="link" size="sm" className="mr-2" />
                Add URLs
              </Button>
              <Button onClick={() => setAddDocDialogOpen(true)}>
                <AdminIcon name="upload" size="sm" className="mr-2" />
                Upload Documents
              </Button>
            </div>

            {loadingDocuments ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : documentsError ? (
              <Alert variant="destructive">
                <AlertDescription>{documentsError}</AlertDescription>
              </Alert>
            ) : selectedChatbotDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No documents found for this chatbot</div>
            ) : (
              <AdminTable
                columns={[
                  {
                    key: "document_id",
                    label: "Document ID",
                    render: (value) => <span className="font-mono text-xs">{value}</span>,
                  },
                  { key: "document_name", label: "Name" },
                  {
                    key: "created_at",
                    label: "Created",
                    render: (value) => new Date(value).toLocaleString(),
                  },
                ]}
                data={selectedChatbotDocuments}
                emptyMessage="No documents found"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Add Documents Dialog */}
        <Dialog open={addDocDialogOpen} onOpenChange={setAddDocDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <AdminIcon name="upload" size="lg" className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-2">Drag and drop files here, or click to select files</p>
                <p className="text-xs text-gray-400 mb-4">Supported formats: PDF, DOCX, TXT, CSV, XLSX</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelection}
                  multiple
                  className="hidden"
                  accept=".pdf,.docx,.txt,.csv,.xlsx"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                  Select Files
                </Button>
              </div>

              {selectedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm border rounded p-2">
                        <div className="truncate max-w-[200px]">{file.name}</div>
                        <div className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAddDocDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDocumentUpload} disabled={selectedFiles.length === 0 || uploadingDocs}>
                  {uploadingDocs ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add URLs Dialog */}
        <Dialog open={addUrlsDialogOpen} onOpenChange={setAddUrlsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add URLs</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label htmlFor="urls" className="block text-sm font-medium mb-1">
                  Enter URLs (one per line)
                </label>
                <textarea
                  id="urls"
                  rows={8}
                  className="w-full border rounded-md p-2"
                  placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                  value={urlsText}
                  onChange={(e) => setUrlsText(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAddUrlsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUrlUpload} disabled={!urlsText.trim() || uploadingUrls}>
                  {uploadingUrls ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Add URLs"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Widget Configuration Dialog */}
        <Dialog open={widgetConfigOpen} onOpenChange={setWidgetConfigOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingWidget ? "Edit Widget" : "Add Widget"}</DialogTitle>
            </DialogHeader>
            <WidgetConfig
              onSave={handleSaveWidget}
              onCancel={() => setWidgetConfigOpen(false)}
              existingWidget={editingWidget || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
