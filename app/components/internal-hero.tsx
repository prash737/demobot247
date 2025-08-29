"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface InternalHeroProps {
  title?: string // Made optional
  description?: string // Made optional
  icon?: ReactNode
  className?: string
}

export function InternalHero({ title, description, icon, className }: InternalHeroProps) {
  return (
    
    <section className="relative justify-center overflow-hidden">
      <div className="absolute inset-0">

        {/* Floating Grid Dots */}
        {/* <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/40 dark:bg-blue-400/25 rounded-full animate-drift transition-transform duration-300 hover:animate-none hover:scale-150"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                "--duration": `${5 + Math.random() * 5}s`, // Increased speed for homepage (5s to 10s)
                "--delay": `${Math.random() * 0.1}s`,
              }}
            />
          ))}
        </div> */}


      </div>
      <div className="solution_innerheading_box">
        <div className="relative z-10 container mx-auto flex flex-col items-center justify-center text-center">
          {/* {icon && <div className="mb-4 flex justify-center">{icon}</div>} */}
          {title && <h1 className="heading70">{title}</h1>}
          {description && (
            <p className="">{description}</p>
          )}
        </div>
      </div>
    </section>
  )
}
