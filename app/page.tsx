
"use client";

import { Hero } from "@/app/components/hero";
import { Suspense, lazy } from "react";

// Lazy load heavy components
const Features = lazy(() => 
  import("@/app/components/features").then(mod => ({ 
    default: mod.Features || mod.default 
  })).catch(() => ({ default: () => <div>Loading...</div> }))
);

const KeyFeatures = lazy(() => 
  import("@/app/components/keyfeatures").then(mod => ({ 
    default: mod.KeyFeatures || mod.default 
  })).catch(() => ({ default: () => <div>Loading...</div> }))
);

const Benefits = lazy(() => 
  import("@/app/components/benefits").then(mod => ({ 
    default: mod.Benefits || mod.default 
  })).catch(() => ({ default: () => <div>Loading...</div> }))
);

const OurClients = lazy(() => 
  import("@/app/components/our-clients").then(mod => ({ 
    default: mod.OurClients || mod.default 
  })).catch(() => ({ default: () => <div>Loading...</div> }))
);

const TestimonialCarousel = lazy(() => 
  import("@/app/components/testimonial-carousel").then(mod => ({ 
    default: mod.TestimonialCarousel || mod.default 
  })).catch(() => ({ default: () => <div>Loading...</div> }))
);

const Pricing = lazy(() => 
  import("@/app/components/pricing").then(mod => ({ 
    default: mod.Pricing || mod.default 
  })).catch(() => ({ default: () => <div>Loading...</div> }))
);

const Stats = lazy(() => 
  import("@/app/components/stats").then(mod => ({ 
    default: mod.Stats || mod.default 
  })).catch(() => ({ default: () => <div>Loading...</div> }))
);

const CTA = lazy(() => 
  import("@/app/components/cta").then(mod => ({ 
    default: mod.CTA || mod.default 
  })).catch(() => ({ default: () => <div>Loading...</div> }))
);

const FAQ = lazy(() => 
  import("@/app/components/faq").then(mod => ({ 
    default: mod.FAQ || mod.default 
  })).catch(() => ({ default: () => <div>Loading...</div> }))
);

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
