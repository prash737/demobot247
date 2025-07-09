"use client";

import { Suspense } from "react";
import { InternalHero } from "@/app/components/internal-hero";
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { TestimonialCarousel } from "@/app/components/testimonial-carousel";
import { Footer } from "@/app/components/footer";
import { LoginForm } from "@/app/components/LoginForm";

function LoginMessage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return message ? <div className="mb-4 text-green-600">{message}</div> : null;
}

export default function LoginPage() {
  const router = useRouter();

  return (
    <>
      <MarketingPageWrapper>
        <InternalHero title="Login" />
        <section className="mb-8">
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row flex-grow">
              {/* Left Side - Login Form */}
              <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
                <div className="w-full max-w-md space-y-6">
                  {/* <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button> */}
                  <div className="space-y-2">
                    <h1 className="benefits_head text-2xl font-bold tracking-tight">
                      Welcome back
                    </h1>
                    <p className="text-muted-foreground">
                      Sign in to your account
                    </p>
                  </div>

                  <Suspense fallback={<div>Loading...</div>}>
                    <LoginMessage />
                  </Suspense>

                  <LoginForm />
                </div>
              </div>

              {/* Right Side - Testimonial Carousel */}
              <div className="hidden md:flex w-1/2 bg-gray-50 dark:bg-gray-900 p-8 items-center justify-center">
                <TestimonialCarousel />
              </div>
            </div>
          </div>
        </section>
      </MarketingPageWrapper>
      <Footer />
    </>
  );
}
