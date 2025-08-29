"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Upload, X } from "lucide-react"
import { supabase } from "@/app/utils/supabaseClient"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import Image from "next/image"
import { hashPassword } from "@/app/utils/auth-utils"

// Replace the entire component with the updated version
export default function AddUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameExists, setUsernameExists] = useState(false)
  const [chatbotIdExists, setChatbotIdExists] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordValid, setPasswordValid] = useState(false)

  // Avatar upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    chatbot_id: "",
    selected_plan: "Basic",
    selected_domain: "Customer Support",
    chatbot_name: "",
    chatbot_status: "Active",
    payment_status: "completed",
    payment_amount: 0,
    payment_date: format(new Date(), "yyyy-MM-dd"),
    payment_id: "",
    chat_limit: "100",
    total_chats: 0,
    first_name: "",
    last_name: "",
    company: "",
    role: "",
    timezone: "",
  })

  // Role options
  const roleOptions = [
    "Business Owner",
    "Developer",
    "Marketing Manager",
    "Sales Representative",
    "Customer Support",
    "Other",
  ]

  // Timezone options
  const timezoneOptions = [
    "GMT-11:00 - Pacific/Midway",
    "GMT-10:00 - America/Adak",
    "GMT-09:00 - America/Anchorage",
    "GMT-08:00 - America/Los_Angeles",
    "GMT-07:00 - America/Denver",
    "GMT-06:00 - America/Chicago",
    "GMT-05:00 - America/New_York",
    "GMT-04:00 - America/Caracas",
    "GMT-03:00 - America/Santiago",
    "GMT-03:00 - America/Sao_Paulo",
    "GMT-02:00 - Atlantic/South_Georgia",
    "GMT-01:00 - Atlantic/Azores",
    "GMT+00:00 - Europe/London",
    "GMT+01:00 - Europe/Berlin",
    "GMT+03:00 - Europe/Istanbul",
    "GMT+02:00 - Africa/Cairo",
    "GMT+03:00 - Europe/Moscow",
    "GMT+04:00 - Asia/Dubai",
    "GMT+05:00 - Asia/Karachi",
    "GMT+05:30 - Asia/Kolkata",
    "GMT+06:00 - Asia/Dhaka",
    "GMT+07:00 - Asia/Bangkok",
    "GMT+08:00 - Asia/Shanghai",
    "GMT+09:00 - Asia/Tokyo",
    "GMT+10:00 - Australia/Sydney",
    "GMT+12:00 - Pacific/Auckland",
    "GMT+12:00 - Pacific/Fiji",
  ]

  // Check admin auth
  useEffect(() => {
    const adminData = localStorage.getItem("adminData")
    if (!adminData) {
      router.push("/admin/login")
    }
  }, [router])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Convert payment_amount to number if it's that field
    if (name === "payment_amount") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 0,
      })
    } else if (name === "total_chats") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Validate password if that field is changing
    if (name === "password") {
      validatePassword(value)
    }

    // Clear validation errors when user types
    if (name === "username") setUsernameExists(false)
    if (name === "chatbot_id") setChatbotIdExists(false)
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle file change for avatar
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

  // Upload avatar
  const uploadAvatar = async (chatbotId: string) => {
    if (!selectedFile) return

    try {
      // Generate a unique filename with timestamp
      const timestamp = new Date().getTime()
      const fileExtension = selectedFile.name.split(".").pop()
      const fileName = `avatar_${timestamp}.${fileExtension}`
      const filePath = `${chatbotId}/${fileName}`

      // Upload the file
      const { error: uploadError } = await supabase.storage.from("profile_pictures").upload(filePath, selectedFile, {
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

  // Check if username or chatbot_id already exists
  const validateUniqueFields = async () => {
    setValidating(true)
    setError(null)
    setUsernameExists(false)
    setChatbotIdExists(false)

    try {
      // Check username
      const { data: usernameData, error: usernameError } = await supabase
        .from("credentials")
        .select("username")
        .eq("username", formData.username)
        .single()

      if (usernameData) {
        setUsernameExists(true)
      }

      // Check chatbot_id
      const { data: chatbotData, error: chatbotError } = await supabase
        .from("credentials")
        .select("chatbot_id")
        .eq("chatbot_id", formData.chatbot_id)
        .single()

      if (chatbotData) {
        setChatbotIdExists(true)
      }

      return !usernameData && !chatbotData
    } catch (error) {
      console.error("Error validating fields:", error)
      return false
    } finally {
      setValidating(false)
    }
  }

  const validatePassword = (password: string) => {
    setPasswordError(null)
    setPasswordValid(false)

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return false
    }

    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter")
      return false
    }

    if (!/[a-z]/.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter")
      return false
    }

    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least one number")
      return false
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setPasswordError("Password must contain at least one special character")
      return false
    }

    setPasswordValid(true)
    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate password
    if (!validatePassword(formData.password)) {
      setLoading(false)
      return
    }

    try {
      // First validate unique fields
      const isValid = await validateUniqueFields()

      if (!isValid) {
        setLoading(false)
        return
      }

      // Hash the password
      const hashedPassword = await hashPassword(formData.password)

      // Insert new user with hashed password
      const { data, error } = await supabase
        .from("credentials")
        .insert([
          {
            username: formData.username,
            password: hashedPassword, // Use the hashed password
            chatbot_id: formData.chatbot_id,
            selected_plan: formData.selected_plan,
            selected_domain: formData.selected_domain,
            chatbot_name: formData.chatbot_name,
            chatbot_status: formData.chatbot_status,
            payment_status: formData.payment_status,
            payment_amount: formData.payment_amount,
            payment_date: formData.payment_date,
            payment_id: formData.payment_id,
            chat_limit: formData.chat_limit,
            total_chats: formData.total_chats,
            first_name: formData.first_name,
            last_name: formData.last_name,
            company: formData.company,
            role: formData.role,
            timezone: formData.timezone,
          },
        ])
        .select()

      if (error) throw error

      // Insert initial theme data with chatbot name
      const { error: themeError } = await supabase.from("chatbot_themes").insert([
        {
          chatbot_id: formData.chatbot_id,
          chatbot_name: formData.chatbot_name,
          primary_color: "#3B82F6", // Default emerald color
          secondary_color: "#10B981",
          border_radius: 8,
          dark_mode: false,
        },
      ])

      if (themeError) {
        console.error("Error creating theme:", themeError)
        // Continue anyway as this is not critical for user creation
      }

      // Upload avatar if selected
      if (selectedFile) {
        await uploadAvatar(formData.chatbot_id)
      }

      toast({
        title: "Success",
        description: "New user has been added successfully",
      })

      // Redirect back to admin page
      router.push("/admin")
    } catch (error: any) {
      console.error("Error adding user:", error)
      setError(error.message || "Failed to add user")
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-16">
        <Button variant="outline" onClick={() => router.push("/admin")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Panel
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Add New User</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Required Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="email">
                      Email (Username) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={usernameExists ? "border-red-500" : ""}
                      placeholder="you@example.com"
                      required
                    />
                    {usernameExists && <p className="text-sm text-red-500">Username already exists</p>}
                    <p className="text-xs text-muted-foreground">Email address will be used as username.</p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={passwordError ? "border-red-500" : ""}
                    />
                    {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="first-name">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="first-name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="company">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="chatbot_id">
                      Chatbot ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="chatbot_id"
                      name="chatbot_id"
                      value={formData.chatbot_id}
                      onChange={handleChange}
                      required
                      className={chatbotIdExists ? "border-red-500" : ""}
                    />
                    {chatbotIdExists && <p className="text-sm text-red-500">Chatbot ID already exists</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="chatbot_name">
                      Chatbot Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="chatbot_name"
                      name="chatbot_name"
                      value={formData.chatbot_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Optional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
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

                  <div className="space-y-1">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleSelectChange("timezone", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="selected_domain">
                      Selected Domain <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.selected_domain}
                      onValueChange={(value) => handleSelectChange("selected_domain", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Customer Support">Customer Support</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Avatar Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <div className="space-y-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

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
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
              </div>

              {/* Plan and Payment Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Plan and Payment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="selected_plan">
                      Selected Plan <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.selected_plan}
                      onValueChange={(value) => handleSelectChange("selected_plan", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="chatbot_status">
                      Chatbot Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.chatbot_status}
                      onValueChange={(value) => handleSelectChange("chatbot_status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="payment_status">
                      Payment Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.payment_status}
                      onValueChange={(value) => handleSelectChange("payment_status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="payment_amount">
                      Payment Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="payment_amount"
                      name="payment_amount"
                      type="number"
                      value={formData.payment_amount}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="payment_date">
                      Payment Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="payment_date"
                      name="payment_date"
                      type="date"
                      value={formData.payment_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="payment_id">Payment ID</Label>
                    <Input id="payment_id" name="payment_id" value={formData.payment_id} onChange={handleChange} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="chat_limit">Chat Limit</Label>
                    <Input id="chat_limit" name="chat_limit" value={formData.chat_limit} onChange={handleChange} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="total_chats">Total Chats</Label>
                    <Input
                      id="total_chats"
                      name="total_chats"
                      type="number"
                      value={formData.total_chats}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <CardFooter className="flex justify-end px-0 pt-6">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    validating ||
                    usernameExists ||
                    chatbotIdExists ||
                    (formData.password.length > 0 && !passwordValid)
                  }
                  className="w-full md:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding User...
                    </>
                  ) : (
                    "Add User"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
