"use client";

import type React from "react";
import { InternalHero } from "@/app/components/internal-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TestimonialCarousel } from "@/app/components/testimonial-carousel";
import { Footer } from "@/app/components/footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabaseForgotPassword } from "@/app/utils/supabaseClientForgotPassword";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if Supabase is initialized correctly
    if (!supabaseForgotPassword) {
      console.error("Supabase client is not initialized");
      setError(
        "There was an error initializing the application. Please try again later.",
      );
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      // Check if the email exists in the credentials table
      const { data, error: fetchError } = await supabaseForgotPassword
        .from("credentials")
        .select("username")
        .eq("username", email)
        .single();

      if (fetchError) {
        console.error("Error checking email:", fetchError);
        setError(
          "An error occurred while checking your email. Please try again.",
        );
        return;
      }

      if (!data) {
        // If the email doesn't exist, still show a generic message for security reasons
        setMessage(
          "If an account exists for this email, you will receive password reset instructions.",
        );
        setIsLoading(false);
        return;
      }

      // If the email exists, send the reset password email
      const { error } = await supabaseForgotPassword.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (error) {
        console.error("Password reset error:", error);
        setError(
          error.message ||
            "An error occurred while sending the reset email. Please try again.",
        );
      } else {
        setMessage("Password reset instructions have been sent to your email.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MarketingPageWrapper>
        <InternalHero title="Forgot Password" />
        <section className="mb-8">
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row flex-grow">
              {/* Left Side - Forgot Password Form */}
              <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
                <div className="w-full max-w-md space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                      Forgot your password?
                    </h1>
                    <p className="text-muted-foreground">
                      Enter your email to reset your password
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-blue-50/50 dark:bg-gray-800/50"
                        required
                      />
                    </div>
                    {message && (
                      <Alert>
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    )}
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Reset Password"}
                    </Button>
                  </form>

                  <div className="text-center text-sm">
                    Remember your password?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Log In
                    </Link>
                  </div>
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
