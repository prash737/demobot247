"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, Download, Filter, ChevronRight, ChevronLeftIcon, InfoIcon } from "lucide-react"
import AccountSidebar from "../../components/account-sidebar"
import UserAvatar from "./components/user-avatar"
import { logAuditEvent } from "@/app/utils/audit-logger"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AdminHeader } from "@/app/components/admin-header"

// First, add the import for the necessary components at the top of the file
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

interface UserData {
  username: string
  password: string
  chatbot_id: string
  selected_plan: string
  selected_domain: string
  chatbot_status: string
  chatbot_name: string
  payment_status: string
  payment_date: string
  payment_id: string
  payment_amount: number
  chat_limit: string
  total_chats: number
  first_name: string
  last_name: string
  company: string
  role: string
  timezone: string
  phone_number: string
  country_code: string
}

const roleOptions = [
  "Business Owner",
  "Developer",
  "Marketing Manager",
  "Sales Representative",
  "Customer Support",
  "Other",
]

const timezoneOptions = [
  "GMT-12:00",
  "GMT-11:00",
  "GMT-10:00",
  "GMT-09:00",
  "GMT-08:00",
  "GMT-07:00",
  "GMT-06:00",
  "GMT-05:00",
  "GMT-04:00",
  "GMT-03:00",
  "GMT-02:00",
  "GMT-01:00",
  "GMT+00:00",
  "GMT+01:00",
  "GMT+02:00",
  "GMT+03:00",
  "GMT+04:00",
  "GMT+05:00",
  "GMT+05:30 Asia/Kolkata",
  "GMT+06:00",
  "GMT+07:00",
  "GMT+08:00",
  "GMT+09:00",
  "GMT+10:00",
  "GMT+11:00",
  "GMT+12:00",
]

const countryCodes = [
  { code: "+1", country: "USA/Canada", minLen: 10, maxLen: 10 },
  { code: "+44", country: "UK", minLen: 10, maxLen: 10 },
  { code: "+91", country: "India", minLen: 10, maxLen: 10 },
  { code: "+61", country: "Australia", minLen: 9, maxLen: 9 },
  { code: "+49", country: "Germany", minLen: 10, maxLen: 11 },
  { code: "+33", country: "France", minLen: 9, maxLen: 9 },
  { code: "+81", country: "Japan", minLen: 10, maxLen: 10 },
  { code: "+86", country: "China", minLen: 11, maxLen: 11 },
  { code: "+55", country: "Brazil", minLen: 11, maxLen: 11 },
  { code: "+27", country: "South Africa", minLen: 9, maxLen: 9 },
  { code: "+7", country: "Russia", minLen: 10, maxLen: 10 },
  { code: "+34", country: "Spain", minLen: 9, maxLen: 9 },
  { code: "+39", country: "Italy", minLen: 9, maxLen: 10 },
  { code: "+52", country: "Mexico", minLen: 10, maxLen: 10 },
  { code: "+62", country: "Indonesia", minLen: 10, maxLen: 12 },
  { code: "+63", country: "Philippines", minLen: 10, maxLen: 10 },
  { code: "+65", country: "Singapore", minLen: 8, maxLen: 8 },
  { code: "+66", country: "Thailand", minLen: 9, maxLen: 10 },
  { code: "+82", country: "South Korea", minLen: 10, maxLen: 11 },
  { code: "+90", country: "Turkey", minLen: 10, maxLen: 10 },
  { code: "+971", country: "UAE", minLen: 9, maxLen: 9 },
  { code: "+20", country: "Egypt", minLen: 10, maxLen: 10 },
  { code: "+234", country: "Nigeria", minLen: 10, maxLen: 10 },
  { code: "+254", country: "Kenya", minLen: 9, maxLen: 9 },
  { code: "+353", country: "Ireland", minLen: 9, maxLen: 9 },
  { code: "+46", country: "Sweden", minLen: 7, maxLen: 13 },
  { code: "+47", country: "Norway", minLen: 8, maxLen: 8 },
  { code: "+48", country: "Poland", minLen: 9, maxLen: 9 },
  { code: "+852", country: "Hong Kong", minLen: 8, maxLen: 8 },
  { code: "+855", country: "Cambodia", minLen: 8, maxLen: 9 },
  { code: "+880", country: "Bangladesh", minLen: 10, maxLen: 10 },
  { code: "+92", country: "Pakistan", minLen: 10, maxLen: 10 },
  { code: "+94", country: "Sri Lanka", minLen: 9, maxLen: 9 },
  { code: "+966", country: "Saudi Arabia", minLen: 9, maxLen: 9 },
  { code: "+972", country: "Israel", minLen: 9, maxLen: 9 },
  { code: "+974", country: "Qatar", minLen: 8, maxLen: 8 },
  { code: "+977", country: "Nepal", minLen: 10, maxLen: 10 },
  { code: "+994", country: "Azerbaijan", minLen: 9, maxLen: 9 },
  { code: "+995", country: "Georgia", minLen: 9, maxLen: 9 },
  { code: "+998", country: "Uzbekistan", minLen: 9, maxLen: 9 },
]

