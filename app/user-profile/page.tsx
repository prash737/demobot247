"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, InfoIcon } from "lucide-react"
import UserProfileSidebar from "./components/user-profile-sidebar"
import UserAvatar from "./components/user-avatar"
import ChatbotHeader from "@/app/components/chatbot-header"
import { Footer } from "@/app/components/footer"
import { logAuditEvent } from "@/app/utils/audit-logger"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface UserData {
  username: string
  password: string
  chatbot_id: string
  selected_plan: string
  selected_domain: string
  chatbot_status: string
  chatbot_name: string
  payment_status: string
  payment_date: string
  payment_id: string
  payment_amount: number
  chat_limit: string
  total_chats: number
  first_name: string
  last_name: string
  company: string
  role: string
  phone_number: string
  country_code: string
}

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

export default function UserProfilePage() {
  const router = useRouter()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("••••••••")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+91") // Default to +91 (India)

  // Original values for tracking changes
  const [originalValues, setOriginalValues] = useState<{
    email: string
    firstName: string
    lastName: string
    company: string
    role: string
    phoneNumber: string
    countryCode: string
  }>({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    role: "",
    phoneNumber: "",
    countryCode: "",
  })

  // Changing password state
  const [changingPassword, setChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Changing email state
  const [changingEmail, setChangingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState("")

  // Function to validate password strength
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

  function validatePhoneNumber(number: string, code: string): { isValid: boolean; message: string } {
    if (!number.trim()) {
      return { isValid: false, message: "Phone number is required" }
    }

    const selectedCountry = countryCodes.find((c) => c.code === code)
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

  // Function to hash password
  async function hashPassword(password: string): Promise<string> {
    try {
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
    } catch (error) {
      console.error("Error hashing password:", error)
      throw error
    }
  }

  useEffect(() => {
    const checkUserAuth = () => {
      const userData = localStorage.getItem("userData")
      if (!userData) {
        router.push("/login")
        return false
      }
      return true
    }

    const fetchUserData = async () => {
      if (!checkUserAuth()) return

      setLoading(true)
      setError(null)

      try {
        const storedData = localStorage.getItem("userData")
        if (!storedData) {
          router.push("/login")
          return
        }

        const { username } = JSON.parse(storedData)

        // Fetch user data from Supabase
        const { data, error } = await supabase.from("credentials").select("*").eq("username", username).single()

        if (error) throw error

        if (data) {
          setUserData(data)
          setEmail(data.username || "")
          setPassword("••••••••") // Mask the actual password
          setFirstName(data.first_name || "")
          setLastName(data.last_name || "")
          setCompany(data.company || "")
          setRole(data.role || "")
          setPhoneNumber(data.phone_number || "")
          setCountryCode(data.country_code || "+91") // Default to +91

          // Store original values for change tracking (removed timezone)
          setOriginalValues({
            email: data.username || "",
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            company: data.company || "",
            role: data.role || "",
            phoneNumber: data.phone_number || "",
            countryCode: data.country_code || "+91", // Default to +91
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to fetch user data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSaveChanges = async () => {
    setSaving(true)
    setError(null)
    setPasswordError("")

    // Phone number validation
    const phoneNumberValidation = validatePhoneNumber(phoneNumber, countryCode)
    if (!phoneNumberValidation.isValid) {
      setPasswordError(phoneNumberValidation.message) // Reusing passwordError state for general form errors
      setSaving(false)
      return
    }

    try {
      if (!userData?.username) {
        router.push("/login")
        return
      }

      const updates: any = {
        first_name: firstName,
        last_name: lastName,
        company: company,
        role: role,
        phone_number: phoneNumber,
        country_code: countryCode,
      }

      // Track changes for audit logging
      const changes: Record<string, { from: string; to: string }> = {}

      if (firstName !== originalValues.firstName) {
        changes["first_name"] = { from: originalValues.firstName, to: firstName }
      }

      if (lastName !== originalValues.lastName) {
        changes["last_name"] = { from: originalValues.lastName, to: lastName }
      }

      if (company !== originalValues.company) {
        changes["company"] = { from: originalValues.company, to: company }
      }

      if (role !== originalValues.role) {
        changes["role"] = { from: originalValues.role, to: role }
      }

      if (phoneNumber !== originalValues.phoneNumber) {
        changes["phone_number"] = { from: originalValues.phoneNumber, to: phoneNumber }
      }

      if (countryCode !== originalValues.countryCode) {
        changes["country_code"] = { from: originalValues.countryCode, to: countryCode }
      }

      // Only update email if it was changed
      if (changingEmail && newEmail) {
        updates.username = newEmail
        changes["email"] = { from: userData.username, to: newEmail }
      }

      // Only update password if it was changed
      if (changingPassword && newPassword) {
        // Validate the new password
        const passwordValidation = validatePassword(newPassword, userData.username)
        if (!passwordValidation.isValid) {
          setPasswordError(passwordValidation.message)
          setSaving(false)
          return
        }

        // Hash the new password before saving
        try {
          const hashedPassword = await hashPassword(newPassword)
          updates.password = hashedPassword
          changes["password"] = { from: "********", to: "********" } // Don't log actual passwords
        } catch (error) {
          console.error("Error hashing password:", error)
          setPasswordError("Failed to process password. Please try again.")
          setSaving(false)
          return
        }
      }

      const { error } = await supabase.from("credentials").update(updates).eq("username", userData.username)

      if (error) throw error

      // Log changes to audit_logs if there are any changes
      if (Object.keys(changes).length > 0) {
        await logAuditEvent(userData.chatbot_id, "user", changes)
      }

      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      })

      // Reset changing states
      setChangingEmail(false)
      setChangingPassword(false)

      // If email was changed, update the displayed email and localStorage
      if (changingEmail && newEmail) {
        setEmail(newEmail)
        setNewEmail("")

        // Update localStorage
        const storedData = localStorage.getItem("userData")
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          parsedData.username = newEmail
          localStorage.setItem("userData", JSON.stringify(parsedData))
        }

        // Update original values
        setOriginalValues((prev) => ({
          ...prev,
          email: newEmail,
        }))
      }

      // Update original values to match current values (removed timezone)
      setOriginalValues({
        email: changingEmail && newEmail ? newEmail : email,
        firstName,
        lastName,
        company,
        role,
        phoneNumber,
        countryCode,
      })

      // Reset password field to masked state
      setPassword("••••••••")
      setNewPassword("")
    } catch (error) {
      console.error("Error updating user data:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading your profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ChatbotHeader currentPage="Profile" />
      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <UserProfileSidebar activePage="profile" chatbotId={userData?.chatbot_id || ""} />

          {/* Main content */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold mb-8">My Profile</h1>

              {/* Profile avatar */}
              <UserAvatar
                chatbotId={userData?.chatbot_id || ""}
                firstName={firstName}
                lastName={lastName}
                username={email}
                size="md"
              />

              {/* Form fields */}
              <div className="space-y-6">
                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span> <span className="text-gray-500">(required)</span>
                  </label>
                  {changingEmail ? (
                    <div className="flex gap-2">
                      <Input
                        id="new-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-grow"
                        placeholder="Enter new email"
                      />
                      <Button variant="outline" onClick={() => setChangingEmail(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className="flex-grow bg-gray-50 dark:bg-gray-700"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setChangingEmail(true)
                          setNewEmail(email)
                        }}
                      >
                        CHANGE EMAIL
                      </Button>
                    </div>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password <span className="text-red-500">*</span> <span className="text-gray-500">(required)</span>
                    </label>
                    {changingPassword && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
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
                    )}
                  </div>
                  {changingPassword ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="flex-grow"
                          placeholder="Enter new password"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setChangingPassword(false)
                            setPasswordError("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                      {passwordError && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription>{passwordError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        readOnly
                        className="flex-grow bg-gray-50 dark:bg-gray-700"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setChangingPassword(true)
                          setNewPassword("")
                        }}
                      >
                        CHANGE PASSWORD
                      </Button>
                    </div>
                  )}
                </div>

                {/* First name field */}
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium mb-1">
                    First name <span className="text-red-500">*</span> <span className="text-gray-500">(required)</span>
                  </label>
                  <Input id="first-name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>

                {/* Last name field */}
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium mb-1">
                    Last name
                  </label>
                  <Input id="last-name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>

                {/* Company field */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-1">
                    Company
                  </label>
                  <Input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>

                {/* Role field */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
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

                {/* Phone Number fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="country-code" className="block text-sm font-medium mb-1">
                      Country Code <span className="text-red-500">*</span>
                    </label>
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
                    <label htmlFor="phone-number" className="block text-sm font-medium mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="phone-number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value
                        const filteredValue = value.replace(/\D/g, "") // Only allow digits
                        const selectedCountry = countryCodes.find((c) => c.code === countryCode)
                        if (selectedCountry && filteredValue.length > selectedCountry.maxLen) {
                          setPhoneNumber(filteredValue.slice(0, selectedCountry.maxLen))
                        } else {
                          setPhoneNumber(filteredValue)
                        }
                      }}
                      placeholder="e.g., 1234567890"
                      required
                    />
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-4">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
