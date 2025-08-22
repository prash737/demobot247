"use client";

import { Hero } from "@/app/components/hero";
import { Suspense, lazy } from "react";

// Lazy load heavy components with direct imports
const Features = lazy(() => import("@/app/components/features"));
const KeyFeatures = lazy(() => import("@/app/components/keyfeatures"));
const Benefits = lazy(() => import("@/app/components/benefits"));
const OurClients = lazy(() => import("@/app/components/our-clients"));
const TestimonialCarousel = lazy(() => import("@/app/components/testimonial-carousel"));
const Pricing = lazy(() => import("@/app/components/pricing"));
const Stats = lazy(() => import("@/app/components/stats"));
const CTA = lazy(() => import("@/app/components/cta"));
const FAQ = lazy(() => import("@/app/components/faq"));

// Loading component
const LoadingComponent = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
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