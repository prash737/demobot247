"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

export function CTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuthStatus = () => {
      const adminData = localStorage.getItem("adminData")
      const userData = localStorage.getItem("userData")
      setIsLoggedIn(!!(adminData || userData))
    }

    checkAuthStatus()
    // Set up an interval to periodically check auth status, e.g., every second
    const interval = setInterval(checkAuthStatus, 1000)
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 w-full">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Operational Processes
            </span>
            ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join organizations worldwide that are streamlining their operations with Bot247.live
          </p>
          {!isLoggedIn && ( // Conditionally render the button based on login status
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-500 text-white hover:bg-blue-600">
                  Start Free Trial →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
