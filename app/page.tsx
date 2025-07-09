"use client";
import dynamic from "next/dynamic";
import { Hero } from "@/app/components/hero";
import { Features } from "@/app/components/features";
import { Stats } from "@/app/components/stats";
import { Implementation } from "@/app/components/implementation";
import { Benefits } from "@/app/components/benefits";
import { Keyfeatures } from "@/app/components/keyfeatures";
import { Pricing } from "@/app/components/pricing";
import { CTA } from "@/app/components/cta";
import { Footer } from "@/app/components/footer";
import { IndustrySolutions } from "@/app/components/industry-solutions";
import { useScrollToHash } from "./hooks/useScrollToHash";

// Dynamically import components that might use browser APIs
const OurClients = dynamic(() => import("@/app/components/our-clients").then(mod => ({ default: mod.OurClients })), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  useScrollToHash();

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
  );
}
