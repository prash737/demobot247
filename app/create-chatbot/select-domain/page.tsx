"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/app/components/footer"
import { supabase } from "@/app/utils/supabaseClient"

const domains = [
  { name: "Education", active: true, disabled: false },
  { name: "Corporate", active: false, disabled: true },
  { name: "Legal", active: false, disabled: true },
  { name: "E-commerce", active: false, disabled: true },
]

export default function SelectDomainPage() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkExistingDomain = async () => {
      try {
        const storedData = localStorage.getItem("userData")
        if (!storedData) {
          router.push("/login")
          return
        }

        const { username } = JSON.parse(storedData)

        const { data, error } = await supabase
          .from("credentials")
          .select("selected_domain")
          .eq("username", username)
          .single()

        if (error) throw error

        if (data?.selected_domain) {
          router.push("/create-chatbot")
        }
      } catch (error) {
        console.error("Error checking existing domain:", error)
        // You may want to handle this error differently
      }
    }

    checkExistingDomain()
  }, [router])

  const handleDomainSelection = (domain: string) => {
    const selectedDomain = domains.find((d) => d.name === domain)
    if (selectedDomain && !selectedDomain.disabled) {
      setSelectedDomain(domain)
    }
  }

  const handleContinue = () => {
    if (selectedDomain) {
      // Store the selected domain in localStorage
      const storedData = localStorage.getItem("userData")
      if (storedData) {
        const userData = JSON.parse(storedData)
        userData.selectedDomain = selectedDomain
        localStorage.setItem("userData", JSON.stringify(userData))
      }

      router.push("/create-chatbot")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">Select Your Domain</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {domains.map((domain, index) => (
            <Card
              key={index}
              className={`cursor-pointer ${selectedDomain === domain.name ? "border-blue-500" : ""} ${
                domain.disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handleDomainSelection(domain.name)}
            >
              <CardHeader>
                <CardTitle>{domain.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{domain.active ? "Available" : domain.disabled ? "Coming Soon" : "Not Available"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button onClick={handleContinue} disabled={!selectedDomain}>
            Continue
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
