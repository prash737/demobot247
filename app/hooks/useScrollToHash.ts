
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export const useScrollToHash = () => {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (pathname === "/") {
      const hash = window.location.hash
      if (hash) {
        setTimeout(() => {
          const element = document.querySelector(hash)
          if (element) {
            element.scrollIntoView({ behavior: "smooth" })
          }
        }, 100) // Small delay to ensure the DOM has updated
      }
    }
  }, [pathname])
}
