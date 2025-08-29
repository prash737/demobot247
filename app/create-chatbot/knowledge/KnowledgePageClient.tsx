"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Info, Plus, X, Paperclip, Trash2, AlertCircle, RefreshCw, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/app/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { toast } from "@/components/ui/use-toast"
import { useChatbotTheme } from "@/app/contexts/chatbot-theme-context"
import SharedChatInterface from "@/app/components/shared-chat-interface"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ChatbotSidebar from "@/app/components/chatbot-sidebar"
import ChatbotHeader from "@/app/components/chatbot-header"
import { logAuditEvent } from "@/app/utils/audit-logger"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

// Helper function to count words
const countWords = (text: string) => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function KnowledgePageClient() {
  const router = useRouter()
  const { darkMode, setDarkMode } = useChatbotTheme()

  // State management
  const [activeSection, setActiveSection] = useState("knowledge")
  const [isFullscreen, setIsFullscreen] = useState(false) // Kept for potential future use, but button removed
  const [isScrolled, setIsScrolled] = useState(false)
  const [chatbotName, setChatbotName] = useState("AI Assistant")

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileUploadErrors, setFileUploadErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // URL states
  const [urls, setUrls] = useState<string[]>([""])
  const [urlErrors, setUrlErrors] = useState<string[]>([])
  const [isUploadingUrls, setIsUploadingUrls] = useState(false)
  const [urlUploadSuccess, setUrlUploadSuccess] = useState(false)

  // Add these new state variables after the existing state declarations
  const [existingUrls, setExistingUrls] = useState<string[]>([])
  const [existingDocuments, setExistingDocuments] = useState<string[]>([])
  const [totalKnowledgeSources, setTotalKnowledgeSources] = useState<number>(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    type: "url" | "document" | "domain" | "faq"
    value: string
  } | null>(null)

  // Domain states - updated to match URL handling
  const [domains, setDomains] = useState<string[]>([""])
  const [domainErrors, setDomainErrors] = useState<string[]>([])
  const [isUploadingDomains, setIsUploadingDomains] = useState(false)
  const [domainUploadSuccess, setDomainUploadSuccess] = useState(false)
  const [existingDomains, setExistingDomains] = useState<string[]>([])
  const [isLoadingDomains, setIsLoadingDomains] = useState(false)
  const [isDeletingDomain, setIsDeletingDomain] = useState(false)
  const [chatbotId, setChatbotId] = useState<string>("")

  // Refresh dialog state
  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [userPlan, setUserPlan] = useState<string>("Free Plan") // Add state for user plan

  // Add new state variables after existing declarations
  const [newFaqQuestion, setNewFaqQuestion] = useState("")
  const [newFaqAnswer, setNewFaqAnswer] = useState("")
  const [existingFaqs, setExistingFaqs] = useState<Array<{ question: string; answer: string }>>([])
  const [isAddingFaq, setIsAddingFaq] = useState(false)
  const [faqErrors, setFaqErrors] = useState<{ question?: string; answer?: string }>({})
  // Add these new state variables for editing FAQs
  const [isEditingFaq, setIsEditingFaq] = useState(false)
  const [currentFaqIndex, setCurrentFaqIndex] = useState<number | null>(null)
  const [originalFaqQuestion, setOriginalFaqQuestion] = useState("")
  const [originalFaqAnswer, setOriginalFaqAnswer] = useState("")

  // Define limits based on user plan
  const faqLimit = userPlan === "Free Plan" ? 10 : Number.POSITIVE_INFINITY
  const otherKnowledgeLimit = userPlan === "Free Plan" ? 0 : 20 // For URLs and Documents combined
  const freePlanDomainLimit = 1 // New limit for Free Plan domains

  // Define word limits for FAQs
  const FAQ_QUESTION_WORD_LIMIT = 50
  const FAQ_ANSWER_WORD_LIMIT = 100

  // Effects
  useEffect(() => {
    // Apply theme
    const root = document.documentElement
    if (darkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [darkMode])

  // Load chatbot ID, name and greeting from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("chatbotName")
      if (savedName) {
        setChatbotName(savedName)
      }

      // Get the chatbot ID from userData in localStorage
      const userDataStr = localStorage.getItem("userData")
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)
          if (userData.chatbotId) {
            setChatbotId(userData.chatbotId)
          }
        } catch (error) {
          console.error("Error parsing userData from localStorage:", error)
        }
      }
    }
  }, [])

  // Fetch theme data from Supabase when component mounts
  useEffect(() => {
    const fetchThemeData = async () => {
      try {
        // Get the chatbot ID from userData in localStorage
        let chatbotId = null

        if (typeof window !== "undefined") {
          const userDataStr = localStorage.getItem("userData")
          if (userDataStr) {
            const userData = JSON.parse(userDataStr)
            if (userData.chatbotId) {
              chatbotId = userData.chatbotId
            }
          }
        }

        if (!chatbotId) return

        // Fetch the theme data from the chatbot_themes table
        const { data, error } = await supabase.from("chatbot_themes").select("*").eq("chatbot_id", chatbotId).single()

        if (error) {
          console.error("Error fetching theme data:", error)
          return
        }

        if (data) {
          console.log("Theme data loaded for knowledge page:", data)

          if (data.chatbot_name !== null) {
            setChatbotName(data.chatbot_name)
            localStorage.setItem("chatbotName", data.chatbot_name)
          }
        }
      } catch (error) {
        console.error("Error in fetchThemeData:", error)
      }
    }

    fetchThemeData()
  }, [])

  // Fetch user plan from database
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!chatbotId) return

      try {
        const { data, error } = await supabase
          .from("credentials")
          .select("selected_plan")
          .eq("chatbot_id", chatbotId)
          .single()

        if (error) {
          console.error("Error fetching user plan:", error)
          return
        }

        if (data && data.selected_plan) {
          setUserPlan(data.selected_plan)
        }
      } catch (error) {
        console.error("Error fetching user plan:", error)
      }
    }

    fetchUserPlan()
  }, [chatbotId])

  // Add this new useEffect to fetch existing URLs and documents
  useEffect(() => {
    const fetchExistingData = async () => {
      if (!chatbotId) return

      try {
        // Fetch existing URLs
        const { data: urlData, error: urlError } = await supabase
          .from("urls_uploaded")
          .select("url_links")
          .eq("chatbot_id", chatbotId)
          .single()

        if (urlError && urlError.code !== "PGRST116") {
          console.error("Error fetching URLs:", urlError)
        }

        if (urlData && urlData.url_links && urlData.url_links.links) {
          setExistingUrls(urlData.url_links.links)
        } else {
          setExistingUrls([])
        }

        // Fetch existing documents
        const { data: documentsData, error: documentsError } = await supabase.storage
          .from("documentuploaded")
          .list(`${chatbotId}/`)

        if (documentsError) {
          console.error("Error fetching documents:", documentsError)
        }

        if (documentsData) {
          // Filter out the .keep file and any other system files
          const documentFiles = documentsData
            .filter((file) => file.name !== ".keep" && !file.name.startsWith("."))
            .map((file) => file.name)
          setExistingDocuments(documentFiles)
        } else {
          setExistingDocuments([])
        }

        // Fetch existing FAQs
        const { data: faqsData, error: faqsError } = await supabase
          .from("faqs_uploaded")
          .select("faqs")
          .eq("chatbot_id", chatbotId)
          .single()

        if (faqsError && faqsError.code !== "PGRST116") {
          console.error("Error fetching FAQs:", faqsError)
        }

        if (faqsData && faqsData.faqs) {
          setExistingFaqs(faqsData.faqs)
        } else {
          setExistingFaqs([])
        }

        // Update total count calculation
        const urlCount = urlData?.url_links?.links?.length || 0
        const documentCount =
          documentsData?.filter((file) => file.name !== ".keep" && !file.name.startsWith(".")).length || 0
        const faqCount = faqsData?.faqs?.length || 0
        setTotalKnowledgeSources(urlCount + documentCount + faqCount)
      } catch (error) {
        console.error("Error fetching existing data:", error)
      }
    }

    fetchExistingData()
  }, [chatbotId])

  // Add this new useEffect to fetch embed domains after the other useEffects
  useEffect(() => {
    const fetchEmbedDomains = async () => {
      if (!chatbotId) return

      setIsLoadingDomains(true)
      try {
        // Fetch existing embed domains
        const { data, error } = await supabase
          .from("embed_domains")
          .select("domains")
          .eq("chatbot_id", chatbotId)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching embed domains:", error)
        }

        if (data && data.domains && data.domains.links) {
          setExistingDomains(data.domains.links)
        } else {
          setExistingDomains([])
        }
      } catch (error) {
        console.error("Error in fetchEmbedDomains:", error)
      } finally {
        setIsLoadingDomains(false)
      }
    }

    fetchEmbedDomains()
  }, [chatbotId])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] // Get only the first file
    setFileUploadErrors([]) // Clear previous errors
    setSelectedFiles([]) // Clear previously selected files

    if (!file) {
      return
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const fileSizeInMB = file.size / (1024 * 1024)

    const errors: string[] = []

    // Check file size (5MB limit)
    if (fileSizeInMB > 5) {
      errors.push(`${file.name}: File size exceeds 5MB limit (${fileSizeInMB.toFixed(2)}MB)`)
    }

    // Updated to accept PDF, CSV, and DOCX
    if (fileExtension !== "pdf" && fileExtension !== "csv" && fileExtension !== "docx") {
      errors.push(`${file.name}: Only PDF, CSV, and DOCX files are allowed`)
    }

    if (errors.length > 0) {
      setFileUploadErrors(errors)
      toast({
        title: "File validation errors",
        description: `${errors.length} file(s) had issues. Check the details below.`,
        variant: "destructive",
      })
    } else {
      setSelectedFiles([file]) // Set only the valid file
    }
  }

  // Handle file removal
  const handleRemoveFile = () => {
    // Removed index parameter as there's only one file
    setSelectedFiles([])
  }

  // Upload all files to Supabase
  const uploadAllFiles = async () => {
    if (userPlan === "Free Plan") {
      toast({
        title: "Plan Restriction",
        description: "Document uploads are not available on the Free Plan. Please upgrade to upload documents.",
        variant: "destructive",
      })
      return
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "No file selected", // Updated text
        description: "Please select a file to upload", // Updated text
        variant: "destructive",
      })
      return
    }

    if (!chatbotId) {
      toast({
        title: "Missing chatbot ID",
        description: "Could not determine which chatbot to upload files for.",
        variant: "destructive",
      })
      return
    }

    // Check if adding this file would exceed the knowledge source limit for documents/urls
    if (existingDocuments.length + existingUrls.length + 1 > otherKnowledgeLimit) {
      toast({
        title: "Source limit exceeded",
        description: `You can only have ${otherKnowledgeLimit} combined documents and URLs for your current plan.`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)

    try {
      const folderPath = `${chatbotId}/`
      const { data: folderData, error: folderError } = await supabase.storage.from("documentuploaded").list(folderPath)

      if (folderError && folderError.message !== "The resource was not found") {
        throw folderError
      }

      if (!folderData || folderData.length === 0) {
        const { error: createFolderError } = await supabase.storage
          .from("documentuploaded")
          .upload(`${folderPath}.keep`, new Blob([]), { upsert: true })

        if (createFolderError) {
          throw createFolderError
        }
      }

      // Upload the single file
      const file = selectedFiles[0] // Get the single file
      const { error: uploadError } = await supabase.storage
        .from("documentuploaded")
        .upload(`${folderPath}${file.name}`, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Log to audit_logs
      const fileName = file.name // Get the single file name
      await logAuditEvent(supabase, chatbotId, "user", "documents_added", {
        // Pass supabase client
        previous: null,
        current: [fileName], // Pass as array for consistency
      })

      // Success
      setSelectedFiles([]) // Clear the selected file
      setUploadSuccess(true)
      toast({
        title: "Upload successful",
        description: `Successfully uploaded 1 file`, // Updated text
      })

      // Refresh all knowledge sources to ensure counts are up-to-date
      await refreshKnowledgeSources()
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Validate URL
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  // Handle URL input change
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)

    const newErrors = [...urlErrors]
    if (value && !validateUrl(value)) {
      newErrors[index] = "Please enter a valid URL"
    } else {
      newErrors[index] = ""
    }
    setUrlErrors(newErrors)
  }

  // Add URL input field
  const handleAddUrl = () => {
    setUrls([...urls, ""])
    setUrlErrors([...urlErrors, ""])
  }

  // Remove URL input field
  const handleRemoveUrl = (index: number) => {
    const newUrls = [...urls]
    newUrls.splice(index, 1)
    setUrls(newUrls)

    const newErrors = [...urlErrors]
    newErrors.splice(index, 1)
    setUrlErrors(newErrors)
  }

  // Upload URLs to Supabase
  const uploadUrls = async () => {
    if (userPlan === "Free Plan") {
      toast({
        title: "Plan Restriction",
        description: "URL uploads are not available on the Free Plan. Please upgrade to upload URLs.",
        variant: "destructive",
      })
      return
    }

    // Filter out empty URLs
    const validUrls = urls.filter((url) => url.trim() !== "")

    if (validUrls.length === 0) {
      toast({
        title: "No URLs entered",
        description: "Please enter at least one valid URL",
        variant: "destructive",
      })
      return
    }

    if (!chatbotId) {
      toast({
        title: "Missing chatbot ID",
        description: "Could not determine which chatbot to upload URLs for.",
        variant: "destructive",
      })
      return
    }

    // Check if all URLs are valid
    const hasErrors = urlErrors.some((error) => error !== "")
    if (hasErrors) {
      toast({
        title: "Invalid URLs",
        description: "Please correct the errors before uploading",
        variant: "destructive",
      })
      return
    }

    // Check if adding these URLs would exceed the knowledge source limit for documents/urls
    const totalAfterUpload = existingUrls.length + validUrls.length + existingDocuments.length
    if (totalAfterUpload > otherKnowledgeLimit) {
      toast({
        title: "Source limit exceeded",
        description: `You can only have ${otherKnowledgeLimit} combined documents and URLs for your current plan.`,
        variant: "destructive",
      })
      return
    }

    setIsUploadingUrls(true)
    setUrlUploadSuccess(false)

    try {
      // Check if there are existing URLs
      const { data: existingUrlData, error: existingUrlError } = await supabase
        .from("urls_uploaded")
        .select("url_links")
        .eq("chatbot_id", chatbotId)
        .single()

      let combinedUrls: string[] = []

      if (existingUrlData && existingUrlData.url_links && existingUrlData.url_links.links) {
        // Combine existing URLs with new ones
        combinedUrls = [...existingUrlData.url_links.links, ...validUrls]
      } else {
        combinedUrls = validUrls
      }

      // Format URLs as required JSON
      const urlData = {
        links: combinedUrls,
      }

      if (existingUrlData) {
        // Update existing record
        const { error } = await supabase
          .from("urls_uploaded")
          .update({ url_links: urlData })
          .eq("chatbot_id", chatbotId)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase.from("urls_uploaded").insert([
          {
            chatbot_id: chatbotId,
            url_links: urlData,
          },
        ])

        if (error) throw error
      }

      // Log to audit_logs
      await logAuditEvent(supabase, chatbotId, "user", "urls_added", {
        // Pass supabase client
        previous: existingUrlData?.url_links?.links || null,
        current: validUrls,
      })

      // Success
      setUrls([""])
      setUrlErrors([""])
      setUrlUploadSuccess(true)
      // Refresh all knowledge sources to ensure counts are up-to-date
      await refreshKnowledgeSources()

      toast({
        title: "URLs uploaded successfully",
        description: `Successfully added ${validUrls.length} URLs as knowledge sources`,
      })
    } catch (error) {
      console.error("Error uploading URLs:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploadingUrls(false)
    }
  }

  // Handle domain input change - similar to URL handling
  const handleDomainChange = (index: number, value: string) => {
    const newDomains = [...domains]
    newDomains[index] = value
    setDomains(newDomains)

    const newErrors = [...domainErrors]
    if (value && !validateUrl(value)) {
      newErrors[index] = "Please enter a valid URL"
    } else {
      newErrors[index] = ""
    }
    setDomainErrors(newErrors)
  }

  // Add domain input field - similar to URL handling
  const handleAddDomain = () => {
    if (userPlan === "Free Plan" && domains.length >= freePlanDomainLimit) {
      toast({
        title: "Domain limit reached",
        description: `You can only add ${freePlanDomainLimit} embed domain on the Free Plan.`,
        variant: "destructive",
      })
      return
    }
    setDomains([...domains, ""])
    setDomainErrors([...domainErrors, ""])
  }

  // Remove domain input field - similar to URL handling
  const handleRemoveDomain = (index: number) => {
    const newDomains = [...domains]
    newDomains.splice(index, 1)
    setDomains(newDomains)

    const newErrors = [...domainErrors]
    newErrors.splice(index, 1)
    setDomainErrors(newErrors)
  }

  // Upload domains to Supabase - similar to URL handling
  const uploadDomains = async () => {
    // Filter out empty domains
    const validDomains = domains.filter((domain) => domain.trim() !== "")

    if (validDomains.length === 0) {
      toast({
        title: "No domains entered",
        description: "Please enter at least one valid domain",
        variant: "destructive",
      })
      return
    }

    if (!chatbotId) {
      toast({
        title: "Missing chatbot ID",
        description: "Could not determine which chatbot to upload domains for.",
        variant: "destructive",
      })
      return
    }

    // Check if all domains are valid
    const hasErrors = domainErrors.some((error) => error !== "")
    if (hasErrors) {
      toast({
        title: "Invalid domains",
        description: "Please correct the errors before uploading",
        variant: "destructive",
      })
      return
    }

    if (userPlan === "Free Plan" && existingDomains.length + validDomains.length > freePlanDomainLimit) {
      toast({
        title: "Domain limit exceeded",
        description: `You can only have ${freePlanDomainLimit} embed domain on the Free Plan.`,
        variant: "destructive",
      })
      return
    }

    setIsUploadingDomains(true)
    setDomainUploadSuccess(false)

    try {
      // Check if there are existing domains
      const { data: existingData, error: existingError } = await supabase
        .from("embed_domains")
        .select("domains")
        .eq("chatbot_id", chatbotId)
        .single()

      let combinedDomains: string[] = []

      if (existingData && existingData.domains && existingData.domains.links) {
        // Combine existing domains with new ones
        combinedDomains = [...existingData.domains.links, ...validDomains]
      } else {
        combinedDomains = validDomains
      }

      // Format domains as required JSON
      const domainData = {
        links: combinedDomains,
      }

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("embed_domains")
          .update({ domains: domainData })
          .eq("chatbot_id", chatbotId)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase.from("embed_domains").insert([
          {
            chatbot_id: chatbotId,
            domains: domainData,
          },
        ])

        if (error) throw error
      }

      // Log to audit_logs
      await logAuditEvent(supabase, chatbotId, "user", "domains_added", {
        // Pass supabase client
        previous: existingData?.domains?.links || null,
        current: validDomains,
      })

      // Success
      setDomains([""])
      setDomainErrors([""])
      setDomainUploadSuccess(true)
      setExistingDomains(combinedDomains)

      toast({
        title: "Domains uploaded successfully",
        description: `Successfully added ${validDomains.length} domains to your embed list`,
      })
    } catch (error) {
      console.error("Error uploading domains:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploadingDomains(false)
    }
  }

  const deleteEmbedDomain = async (domain: string) => {
    if (!chatbotId) {
      toast({
        title: "Missing chatbot ID",
        description: "Could not determine which chatbot to delete domain from.",
        variant: "destructive",
      })
      return
    }

    setIsDeletingDomain(true)

    try {
      // Get current domains
      const { data, error } = await supabase
        .from("embed_domains")
        .select("domains")
        .eq("chatbot_id", chatbotId)
        .single()

      if (error) throw error

      if (!data || !data.domains || !data.domains.links) {
        throw new Error("No domains found")
      }

      // Filter out the domain to delete
      const updatedDomains = data.domains.links.filter((existingDomain: string) => existingDomain !== domain)

      // Update the record
      const { error: updateError } = await supabase
        .from("embed_domains")
        .update({ domains: { links: updatedDomains } })
        .eq("chatbot_id", chatbotId)

      if (updateError) throw updateError

      // Log to audit_logs
      await logAuditEvent(supabase, chatbotId, "user", "domain_deleted", {
        // Pass supabase client
        previous: domain,
        current: null,
      })

      // Update state
      setExistingDomains(updatedDomains)

      toast({
        title: "Domain deleted",
        description: "The domain has been removed from your embed list",
      })
    } catch (error) {
      console.error("Error deleting domain:", error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeletingDomain(false)
    }
  }

  // Add new functions for FAQ management
  const addFaq = async () => {
    setFaqErrors({})
    if (!newFaqQuestion.trim()) {
      setFaqErrors((prev) => ({ ...prev, question: "Question cannot be empty" }))
      return
    }
    if (!newFaqAnswer.trim()) {
      setFaqErrors((prev) => ({ ...prev, answer: "Answer cannot be empty" }))
      return
    }

    // Check word limits
    if (countWords(newFaqQuestion) > FAQ_QUESTION_WORD_LIMIT) {
      setFaqErrors((prev) => ({ ...prev, question: `Question exceeds ${FAQ_QUESTION_WORD_LIMIT} words` }))
      toast({
        title: "Question too long",
        description: `Please keep the question within ${FAQ_QUESTION_WORD_LIMIT} words.`,
        variant: "destructive",
      })
      return
    }
    if (countWords(newFaqAnswer) > FAQ_ANSWER_WORD_LIMIT) {
      setFaqErrors((prev) => ({ ...prev, answer: `Answer exceeds ${FAQ_ANSWER_WORD_LIMIT} words` }))
      toast({
        title: "Answer too long",
        description: `Please keep the answer within ${FAQ_ANSWER_WORD_LIMIT} words.`,
        variant: "destructive",
      })
      return
    }

    if (!chatbotId) {
      toast({
        title: "Missing chatbot ID",
        description: "Could not determine which chatbot to add FAQ for.",
        variant: "destructive",
      })
      return
    }

    // Check FAQ specific limit only when adding a new FAQ
    if (!isEditingFaq && existingFaqs.length + 1 > faqLimit) {
      toast({
        title: "FAQ limit exceeded",
        description: `You can only add ${faqLimit} FAQs for your current plan.`,
        variant: "destructive",
      })
      return
    }

    setIsAddingFaq(true)
    try {
      const newFaq = { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }

      const { data: existingFaqData, error: existingFaqError } = await supabase
        .from("faqs_uploaded")
        .select("faqs")
        .eq("chatbot_id", chatbotId)
        .single()

      let combinedFaqs: Array<{ question: string; answer: string }> = []
      let auditPrevious: Array<{ question: string; answer: string }> | null = existingFaqData?.faqs || null
      let auditCurrent: Array<{ question: string; answer: string }> | null = null
      let auditActionType = ""

      if (existingFaqData && existingFaqData.faqs) {
        combinedFaqs = [...existingFaqData.faqs]
      }

      if (isEditingFaq && currentFaqIndex !== null) {
        // Update existing FAQ
        const oldFaq = combinedFaqs[currentFaqIndex]
        combinedFaqs[currentFaqIndex] = newFaq
        auditPrevious = [oldFaq]
        auditCurrent = [newFaq]
        auditActionType = "faq_updated"
      } else {
        // Add new FAQ
        combinedFaqs.push(newFaq)
        auditPrevious = null
        auditCurrent = [newFaq]
        auditActionType = "faq_added"
      }

      if (existingFaqData) {
        const { error } = await supabase
          .from("faqs_uploaded")
          .update({ faqs: combinedFaqs })
          .eq("chatbot_id", chatbotId)
        if (error) throw error
      } else {
        const { error } = await supabase.from("faqs_uploaded").insert([
          {
            chatbot_id: chatbotId,
            faqs: combinedFaqs,
          },
        ])
        if (error) throw error
      }

      await logAuditEvent(supabase, chatbotId, "user", auditActionType, {
        previous: auditPrevious,
        current: auditCurrent,
      })

      setNewFaqQuestion("")
      setNewFaqAnswer("")
      setIsEditingFaq(false)
      setCurrentFaqIndex(null)
      setOriginalFaqQuestion("")
      setOriginalFaqAnswer("")

      // Refresh all knowledge sources to ensure counts are up-to-date
      await refreshKnowledgeSources()

      toast({
        title: `FAQ ${isEditingFaq ? "updated" : "added"} successfully`,
        description: `Your FAQ has been ${isEditingFaq ? "updated" : "added"} to the knowledge base.`,
      })
    } catch (error) {
      console.error(`Error ${isEditingFaq ? "updating" : "adding"} FAQ:`, error)
      toast({
        title: `Failed to ${isEditingFaq ? "update" : "add"} FAQ`,
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAddingFaq(false)
    }
  }

  const handleEditFaq = (index: number) => {
    const faqToEdit = existingFaqs[index]
    setNewFaqQuestion(faqToEdit.question)
    setNewFaqAnswer(faqToEdit.answer)
    setIsEditingFaq(true)
    setCurrentFaqIndex(index)
    setOriginalFaqQuestion(faqToEdit.question)
    setOriginalFaqAnswer(faqToEdit.answer)
    setFaqErrors({}) // Clear any previous errors
  }

  const handleCancelEdit = () => {
    setNewFaqQuestion("")
    setNewFaqAnswer("")
    setIsEditingFaq(false)
    setCurrentFaqIndex(null)
    setOriginalFaqQuestion("")
    setOriginalFaqAnswer("")
    setFaqErrors({}) // Clear any errors
  }

  const deleteFaq = async (faqToDelete: { question: string; answer: string }) => {
    if (!chatbotId) {
      toast({
        title: "Missing chatbot ID",
        description: "Could not determine which chatbot to delete FAQ from.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      const { data, error } = await supabase.from("faqs_uploaded").select("faqs").eq("chatbot_id", chatbotId).single()

      if (error) throw error
      if (!data || !data.faqs) {
        throw new Error("No FAQs found")
      }

      const updatedFaqs = data.faqs.filter(
        (faq: { question: string; answer: string }) =>
          faq.question !== faqToDelete.question || faq.answer !== faqToDelete.answer,
      )

      const { error: updateError } = await supabase
        .from("faqs_uploaded")
        .update({ faqs: updatedFaqs })
        .eq("chatbot_id", chatbotId)

      if (updateError) throw updateError

      await logAuditEvent(supabase, chatbotId, "user", "faq_deleted", {
        previous: faqToDelete,
        current: null,
      })

      // Refresh all knowledge sources to ensure counts are up-to-date
      await refreshKnowledgeSources()
      toast({
        title: "FAQ deleted",
        description: "The FAQ has been removed from your knowledge sources.",
      })
    } catch (error) {
      console.error("Error deleting FAQ:", error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Inside the `faqSection` JSX:
  const faqSection = () => {
    const currentQuestionWords = countWords(newFaqQuestion)
    const currentAnswerWords = countWords(newFaqAnswer)

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-6">
        <h3 className="font-medium mb-4">Add Frequently Asked Questions (FAQs)</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Manually add question and answer pairs to train your chatbot. These FAQs will be prioritized in responses.
        </p>
        {userPlan === "Free Plan" && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Free Plan: You can add up to {faqLimit} FAQs.
            </span>
          </p>
        )}
        {userPlan !== "Free Plan" && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Paid Plans: You can add unlimited FAQs.
            </span>
          </p>
        )}

        <div className="space-y-3 mb-4">
          <div>
            <Label htmlFor="faq-question" className="mb-1 block text-sm font-medium">
              Question
            </Label>
            <Input
              id="faq-question"
              value={newFaqQuestion}
              onChange={(e) => setNewFaqQuestion(e.target.value)}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                const words = e.target.value.trim().split(/\s+/).filter(Boolean)
                if (words.length > FAQ_QUESTION_WORD_LIMIT) {
                  e.target.value = words.slice(0, FAQ_QUESTION_WORD_LIMIT).join(" ")
                  setNewFaqQuestion(e.target.value)
                }
              }}
              placeholder="e.g., What are your business hours?"
              className={faqErrors.question || currentQuestionWords > FAQ_QUESTION_WORD_LIMIT ? "border-red-500" : ""}
              style={{
                borderRadius: `var(--border-radius)px`,
                borderColor: `var(--primary-color)50`,
              }}
            />
            <p
              className={`text-xs mt-1 ${currentQuestionWords > FAQ_QUESTION_WORD_LIMIT ? "text-red-500" : "text-gray-500"}`}
            >
              {currentQuestionWords}/{FAQ_QUESTION_WORD_LIMIT} words
            </p>
            {faqErrors.question && <p className="text-xs text-red-500 mt-1">{faqErrors.question}</p>}
          </div>
          <div>
            <Label htmlFor="faq-answer" className="mb-1 block text-sm font-medium">
              Answer
            </Label>
            <Textarea
              id="faq-answer"
              value={newFaqAnswer}
              onChange={(e) => setNewFaqAnswer(e.target.value)}
              onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const words = e.target.value.trim().split(/\s+/).filter(Boolean)
                if (words.length > FAQ_ANSWER_WORD_LIMIT) {
                  e.target.value = words.slice(0, FAQ_ANSWER_WORD_LIMIT).join(" ")
                  setNewFaqAnswer(e.target.value)
                }
              }}
              placeholder="e.g., We are open Monday to Friday, 9 AM to 5 PM."
              className={faqErrors.answer || currentAnswerWords > FAQ_ANSWER_WORD_LIMIT ? "border-red-500" : ""}
              rows={3}
              style={{
                borderRadius: `var(--border-radius)px`,
                borderColor: `var(--primary-color)50`,
              }}
            />
            <p
              className={`text-xs mt-1 ${currentAnswerWords > FAQ_ANSWER_WORD_LIMIT ? "text-red-500" : "text-gray-500"}`}
            >
              {currentAnswerWords}/{FAQ_ANSWER_WORD_LIMIT} words
            </p>
            {faqErrors.answer && <p className="text-xs text-red-500 mt-1">{faqErrors.answer}</p>}
          </div>
        </div>

        <Button
          onClick={addFaq}
          disabled={
            isAddingFaq ||
            !newFaqQuestion.trim() ||
            !newFaqAnswer.trim() ||
            currentQuestionWords > FAQ_QUESTION_WORD_LIMIT ||
            currentAnswerWords > FAQ_ANSWER_WORD_LIMIT ||
            (!isEditingFaq && existingFaqs.length >= faqLimit)
          }
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isAddingFaq ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              {isEditingFaq ? "Updating FAQ..." : "Adding FAQ..."}
            </>
          ) : !isEditingFaq && existingFaqs.length >= faqLimit ? (
            "Limit Reached"
          ) : isEditingFaq ? (
            "Update FAQ"
          ) : (
            "Add FAQ"
          )}
        </Button>
        {isEditingFaq && (
          <Button onClick={handleCancelEdit} variant="outline" className="ml-2 bg-transparent" disabled={isAddingFaq}>
            Cancel Edit
          </Button>
        )}

        {existingFaqs.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Existing FAQs ({existingFaqs.length})</h4>
            <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {existingFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Q: {faq.question}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">A: {faq.answer}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {" "}
                    {/* Added a div for buttons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-blue-500 flex-shrink-0"
                      onClick={() => handleEditFaq(index)}
                      disabled={isDeleting || isAddingFaq} // Disable edit while deleting or adding/updating
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-500 flex-shrink-0"
                      onClick={() => handleDeleteConfirm("faq", faq.question)} // Using question as value for deletion
                      disabled={isDeleting || isAddingFaq} // Disable delete while deleting or adding/updating
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const documentUploadSection = () => {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-6">
        <h3 className="font-medium mb-4">Upload Documents</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Upload PDF, CSV, and DOCX files to train your chatbot.
        </p>
        {userPlan === "Free Plan" && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Free Plan: Document uploads are not available on your plan.
            </span>
          </p>
        )}
        {userPlan !== "Free Plan" && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Paid Plans: You can upload PDF, CSV, and DOCX files to train your chatbot.
            </span>
          </p>
        )}

        <div className="mb-4">
          <Label
            htmlFor="file-upload"
            className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 inline-block"
          >
            <Paperclip className="inline-block h-4 w-4 mr-2" />
            {selectedFiles.length > 0 ? selectedFiles[0].name : "Select a file"}
            <Input
              id="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileSelect}
              accept=".pdf, .csv, .docx"
            />
          </Label>
          {selectedFiles.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-gray-500 hover:text-red-500"
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {fileUploadErrors.length > 0 && (
            <ul className="mt-2 text-sm text-red-500">
              {fileUploadErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>

        <Button
          onClick={uploadAllFiles}
          disabled={isUploading || selectedFiles.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isUploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Uploading...
            </>
          ) : (
            "Upload File"
          )}
        </Button>
        {uploadSuccess && <p className="mt-2 text-sm text-green-500">File uploaded successfully!</p>}

        {existingDocuments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Existing Documents ({existingDocuments.length})</h4>
            <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {existingDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-500 flex-shrink-0"
                      onClick={() => handleDeleteConfirm("document", doc)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const urlUploadSection = () => {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-6">
        <h3 className="font-medium mb-4">Add URLs</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Add URLs to train your chatbot.</p>
        {userPlan === "Free Plan" && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Free Plan: URL uploads are not available on your plan.
            </span>
          </p>
        )}
        {userPlan !== "Free Plan" && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Paid Plans: You can add URLs to train your chatbot.
            </span>
          </p>
        )}

        {urls.map((url, index) => (
          <div key={index} className="flex items-center mb-3">
            <Input
              type="url"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              className={urlErrors[index] ? "border-red-500" : ""}
              style={{
                borderRadius: `var(--border-radius)px`,
                borderColor: `var(--primary-color)50`,
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-gray-500 hover:text-red-500"
              onClick={() => handleRemoveUrl(index)}
              disabled={isUploadingUrls}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {urlErrors.map(
          (error, index) =>
            error && (
              <p key={`error-${index}`} className="text-xs text-red-500 mt-1">
                {error}
              </p>
            ),
        )}

        <Button variant="outline" className="mb-3 bg-transparent" onClick={handleAddUrl} disabled={isUploadingUrls}>
          <Plus className="h-4 w-4 mr-2" />
          Add URL
        </Button>

        <Button
          onClick={uploadUrls}
          disabled={isUploadingUrls}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isUploadingUrls ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Uploading...
            </>
          ) : (
            "Upload URLs"
          )}
        </Button>
        {urlUploadSuccess && <p className="mt-2 text-sm text-green-500">URLs uploaded successfully!</p>}

        {existingUrls.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Existing URLs ({existingUrls.length})</h4>
            <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {existingUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{url}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-500 flex-shrink-0"
                      onClick={() => handleDeleteConfirm("url", url)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const embedDomainsSection = (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-6">
      <h3 className="font-medium mb-4">Allowed Embed Domains</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Specify the domains where your chatbot can be embedded.
      </p>
      {userPlan === "Free Plan" && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Free Plan: You can add up to {freePlanDomainLimit} embed domain.
          </span>
        </p>
      )}
      {userPlan !== "Free Plan" && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Paid Plans: You can add unlimited embed domains.
          </span>
        </p>
      )}

      {domains.map((domain, index) => (
        <div key={index} className="flex items-center mb-3">
          <Input
            type="url"
            placeholder="Enter Domain URL"
            value={domain}
            onChange={(e) => handleDomainChange(index, e.target.value)}
            className={domainErrors[index] ? "border-red-500" : ""}
            style={{
              borderRadius: `var(--border-radius)px`,
              borderColor: `var(--primary-color)50`,
            }}
            disabled={userPlan === "Free Plan" && domains.length >= freePlanDomainLimit}
          />
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-gray-500 hover:text-red-500"
            onClick={() => handleRemoveDomain(index)}
            disabled={isUploadingDomains}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {domainErrors.map(
        (error, index) =>
          error && (
            <p key={`error-${index}`} className="text-xs text-red-500 mt-1">
              {error}
            </p>
          ),
      )}

      <Button
        variant="outline"
        className="mb-3 bg-transparent"
        onClick={handleAddDomain}
        disabled={isUploadingDomains || (userPlan === "Free Plan" && domains.length >= freePlanDomainLimit)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Domain
      </Button>

      <Button
        onClick={uploadDomains}
        disabled={isUploadingDomains}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {isUploadingDomains ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Uploading...
          </>
        ) : (
          "Upload Domains"
        )}
      </Button>
      {domainUploadSuccess && <p className="mt-2 text-sm text-green-500">Domains uploaded successfully!</p>}

      {existingDomains.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Existing Domains ({existingDomains.length})</h4>
          <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {existingDomains.map((domain, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{domain}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-500 flex-shrink-0"
                    onClick={() => handleDeleteConfirm("domain", domain)}
                    disabled={isDeletingDomain}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const handleDeleteConfirm = (type: "url" | "document" | "faq" | "domain", value: string) => {
    setItemToDelete({ type, value })
    setDeleteConfirmOpen(true)
  }

  const processDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      if (itemToDelete.type === "url") {
        await deleteUrl(itemToDelete.value)
      } else if (itemToDelete.type === "document") {
        await deleteDocument(itemToDelete.value)
      } else if (itemToDelete.type === "faq") {
        // Assuming itemToDelete.value contains the question of the FAQ
        const faqToDelete = existingFaqs.find((faq) => faq.question === itemToDelete.value)
        if (faqToDelete) {
          await deleteFaq(faqToDelete)
        } else {
          throw new Error("FAQ not found for deletion")
        }
      } else if (itemToDelete.type === "domain") {
        await deleteEmbedDomain(itemToDelete.value)
      }
      toast({
        title: `${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} deleted`,
        description: `The ${itemToDelete.type} has been removed from your knowledge sources.`,
      })
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  const deleteUrl = async (urlToDelete: string) => {
    if (!chatbotId) {
      toast({
        title: "Missing chatbot ID",
        description: "Could not determine which chatbot to delete URL from.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      // Get current URLs
      const { data, error } = await supabase
        .from("urls_uploaded")
        .select("url_links")
        .eq("chatbot_id", chatbotId)
        .single()

      if (error) throw error

      if (!data || !data.url_links || !data.url_links.links) {
        throw new Error("No URLs found")
      }

      // Filter out the URL to delete
      const updatedUrls = data.url_links.links.filter((url: string) => url !== urlToDelete)

      // Update the record
      const { error: updateError } = await supabase
        .from("urls_uploaded")
        .update({ url_links: { links: updatedUrls } })
        .eq("chatbot_id", chatbotId)

      if (updateError) throw updateError

      // Log to audit_logs
      await logAuditEvent(supabase, chatbotId, "user", "url_deleted", {
        // Pass supabase client
        previous: urlToDelete,
        current: null,
      })

      // Update state
      setExistingUrls(updatedUrls)

      // Refresh all knowledge sources to ensure counts are up-to-date
      await refreshKnowledgeSources()
    } catch (error) {
      console.error("Error deleting URL:", error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const deleteDocument = async (documentToDelete: string) => {
    if (!chatbotId) {
      toast({
        title: "Missing chatbot ID",
        description: "Could not determine which chatbot to delete document from.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      const filePath = `${chatbotId}/${documentToDelete}`
      const { error: deleteError } = await supabase.storage.from("documentuploaded").remove([filePath])

      if (deleteError) throw deleteError

      // Log to audit_logs
      await logAuditEvent(supabase, chatbotId, "user", "document_deleted", {
        // Pass supabase client
        previous: documentToDelete,
        current: null,
      })

      // Update state
      setExistingDocuments((prevDocuments) => prevDocuments.filter((doc) => doc !== documentToDelete))

      // Refresh all knowledge sources to ensure counts are up-to-date
      await refreshKnowledgeSources()
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRefreshConfirm = () => {
    setRefreshConfirmOpen(true)
  }

  const processRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate a refresh operation (replace with actual logic)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Log to audit_logs
      await logAuditEvent(supabase, chatbotId, "user", "urls_refreshed", {
        // Pass supabase client
        previous: null,
        current: existingUrls,
      })

      toast({
        title: "URLs refreshed",
        description: "All URLs have been refreshed successfully.",
      })
    } catch (error) {
      console.error("Error refreshing URLs:", error)
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
      setRefreshConfirmOpen(false)
    }
  }

  const refreshKnowledgeSources = async () => {
    if (!chatbotId) return

    try {
      // Fetch existing URLs
      const { data: urlData, error: urlError } = await supabase
        .from("urls_uploaded")
        .select("url_links")
        .eq("chatbot_id", chatbotId)
        .single()

      if (urlError && urlError.code !== "PGRST116") {
        console.error("Error fetching URLs:", urlError)
      }

      if (urlData && urlData.url_links && urlData.url_links.links) {
        setExistingUrls(urlData.url_links.links)
      } else {
        setExistingUrls([])
      }

      // Fetch existing documents
      const { data: documentsData, error: documentsError } = await supabase.storage
        .from("documentuploaded")
        .list(`${chatbotId}/`)

      if (documentsError) {
        console.error("Error fetching documents:", documentsError)
      }

      if (documentsData) {
        // Filter out the .keep file and any other system files
        const documentFiles = documentsData
          .filter((file) => file.name !== ".keep" && !file.name.startsWith("."))
          .map((file) => file.name)
        setExistingDocuments(documentFiles)
      } else {
        setExistingDocuments([])
      }

      // Fetch existing FAQs
      const { data: faqsData, error: faqsError } = await supabase
        .from("faqs_uploaded")
        .select("faqs")
        .eq("chatbot_id", chatbotId)
        .single()

      if (faqsError && faqsError.code !== "PGRST116") {
        console.error("Error fetching FAQs:", faqsError)
      }

      if (faqsData && faqsData.faqs) {
        setExistingFaqs(faqsData.faqs)
      } else {
        setExistingFaqs([])
      }

      // Update total count calculation
      const urlCount = urlData?.url_links?.links?.length || 0
      const documentCount =
        documentsData?.filter((file) => file.name !== ".keep" && !file.name.startsWith(".")).length || 0
      const faqCount = faqsData?.faqs?.length || 0
      setTotalKnowledgeSources(urlCount + documentCount + faqCount)
    } catch (error) {
      console.error("Error fetching existing data:", error)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50" : "",
      )}
    >
      {/* Top Navigation Bar */}
      <ChatbotHeader chatbotName={chatbotName} isScrolled={isScrolled} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {!isFullscreen && <ChatbotSidebar activeSection="knowledge" />}
        {/* Main Content */}
        <div
          className={cn(
            "flex-1 overflow-auto bg-gradient-to-br from-blue-50/30 to-green-50/30 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 scrollbar-hide",
            isFullscreen ? "w-full" : "w-full lg:w-3/5 xl:w-2/3", // Adjust width based on fullscreen
          )}
        >
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">
                  Knowledge sources (
                  {userPlan === "Free Plan"
                    ? `${existingFaqs.length}/${faqLimit}`
                    : `${existingDocuments.length + existingUrls.length}/${otherKnowledgeLimit}`}
                  )
                  {userPlan === "Free Plan" && existingFaqs.length >= faqLimit && (
                    <span className="ml-2 text-sm text-red-500 font-normal">(FAQ Limit reached)</span>
                  )}
                </h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 ml-2 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {userPlan === "Free Plan" ? (
                        <p>
                          Add and manage up to {faqLimit} FAQs for your chatbot. Document and URL knowledge sources are
                          not available on your plan.
                        </p>
                      ) : (
                        <p>
                          Add and manage knowledge sources for your chatbot. You can add unlimited FAQs, and up to{" "}
                          {otherKnowledgeLimit} combined URLs and documents.
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center space-x-2">
                {/* Refresh Button - Only show if URLs exist and not Free Plan */}
                {existingUrls.length > 0 && userPlan !== "Free Plan" && (
                  <Button
                    onClick={handleRefreshConfirm}
                    variant="outline"
                    className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30 bg-transparent"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isRefreshing ? "Refreshing..." : "Refresh URLs"}
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Your current plan allows you to add knowledge sources for your chatbot.
                {userPlan === "Free Plan" ? (
                  <>
                    {" "}
                    You can add up to {faqLimit} FAQs. Document and URL knowledge sources are not available on your
                    plan.
                  </>
                ) : (
                  <> You can add unlimited FAQs, and up to {otherKnowledgeLimit} combined URLs and documents.</>
                )}
              </p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start">
              <div className="mr-3 mt-0.5 bg-blue-100 dark:bg-blue-800 rounded-full p-1.5">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-300">Processing Time</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your chatbot will be ready with all your updated documents and URLs within 1800 seconds! Bot247.live
                  is analyzing your information to ensure accurate responses.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {userPlan === "Free Plan" ? (
                <>
                  {faqSection()}
                  {embedDomainsSection}
                </>
              ) : (
                <>
                  {documentUploadSection()}
                  {urlUploadSection()}
                  {embedDomainsSection}
                  {faqSection()}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <SharedChatInterface isFullscreen={isFullscreen} />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === "url"
                ? `Are you sure you want to delete this URL from your knowledge sources? This action cannot be undone.`
                : itemToDelete?.type === "document"
                  ? `Are you sure you want to delete the document "${itemToDelete?.value}" from your knowledge sources? This action cannot be undone.`
                  : itemToDelete?.type === "faq"
                    ? `Are you sure you want to delete the FAQ "${itemToDelete?.value}" from your knowledge sources? This action cannot be undone.`
                    : `Are you sure you want to delete the domain "${itemToDelete?.value}" from the allowed embed domains? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={processDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refresh Confirmation Dialog */}
      <AlertDialog open={refreshConfirmOpen} onOpenChange={setRefreshConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 text-blue-500 mr-2" />
              Confirm URL Refresh
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refresh all your URLs? This will update the content from all your knowledge
              sources. This process may take some time to complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRefreshing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={processRefresh}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              {isRefreshing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Refreshing...
                </>
              ) : (
                "Refresh URLs"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
