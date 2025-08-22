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
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Hero />

      <div className="space-y-16 md:space-y-24">
        <Suspense fallback={<LoadingComponent />}>
          <div className="section-padding animate-slide-up">
            <Features />
          </div>
        </Suspense>

        <Suspense fallback={<LoadingComponent />}>
          <div className="section-padding-sm animate-slide-up">
            <KeyFeatures />
          </div>
        </Suspense>

        <Suspense fallback={<LoadingComponent />}>
          <div className="section-padding animate-slide-up">
            <Benefits />
          </div>
        </Suspense>

        <Suspense fallback={<LoadingComponent />}>
          <div className="section-padding-sm animate-slide-up">
            <OurClients />
          </div>
        </Suspense>

        <Suspense fallback={<LoadingComponent />}>
          <div className="section-padding animate-slide-up">
            <TestimonialCarousel />
          </div>
        </Suspense>

        <Suspense fallback={<LoadingComponent />}>
          <div className="section-padding animate-slide-up">
            <Pricing />
          </div>
        </Suspense>

        <Suspense fallback={<LoadingComponent />}>
          <div className="section-padding-sm animate-slide-up">
            <Stats />
          </div>
        </Suspense>

        <Suspense fallback={<LoadingComponent />}>
          <div className="section-padding animate-slide-up">
            <CTA />
          </div>
        </Suspense>

        <Suspense fallback={<LoadingComponent />}>
          <div className="section-padding-sm animate-slide-up">
            <FAQ />
          </div>
        </Suspense>
      </div>
    </main>
  );
}