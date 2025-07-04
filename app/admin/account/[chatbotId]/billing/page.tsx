"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft } from "lucide-react"
import AccountSidebar from "../../components/account-sidebar"
import { useToast } from "@/components/ui/use-toast"
import { logAuditEvent } from "@/app/utils/audit-logger"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

interface UserData {
  username: string
  chatbot_id: string
  selected_plan: string
  payment_status: string
  payment_date: string
  payment_id: string
  payment_amount: number
  chat_limit: string
  total_chats: number
  first_name: string
  last_name: string
}

export default function BillingPage() {
  const router = useRouter()
  const params = useParams()
  const chatbotId = params.chatbotId as string

  const [userData, setUserData] = useState<UserData | null>(null)
  const [originalUserData, setOriginalUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkAdminAuth = () => {
      const adminData = localStorage.getItem("adminData")
      if (!adminData) {
        router.push("/admin/login")
        return false
      }
      return true
    }

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
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to fetch user data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [chatbotId, router, toast])

  const handleBack = () => {
    router.push(`/admin/account/${chatbotId}`)
  }

  const handleUpgradePlan = async () => {
    setUpgrading(true)
    try {
      // This is a placeholder for the actual upgrade functionality
      // In a real implementation, you would show a plan selection modal or redirect to a plan selection page

      // For demonstration purposes, let's assume we're upgrading from Basic to Pro
      const newPlan =
        userData?.selected_plan === "Basic" ? "Pro" : userData?.selected_plan === "Pro" ? "Advanced" : "Pro"

      const newChatLimit = newPlan === "Pro" ? "5000" : newPlan === "Advanced" ? "Unlimited" : "500"

      const { error } = await supabase
        .from("credentials")
        .update({
          selected_plan: newPlan,
          chat_limit: newChatLimit,
        })
        .eq("chatbot_id", chatbotId)

      if (error) throw error

      // Log the plan change to audit logs
      await logAuditEvent(chatbotId, "admin", {
        plan_change: {
          previous: {
            plan: userData?.selected_plan,
            chat_limit: userData?.chat_limit,
          },
          current: {
            plan: newPlan,
            chat_limit: newChatLimit,
          },
        },
      })

      toast({
        title: "Plan Upgraded",
        description: `Successfully upgraded to ${newPlan} plan`,
      })

      // Refresh the data
      const { data: updatedData } = await supabase.from("credentials").select("*").eq("chatbot_id", chatbotId).single()

      if (updatedData) {
        setUserData(updatedData)
        setOriginalUserData(JSON.parse(JSON.stringify(updatedData)))
      }
    } catch (error) {
      console.error("Error upgrading plan:", error)
      toast({
        title: "Error",
        description: "Failed to upgrade plan",
        variant: "destructive",
      })
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading billing data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar - now using the shared component */}
          <AccountSidebar activePage="billing" chatbotId={chatbotId} />

          {/* Main content */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold mb-8">Billing and Usage</h1>

              {/* Avatar section removed */}

              {/* Current Plan */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Current Plan</h2>
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">{userData?.selected_plan || "Free Plan"}</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Chat Limit: {userData?.chat_limit || "N/A"} messages
                      </p>
                    </div>
                    {/* Changed button color from orange to blue */}
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUpgradePlan} disabled={upgrading}>
                      {upgrading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Upgrading...
                        </>
                      ) : (
                        "Upgrade Plan"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Usage Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Chats Used</p>
                    <p className="text-2xl font-bold">{userData?.total_chats || "0"}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Chats</p>
                    <p className="text-2xl font-bold">
                      {userData?.selected_plan === "Basic"
                        ? userData?.total_chats !== undefined
                          ? Math.max(0, 500 - userData.total_chats)
                          : "N/A"
                        : "Unlimited"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h2 className="text-xl font-bold mb-4">Payment Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Payment Status</p>
                    <p className="font-medium">{userData?.payment_status || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Payment Date</p>
                    <p className="font-medium">
                      {userData?.payment_date ? new Date(userData.payment_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Payment ID</p>
                    <p className="font-medium">{userData?.payment_id || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Payment Amount</p>
                    <p className="font-medium">
                      {userData?.payment_amount ? `₹${userData.payment_amount.toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Payment History</h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {userData?.payment_id ? (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {userData.payment_date ? new Date(userData.payment_date).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {userData.selected_plan} Plan Subscription
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {userData.payment_amount ? `₹${userData.payment_amount.toLocaleString()}` : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                userData.payment_status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                              }`}
                            >
                              {userData.payment_status || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No payment history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
