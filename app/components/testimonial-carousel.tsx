"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface Testimonial {
  quote: string
  author: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Working with @bot247 has been one of the best experiences I've had lately. Incredibly easy to set up, great documentation, and so many fewer hoops to jump through than the competition.",
    author: "@happy_user",
  },
  {
    quote:
      "Bot247 has revolutionized our client onboarding process. The AI-powered system has saved us countless hours and improved our efficiency tenfold.",
    author: "@efficiency_expert",
  },
  {
    quote:
      "The customer support at Bot247 is unparalleled. They're always quick to respond and go above and beyond to solve any issues.",
    author: "@grateful_admin",
  },
  {
    quote:
      "Since implementing Bot247, we've seen a significant increase in client satisfaction. The streamlined process makes everything smoother for everyone involved.",
    author: "@satisfied_executive",
  },
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-full flex flex-col justify-center items-center">
      <div className="max-w-md space-y-4">
        <div className="relative">
          <div
            className="text-[120px] font-serif leading-none bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent absolute -top-16 -left-6"
            style={{
              fontFamily: "Georgia, serif",
              opacity: "0.7",
              zIndex: 10,
            }}
          >
            "
          </div>

          <p className="text-xl font-medium min-h-[6rem] text-gray-800 dark:text-gray-200 relative z-20 pt-8">
            {testimonials[currentIndex].quote}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{testimonials[currentIndex].author}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-2 h-2 rounded-full p-0 ${
              index === currentIndex ? "bg-gray-800 dark:bg-gray-200" : "bg-gray-300 dark:bg-gray-700"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
