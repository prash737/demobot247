"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/app/components/footer"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { loadRazorpayScript, RAZORPAY_KEY_ID, generateOrderId } from "@/app/utils/razorpay"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

const plans = [
  {
    title: "Free Plan",
    price: 0,
    displayPrice: "Free",
    chatLimit: 10,
    features: ["10 chats/month", "1 FAQ upload (file, 5MB max)", "Email support", "bot247.live branding"],
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
  chatbotId?: string
  name?: string
  email?: string
}

// Define Razorpay interface
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PlanSelectionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("Pro") // Default to Pro plan
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
      router.push("/signup")
    }
  }, [router])

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
        router.push("/signup")
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
              // Update user's plan in the database
              const { error: updateError } = await supabase
                .from("credentials")
                .update({
                  selected_plan: planTitle,
                  payment_status: "paid",
                  payment_date: new Date().toISOString(),
                })
                .eq("username", userData.username)

              if (updateError) throw updateError

              // Payment successful, redirect to profile page
              router.push("/profile")
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
          email: userData.email || userData.username,
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
        router.push("/signup")
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

      // Redirect to profile page
      router.push("/profile")
    } catch (error) {
      console.error("Free subscription error:", error)
      setError("An unexpected error occurred during plan selection")
    } finally {
      setPaymentProcessing(false)
    }
  }

  // Handle proceed button click
  const handleProceed = async () => {
    setIsLoading(true)
    const plan = plans.find((p) => p.title === selectedPlan)

    if (!plan) {
      setError("Please select a plan to continue")
      setIsLoading(false)
      return
    }

    try {
      await handlePayment(plan.title, plan.price)
    } catch (error) {
      console.error("Plan selection error:", error)
      setError("An unexpected error occurred during plan selection")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle back button click
  const handleBack = () => {
    router.push("/signup")
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={handleBack} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Signup
          </Button>

          <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
          <p className="text-center text-muted-foreground mb-8">Select the plan that best fits your needs</p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`${
                  selectedPlan === plan.title
                    ? "border-blue-500 shadow-lg dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-700"
                } cursor-pointer transition-all hover:shadow-md`}
                onClick={() => setSelectedPlan(plan.title)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {plan.title}
                    {selectedPlan === plan.title && (
                      <div className="bg-blue-500 text-white text-xs font-medium px-2.5 py-0.5 rounded">Selected</div>
                    )}
                  </CardTitle>
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
                          className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleBack} disabled={isLoading || paymentProcessing}>
              Back
            </Button>
            <Button
              onClick={handleProceed}
              disabled={isLoading || paymentProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading || paymentProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Proceed with ${selectedPlan}`
              )}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
