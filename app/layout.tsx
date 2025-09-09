import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/app/components/theme-provider"
import { NavbarWrapper } from "@/app/components/navbar-wrapper"
import { ScrollToTop } from "@/app/utils/scroll-to-top"
import { ChatbotThemeProvider } from "@/app/contexts/chatbot-theme-context"
import type React from "react"

// Dynamically import CSS only on client side
if (typeof window !== 'undefined') {
  import('aos/dist/aos.css');
}
import Script from "next/script"
import { Nav } from "@/app/components/nav" // Ensure Nav is imported


const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true
})

export const metadata: Metadata = {
  title: "Bot247 - AI Chatbots for Every Business Need",
  description: "Empower your business with intelligent AI chatbots. Bot247 offers 24/7 customer support, lead generation, and seamless integration for enhanced customer engagement.",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Bootstrap CSS from CDN to resolve MIME type error */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <Script
          src="https://chat.bot247.live/api/chatbot-script"
          data-chatbot-id="bot247chatbot"
          strategy="afterInteractive"
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ChatbotThemeProvider>
            <div className="flex flex-col min-h-screen">
              <NavbarWrapper />
              <main className="middle_section">{children}</main>
            </div>
            <ScrollToTop />
          </ChatbotThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}