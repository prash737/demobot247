"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"; // Import Input
import { Loader2 } from "lucide-react"; // Import Loader2 icon
import { useRouter } from "next/navigation"; // Import useRouter

const words = ["Intelligence", "Efficiency", "Precision", "Innovation"];
const gradients = [
  "from-blue-600 to-green-600",
  "from-purple-600 to-pink-600",
  "from-orange-600 to-red-600",
  "from-teal-600 to-cyan-600",
];

const illustrations = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/option%201.jpg-c7rFfA9XabUAO2HM9iks9drNlEGG57.jpeg",
    alt: "Three people collaborating with floating icons",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/option%201.jpg-9ITxdM78IAwlpXc4ISsoKbApLSqwp9.jpeg",
    alt: "Two people working with computer interface",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/option%201.jpg-FqttOY6KIS0QvsYQtZfNSyPoaAMceU.jpeg",
    alt: "Video call interface between two people",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/option%201.jpg-9Zstp5nNue81bmROCITBkEMSAWTzps.jpeg",
    alt: "Mobile chat interface with multiple conversations",
  },
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("https://www."); // New state for website URL input
  const [launchLoading, setLaunchLoading] = useState(false); // New state for launch button loading
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const checkAuthStatus = () => {
      const adminData = localStorage.getItem("adminData");
      const userData = localStorage.getItem("userData");
      setIsLoggedIn(!!(adminData || userData));
    };

    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const animateText = () => {
      const currentWord = words[currentIndex];
      const currentGradient = gradients[currentIndex];

      if (!isDeleting && displayText === currentWord) {
        timer = setTimeout(() => setIsDeleting(true), 3000);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
      } else {
        timer = setTimeout(
          () => {
            setDisplayText(
              currentWord.substring(
                0,
                isDeleting ? displayText.length - 1 : displayText.length + 1,
              ),
            );
          },
          isDeleting ? 50 : 100,
        );
      }
    };

    animateText();

    return () => clearTimeout(timer);
  }, [currentIndex, displayText, isDeleting]);

  const handleLaunchDemo = () => {
    if (websiteUrl.trim()) {
      setLaunchLoading(true);
      // Encode the URL to ensure it's safely passed as a query parameter
      router.push(`/demo?url=${encodeURIComponent(websiteUrl)}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <section className="banner_section relative z-10 w-full">
        <div className="container mx-auto px-4">
          {/* Header Section with Smooth Fade In */}
          <div className="text-center space-y-8 mb-12 animate-fade-in">
            <div className="space-y-4">
              <h1 className="banner_head1 text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Build Your Own AI Chatbot for
              </h1>
              <h2 className="banner_head2 text-3xl md:text-4xl lg:text-5xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Your website
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="banner_head3 text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mr-2 animate-pulse">
                  24/7
                </span>
                automated inquiry handling system that streamlines your entire operational process with intelligent responses and efficient handling.
              </p>
            </div>
          </div>

          {/* Launch Box with Enhanced Styling */}
          <div className="launch_box max-w-4xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 transition-all duration-300 hover:shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="flex-1 w-full sm:max-w-md">
                  <Input
                    type="url"
                    placeholder="Enter your website URL (e.g., https://example.com)"
                    className="w-full h-12 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleLaunchDemo();
                      }
                    }}
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleLaunchDemo}
                  className="h-12 px-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center rounded-xl text-base font-semibold whitespace-nowrap"
                  disabled={launchLoading || !websiteUrl.trim()}
                >
                  {launchLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      Launch 🚀
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Subtitle with Fade In Animation */}
          <div className="text-center animate-fade-in-delayed">
            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg transition-opacity duration-500 hover:opacity-100 opacity-70">
              See how an AI chatbot can instantly enhance your website.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
