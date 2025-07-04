"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import UserProfileSidebar from "../components/user-profile-sidebar"
import { useToast } from "@/components/ui/use-toast"
import ChatbotHeader from "@/app/components/chatbot-header"
import { Footer } from "@/app/components/footer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { loadRazorpayScript, RAZORPAY_KEY_ID, generateOrderId } from "@/app/utils/razorpay"
import { logAuditEvent } from "@/app/utils/audit-logger" // Import the audit logger

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

// Add this after the UserData interface
declare global {
  interface Window {
    Razorpay: any
  }
}

const plans = [
  {
    title: "Free Plan",
    price: 0,
    displayPrice: "Free",
    chatLimit: 50, // Changed from 10 to 50
    features: ["50 chats/month", "1 FAQ upload (file, 5MB max)", "Email support", "bot247.live branding"],
  },
  {
    title: "Basic",
    price: 3000,
    displayPrice: "₹ 3000",
    chatLimit: 200,
    features: [
      "Free for All Non-Profit Organizations / 14 day Free trial for other Organizations",
      "Upto 200 chat sessions/month",
      "Basic AI chatbot",
      "Website Crawl Data",
      "Email support",
      "Basic Analytics and Chat history",
      "bot247.live branding",
    ],
  },
  {
    title: "Pro",
    price: 7000,
    displayPrice: "₹ 7000",
    chatLimit: 1500,
    features: [
      "Upto 1500 chat sessions/month",
      "Advanced AI chatbot",
      "Upto 20 data source(including URL, PDF, TXT, CSV)",
      "Priority support",
      "Advanced analytics & reporting",
      "Custom co-branding",
    ],
  },
  {
    title: "Advanced",
    price: 10000,
    displayPrice: "₹ 10000",
    chatLimit: 4000,
    features: [
      "Whatsapp Business API Registration and Integration",
      "Upto 4000 chat sessions/month",
      "Advanced AI chatbot",
      "Upto 20 data source(including URL, PDF, TXT, CSV)",
      "Priority support",
      "Advanced analytics & reporting",
      "Dedicated account manager",
      "Custom branding",
    ],
  },
]

