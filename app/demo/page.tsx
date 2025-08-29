"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper"
import { InternalHero } from "@/app/components/internal-hero"
import { Loader2, TriangleAlert } from "lucide-react"
import { ChatbotButton } from "@/app/components/chatbot-button"
import { ChatWindow } from "@/app/components/chat-window"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ScrapedData {
  title: string
  description: string
  headings: string[]
  links: { href: string; text: string }[]
  mainText: string
  images: { src: string; alt: string }[]
  structuredData: any[]
}

// Country codes and validation logic copied from app/contact/page.tsx
const countryCodes = [
  { code: "+1", country: "USA/Canada", minLen: 10, maxLen: 10 },
  { code: "+1", country: "Trinidad & Tobago", minLen: 7, maxLen: 7 }, // Specific entry for T&T
  { code: "+7", country: "Russia", minLen: 10, maxLen: 10 },
  { code: "+20", country: "Egypt", minLen: 10, maxLen: 10 },
  { code: "+27", country: "South Africa", minLen: 9, maxLen: 9 },
  { code: "+31", country: "Netherlands", minLen: 9, maxLen: 9 },
  { code: "+32", country: "Belgium", minLen: 8, maxLen: 10 },
  { code: "+33", country: "France", minLen: 9, maxLen: 9 },
  { code: "+34", country: "Spain", minLen: 9, maxLen: 9 },
  { code: "+36", country: "Hungary", minLen: 8, maxLen: 9 },
  { code: "+39", country: "Italy", minLen: 6, maxLen: 12 },
  { code: "+40", country: "Romania", minLen: 9, maxLen: 9 },
  { code: "+43", country: "Austria", minLen: 4, maxLen: 13 },
  { code: "+44", country: "UK", minLen: 10, maxLen: 10 },
  { code: "+45", country: "Denmark", minLen: 8, maxLen: 8 },
  { code: "+46", country: "Sweden", minLen: 6, maxLen: 9 },
  { code: "+47", country: "Norway", minLen: 4, maxLen: 12 },
  { code: "+48", country: "Poland", minLen: 9, maxLen: 9 },
  { code: "+49", country: "Germany", minLen: 3, maxLen: 12 },
  { code: "+51", country: "Peru", minLen: 7, maxLen: 9 },
  { code: "+52", country: "Mexico", minLen: 10, maxLen: 10 },
  { code: "+54", country: "Argentina", minLen: 10, maxLen: 13 },
  { code: "+55", country: "Brazil", minLen: 10, maxLen: 11 },
  { code: "+56", country: "Chile", minLen: 8, maxLen: 9 },
  { code: "+57", country: "Colombia", minLen: 10, maxLen: 10 },
  { code: "+58", country: "Venezuela", minLen: 7, maxLen: 11 },
  { code: "+591", country: "Bolivia", minLen: 7, maxLen: 8 },
  { code: "+592", country: "Guyana", minLen: 7, maxLen: 7 },
  { code: "+593", country: "Ecuador", minLen: 9, maxLen: 10 },
  { code: "+595", country: "Paraguay", minLen: 7, maxLen: 9 },
  { code: "+597", country: "Suriname", minLen: 7, maxLen: 7 },
  { code: "+598", country: "Uruguay", minLen: 7, maxLen: 8 },
  { code: "+61", country: "Australia", minLen: 10, maxLen: 15 },
  { code: "+62", country: "Indonesia", minLen: 7, maxLen: 13 },
  { code: "+63", country: "Philippines", minLen: 10, maxLen: 10 },
  { code: "+64", country: "New Zealand", minLen: 8, maxLen: 15 },
  { code: "+65", country: "Singapore", minLen: 8, maxLen: 8 },
  { code: "+66", country: "Thailand", minLen: 9, maxLen: 10 },
  { code: "+675", country: "Papua N.G.", minLen: 8, maxLen: 8 },
  { code: "+679", country: "Fiji", minLen: 7, maxLen: 7 },
  { code: "+685", country: "Samoa", minLen: 7, maxLen: 7 },
  { code: "+81", country: "Japan", minLen: 10, maxLen: 11 },
  { code: "+82", country: "South Korea", minLen: 10, maxLen: 11 },
  { code: "+86", country: "China", minLen: 7, maxLen: 11 },
  { code: "+880", country: "Bangladesh", minLen: 10, maxLen: 11 },
  { code: "+90", country: "Turkey", minLen: 10, maxLen: 10 },
  { code: "+91", country: "India", minLen: 10, maxLen: 10 },
  { code: "+92", country: "Pakistan", minLen: 10, maxLen: 11 },
  { code: "+94", country: "Sri Lanka", minLen: 9, maxLen: 9 },
  { code: "+234", country: "Nigeria", minLen: 10, maxLen: 10 },
  { code: "+254", country: "Kenya", minLen: 9, maxLen: 9 },
  { code: "+352", country: "Luxembourg", minLen: 8, maxLen: 12 },
  { code: "+353", country: "Ireland", minLen: 7, maxLen: 10 },
  { code: "+358", country: "Finland", minLen: 5, maxLen: 12 },
  { code: "+359", country: "Bulgaria", minLen: 7, maxLen: 9 },
  { code: "+372", country: "Estonia", minLen: 7, maxLen: 8 },
  { code: "+385", country: "Croatia", minLen: 8, maxLen: 9 },
  { code: "+420", country: "Czech Republic", minLen: 9, maxLen: 9 },
  { code: "+852", country: "Hong Kong", minLen: 8, maxLen: 8 },
  { code: "+855", country: "Cambodia", minLen: 8, maxLen: 9 },
  { code: "+966", country: "Saudi Arabia", minLen: 9, maxLen: 9 },
  { code: "+971", country: "UAE", minLen: 9, maxLen: 9 },
  { code: "+972", country: "Israel", minLen: 9, maxLen: 9 },
  { code: "+974", country: "Qatar", minLen: 8, maxLen: 8 },
  { code: "+977", country: "Nepal", minLen: 10, maxLen: 10 },
  { code: "+994", country: "Azerbaijan", minLen: 9, maxLen: 9 },
  { code: "+995", country: "Georgia", minLen: 9, maxLen: 9 },
  { code: "+998", country: "Uzbekistan", minLen: 9, maxLen: 9 },
]

