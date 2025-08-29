"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function useScrollToHash() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/") {
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
  }, [pathname])
}
