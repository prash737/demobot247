"use client"
import { Hero } from "@/app/components/hero"
import { Features } from "@/app/components/features"
import { Stats } from "@/app/components/stats"
import { Implementation } from "@/app/components/implementation"
import { Benefits } from "@/app/components/benefits"
import { Keyfeatures } from "@/app/components/keyfeatures"
import { OurClients } from "@/app/components/our-clients"
import { Pricing } from "@/app/components/pricing"
import { CTA } from "@/app/components/cta"
import { Footer } from "@/app/components/footer"
import { IndustrySolutions } from "@/app/components/industry-solutions" // Import the new component
import { useScrollToHash } from "./hooks/useScrollToHash"

export default function Home() {
  useScrollToHash()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
        <Features />
        <IndustrySolutions />
        <Implementation />
        <OurClients />
        
        <Keyfeatures />
        <Benefits />
        <Stats /> {/* Moved here */}        
        <Pricing />
        {/* <CTA /> */}
      </main>
      <Footer />
    </div>
  )
}