const allowedEmailDomains = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  ".com",
  ".co.uk",
  ".org",
  ".net",
  ".edu",
  ".gov",
  ".io",
  ".ai",
  ".xyz",
  ".app",
  ".tech",
  ".co",
  ".me",
  ".dev",
  ".info",
  ".us",
  ".uk",
  ".ca",
  ".au",
  ".de",
  ".fr",
  ".jp",
  ".cn",
  ".br",
  ".za",
  ".ru",
  ".es",
  ".it",
  ".mx",
  ".id",
  ".ph",
  ".sg",
  ".th",
  ".kr",
  ".tr",
  ".sa",
  ".il",
  ".qa",
  ".np",
  ".az",
  ".ge",
  ".uz",
])

function validatePhoneNumber(number: string, code: string): { isValid: boolean; message: string } {
  if (!number.trim()) {
    return { isValid: false, message: "Phone number is required" }
  }
  const selectedCountry = countryCodes.find((c) => c.code === code)
  if (!selectedCountry) {
    return { isValid: false, message: "Invalid country code selected" }
  }
  const cleanedNumber = number.replace(/\D/g, "")
  if (cleanedNumber.length < selectedCountry.minLen || cleanedNumber.length > selectedCountry.maxLen) {
    return {
      isValid: false,
      message: `Phone number must be between ${selectedCountry.minLen} and ${selectedCountry.maxLen} digits for ${selectedCountry.country}`,
    }
  }
  return { isValid: true, message: "" }
}