export default function BillingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add these state variables after the existing ones
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  useEffect(() => {
    const checkUserAuth = () => {
      const userData = localStorage.getItem("userData")
      if (!userData) {
        router.push("/login")
        return false
      }
      return true
    }

    const fetchUserData = async () => {
      if (!checkUserAuth()) return

      setLoading(true)
      setError(null)

      try {
        const storedData = localStorage.getItem("userData")
        if (!storedData) {
          router.push("/login")
          return
        }

        const { username } = JSON.parse(storedData)

        // Fetch user data from Supabase
        const { data, error } = await supabase.from("credentials").select("*").eq("username", username).single()

        if (error) throw error

        if (data) {
          setUserData(data)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to fetch user data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, toast])

  // Add this useEffect after the existing useEffect
  useEffect(() => {
    // Load Razorpay script when component mounts
    loadRazorpayScript().catch((error) => {
      console.error("Failed to load Razorpay script:", error)
      toast({
        title: "Error",
        description: "Failed to load payment gateway. Please try again.",
        variant: "destructive",
      })
    })
  }, [toast])

  const handleBack = () => {
    router.push("/user-profile")
  }

  // Add this function before the return statement
  const handleUpgradePlan = () => {
    // Set the current plan as the default selected plan
    setSelectedUpgradePlan(userData?.selected_plan || "Basic")
    setIsUpgradeDialogOpen(true)
  }

  const handlePlanSelection = (planTitle: string) => {
    setSelectedUpgradePlan(planTitle)
  }

  const handlePayment = async () => {
    if (!selectedUpgradePlan || !userData) return

    try {
      setIsProcessingPayment(true)

      const selectedPlan = plans.find((plan) => plan.title === selectedUpgradePlan)
      if (!selectedPlan) {
        throw new Error("Selected plan not found")
      }

      // For free plan, update directly
      if (selectedPlan.price === 0) {
        await updateUserPlan(selectedUpgradePlan, "free")
        setIsUpgradeDialogOpen(false)
        return
      }

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        const loaded = await loadRazorpayScript()
        if (!loaded) {
          throw new Error("Failed to load Razorpay")
        }
      }

      // Create order
      const orderId = await generateOrderId(selectedPlan.price)

      // Configure Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: selectedPlan.price * 100, // in paise
        currency: "INR",
        name: "Bot247",
        description: `${selectedPlan.title} Plan Subscription`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                username: userData.username,
                planTitle: selectedPlan.title,
                amount: selectedPlan.price,
              }),
            })

            const data = await verificationResponse.json()

            if (data.success) {
              // Update user's plan in the database
              await updateUserPlan(selectedPlan.title, "paid", response.razorpay_payment_id, selectedPlan.price)

              toast({
                title: "Success",
                description: `Successfully upgraded to ${selectedPlan.title} plan`,
              })

              // Refresh the page to show updated plan
              window.location.reload()
            } else {
              toast({
                title: "Payment Failed",
                description: "Payment verification failed. Please try again.",
                variant: "destructive",
              })
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            toast({
              title: "Error",
              description: "An error occurred during payment verification",
              variant: "destructive",
            })
          } finally {
            setIsProcessingPayment(false)
            setIsUpgradeDialogOpen(false)
          }
        },
        prefill: {
          name: userData.first_name ? `${userData.first_name} ${userData.last_name || ""}` : userData.username,
          email: userData.username,
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false)
          },
        },
      }

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during payment setup",
        variant: "destructive",
      })
      setIsProcessingPayment(false)
    }
  }

  const updateUserPlan = async (planTitle: string, status: string, paymentId?: string, amount?: number) => {
    try {
      // Log the plan change to audit logs
      if (userData?.selected_plan !== planTitle) {
        await logAuditEvent(userData?.chatbot_id || "", "user", {
          plan_change: {
            from: userData?.selected_plan || "None",
            to: planTitle,
          },
        })
      }

      const updateData: any = {
        selected_plan: planTitle,
        payment_status: status,
        payment_date: new Date().toISOString(),
        chat_limit: plans.find((p) => p.title === planTitle)?.chatLimit?.toString() || "N/A", // Add this line
      }

      if (paymentId) {
        updateData.payment_id = paymentId
      }

      if (amount) {
        updateData.payment_amount = amount
      }

      const { error } = await supabase.from("credentials").update(updateData).eq("username", userData?.username)

      if (error) throw error

      // Log payment details to audit logs if this is a paid plan
      if (paymentId && amount) {
        await logAuditEvent(userData?.chatbot_id || "", "user", {
          payment_processed: {
            payment_id: paymentId,
            amount: amount,
            status: status,
            date: new Date().toISOString(),
          },
        })
      }

      toast({
        title: "Success",
        description: `Successfully updated to ${planTitle} plan`,
      })
    } catch (error) {
      console.error("Error updating plan:", error)
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      })
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
      <ChatbotHeader chatbotName="Billing and Usage" isScrolled={false} />
      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="mb-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <UserProfileSidebar activePage="billing" chatbotId={userData?.chatbot_id || ""} />

          {/* Main content */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold mb-8">Billing and Usage</h1>

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
                      {userData?.selected_plan === "Free Plan"
                        ? userData?.total_chats !== undefined
                          ? Math.max(0, 50 - userData.total_chats) // Changed from 10 to 50
                          : "N/A"
                        : userData?.selected_plan === "Basic"
                          ? userData?.total_chats !== undefined
                            ? Math.max(0, 200 - userData.total_chats)
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
      {/* Plan Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Upgrade Your Plan</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {plans.map((plan) => (
              <div
                key={plan.title}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedUpgradePlan === plan.title
                    ? "border-blue-500 shadow-md dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => handlePlanSelection(plan.title)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">{plan.title}</h3>
                  {selectedUpgradePlan === plan.title && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold mb-2">
                  {plan.displayPrice}
                  <span className="text-sm font-normal">/month</span>
                </p>
                <ul className="space-y-1 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessingPayment || selectedUpgradePlan === userData?.selected_plan}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed with Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  )
}
