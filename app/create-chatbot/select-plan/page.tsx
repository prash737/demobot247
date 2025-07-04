"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/app/components/footer"
import { createClient } from "@supabase/supabase-js"
import { loadRazorpayScript, RAZORPAY_KEY_ID, generateOrderId } from "@/app/utils/razorpay"

// Updated Supabase client initialization
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

const plans = [
  {
    title: "Free Plan",
    price: 0,
    displayPrice: "Free",
    chatLimit: 50,
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

// Define TypeScript interface for user data
interface UserData {
  username: string
  email?: string // Make email optional
  chatbotId?: string
  name?: string
}

// Define Razorpay interface
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function SelectPlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      setUserData(JSON.parse(storedData))
    } else {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const checkExistingPlan = async () => {
      try {
        if (!userData?.username) return

        const { data, error } = await supabase
          .from("credentials")
          .select("selected_plan, payment_status")
          .eq("username", userData.username)
          .single()

        if (error) throw error

        // If user has a paid plan, redirect to chatbot interface
        if (data?.selected_plan && (data?.payment_status === "paid" || data?.selected_plan === "Basic")) {
          router.push("/create-chatbot/chatbot-interface")
        }
      } catch (error) {
        console.error("Error checking existing plan:", error)
        setError("An unexpected error occurred while checking your plan")
      }
    }

    if (userData) {
      checkExistingPlan()
    }
  }, [userData, router])

  // Load Razorpay script
  useEffect(() => {
    loadRazorpayScript().catch((err) => {
      console.error("Failed to load Razorpay script:", err)
      setError("Failed to load payment gateway. Please try again.")
    })
  }, [])

  // Handle payment with Razorpay
  const handlePayment = async (planTitle: string, amount: number) => {
    console.log("Starting payment process for:", planTitle, amount)
    console.log("User data available:", userData)
    try {
      setPaymentProcessing(true)

      if (!userData?.username) {
        router.push("/login")
        return
      }

      // For free plan, skip payment
      if (amount === 0) {
        await handleFreeSubscription(planTitle)
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
      const orderId = await generateOrderId(amount)

      // Configure Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100, // in paise
        currency: "INR",
        name: "Bot247",
        description: `${planTitle} Plan Subscription`,
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
                planTitle: planTitle,
                amount: amount,
              }),
            })

            const data = await verificationResponse.json()

            if (data.success) {
              // Payment successful, redirect to chatbot interface
              router.push("/create-chatbot/chatbot-interface")
            } else {
              setError("Payment verification failed. Please try again.")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            setError("An error occurred during payment verification")
          } finally {
            setPaymentProcessing(false)
          }
        },
        prefill: {
          name: userData.name || userData.username,
          email: userData.email || `${userData.username}@example.com`, // Provide fallback email
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false)
          },
        },
      }

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment error:", error)
      setError("An unexpected error occurred during payment setup")
      setPaymentProcessing(false)
    }
  }

  // Handle free subscription
  const handleFreeSubscription = async (planTitle: string) => {
    try {
      if (!userData?.username) {
        router.push("/login")
        return
      }

      // Update user's plan in the database
      const { error: updateError } = await supabase
        .from("credentials")
        .update({
          selected_plan: planTitle,
          payment_status: "free",
          payment_date: new Date().toISOString(),
          chat_limit: plans.find((p) => p.title === planTitle)?.chatLimit?.toString() || "N/A", // Add this line
        })
        .eq("username", userData.username)

      if (updateError) throw updateError

      // Redirect to chatbot interface
      router.push("/create-chatbot/chatbot-interface")
    } catch (error) {
      console.error("Free subscription error:", error)
      setError("An unexpected error occurred during plan selection")
    } finally {
      setPaymentProcessing(false)
    }
  }

  // Handle plan selection
  const handlePlanSelection = async (planTitle: string, price: number) => {
    console.log("Plan selected:", planTitle, price)
    console.log("User data:", userData)
    setSelectedPlan(planTitle)
    setIsLoading(true)

    try {
      await handlePayment(planTitle, price)
    } catch (error) {
      console.error("Plan selection error:", error)
      setError("An unexpected error occurred during plan selection")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">Select Your Plan</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={selectedPlan === plan.title ? "border-blue-500 shadow-lg" : ""}>
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <p className="text-2xl font-bold">
                  {plan.displayPrice}
                  <span className="text-sm font-normal">/month</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-500 mr-2 flex-shrink-0"
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
                <Button
                  className="w-full mt-6"
                  onClick={() => handlePlanSelection(plan.title, plan.price)}
                  variant={selectedPlan === plan.title ? "default" : "outline"}
                  disabled={isLoading || paymentProcessing}
                >
                  {(isLoading || paymentProcessing) && selectedPlan === plan.title ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : plan.price === 0 ? (
                    "Get Started Free"
                  ) : (
                    `Subscribe to ${plan.title}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