function validateEmail(email: string): { isValid: boolean; message: string } {
  if (!email.trim()) {
    return { isValid: false, message: "Email is required" }
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: "Please enter a valid email address (e.g., user@example.com)" }
  }
  if (email.trim().length > 320) {
    return { isValid: false, message: "Email address is too long" }
  }
  const domainPart = email.split("@")[1]?.toLowerCase()
  if (!domainPart) {
    return { isValid: false, message: "Email address is missing a domain part." }
  }
  if (allowedEmailDomains.has(domainPart)) {
    return { isValid: true, message: "" }
  }
  let domainAllowed = false
  for (const allowedSuffix of allowedEmailDomains) {
    if (allowedSuffix.startsWith(".")) {
      if (domainPart.endsWith(allowedSuffix)) {
        domainAllowed = true
        break
      }
    }
  }
  if (!domainAllowed) {
    return { isValid: false, message: "Email domain is not allowed. Please use a recognized domain." }
  }
  return { isValid: true, message: "" }
}

export default function DemoPage() {
  const [url, setUrl] = useState<string>("")
  const [iframeSrc, setIframeSrc] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const urlFromQuery = searchParams.get("url")
    if (urlFromQuery && urlFromQuery !== url) {
      const decodedUrl = decodeURIComponent(urlFromQuery)
      setUrl(decodedUrl)
      const fetchOnLoad = async () => {
        await handleFetchWebsite(decodedUrl)
      }
      fetchOnLoad()
    }
  }, [searchParams, url])

  useEffect(() => {
    if (iframeRef.current && iframeSrc) {
      const iframe = iframeRef.current

      const handleIframeLoad = () => {
        try {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDocument) {
            iframeDocument.documentElement.scrollTop = iframeDocument.documentElement.scrollHeight
          }
        } catch (error) {
          console.log("Cannot auto-scroll iframe due to cross-origin restrictions")
        }
      }

      iframe.addEventListener("load", handleIframeLoad)

      return () => {
        iframe.removeEventListener("load", handleIframeLoad)
      }
    }
  }, [iframeSrc])

  const isValidUrl = (urlString: string): boolean => {
    try {
      const parsedUrl = new URL(urlString.startsWith("http") ? urlString : `https://${urlString}`)
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
    } catch {
      return false
    }
  }

  const handleFetchWebsite = async (inputUrl?: string) => {
    const urlToProcess = inputUrl || url

    if (!urlToProcess || !isValidUrl(urlToProcess)) {
      setError("Please enter a valid URL (e.g., https://www.example.com).")
      setIframeSrc("")
      setScrapedData(null)
      setIsChatOpen(false)
      setFormSuccess(false)
      return
    }

    setLoading(true)
    setError(null)
    setScrapedData(null)
    setIsChatOpen(false)
    setFormSuccess(false)

    try {
      const urlToScrape = urlToProcess.startsWith("http") ? urlToProcess : `https://${urlToProcess}`
      setUrl(urlToScrape)
      setIframeSrc(urlToScrape)

      const response = await fetch("/api/scrape-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlToScrape }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to scrape website.")
      }

      const data = await response.json()
      setScrapedData(data.scrapedData)
    } catch (err: any) {
      console.error("Scraping error:", err)
      setError(err.message || "An unexpected error occurred during scraping.")
      setIframeSrc("")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitContact = async () => {
    setFormError(null)

    const emailValidation = validateEmail(contactEmail)
    if (!emailValidation.isValid) {
      toast({
        title: "Validation Error",
        description: emailValidation.message,
        variant: "destructive",
      })
      setFormError(emailValidation.message)
      return
    }

    const phoneNumberValidation = validatePhoneNumber(contactPhone, countryCode)
    if (!phoneNumberValidation.isValid) {
      toast({
        title: "Validation Error",
        description: phoneNumberValidation.message,
        variant: "destructive",
      })
      setFormError(phoneNumberValidation.message)
      return
    }

    setFormLoading(true)

    try {
      const urlToSave = url.startsWith("http") ? url : `https://${url}`
      const response = await fetch("/api/save-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlToSave, email: contactEmail, phone: contactPhone, countryCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save contact data.")
      }

      toast({
        title: "Success!",
        description: "Your contact details have been saved successfully.",
      })
      setFormSuccess(true)
    } catch (err: any) {
      console.error("Contact form submission error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <MarketingPageWrapper>
      {/* InternalHero with no text props */}
      <InternalHero />
      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] h-full w-screen ml-[calc(50%-50vw)] mt-8">
        {" "}
        {/* Added mt-8 for top margin */}
        {/* Left Column */}
        <div className="space-y-6 px-4">
          <div
            className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 flex items-center space-x-3 rounded-md"
            role="alert"
          >
            <TriangleAlert className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">Note: This is a trial version.</p>
          </div>

          {/* How it works Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">How it works</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <p>Enter any website URL in the browser's address bar (e.g., `/demo?url=https://www.example.com`)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <p>The website preview will load automatically</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                <p>Provide your contact details to unlock the full preview</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">
                  4
                </span>
                <p>Chat with our AI about the website content</p>
              </div>
            </div>
          </div>

          {/* New Section: Get Embed Domain */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Get Embed Code for your Website</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Want to embed your own custom chatbot on your website? Sign up now to get started!
            </p>
            <pre className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-md text-xs overflow-auto opacity-70">
              {`<!-- Embed your chatbot -->
<script src="https://your-domain.com/embed.js" id="chatbot-script" data-chatbot-id="YOUR_CHATBOT_ID"></script>
<style>
  #chatbot-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  }
</style>`}
            </pre>
            <Button onClick={() => router.push("/")}>Get Started</Button>
          </div>
        </div>
        {/* Right Column - Preview Section */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Website Preview</h3>

            {loading && !iframeSrc ? (
              <div className="flex flex-col items-center justify-center h-[900px] bg-gray-50 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="mt-2">Loading and scraping website data...</span>
              </div>
            ) : iframeSrc ? (
              <div className="relative w-full h-[900px] border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                {/* Display the fetched URL */}
                <div className="absolute top-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 text-sm text-gray-700 dark:text-gray-300 truncate z-30">
                  Previewing:{" "}
                  <a href={iframeSrc} target="_blank" rel="noopener noreferrer" className="underline">
                    {iframeSrc}
                  </a>
                </div>
                <iframe
                  ref={iframeRef}
                  src={iframeSrc}
                  title="Website Preview"
                  className="absolute top-0 left-0 w-full h-full pt-10"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                />

                {!formSuccess && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
                    <Card className="w-full max-w-sm p-6 space-y-4">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Provide Contact Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            required
                            className="p-3 text-base"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label
                              htmlFor="country-code"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              Country Code
                            </Label>
                            <Select value={countryCode} onValueChange={setCountryCode}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country code" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {countryCodes.map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.code} ({option.country})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label
                              htmlFor="contact-phone"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              Mobile Number
                            </Label>
                            <Input
                              id="contact-phone"
                              type="tel"
                              placeholder="e.g., 1234567890"
                              value={contactPhone}
                              onChange={(e) => {
                                const value = e.target.value
                                const filteredValue = value.replace(/\D/g, "")
                                const selectedCountry = countryCodes.find((c) => c.code === countryCode)
                                if (selectedCountry && filteredValue.length > selectedCountry.maxLen) {
                                  setContactPhone(filteredValue.slice(0, selectedCountry.maxLen))
                                } else {
                                  setContactPhone(filteredValue)
                                }
                              }}
                              required
                              className="p-3 text-base"
                            />
                          </div>
                        </div>
                        {formError && (
                          <div className="text-red-500 text-sm mt-2" role="alert">
                            Error: {formError}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <Button onClick={handleSubmitContact} disabled={formLoading}>
                          {formLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}

                {formSuccess && scrapedData && (
                  <>
                    <div className="absolute bottom-4 right-4 z-10">
                      <ChatbotButton onClick={() => setIsChatOpen(!isChatOpen)}>
                        <Image
                          src="/chatbot-icon.png"
                          alt="AI Chatbot Icon"
                          width={56}
                          height={56}
                          className="rounded-full object-contain"
                        />
                      </ChatbotButton>
                    </div>
                    {isChatOpen && (
                      <div className="absolute bottom-20 right-4 z-20">
                        <ChatWindow scrapedData={scrapedData} onClose={() => setIsChatOpen(false)} />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[900px] bg-gray-50 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                Enter a URL in the address bar (e.g., `/demo?url=https://www.example.com`) to view a website.
              </div>
            )}
          </div>
        </div>
      </div>
    </MarketingPageWrapper>
  )
}
