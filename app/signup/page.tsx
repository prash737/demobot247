"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InternalHero } from "@/app/components/internal-hero"
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { TestimonialCarousel } from "@/app/components/testimonial-carousel"
import { Footer } from "@/app/components/footer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabaseSignup } from "@/app/utils/supabaseClientSignup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon as InfoCircle } from "lucide-react"

// Initialize Supabase client
const supabase = supabaseSignup

const roleOptions = [
  "Business Owner",
  "Developer",
  "Marketing Manager",
  "Sales Representative",
  "Customer Support",
  "Other",
]

const countryCodes = [
  { code: "+1", country: "USA/Canada", minLen: 10, maxLen: 10 },
  { code: "+1-tt", country: "Trinidad & Tobago", minLen: 7, maxLen: 7 }, // Specific entry for T&T
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

// Define default values for chatbot settings
const DEFAULT_CHATBOT_INSTRUCTION =
  "You are an advanced AI assistant for [Organization/Institute name]. Your goal is to provide personalized, efficient, and engaging assistance to users, guiding them through various processes, services, and information. Your tone is friendly, professional, and contextually aware, ensuring that users feel comfortable, respected, and supported throughout their journey."
const DEFAULT_CHATBOT_GREETING = "Hello! How can I help you today?"
const DEFAULT_CHATBOT_TONE = "professional"
const DEFAULT_CHATBOT_RESPONSE_LENGTH = "concise"
const DEFAULT_CHATBOT_FALLBACK_MESSAGE = "Oops I am not able to get context to answer your query!"

// Declare allowedEmailDomains variable
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

export default function SignUpPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+91") // Default to +91 (India)
  const router = useRouter()

  // Avatar upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async (chatbotId: string) => {
    if (!selectedFile) return

    try {
      // Generate a unique filename with timestamp
      const timestamp = new Date().getTime()
      const fileExtension = selectedFile.name.split(".").pop()
      const fileName = `avatar_${timestamp}.${fileExtension}`
      const filePath = `${chatbotId}/${fileName}`

      // Upload the file
      const { error: uploadError } = await supabaseSignup.storage
        .from("profile_pictures")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        throw new Error(`Failed to upload avatar: ${uploadError.message}`)
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Avatar upload failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      })
    }
  }

  // Add a new function to validate password strength
  function validatePassword(password: string, username: string): { isValid: boolean; message: string } {
    // Check password length
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" }
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" }
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" }
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" }
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one special character" }
    }

    // Check if password contains parts of the username (email)
    if (username) {
      const emailParts = username.split("@")
      const usernameWithoutDomain = emailParts[0]

      // Check if username (without domain) is at least 4 characters
      if (usernameWithoutDomain.length >= 4 && password.toLowerCase().includes(usernameWithoutDomain.toLowerCase())) {
        return { isValid: false, message: "Password should not contain parts of your email address" }
      }

      // If domain exists and is at least 4 characters, check for it too
      if (emailParts.length > 1) {
        const domain = emailParts[1].split(".")[0]
        if (domain.length >= 4 && password.toLowerCase().includes(domain.toLowerCase())) {
          return { isValid: false, message: "Password should not contain parts of your email address" }
        }
      }
    }

    return { isValid: true, message: "" }
  }

  // Updated name validation function to only accept alphabets
  function validateName(name: string, fieldName: string): { isValid: boolean; message: string } {
    // Check if name is empty
    if (!name.trim()) {
      return { isValid: false, message: `${fieldName} is required` }
    }

    // Check if name contains only letters (no spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z]+$/
    if (!nameRegex.test(name.trim())) {
      return { isValid: false, message: `${fieldName} should only contain alphabetic characters` }
    }

    // Check minimum length
    if (name.trim().length < 2) {
      return { isValid: false, message: `${fieldName} must be at least 2 characters long` }
    }

    // Check maximum length
    if (name.trim().length > 50) {
      return { isValid: false, message: `${fieldName} must be less than 50 characters` }
    }

    return { isValid: true, message: "" }
  }

  function validatePhoneNumber(number: string, code: string): { isValid: boolean; message: string } {
    if (!number.trim()) {
      return { isValid: false, message: "Phone number is required" }
    }

    const selectedCountry = countryCodes.find((c) => c.code === code || c.code.replace('-tt', '') === code)
    if (!selectedCountry) {
      return { isValid: false, message: "Invalid country code selected" }
    }

    const cleanedNumber = number.replace(/\D/g, "") // Remove non-digits

    if (cleanedNumber.length < selectedCountry.minLen || cleanedNumber.length > selectedCountry.maxLen) {
      return {
        isValid: false,
        message: `Phone number must be between ${selectedCountry.minLen} and ${selectedCountry.maxLen} digits for ${selectedCountry.country}`,
      }
    }

    return { isValid: true, message: "" }
  }

  // Enhanced email validation function with proper RFC standards and domain whitelist
  function validateEmail(email: string): { isValid: boolean; message: string } {
    // Check if email is empty
    if (!email.trim()) {
      return { isValid: false, message: "Email is required" }
    }

    // RFC 5322 compliant email validation regex for general format
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: "Please enter a valid email address (e.g., user@example.com)" }
    }

    // Check email length (RFC 5321 limit)
    if (email.trim().length > 320) {
      return { isValid: false, message: "Email address is too long" }
    }

    // Check local part length (before @)
    const localPart = email.split("@")[0]
    if (localPart.length > 64) {
      return { isValid: false, message: "Email address local part is too long" }
    }

    // --- Domain Whitelist Validation ---
    const domainPart = email.split("@")[1]?.toLowerCase()
    if (!domainPart) {
      return { isValid: false, message: "Email address is missing a domain part." }
    }

    // Check for exact matches first (e.g., gmail.com)
    if (allowedEmailDomains.has(domainPart)) {
      return { isValid: true, message: "" }
    }

    // Check for suffix matches (e.g., .com, .co.uk)
    let domainAllowed = false
    for (const allowedSuffix of allowedEmailDomains) {
      if (allowedSuffix.startsWith(".")) {
        // Only check suffixes
        if (domainPart.endsWith(allowedSuffix)) {
          domainAllowed = true
          break
        }
      }
    }

    if (!domainAllowed) {
      return { isValid: false, message: "Email domain is not allowed. Please use a recognized domain." }
    }
    // --- End Domain Whitelist Validation ---

    return { isValid: true, message: "" }
  }

  // Update the handleSignUp function to include password validation
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Email validation
    const emailValidation = validateEmail(username)
    if (!emailValidation.isValid) {
      setError(emailValidation.message)
      setIsLoading(false)
      return
    }

    // First name validation
    const firstNameValidation = validateName(firstName, "First name")
    if (!firstNameValidation.isValid) {
      setError(firstNameValidation.message)
      setIsLoading(false)
      return
    }

    // Last name validation (only if last name is provided)
    if (lastName.trim()) {
      const lastNameValidation = validateName(lastName, "Last name")
      if (!lastNameValidation.isValid) {
        setError(lastNameValidation.message)
        setIsLoading(false)
        return
      }
    }

    // Phone number validation
    const phoneNumberValidation = validatePhoneNumber(phoneNumber, countryCode)
    if (!phoneNumberValidation.isValid) {
      setError(phoneNumberValidation.message)
      setIsLoading(false)
      return
    }

    // Password validation
    const passwordValidation = validatePassword(password, username)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message)
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate mandatory fields
    if (!company.trim()) {
      setError("Company name is required")
      setIsLoading(false)
      return
    }

    try {
      // Check if username (email) already exists
      const { data: existingUser } = await supabaseSignup
        .from("credentials")
        .select("username")
        .eq("username", username)
        .single()

      if (existingUser) {
        setError("Email already exists. Please use a different email address.")
        setIsLoading(false)
        return
      }

      // Hash the password before storing it
      const hashedPassword = await hashPassword(password)
      const chatbotId = `cb_${Date.now()}`

      // Insert initial user data into credentials table with hashed password (removed timezone)
      const { error: credentialsError } = await supabaseSignup.from("credentials").insert([
        {
          username,
          password: hashedPassword,
          chatbot_id: chatbotId,
          selected_plan: "Free Plan", // Directly assign Free Plan
          chat_limit: 10, // Set chat limit for Free Plan
          chatbot_status: "Inactive",
          selected_domain: null,
          first_name: firstName,
          last_name: lastName,
          company: company,
          role: role,
          phone_number: phoneNumber, // Add this line
          country_code: countryCode, // Add this line
          chatbot_name: "My Assistant",
        },
      ])

      if (credentialsError) throw credentialsError

      // Default theme values
      const defaultThemeValues = {
        primaryColor: "#3B82F6", // Default blue color
        secondaryColor: "#10B981", // Default green color
        borderRadius: 8,
        avatarUrl: "/images/default-avatar.png",
        darkMode: false,
        chatbotName: "My Assistant",
      }

      // Insert initial theme data with chatbot name
      const { error: themeError } = await supabaseSignup.from("chatbot_themes").insert([
        {
          chatbot_id: chatbotId,
          chatbot_name: defaultThemeValues.chatbotName,
          primary_color: defaultThemeValues.primaryColor,
          secondary_color: defaultThemeValues.secondaryColor,
          border_radius: defaultThemeValues.borderRadius,
          dark_mode: defaultThemeValues.darkMode,
          instruction: DEFAULT_CHATBOT_INSTRUCTION,
          greeting: DEFAULT_CHATBOT_GREETING,
          response_tone: DEFAULT_CHATBOT_TONE,
          response_length: DEFAULT_CHATBOT_RESPONSE_LENGTH,
          fallback_message: DEFAULT_CHATBOT_FALLBACK_MESSAGE,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (themeError) {
        console.error("Error creating theme:", themeError)
        // Continue anyway as this is not critical for signup
      }

      // Upload avatar if selected
      if (selectedFile) {
        await uploadAvatar(chatbotId)
      }

      // Store username and chatbotId in localStorage for future use
      localStorage.setItem(
        "userData",
        JSON.stringify({
          username,
          chatbotId,
          name: `${firstName} ${lastName}`.trim(),
          email: username,
          selected_plan: "Free Plan", // Update localStorage with the assigned plan
        }),
      )

      // Store theme in localStorage
      localStorage.setItem("chatbotTheme", JSON.stringify(defaultThemeValues))

      // Apply theme to CSS variables immediately
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--primary-color", defaultThemeValues.primaryColor)
        document.documentElement.style.setProperty("--secondary-color", defaultThemeValues.secondaryColor)
        document.documentElement.style.setProperty("--border-radius", `${defaultThemeValues.borderRadius}px`)

        if (defaultThemeValues.darkMode) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }

      // Dispatch events to notify components
      window.dispatchEvent(new Event("storage"))
      window.dispatchEvent(new CustomEvent("userLoggedIn"))
      window.dispatchEvent(
        new CustomEvent("themeUpdate", {
          detail: defaultThemeValues,
        }),
      )

      // Redirect directly to chatbot interface or dashboard
      router.push("/create-chatbot/chatbot-interface") // Or "/dashboard"
    } catch (error) {
      console.error("Sign up error:", error)
      setError("An unexpected error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
<>
    <MarketingPageWrapper>
    <InternalHero title="Create an account" />
      <section className="mb-8">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row flex-grow">
            <div className="w-full md:w-1/2 p-4 md:p-8 flex items-start justify-center overflow-y-auto">
              <div className="w-full max-w-md space-y-6">
                {/* <Button variant="ghost" onClick={() => router.push("/")} className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button> */}
                <div className="space-y-2">
                  <h1 className="benefits_head text-2xl font-bold tracking-tight">Create an account</h1>
                  <p className="text-muted-foreground">Sign up to get started with Bot247</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Name and Company fields - 2x2 grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="first-name">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          const value = e.target.value
                          // Only allow alphabetic characters
                          const filteredValue = value.replace(/[^a-zA-Z]/g, "")
                          setFirstName(filteredValue)
                        }}
                        className="bg-blue-50/50 dark:bg-gray-800/50"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          const value = e.target.value
                          // Only allow alphabetic characters
                          const filteredValue = value.replace(/[^a-zA-Z]/g, "")
                          setLastName(filteredValue)
                        }}
                        className="bg-blue-50/50 dark:bg-gray-800/50"
                      />
                    </div>
                  </div>

                  {/* Email field - full width */}
                  <div className="space-y-1">
                    <Label htmlFor="email">
                      Email (Username) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-blue-50/50 dark:bg-gray-800/50"
                      placeholder="you@example.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Your email address will be used as your username.</p>
                  </div>

                  {/* Password fields - side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="password">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <InfoCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="font-medium">Password must:</p>
                              <ul className="list-disc pl-4 text-xs mt-1">
                                <li>Be at least 8 characters long</li>
                                <li>Contain at least one uppercase letter</li>
                                <li>Contain at least one lowercase letter</li>
                                <li>Contain at least one number</li>
                                <li>Contain at least one special character</li>
                                <li>Not contain parts of your email address</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-blue-50/50 dark:bg-gray-800/50"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="confirm-password">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-blue-50/50 dark:bg-gray-800/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number fields - side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="country-code">
                        Country Code <span className="text-red-500">*</span>
                      </Label>
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="bg-blue-50/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Select country code" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {countryCodes.map((option, index) => (
                            <SelectItem key={`${option.code}-${index}`} value={option.code}>
                              {option.code.replace('-tt', '')} ({option.country})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone-number">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone-number"
                        type="tel" // Use type="tel" for phone numbers
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value
                          // Only allow digits
                          const filteredValue = value.replace(/\D/g, "")
                          const selectedCountry = countryCodes.find((c) => c.code === countryCode || c.code.replace('-tt', '') === countryCode)
                          if (selectedCountry && filteredValue.length > selectedCountry.maxLen) {
                            setPhoneNumber(filteredValue.slice(0, selectedCountry.maxLen))
                          } else {
                            setPhoneNumber(filteredValue)
                          }
                        }}
                        className="bg-blue-50/50 dark:bg-gray-800/50"
                        placeholder="e.g., 1234567890"
                        required
                      />
                    </div>
                  </div>

                  {/* Company Name and Role fields - side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="company">
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="bg-blue-50/50 dark:bg-gray-800/50"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="bg-blue-50/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div className="space-y-1">
                    <Label>Profile Picture</Label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                    <div className="flex items-center gap-4">
                      {previewUrl ? (
                        <div className="relative">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden">
                            <Image
                              src={previewUrl || "/placeholder.svg"}
                              alt="Avatar preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="absolute -top-1 -right-1 p-1 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={handleBrowseClick}
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p className="font-medium">Drag and drop or click to browse</p>
                          <p className="text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

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
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
                      Log In
                    </Link>
                  </div>

                  <div className="text-center text-xs text-muted-foreground">
                    By signing up, you agree to Bot247's{" "}
                    <Link href="/terms-of-service" className="text-blue-600 hover:underline dark:text-blue-400">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" className="text-blue-600 hover:underline dark:text-blue-400">
                      Privacy Policy
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            <div className="hidden md:flex w-1/2 bg-gray-50 dark:bg-gray-900 p-8 items-center justify-center">
              <TestimonialCarousel />
            </div>
          </div>
        </div>
      </section>
    </MarketingPageWrapper >
    <Footer />
</>
  )
}

// Import the password hashing function
async function hashPassword(password: string): Promise<string> {
  // Call the API route to hash the password
  const response = await fetch("/api/hash-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    throw new Error("Failed to hash password")
  }

  const data = await response.json()
  return data.hashedPassword
}