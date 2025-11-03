"use client"
import dynamic from 'next/dynamic'
import { Hero } from "@/app/components/hero"
import { Implementation } from "@/app/components/implementation"
import { Footer } from "@/app/components/footer"
import { IndustrySolutions } from "@/app/components/industry-solutions"
import { useScrollToHash } from "./hooks/useScrollToHash"

// Dynamic imports for components that use OwlCarousel
const Features = dynamic(() => import("@/app/components/features").then(mod => ({ default: mod.Features })), {
  ssr: false,
  loading: () => null
})

const OurClients = dynamic(() => import("@/app/components/our-clients").then(mod => ({ default: mod.OurClients })), {
  ssr: false,
  loading: () => null
})

// Lazy load below-fold components
const Keyfeatures = dynamic(() => import("@/app/components/keyfeatures").then(mod => ({ default: mod.Keyfeatures })), {
  ssr: false
})

const Benefits = dynamic(() => import("@/app/components/benefits").then(mod => ({ default: mod.Benefits })), {
  ssr: false
})

const Stats = dynamic(() => import("@/app/components/stats").then(mod => ({ default: mod.Stats })), {
  ssr: false
})

const Pricing = dynamic(() => import("@/app/components/pricing").then(mod => ({ default: mod.Pricing })), {
  ssr: false
})

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