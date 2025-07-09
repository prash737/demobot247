"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export const useScrollToHash = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (usePathname() === "/") {
      const hash = window.location.hash
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash.slice(1))
          if (element) {
            const navHeight = 80 // Adjust this value based on your navbar height
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - navHeight

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            })
          }
        }, 100) // Small delay to ensure the DOM has updated
      }
    }
  }, [usePathname()])
}