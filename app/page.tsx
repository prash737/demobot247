
"use client";

import { Hero } from "@/app/components/hero";
import { Suspense, lazy } from "react";

// Lazy load heavy components
const Features = lazy(() => import("@/app/components/features").then(mod => ({ default: mod.Features })));
const KeyFeatures = lazy(() => import("@/app/components/keyfeatures").then(mod => ({ default: mod.KeyFeatures })));
const Benefits = lazy(() => import("@/app/components/benefits").then(mod => ({ default: mod.Benefits })));
const OurClients = lazy(() => import("@/app/components/our-clients").then(mod => ({ default: mod.OurClients })));
const TestimonialCarousel = lazy(() => import("@/app/components/testimonial-carousel").then(mod => ({ default: mod.TestimonialCarousel })));
const Pricing = lazy(() => import("@/app/components/pricing").then(mod => ({ default: mod.Pricing })));
const Stats = lazy(() => import("@/app/components/stats").then(mod => ({ default: mod.Stats })));
const CTA = lazy(() => import("@/app/components/cta").then(mod => ({ default: mod.CTA })));
const FAQ = lazy(() => import("@/app/components/faq").then(mod => ({ default: mod.FAQ })));

// Loading component
const LoadingComponent = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      
      <Suspense fallback={<LoadingComponent />}>
        <Features />
      </Suspense>
      
      <Suspense fallback={<LoadingComponent />}>
        <KeyFeatures />
      </Suspense>
      
      <Suspense fallback={<LoadingComponent />}>
        <Benefits />
      </Suspense>
      
      <Suspense fallback={<LoadingComponent />}>
        <OurClients />
      </Suspense>
      
      <Suspense fallback={<LoadingComponent />}>
        <TestimonialCarousel />
      </Suspense>
      
      <Suspense fallback={<LoadingComponent />}>
        <Pricing />
      </Suspense>
      
      <Suspense fallback={<LoadingComponent />}>
        <Stats />
      </Suspense>
      
      <Suspense fallback={<LoadingComponent />}>
        <CTA />
      </Suspense>
      
      <Suspense fallback={<LoadingComponent />}>
        <FAQ />
      </Suspense>
    </main>
  );
}