export default function AccountPage() {
  const router = useRouter()
  const params = useParams()
  const chatbotId = params.chatbotId as string

  const [userData, setUserData] = useState<UserData | null>(null)
  const [originalUserData, setOriginalUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState("")

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("••••••••")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [timezone, setTimezone] = useState("")

  // Changing password state
  const [changingPassword, setChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  // Changing email state
  const [changingEmail, setChangingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState("")

  // Add the state for audit logs after the other state declarations
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLogsLoading, setAuditLogsLoading] = useState(false)

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(50) // Show 50 logs per page

  // Add date filter state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isFilterApplied, setIsFilterApplied] = useState(false)

  // Function to validate password strength
  function validatePassword(password: string, username: string): { isValid: boolean; message: string } {
    // Check password length
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" }
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" }
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" }
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" }
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one special character" }
    }

    // Check if password contains parts of the username (email)
    if (username) {
      const emailParts = username.split("@")
      const usernameWithoutDomain = emailParts[0]

      // Check if username (without domain) is at least 4 characters
      if (usernameWithoutDomain.length >= 4 && password.toLowerCase().includes(usernameWithoutDomain.toLowerCase())) {
        return { isValid: false, message: "Password should not contain parts of the email address" }
      }

      // If domain exists and is at least 4 characters, check for it too
      if (emailParts.length > 1) {
        const domain = emailParts[1].split(".")[0]
        if (domain.length >= 4 && password.toLowerCase().includes(domain.toLowerCase())) {
          return { isValid: false, message: "Password should not contain parts of the email address" }
        }
      }
    }

    return { isValid: true, message: "" }
  }

  function validatePhoneNumber(number: string, code: string): { isValid: boolean; message: string } {
    if (!number.trim()) {
      return { isValid: false, message: "Phone number is required" }
    }

    const selectedCountry = countryCodes.find((c) => c.code === code)
    if (!selectedCountry) {
      return { isValid: false, message: "Invalid country code selected" }
    }

    const cleanedNumber = number.replace(/\D/g, "") // Remove non-digits

    if (cleanedNumber.length < selectedCountry.minLen || cleanedNumber.length > selectedCountry.maxLen) {
      return {
        isValid: false,
        message: `Phone number must be between ${selectedCountry.minLen} and ${selectedCountry.maxLen} digits for ${selectedCountry.country}`,
      }
    }

    return { isValid: true, message: "" }
  }

  // Function to hash password
  async function hashPassword(password: string): Promise<string> {
    try {
      const response = await fetch("/api/hash-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        throw new Error("Failed to hash password")
      }

      const data = await response.json()
      return data.hashedPassword
    } catch (error) {
      console.error("Error hashing password:", error)
      throw error
    }
  }

  const checkAdminAuth = () => {
    const adminData = localStorage.getItem("adminData")
    if (!adminData) {
      router.push("/admin/login")
      return false
    }
    return true
  }

  const handleBack = () => {
    router.back()
  }

  const handleSaveChanges = async () => {
    if (!checkAdminAuth()) return

    setSaving(true)
    setPasswordError("")

    try {
      // Prepare updates
      const updates: Partial<UserData> = {}

      if (firstName !== originalUserData?.first_name) {
        updates.first_name = firstName
      }
      if (lastName !== originalUserData?.last_name) {
        updates.last_name = lastName
      }
      if (company !== originalUserData?.company) {
        updates.company = company
      }
      if (role !== originalUserData?.role) {
        updates.role = role
      }
      if (timezone !== originalUserData?.timezone) {
        updates.timezone = timezone
      }
      if (phoneNumber !== originalUserData?.phone_number) {
        updates.phone_number = phoneNumber
      }
      if (countryCode !== originalUserData?.country_code) {
        updates.country_code = countryCode
      }

      // If email is changed
      if (changingEmail && newEmail !== originalUserData?.username) {
        updates.username = newEmail
      }

      // If password is changed
      if (changingPassword && newPassword) {
        // Validate the new password
        const passwordValidation = validatePassword(newPassword, userData?.username || "")
        if (!passwordValidation.isValid) {
          setPasswordError(passwordValidation.message)
          setSaving(false)
          return
        }

        // Hash the new password before saving
        try {
          const hashedPassword = await hashPassword(newPassword)
          updates.password = hashedPassword
        } catch (error) {
          console.error("Error hashing password:", error)
          setPasswordError("Failed to process password. Please try again.")
          setSaving(false)
          return
        }
      }

      // Phone number validation
      const phoneNumberValidation = validatePhoneNumber(phoneNumber, countryCode)
      if (!phoneNumberValidation.isValid) {
        setPasswordError(phoneNumberValidation.message) // Reusing passwordError state for general form errors
        setSaving(false)
        return
      }

      // No changes
      if (Object.keys(updates).length === 0) {
        toast({
          title: "No changes to save.",
        })
        setSaving(false)
        return
      }

      // Update data
      const { data, error } = await supabase.from("credentials").update(updates).eq("chatbot_id", chatbotId).select()

      if (error) {
        throw error
      }

      // Log audit event
      await logAuditEvent(
        supabase,
        chatbotId,
        "Admin",
        `Updated user profile: ${Object.entries(updates)
          .map(([key, value]) => (key === "password" ? "password: [REDACTED]" : `${key}: ${value}`))
          .join(", ")}`,
      )

      // Update local state
      setUserData({ ...userData, ...updates } as UserData)
      setOriginalUserData({ ...userData, ...updates } as UserData)
      setEmail(newEmail || email)
      setPassword(newPassword ? "••••••••" : password)
      setChangingEmail(false)
      setChangingPassword(false)
      setNewPassword("")

      toast({
        title: "Success",
        description: "User profile updated successfully!",
      })
    } catch (error) {
      console.error("Error updating user data:", error)
      toast({
        title: "Error",
        description: "Failed to update user profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const fetchAuditLogs = async (page = 0, pageSize = 50, startDate = "", endDate = "") => {
    if (!checkAdminAuth()) return

    setAuditLogsLoading(true)

    try {
      // Start with the base query
      let query = supabase
        .from("audit_logs")
        .select("chatbot_id, change_by, created_at, change_made", { count: "exact" })
        .eq("chatbot_id", chatbotId)
        .order("created_at", { ascending: false })

      // Apply date filters if provided
      if (startDate) {
        query = query.gte("created_at", startDate)
      }

      if (endDate) {
        // Add one day to include the end date fully
        const nextDay = new Date(endDate)
        nextDay.setDate(nextDay.getDate() + 1)
        const formattedNextDay = nextDay.toISOString().split("T")[0]
        query = query.lt("created_at", formattedNextDay)
      }

      // Apply pagination
      const from = page * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      if (data) {
        setAuditLogs(data)

        // Calculate total pages
        if (count !== null) {
          setTotalPages(Math.ceil(count / pageSize))
        }
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      })
    } finally {
      setAuditLogsLoading(false)
    }
  }

  const exportAuditLogs = async () => {
    if (!checkAdminAuth()) return

    toast({
      title: "Exporting logs",
      description: "Please wait while we prepare your export...",
    })

    try {
      // Initialize an array to store all logs
      let allLogs = []
      let hasMore = true
      let page = 0
      const batchSize = 1000 // Supabase limit

      // Apply the same filters as the current view
      while (hasMore) {
        // Start with the base query
        let query = supabase
          .from("audit_logs")
          .select("*")
          .eq("chatbot_id", chatbotId)
          .order("created_at", { ascending: false })

        // Apply date filters if provided
        if (startDate) {
          query = query.gte("created_at", startDate)
        }

        if (endDate) {
          // Add one day to include the end date fully
          const nextDay = new Date(endDate)
          nextDay.setDate(nextDay.getDate() + 1)
          const formattedNextDay = nextDay.toISOString().split("T")[0]
          query = query.lt("created_at", formattedNextDay)
        }

        // Apply pagination for this batch
        const from = page * batchSize
        const to = from + batchSize - 1
        query = query.range(from, to)

        const { data, error } = await query

        if (error) throw error

        if (data && data.length > 0) {
          allLogs = [...allLogs, ...data]
          page++
        } else {
          hasMore = false
        }

        // Safety check to prevent infinite loops
        if (page > 100) {
          // Max 100,000 logs
          hasMore = false
        }
      }

      // Create a JSON file and trigger download
      const dataStr = JSON.stringify(allLogs, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `audit_logs_${chatbotId}_${new Date().toISOString().split("T")[0]}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Export complete",
        description: `Successfully exported ${allLogs.length} audit log entries.`,
      })
    } catch (error) {
      console.error("Error exporting audit logs:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting the audit logs.",
        variant: "destructive",
      })
    }
  }

  const applyDateFilter = () => {
    setCurrentPage(0) // Reset to first page when filter changes
    setIsFilterApplied(true)
    fetchAuditLogs(0, pageSize, startDate, endDate)
  }

  const clearDateFilter = () => {
    setStartDate("")
    setEndDate("")
    setIsFilterApplied(false)
    setCurrentPage(0)
    fetchAuditLogs(0, pageSize)
  }

  // Update the useEffect to call fetchAuditLogs
  useEffect(() => {
    const fetchUserData = async () => {
      if (!checkAdminAuth()) return

      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase.from("credentials").select("*").eq("chatbot_id", chatbotId).single()

        if (error) throw error

        if (data) {
          setUserData(data)
          setOriginalUserData(JSON.parse(JSON.stringify(data))) // Deep copy for comparison later
          setEmail(data.username || "")
          setPassword("••••••••") // Mask the actual password
          setFirstName(data.first_name || "")
          setLastName(data.last_name || "")
          setCompany(data.company || "")
          setRole(data.role || "")
          setTimezone(data.timezone || "")
          setPhoneNumber(data.phone_number || "")
          setCountryCode(data.country_code || "+1")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to fetch user data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
    fetchAuditLogs(currentPage, pageSize, startDate, endDate) // Pass the pagination and filter parameters
  }, [chatbotId, router, currentPage])

  // Add a function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date)
  }

  // Add a function to format the JSON data
  const formatChangeData = (changeData) => {
    if (!changeData) return "No changes"

    try {
      // If it's already a string, parse it
      const changes = typeof changeData === "string" ? JSON.parse(changeData) : changeData

      // Format the changes for display
      return Object.entries(changes)
        .map(([key, value]) => {
          // Handle different formats of change data
          if (value && typeof value === "object" && ("previous" in value || "current" in value)) {
            return `${key}: changed from "${value.previous}" to "${value.current}"`
          } else if (value && typeof value === "object" && ("from" in value || "to" in value)) {
            return `${key}: changed from "${value.from}" to "${value.to}"`
          } else if (typeof value === "string" && value.startsWith("changed from")) {
            return `${key}: ${value}`
          } else {
            return `${key}: ${JSON.stringify(value)}`
          }
        })
        .join("\n")
    } catch (error) {
      console.error("Error formatting change data:", error)
      return JSON.stringify(changeData, null, 2)
    }
  }

  // Add the Audit Logs section to the return statement, after the main profile form
  // Replace the existing return statement with this updated one that includes tabs

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 pt-20 pb-8">
        <AdminHeader
          title="Account Management"
          description="Manage user account settings and preferences"
          showBackButton={true}
          backButtonText="Back to Admin Dashboard"
          backButtonHref="/admin"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar - now using the shared component */}
          <AccountSidebar activePage="profile" chatbotId={chatbotId} />

          {/* Main content */}
          <div className="md:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="audit">Audit Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h1 className="text-3xl font-bold mb-8">My profile</h1>

                  {/* Profile avatar */}
                  <UserAvatar
                    chatbotId={chatbotId}
                    firstName={firstName}
                    lastName={lastName}
                    username={email}
                    size="md"
                  />

                  {/* Form fields */}
                  <div className="space-y-6">
                    {/* Email field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email <span className="text-red-500">*</span> <span className="text-gray-500">(required)</span>
                      </label>
                      {changingEmail ? (
                        <div className="flex gap-2">
                          <Input
                            id="new-email"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="flex-grow"
                            placeholder="Enter new email"
                          />
                          <Button variant="outline" onClick={() => setChangingEmail(false)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            readOnly
                            className="flex-grow bg-gray-50 dark:bg-gray-700"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              setChangingEmail(true)
                              setNewEmail(email)
                            }}
                          >
                            CHANGE EMAIL
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Password field */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label htmlFor="password" className="block text-sm font-medium">
                          Password <span className="text-red-500">*</span>{" "}
                          <span className="text-gray-500">(required)</span>
                        </label>
                        {changingPassword && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="font-medium">Password must:</p>
                                <ul className="list-disc pl-4 text-xs mt-1">
                                  <li>Be at least 8 characters long</li>
                                  <li>Contain at least one uppercase letter</li>
                                  <li>Contain at least one lowercase letter</li>
                                  <li>Contain at least one number</li>
                                  <li>Contain at least one special character</li>
                                  <li>Not contain parts of the email address</li>
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      {changingPassword ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="flex-grow"
                              placeholder="Enter new password"
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                setChangingPassword(false)
                                setPasswordError("")
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                          {passwordError && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertDescription>{passwordError}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            readOnly
                            className="flex-grow bg-gray-50 dark:bg-gray-700"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              setChangingPassword(true)
                              setNewPassword("")
                            }}
                          >
                            CHANGE PASSWORD
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* First name field */}
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium mb-1">
                        First name <span className="text-red-500">*</span>{" "}
                        <span className="text-gray-500">(required)</span>
                      </label>
                      <Input
                        id="first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    {/* Last name field */}
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium mb-1">
                        Last name
                      </label>
                      <Input
                        id="last-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>

                    {/* Company field */}
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-1">
                        Company
                      </label>
                      <Input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>

                    {/* Role field */}
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium mb-1">
                        Role
                      </label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Timezone field */}
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium mb-1">
                        Timezone
                      </label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezoneOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-1">Used when we handle time with no explicit timezone.</p>
                    </div>

                    {/* Phone Number fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="country-code" className="block text-sm font-medium mb-1">
                          Country Code <span className="text-red-500">*</span>
                        </label>
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country code" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {countryCodes.map((option) => (
                              <SelectItem key={option.code} value={option.code}>
                                {option.code} ({option.country})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="phone-number" className="block text-sm font-medium mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="phone-number"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            const value = e.target.value
                            const filteredValue = value.replace(/\D/g, "") // Only allow digits
                            setPhoneNumber(filteredValue)
                          }}
                          placeholder="e.g., 1234567890"
                          required
                        />
                      </div>
                    </div>

                    {/* Save button */}
                    <div className="pt-4">
                      <Button
                        onClick={handleSaveChanges}
                        disabled={saving}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audit">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Audit Logs</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={exportAuditLogs} className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Export Logs
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Date filter controls */}
                    <div className="mb-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <Filter className="h-4 w-4 mr-1" />
                        Filter by date
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label htmlFor="start-date" className="block text-xs mb-1">
                            Start Date
                          </label>
                          <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="end-date" className="block text-xs mb-1">
                            End Date
                          </label>
                          <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={clearDateFilter} disabled={!isFilterApplied}>
                          Clear
                        </Button>
                        <Button size="sm" onClick={applyDateFilter} disabled={!startDate && !endDate}>
                          Apply Filter
                        </Button>
                      </div>
                    </div>

                    {auditLogsLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : auditLogs.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">
                        {isFilterApplied
                          ? "No audit logs found for the selected date range."
                          : "No audit logs found for this chatbot."}
                      </p>
                    ) : (
                      <>
                        <ScrollArea className="h-[500px] rounded-md border">
                          <div className="p-4 space-y-4">
                            {auditLogs.map((log, index) => (
                              <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <span className="font-semibold text-sm text-gray-500">Changed By:</span>
                                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-100 text-xs font-medium">
                                      {log.change_by}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-semibold text-sm text-gray-500">Date:</span>
                                    <span className="ml-2 text-sm">{formatDate(log.created_at)}</span>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="font-semibold text-sm text-gray-500">Changes:</span>
                                  <pre className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-xs overflow-auto whitespace-pre-wrap">
                                    {formatChangeData(log.change_made)}
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>

                        {/* Pagination controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-500">
                            Showing page {currentPage + 1} of {totalPages || 1}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                              disabled={currentPage === 0 || auditLogsLoading}
                            >
                              <ChevronLeftIcon className="h-4 w-4" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage >= totalPages - 1 || auditLogsLoading}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
