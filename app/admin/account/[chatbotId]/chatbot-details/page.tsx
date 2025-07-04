"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Palette,
  Settings,
  Save,
  FileText,
  Link2,
  Upload,
  Trash2,
  ImageIcon,
  Plus,
  X,
  Download,
  Loader2,
  Globe,
  BarChart,
  MessageSquare,
  Pencil,
} from "lucide-react"
import AccountSidebar from "../components/account-sidebar"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatInterface from "@/app/components/chat-interface"
import { logAuditEvent } from "@/app/utils/audit-logger"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
// Import logAuditEvent

interface Lead {
  id: number
  created_at: string
  chatbot_id: string
  name: string
  email: string
  phone: string
  session_id: string | null
}

// Define the structure for an FAQ item within the JSONB array
interface FaqItem {
  question: string
  answer: string
  tempId: string // Client-side generated ID for unique identification
}

// Helper function to count words
const countWords = (text: string) => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function ChatbotDetailsPage({ params }: { params: { chatbotId: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("appearance")
  const [savingFaq, setSavingFaq] = useState(false)

  // Document management states
  const [documents, setDocuments] = useState<any[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL management states
  const [urls, setUrls] = useState<string[]>([])
  const [loadingUrls, setLoadingUrls] = useState(false)
  const [newUrl, setNewUrl] = useState("")
  const [savingUrl, setSavingUrl] = useState(false)

  // Domain management states
  const [domains, setDomains] = useState<string[]>([])
  const [loadingDomains, setLoadingDomains] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [savingDomain, setSavingDomain] = useState(false)

  // Avatar management states
  const [avatar, setAvatar] = useState<string | null>(null)
  const [loadingAvatar, setLoadingAvatar] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Conversation management states
  const [conversations, setConversations] = useState<{ date_of_convo: string; count: number }[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [conversationsForDate, setConversationsForDate] = useState<{
    date: string
    conversations: { id: string; created_at: string; messages: { role: "user" | "assistant"; content: string }[] }[]
  } | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  // FAQ management states
  const [faqs, setFaqs] = useState<FaqItem[]>([]) // Updated type
  const [faqsRowId, setFaqsRowId] = useState<string | null>(null) // To store the UUID of the faqs_uploaded row
  const [loadingFaqs, setLoadingFaqs] = useState(false)
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    type: "document" | "url" | "domain" | "faq"
    name: string // For documents, URLs, domains (display name)
    tempId?: string // For FAQs within JSONB
  } | null>(null)

  // New state for FAQ editing
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState("")
  const [editingAnswer, setEditingAnswer] = useState("")

  // Define word limits for FAQs
  const FAQ_QUESTION_WORD_LIMIT = 50
  const FAQ_ANSWER_WORD_LIMIT = 100

  // Default values
  const defaultTheme = {
    chatbot_id: params.chatbotId,
    primary_color: "#3B82F6",
    secondary_color: "#10B981",
    border_radius: 8,
    dark_mode: false,
    chatbot_name: "AI Assistant",
    greeting: "Hello! How can I help you today?",
    instruction:
      "You are an advanced AI assistant for [Organization/Institute name]. Your goal is to provide personalized, efficient, and engaging assistance to users, guiding them through various processes, services, and information. Your tone is friendly, professional, and contextually aware, ensuring that users feel comfortable, respected, and supported throughout their journey.",
    response_tone: "Friendly",
    response_length: "Medium",
    pulsating_effect: "yes",
    alignment: "bottom-right",
  }

  const [theme, setTheme] = useState(defaultTheme)

  useEffect(() => {
    async function fetchChatbotTheme() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("chatbot_themes")
          .select("*")
          .eq("chatbot_id", params.chatbotId)
          .single()

        if (error) {
          console.error("Error fetching chatbot theme:", error)
          // Use default values if no data found
          console.log("Using default theme values:", defaultTheme)
          setTheme(defaultTheme)
        } else if (data) {
          // Use fetched data with fallbacks to default values for any missing fields
          // Normalize response_tone to ensure proper capitalization
          const responseTone = data.response_tone
            ? data.response_tone.toLowerCase() === "friendly"
              ? "Friendly"
              : data.response_tone.toLowerCase() === "professional"
                ? "Professional"
                : "Friendly"
            : "Friendly"

          // Normalize response_length to ensure proper capitalization
          const responseLength = data.response_length
            ? data.response_length.toLowerCase() === "concise"
              ? "Concise"
              : data.response_length.toLowerCase() === "detailed"
                ? "Detailed"
                : "Concise"
            : "Concise"

          // Normalize pulsating_effect to ensure proper format
          const pulsatingEffect = data.pulsating_effect
            ? data.pulsating_effect.toLowerCase() === "yes" || data.pulsating_effect.toLowerCase() === "true"
              ? "yes"
              : "no"
            : "yes"

          const themeData = {
            ...data,
            response_tone: responseTone,
            response_length: responseLength,
            pulsating_effect: pulsatingEffect,
          }

          console.log("Fetched theme data with normalized values:", {
            response_tone: themeData.response_tone,
            response_length: themeData.response_length,
            pulsating_effect: themeData.pulsating_effect,
          })

          setTheme(themeData)
        } else {
          console.log("No theme data found, using defaults:", defaultTheme)
          setTheme(defaultTheme)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChatbotTheme()
  }, [params.chatbotId, supabase])

  // Add this effect right after the fetchChatbotTheme effect
  useEffect(() => {
    // Fetch avatar immediately when component mounts
    const loadAvatar = async () => {
      try {
        setLoadingAvatar(true)
        console.log("Initial avatar fetch for chatbot ID:", params.chatbotId)

        // List files in the chatbotavatar bucket for this chatbot
        const { data: files, error } = await supabase.storage.from("chatbotavatar").list(params.chatbotId)

        if (error) {
          console.error("Error listing avatar files:", error)
          setAvatar(null)
        } else if (files && files.length > 0) {
          console.log("Found avatar files:", files)

          // Find the first image file
          const imageFile = files.find(
            (file) =>
              file.name.endsWith(".jpg") ||
              file.name.endsWith(".jpeg") ||
              file.name.endsWith(".png") ||
              file.name.endsWith(".gif"),
          )

          if (imageFile) {
            // Get the public URL for the image
            const { data: urlData } = supabase.storage
              .from("chatbotavatar")
              .getPublicUrl(`${params.chatbotId}/${imageFile.name}`)

            console.log("Using avatar:", urlData.publicUrl)
            setAvatar(urlData.publicUrl)
          } else {
            console.log("No image files found in the folder")
            setAvatar(null)
          }
        } else {
          console.log("No files found in chatbotavatar bucket for this chatbot")
          setAvatar(null)
        }
      } catch (error) {
        console.error("Error in initial avatar fetch:", error)
        setAvatar(null)
      } finally {
        setLoadingAvatar(false)
      }
    }

    loadAvatar()
  }, [params.chatbotId, supabase])

  // Effect to handle tab changes
  useEffect(() => {
    if (activeTab === "documents") {
      fetchDocuments()
    } else if (activeTab === "urls") {
      fetchUrls()
    } else if (activeTab === "domains") {
      fetchDomains()
    } else if (activeTab === "avatar") {
      fetchAvatar()
    } else if (activeTab === "conversations") {
      fetchConversations()
    } else if (activeTab === "faqs") {
      fetchFaqs()
    }
  }, [activeTab, params.chatbotId])

  // Update selected messages whenever the selected conversation ID changes
  useEffect(() => {
    if (selectedConversationId && conversationsForDate) {
      const selectedConversation = conversationsForDate.conversations.find((conv) => conv.id === selectedConversationId)
      if (selectedConversation && selectedConversation.messages) {
        console.log("Setting selected messages:", selectedConversation.messages.length)
        setSelectedMessages(selectedConversation.messages)
      } else {
        console.log("No messages found for this conversation")
        setSelectedMessages([])
      }
    } else {
      setSelectedMessages([])
    }
  }, [selectedConversationId, conversationsForDate])

  // Fetch documents from Supabase storage
  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true)

      // List files in the documentuploaded bucket for this chatbot
      const { data, error } = await supabase.storage.from("documentuploaded").list(params.chatbotId, {
        sortBy: { column: "name", order: "asc" },
      })

      if (error) {
        console.error("Error fetching documents:", error)
        toast.error("Failed to load documents")
        setDocuments([])
      } else {
        setDocuments(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred while loading documents")
    } finally {
      setLoadingDocs(false)
    }
  }

  // Fetch URLs from Supabase database
  const fetchUrls = async () => {
    try {
      setLoadingUrls(true)

      // Get URLs from the urls_uploaded table
      const { data, error } = await supabase
        .from("urls_uploaded")
        .select("url_links")
        .eq("chatbot_id", params.chatbotId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // No record found, set empty array
          setUrls([])
        } else {
          console.error("Error fetching URLs:", error)
          toast.error("Failed to load URLs")
          setUrls([])
        }
      } else if (data && data.url_links && data.url_links.links) {
        setUrls(data.url_links.links)
      } else {
        setUrls([])
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred while loading URLs")
    } finally {
      setLoadingUrls(false)
    }
  }

  // Fetch domains from Supabase database
  const fetchDomains = async () => {
    try {
      setLoadingDomains(true)

      // Get domains from the embed_domains table
      const { data, error } = await supabase
        .from("embed_domains")
        .select("domains")
        .eq("chatbot_id", params.chatbotId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // No record found, set empty array
          setDomains([])
        } else {
          console.error("Error fetching domains:", error)
          toast.error("Failed to load domains")
          setDomains([])
        }
      } else if (data && data.domains && data.domains.links) {
        setDomains(data.domains.links)
      } else {
        setDomains([])
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred while loading domains")
    } finally {
      setLoadingDomains(false)
    }
  }

  // Fetch avatar from Supabase storage - this is called when the avatar tab is selected
  const fetchAvatar = async () => {
    try {
      setLoadingAvatar(true)
      console.log("Fetching avatar for chatbot ID:", params.chatbotId)

      // List files in the chatbotavatar bucket for this chatbot
      const { data: files, error } = await supabase.storage.from("chatbotavatar").list(params.chatbotId)

      if (error) {
        console.error("Error listing avatar files:", error)
        toast.error("Failed to load avatar")
        setAvatar(null)
      } else if (files && files.length > 0) {
        console.log("Found avatar files:", files)

        // Find the first image file
        const imageFile = files.find(
          (file) =>
            file.name.endsWith(".jpg") ||
            file.name.endsWith(".jpeg") ||
            file.name.endsWith(".png") ||
            file.name.endsWith(".gif"),
        )

        if (imageFile) {
          // Get the public URL for the image
          const { data: urlData } = supabase.storage
            .from("chatbotavatar")
            .getPublicUrl(`${params.chatbotId}/${imageFile.name}`)

          console.log("Using avatar:", urlData.publicUrl)
          setAvatar(urlData.publicUrl)
        } else {
          console.log("No image files found in the folder")
          setAvatar(null)
        }
      } else {
        console.log("No files found in chatbotavatar bucket for this chatbot")
        setAvatar(null)
      }
    } catch (error) {
      console.error("Error in fetchAvatar:", error)
      toast.error("An unexpected error occurred while loading avatar")
    } finally {
      setLoadingAvatar(false)
    }
  }

  const fetchFaqs = async () => {
    try {
      setLoadingFaqs(true)
      // Fetch the single row containing the JSONB array of FAQs
      const { data, error } = await supabase
        .from("faqs_uploaded")
        .select("id, faqs") // Select the 'id' of the row and the 'faqs' JSONB column
        .eq("chatbot_id", params.chatbotId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // No row found
          setFaqs([])
          setFaqsRowId(null)
        } else {
          console.error("Error fetching FAQs:", error)
          toast.error("Failed to load FAQs")
          setFaqs([])
          setFaqsRowId(null)
        }
      } else if (data && data.faqs) {
        // Ensure data.faqs is an array, then map to add client-side tempId
        const faqsArray: { question: string; answer: string }[] = Array.isArray(data.faqs) ? data.faqs : []
        const faqsWithTempIds = faqsArray.map((faq) => ({
          ...faq,
          tempId: crypto.randomUUID(), // Generate a unique ID for client-side management
        }))
        setFaqs(faqsWithTempIds)
        setFaqsRowId(data.id) // Store the row ID for future updates/deletions
      } else {
        setFaqs([])
        setFaqsRowId(null)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred while loading FAQs")
    } finally {
      setLoadingFaqs(false)
    }
  }

  // Helper to refresh all knowledge sources after a deletion
  const refreshKnowledgeSources = async () => {
    await fetchDocuments()
    await fetchUrls()
    await fetchDomains()
    await fetchFaqs()
  }

  const handleSaveFaq = async () => {
    const currentQuestion = editingFaqId ? editingQuestion : newQuestion
    const currentAnswer = editingFaqId ? editingAnswer : newAnswer

    if (!currentQuestion.trim() || !currentAnswer.trim()) {
      toast.error("Please enter both a question and an answer.")
      return
    }

    // Check word limits
    if (countWords(currentQuestion) > FAQ_QUESTION_WORD_LIMIT) {
      toast.error(`Question exceeds ${FAQ_QUESTION_WORD_LIMIT} words.`)
      return
    }
    if (countWords(currentAnswer) > FAQ_ANSWER_WORD_LIMIT) {
      toast.error(`Answer exceeds ${FAQ_ANSWER_WORD_LIMIT} words.`)
      return
    }

    try {
      setSavingFaq(true)

      let updatedFaqsArray: { question: string; answer: string }[] = []
      let saveError
      let auditAction: "faq_added" | "faq_updated" = "faq_added"
      let previousFaq: FaqItem | null = null

      if (faqsRowId) {
        // If a row already exists, fetch its current FAQs and append/update
        const { data: existingFaqsData, error: fetchError } = await supabase
          .from("faqs_uploaded")
          .select("faqs")
          .eq("id", faqsRowId)
          .single()

        if (fetchError) {
          console.error("Error fetching existing FAQs for update:", fetchError)
          toast.error("Failed to save FAQ: Could not retrieve existing data.")
          setSavingFaq(false)
          return
        }

        updatedFaqsArray = Array.isArray(existingFaqsData?.faqs) ? existingFaqsData.faqs : []

        if (editingFaqId) {
          // Update existing FAQ
          const faqIndex = faqs.findIndex((faq) => faq.tempId === editingFaqId)
          if (faqIndex > -1) {
            previousFaq = faqs[faqIndex]
            // Create a new array to avoid direct mutation of state
            const tempFaqs = [...faqs]
            tempFaqs[faqIndex] = { ...tempFaqs[faqIndex], question: currentQuestion, answer: currentAnswer }
            // Map back to the database format (without tempId)
            updatedFaqsArray = tempFaqs.map(({ tempId, ...rest }) => rest)
            auditAction = "faq_updated"
          } else {
            toast.error("FAQ to edit not found.")
            setSavingFaq(false)
            return
          }
        } else {
          // Add new FAQ
          updatedFaqsArray.push({ question: currentQuestion, answer: currentAnswer })
          auditAction = "faq_added"
        }

        const { error } = await supabase.from("faqs_uploaded").update({ faqs: updatedFaqsArray }).eq("id", faqsRowId)
        saveError = error
      } else {
        // No row exists for this chatbot_id, insert a new one
        updatedFaqsArray = [{ question: currentQuestion, answer: currentAnswer }]
        const { data, error } = await supabase
          .from("faqs_uploaded")
          .insert({
            chatbot_id: params.chatbotId,
            faqs: updatedFaqsArray,
          })
          .select("id") // Select the new row's ID
          .single()
        saveError = error
        if (data) {
          setFaqsRowId(data.id) // Store the new row ID
        }
        auditAction = "faq_added"
      }

      if (saveError) {
        console.error("Error saving FAQ:", saveError)
        toast.error("Failed to save FAQ")
      } else {
        // Log the FAQ addition/update
        const changes = {
          previous: previousFaq ? { question: previousFaq.question, answer: previousFaq.answer } : null,
          current: { question: currentQuestion, answer: currentAnswer },
        }
        await logAuditEvent(supabase, params.chatbotId, "admin", auditAction, changes)

        setNewQuestion("")
        setNewAnswer("")
        setEditingFaqId(null)
        setEditingQuestion("")
        setEditingAnswer("")
        await refreshKnowledgeSources() // Refresh all knowledge sources
        toast.success(`FAQ ${auditAction === "faq_added" ? "added" : "updated"} successfully`)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred while saving FAQ")
    } finally {
      setSavingFaq(false)
    }
  }

  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaqId(faq.tempId)
    setEditingQuestion(faq.question)
    setEditingAnswer(faq.answer)
    // Optionally scroll to the input fields
    const faqForm = document.getElementById("faq-form")
    if (faqForm) {
      faqForm.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleCancelEdit = () => {
    setEditingFaqId(null)
    setEditingQuestion("")
    setEditingAnswer("")
    setNewQuestion("")
    setNewAnswer("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTheme((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setTheme((prev) => ({ ...prev, dark_mode: checked }))
  }

  const handleSliderChange = (value: number[]) => {
    setTheme((prev) => ({ ...prev, border_radius: value[0] }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Store original theme for audit logging
      const originalTheme = { ...theme }

      console.log("Saving theme values:", {
        response_tone: theme.response_tone,
        response_length: theme.response_length,
        pulsating_effect: theme.pulsating_effect,
      })

      // Check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from("chatbot_themes")
        .select("*")
        .eq("chatbot_id", params.chatbotId)
        .single()

      let saveError

      if (checkError && checkError.code === "PGRST116") {
        // Record doesn't exist, insert new record
        const { error } = await supabase.from("chatbot_themes").insert({
          chatbot_id: params.chatbotId,
          primary_color: theme.primary_color,
          secondary_color: theme.secondary_color,
          border_radius: theme.border_radius,
          dark_mode: theme.dark_mode,
          chatbot_name: theme.chatbot_name,
          greeting: theme.greeting,
          instruction: theme.instruction,
          response_tone: theme.response_tone,
          response_length: theme.response_length,
          pulsating_effect: theme.pulsating_effect,
          // alignment: theme.alignment, // Removed this line as per previous instructions
        })
        saveError = error

        // Log creation as a change
        if (!error) {
          const changes: Record<string, { previous: any; current: any }> = {
            chatbot_name: { previous: null, current: theme.chatbot_name },
            primary_color: { previous: null, current: theme.primary_color },
            secondary_color: { previous: null, current: theme.secondary_color },
            border_radius: { previous: null, current: theme.border_radius },
            dark_mode: { previous: null, current: theme.dark_mode },
            greeting: { previous: null, current: theme.greeting },
            instruction: { previous: null, current: theme.instruction },
            response_tone: { previous: null, current: theme.response_tone },
            response_length: { previous: null, current: theme.response_length },
            pulsating_effect: { previous: null, current: theme.pulsating_effect },
            // alignment: { previous: null, current: theme.alignment }, // Removed this line as per previous instructions
          }
          await logAuditEvent(supabase, params.chatbotId, "admin", "created_new_theme", changes)
        }
      } else {
        // Record exists, update it
        const { error } = await supabase
          .from("chatbot_themes")
          .update({
            primary_color: theme.primary_color,
            secondary_color: theme.secondary_color,
            border_radius: theme.border_radius,
            dark_mode: theme.dark_mode,
            chatbot_name: theme.chatbot_name,
            greeting: theme.greeting,
            instruction: theme.instruction,
            response_tone: theme.response_tone,
            response_length: theme.response_length,
            pulsating_effect: theme.pulsating_effect,
            // alignment: theme.alignment, // Removed this line as per previous instructions
          })
          .eq("chatbot_id", params.chatbotId)
        saveError = error

        // Log changes for audit
        if (!error && existingData) {
          const changes: Record<string, { previous: any; current: any }> = {}

          // Only log fields that actually changed
          if (existingData.primary_color !== theme.primary_color) {
            changes.primary_color = { previous: existingData.primary_color, current: theme.primary_color }
          }
          if (existingData.secondary_color !== theme.secondary_color) {
            changes.secondary_color = { previous: existingData.secondary_color, current: theme.secondary_color }
          }
          if (existingData.border_radius !== theme.border_radius) {
            changes.border_radius = { previous: existingData.border_radius, current: theme.border_radius }
          }
          if (existingData.dark_mode !== theme.dark_mode) {
            changes.dark_mode = { previous: existingData.dark_mode, current: theme.dark_mode }
          }
          if (existingData.chatbot_name !== theme.chatbot_name) {
            changes.chatbot_name = { previous: existingData.chatbot_name, current: theme.chatbot_name }
          }
          if (existingData.greeting !== theme.greeting) {
            changes.greeting = { previous: existingData.greeting, current: theme.greeting }
          }
          if (existingData.instruction !== theme.instruction) {
            changes.instruction = { previous: existingData.instruction, current: theme.instruction }
          }
          if (existingData.response_tone !== theme.response_tone) {
            changes.response_tone = { previous: existingData.response_tone, current: theme.response_tone }
          }
          if (existingData.response_length !== theme.response_length) {
            changes.response_length = { previous: existingData.response_length, current: theme.response_length }
          }
          if (existingData.pulsating_effect !== theme.pulsating_effect) {
            changes.pulsating_effect = { previous: existingData.pulsating_effect, current: theme.pulsating_effect }
          }
          // if (existingData.alignment !== theme.alignment) { // Removed this block as per previous instructions
          //   changes.alignment = { previous: existingData.alignment, current: theme.alignment }
          // }

          // Only log if there were actual changes
          if (Object.keys(changes).length > 0) {
            await logAuditEvent(supabase, params.chatbotId, "admin", "updated_theme", changes)
          }
        }
      }

      if (saveError) {
        console.error("Error saving chatbot theme:", saveError)
        toast.error("Failed to save changes")
      } else {
        toast.success("Changes saved successfully")

        // Fetch the latest avatar to reflect any changes
        await fetchAvatar()

        // Force reload the page to refresh the chatbot with new settings
        window.location.reload()
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    try {
      setUploadingDoc(true)

      // Check if folder exists, if not it will be created automatically
      const files = Array.from(e.target.files)
      const uploadedFiles = []

      for (const file of files) {
        const filePath = `${params.chatbotId}/${file.name}`

        // Upload the file
        const { error: uploadError } = await supabase.storage.from("documentuploaded").upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

        if (uploadError) {
          console.error("Error uploading document:", uploadError)
          toast.error(`Failed to upload ${file.name}`)
        } else {
          uploadedFiles.push(file.name)
        }
      }

      // Log the document uploads
      if (uploadedFiles.length > 0) {
        const changes = {
          uploaded_files: { previous: null, current: uploadedFiles },
        }
        await logAuditEvent(supabase, params.chatbotId, "admin", "documents_uploaded", changes)
      }

      // Refresh the document list
      await refreshKnowledgeSources() // Refresh all knowledge sources
      toast.success("Documents uploaded successfully")
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred during upload")
    } finally {
      setUploadingDoc(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle document deletion
  const handleDocumentDelete = async (fileName: string) => {
    try {
      const filePath = `${params.chatbotId}/${fileName}`

      // Delete the file
      const { error } = await supabase.storage.from("documentuploaded").remove([filePath])

      if (error) {
        console.error("Error deleting document:", error)
        toast.error("Failed to delete document")
      } else {
        // Log the document deletion
        const changes = {
          deleted_file: { previous: fileName, current: null },
        }
        await logAuditEvent(supabase, params.chatbotId, "admin", "document_deleted", changes)

        // Refresh the document list
        await refreshKnowledgeSources() // Refresh all knowledge sources
        toast.success("Document deleted successfully")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred during deletion")
    } finally {
      setUploadingDoc(false)
      setShowConfirmDialog(false) // Close dialog after deletion attempt
      setItemToDelete(null)
    }
  }

  // Handle document download
  const handleDocumentDownload = async (fileName: string) => {
    try {
      const filePath = `${params.chatbotId}/${fileName}`

      // Get the download URL
      const { data, error } = await supabase.storage.from("documentuploaded").createSignedUrl(filePath, 60) // 60 seconds expiry

      if (error) {
        console.error("Error generating download URL:", error)
        toast.error("Failed to generate download link")
      } else if (data) {
        // Open the download URL in a new tab
        window.open(data.signedUrl, "_blank")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    }
  }

  // Handle URL addition
  const handleAddUrl = async () => {
    if (!newUrl.trim()) {
      toast.error("Please enter a valid URL")
      return
    }

    try {
      setSavingUrl(true)

      // Validate URL format
      try {
        new URL(newUrl) // This will throw an error if the URL is invalid
      } catch (e) {
        toast.error("Please enter a valid URL with http:// or https://")
        setSavingUrl(false)
        return
      }

      // Check if URL already exists
      if (urls.includes(newUrl)) {
        toast.error("This URL already exists")
        setSavingUrl(false)
        return
      }

      // Add the new URL to the list
      const updatedUrls = [...urls, newUrl]

      // Check if a record already exists
      const { data, error: checkError } = await supabase
        .from("urls_uploaded")
        .select("id")
        .eq("chatbot_id", params.chatbotId)
        .single()

      if (checkError && checkError.code === "PGRST116") {
        // No record exists, create a new one
        const { error } = await supabase.from("urls_uploaded").insert({
          chatbot_id: params.chatbotId,
          url_links: { links: updatedUrls },
          created_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error adding URL:", error)
          toast.error("Failed to add URL")
        } else {
          // Log the URL addition
          const changes = {
            urls: { previous: urls, current: updatedUrls },
          }
          await logAuditEvent(supabase, params.chatbotId, "admin", "url_added", changes)

          setUrls(updatedUrls)
          setNewUrl("")
          toast.success("URL added successfully")
        }
      } else {
        // Record exists, update it
        const { error } = await supabase
          .from("urls_uploaded")
          .update({
            url_links: { links: updatedUrls },
          })
          .eq("chatbot_id", params.chatbotId)

        if (error) {
          console.error("Error adding URL:", error)
          toast.error("Failed to add URL")
        } else {
          // Log the URL addition
          const changes = {
            added_url: { previous: null, current: newUrl },
          }
          await logAuditEvent(supabase, params.chatbotId, "admin", "url_added", changes)

          setUrls(updatedUrls)
          setNewUrl("")
          toast.success("URL added successfully")
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setSavingUrl(false)
    }
  }

  // Handle URL deletion
  const handleDeleteUrl = async (urlToDelete: string) => {
    try {
      setSavingUrl(true)

      // Remove the URL from the list
      const updatedUrls = urls.filter((url) => url !== urlToDelete)

      // Update the record
      const { error } = await supabase
        .from("urls_uploaded")
        .update({
          url_links: { links: updatedUrls },
        })
        .eq("chatbot_id", params.chatbotId)

      if (error) {
        console.error("Error deleting URL:", error)
        toast.error("Failed to delete URL")
      } else {
        // Log the URL deletion
        const changes = {
          deleted_url: { previous: urlToDelete, current: null },
        }
        await logAuditEvent(supabase, params.chatbotId, "admin", "url_deleted", changes)

        setUrls(updatedUrls)
        await refreshKnowledgeSources() // Refresh all knowledge sources
        toast.success("URL deleted successfully")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setSavingUrl(false)
      setShowConfirmDialog(false) // Close dialog after deletion attempt
      setItemToDelete(null)
    }
  }

  // Handle domain addition
  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a valid domain")
      return
    }

    try {
      setSavingDomain(true)

      // Validate domain format
      try {
        new URL(newDomain) // This will throw an error if the URL is invalid
      } catch (e) {
        toast.error("Please enter a valid domain with http:// or https://")
        setSavingDomain(false)
        return
      }

      // Check if domain already exists
      if (domains.includes(newDomain)) {
        toast.error("This domain already exists")
        setSavingDomain(false)
        return
      }

      // Add the new domain to the list
      const updatedDomains = [...domains, newDomain]

      // Check if a record already exists
      const { data, error: checkError } = await supabase
        .from("embed_domains")
        .select("id")
        .eq("chatbot_id", params.chatbotId)
        .single()

      if (checkError && checkError.code === "PGRST116") {
        // No record exists, create a new one
        const { error } = await supabase.from("embed_domains").insert({
          chatbot_id: params.chatbotId,
          domains: { links: updatedDomains },
          created_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error adding domain:", error)
          toast.error("Failed to add domain")
        } else {
          // Log the domain addition
          const changes = {
            domains: { previous: domains, current: updatedDomains },
          }
          await logAuditEvent(supabase, params.chatbotId, "admin", "domain_added", changes)

          setDomains(updatedDomains)
          setNewDomain("")
          toast.success("Domain added successfully")
        }
      } else {
        // Record exists, update it
        const { error } = await supabase
          .from("embed_domains")
          .update({
            domains: { links: updatedDomains },
          })
          .eq("chatbot_id", params.chatbotId)

        if (error) {
          console.error("Error adding domain:", error)
          toast.error("Failed to add domain")
        } else {
          // Log the domain addition
          const changes = {
            added_domain: { previous: null, current: newDomain },
          }
          await logAuditEvent(supabase, params.chatbotId, "admin", "domain_added", changes)

          setDomains(updatedDomains)
          setNewDomain("")
          toast.success("Domain added successfully")
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setSavingDomain(false)
    }
  }

  // Handle domain deletion
  const handleDeleteDomain = async (domainToDelete: string) => {
    try {
      setSavingDomain(true)

      // Remove the domain from the list
      const updatedDomains = domains.filter((domain) => domain !== domainToDelete)

      // Update the record
      const { error } = await supabase
        .from("embed_domains")
        .update({
          domains: { links: updatedDomains },
        })
        .eq("chatbot_id", params.chatbotId)

      if (error) {
        console.error("Error deleting domain:", error)
        toast.error("Failed to delete domain")
      } else {
        // Log the domain deletion
        const changes = {
          deleted_domain: { previous: domainToDelete, current: null },
        }
        await logAuditEvent(supabase, params.chatbotId, "admin", "domain_deleted", changes)

        setDomains(updatedDomains)
        await refreshKnowledgeSources() // Refresh all knowledge sources
        toast.success("Domain deleted successfully")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setSavingDomain(false)
      setShowConfirmDialog(false) // Close dialog after deletion attempt
      setItemToDelete(null)
    }
  }

  const handleDeleteFaq = async (tempIdToDelete: string) => {
    try {
      setSavingFaq(true)

      if (!faqsRowId) {
        toast.error("No FAQ record found to delete from.")
        setSavingFaq(false)
        setShowConfirmDialog(false)
        setItemToDelete(null)
        return
      }

      // Fetch the current FAQs array from the database
      const { data: existingFaqsData, error: fetchError } = await supabase
        .from("faqs_uploaded")
        .select("faqs")
        .eq("id", faqsRowId)
        .single()

      if (fetchError) {
        console.error("Error fetching existing FAQs for deletion:", fetchError)
        toast.error("Failed to delete FAQ: Could not retrieve existing data.")
        setSavingFaq(false)
        setShowConfirmDialog(false)
        setItemToDelete(null)
        return
      }

      const currentFaqsArray: { question: string; answer: string }[] = Array.isArray(existingFaqsData?.faqs)
        ? existingFaqsData.faqs
        : []

      // Find the FAQ to delete using its client-side tempId
      const faqToDelete = faqs.find((faq) => faq.tempId === tempIdToDelete)
      if (!faqToDelete) {
        toast.error("FAQ not found for deletion.")
        setSavingFaq(false)
        setShowConfirmDialog(false)
        setItemToDelete(null)
        return
      }

      // Filter out the FAQ that matches the question and answer of the identified FAQ
      // This is crucial because tempId is client-side and not in the DB.
      // We assume question + answer uniquely identifies an FAQ within the JSONB array.
      const updatedFaqsArray = currentFaqsArray.filter(
        (faq) => !(faq.question === faqToDelete.question && faq.answer === faqToDelete.answer),
      )

      let saveError
      if (updatedFaqsArray.length === 0) {
        // If no FAQs left, delete the entire row
        const { error } = await supabase.from("faqs_uploaded").delete().eq("id", faqsRowId)
        saveError = error
        if (!error) {
          setFaqsRowId(null) // Clear row ID if deleted
        }
      } else {
        // Update the row with the filtered FAQs array
        const { error } = await supabase.from("faqs_uploaded").update({ faqs: updatedFaqsArray }).eq("id", faqsRowId)
        saveError = error
      }

      if (saveError) {
        console.error("Error deleting FAQ:", saveError)
        toast.error("Failed to delete FAQ")
      } else {
        // Log the FAQ deletion
        const changes = {
          deleted_faq: { previous: faqToDelete, current: null },
        }
        await logAuditEvent(supabase, params.chatbotId, "admin", "faq_deleted", changes)

        await refreshKnowledgeSources() // Refresh all knowledge sources
        toast.success("FAQ deleted successfully")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred during deletion")
    } finally {
      setSavingFaq(false)
      setShowConfirmDialog(false) // Close dialog after deletion attempt
      setItemToDelete(null)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    try {
      setUploadingAvatar(true)
      const file = e.target.files[0]
      const previousAvatar = avatar

      // First, check if there are any existing files and delete them
      const { data: existingFiles, error: listError } = await supabase.storage
        .from("chatbotavatar")
        .list(params.chatbotId)

      if (listError) {
        console.error("Error listing existing avatar files:", listError)
        toast.error("Failed to list avatar files")
      } else if (existingFiles && existingFiles.length > 0) {
        // Delete existing files
        const filesToDelete = existingFiles.map((file) => `${params.chatbotId}/${file.name}`)
        const { error: deleteError } = await supabase.storage.from("chatbotavatar").remove(filesToDelete)

        if (deleteError) {
          console.error("Error deleting existing avatar files:", deleteError)
        }
      }

      // Upload the new file
      const fileName = `avatar-${Date.now()}.${file.name.split(".").pop()}`
      const filePath = `${params.chatbotId}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("chatbotavatar").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError)
        toast.error("Failed to upload avatar")
      } else {
        // Get the public URL
        const { data: urlData } = supabase.storage.from("chatbotavatar").getPublicUrl(filePath)

        // Log the avatar change
        const changes = {
          avatar_url: { previous: previousAvatar, current: urlData.publicUrl },
        }
        await logAuditEvent(
          supabase,
          params.chatbotId,
          "admin",
          previousAvatar ? "avatar_replaced" : "avatar_added",
          changes,
        )

        console.log("Avatar uploaded successfully, new URL:", urlData.publicUrl)
        setAvatar(urlData.publicUrl)
        toast.success("Avatar uploaded successfully")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred during upload")
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Handle avatar deletion
  const handleAvatarDelete = async () => {
    try {
      setUploadingAvatar(true)
      const previousAvatar = avatar

      // List files in the chatbotavatar bucket for this chatbot
      const { data, error: listError } = await supabase.storage.from("chatbotavatar").list(params.chatbotId)

      if (listError) {
        console.error("Error listing avatar files:", listError)
        toast.error("Failed to list avatar files")
      } else if (data && data.length > 0) {
        // Delete all files
        const filesToDelete = data.map((file) => `${params.chatbotId}/${file.name}`)
        const { error: deleteError } = await supabase.storage.from("chatbotavatar").remove(filesToDelete)

        if (deleteError) {
          console.error("Error deleting avatar files:", deleteError)
          toast.error("Failed to delete avatar")
        } else {
          // Log the avatar deletion
          const changes = {
            deleted_avatar: { previous: previousAvatar, current: null },
          }
          await logAuditEvent(supabase, params.chatbotId, "admin", "avatar_deleted", changes)

          setAvatar(null)
          toast.success("Avatar deleted successfully")
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Handle back to profile
  const handleBackToProfile = () => {
    router.push(`/admin/account/${params.chatbotId}`)
  }

  // Fetch leads
  const [leads, setLeads] = useState<Lead[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)

  const fetchLeads = async () => {
    try {
      setLoadingLeads(true)
      const { data, error } = await supabase
        .from("collected_leads")
        .select("*")
        .eq("chatbot_id", params.chatbotId)
        .or("email.neq.000,phone.neq.000")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching leads:", error)
        toast.error("Failed to load leads")
        setLeads([])
      } else {
        setLeads(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred while loading leads")
    } finally {
      setLoadingLeads(false)
    }
  }

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true)
      const { data, error } = await supabase
        .from("conversations")
        .select("date_of_convo, count")
        .eq("chatbot_id", params.chatbotId)
        .order("date_of_convo", { ascending: false })

      if (error) {
        console.error("Error fetching conversations:", error)
        toast.error("Failed to load conversations")
        setConversations([])
      } else {
        setConversations(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred while loading conversations")
    } finally {
      setLoadingConversations(false)
    }
  }

  // Fetch conversations for a specific date
  const fetchConversationsForDate = async (date: string) => {
    try {
      setLoadingConversations(true)
      const { data, error } = await supabase
        .from("conversations")
        .select("id, created_at, messages")
        .eq("chatbot_id", params.chatbotId)
        .eq("date_of_convo", date)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching conversations for date:", error)
        toast.error("Failed to load conversations for this date")
        setConversationsForDate(null)
      } else {
        setConversationsForDate({ date, conversations: data || [] })
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred while loading conversations for this date")
    } finally {
      setLoadingConversations(false)
    }
  }

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const currentQuestionWords = countWords(editingFaqId ? editingQuestion : newQuestion)
  const currentAnswerWords = countWords(editingFaqId ? editingAnswer : newAnswer)

  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {itemToDelete?.type === "document"
                ? "document"
                : itemToDelete?.type === "url"
                  ? "URL"
                  : itemToDelete?.type === "domain"
                    ? "domain"
                    : itemToDelete?.type === "faq"
                      ? "FAQ"
                      : "item"}{" "}
              {itemToDelete?.name ? `"${itemToDelete.name}"` : "selected item"} from your chatbot's knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  if (itemToDelete.type === "document") {
                    handleDocumentDelete(itemToDelete.name)
                  } else if (itemToDelete.type === "url") {
                    handleDeleteUrl(itemToDelete.name)
                  } else if (itemToDelete.type === "domain") {
                    handleDeleteDomain(itemToDelete.name)
                  } else if (itemToDelete.type === "faq" && itemToDelete.tempId) {
                    handleDeleteFaq(itemToDelete.tempId)
                  }
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-2">
            <AccountSidebar activePage="chatbot-details" chatbotId={params.chatbotId} />
          </div>

          {/* Main Content */}
          <div className="md:col-span-8">
            <Card className="shadow-sm">
              <CardContent className="pt-8 px-8 relative flex flex-col min-h-[700px] overflow-y-auto">
                {/* Save Changes button at the top left */}
                <div className="flex justify-start mb-8">
                  <Button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <Tabs defaultValue="appearance" onValueChange={handleTabChange} key={loading ? "loading" : "loaded"}>
                    <TabsList className="mb-8 flex overflow-x-auto whitespace-nowrap gap-1 pb-2 w-full">
                      <TabsTrigger value="appearance" className="flex items-center gap-1 px-2 py-1 text-sm">
                        <Palette className="h-4 w-4" />
                        Appearance
                      </TabsTrigger>
                      <TabsTrigger value="behavior" className="flex items-center gap-1 px-2 py-1 text-sm">
                        <Settings className="h-4 w-4" />
                        Behavior
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="flex items-center gap-1 px-2 py-1 text-sm">
                        <FileText className="h-4 w-4" />
                        Documents
                      </TabsTrigger>
                      <TabsTrigger value="urls" className="flex items-center gap-1 px-2 py-1 text-sm">
                        <Link2 className="h-4 w-4" />
                        URLs
                      </TabsTrigger>
                      <TabsTrigger value="domains" className="flex items-center gap-1 px-2 py-1 text-sm">
                        <Globe className="h-4 w-4" />
                        Domains
                      </TabsTrigger>
                      <TabsTrigger value="faqs" className="flex items-center gap-1 px-2 py-1 text-sm">
                        <MessageSquare className="h-4 w-4" />
                        FAQs
                      </TabsTrigger>
                      <TabsTrigger value="avatar" className="flex items-center gap-1 px-2 py-1 text-sm">
                        <ImageIcon className="h-4 w-4" />
                        Avatar
                      </TabsTrigger>
                      <TabsTrigger value="conversations" className="flex items-center gap-1 px-2 py-1 text-sm">
                        <MessageSquare className="h-4 w-4" />
                        Conversations
                      </TabsTrigger>
                      <TabsTrigger
                        value="analytics"
                        className="flex items-center gap-1 px-2 py-1 text-sm"
                        onClick={() => router.push(`/admin/dashboard/${params.chatbotId}/chatbot-insights`)}
                      >
                        <BarChart className="h-4 w-4" />
                        Analytics
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="appearance">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="chatbot_name">Chatbot Name</Label>
                          <Input
                            id="chatbot_name"
                            name="chatbot_name"
                            value={theme.chatbot_name}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="primary_color">Primary Color</Label>
                          <div className="flex gap-3">
                            <div
                              className="w-10 h-10 rounded-md border"
                              style={{ backgroundColor: theme.primary_color }}
                            />
                            <Input
                              id="primary_color"
                              name="primary_color"
                              type="color"
                              value={theme.primary_color}
                              onChange={handleInputChange}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="secondary_color">Secondary Color</Label>
                          <div className="flex gap-3">
                            <div
                              className="w-10 h-10 rounded-md border"
                              style={{ backgroundColor: theme.secondary_color }}
                            />
                            <Input
                              id="secondary_color"
                              name="secondary_color"
                              type="color"
                              value={theme.secondary_color}
                              onChange={handleInputChange}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="border_radius">Border Radius: {theme.border_radius}px</Label>
                          <Slider
                            id="border_radius"
                            min={0}
                            max={20}
                            step={1}
                            value={[theme.border_radius]}
                            onValueChange={handleSliderChange}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="behavior">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="greeting">Greeting Message</Label>
                          <Textarea
                            id="greeting"
                            name="greeting"
                            value={theme.greeting}
                            onChange={handleInputChange}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="instruction">Instructions</Label>
                          <Textarea
                            id="instruction"
                            name="instruction"
                            value={theme.instruction}
                            onChange={handleInputChange}
                            rows={6}
                          />
                          <p className="text-sm text-gray-500">
                            These instructions guide how the AI responds to user queries.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="response_tone">Response Tone</Label>
                            <Select
                              value={theme.response_tone || "Friendly"}
                              onValueChange={(value) => setTheme({ ...theme, response_tone: value })}
                            >
                              <SelectTrigger id="response_tone">
                                <SelectValue placeholder="Select tone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Friendly">Friendly</SelectItem>
                                <SelectItem value="Professional">Professional</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="response_length">Response Length</Label>
                            <Select
                              value={theme.response_length || "Concise"}
                              onValueChange={(value) => setTheme({ ...theme, response_length: value })}
                            >
                              <SelectTrigger id="response_length">
                                <SelectValue placeholder="Select length" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Concise">Concise</SelectItem>
                                <SelectItem value="Detailed">Detailed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pulsating_effect">Pulsating Effect</Label>
                            <Select
                              value={theme.pulsating_effect || "yes"}
                              onValueChange={(value) => setTheme({ ...theme, pulsating_effect: value })}
                            >
                              <SelectTrigger id="pulsating_effect">
                                <SelectValue placeholder="Select effect" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="documents">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Chatbot Documents</h3>
                          <div className="relative">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleDocumentUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              multiple
                              disabled={uploadingDoc}
                            />
                            <Button variant="outline" className="flex items-center gap-2" disabled={uploadingDoc}>
                              {uploadingDoc ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  Upload Documents
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {loadingDocs ? (
                          <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        ) : documents.length === 0 ? (
                          <div className="text-center py-8 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            <FileText className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-gray-500">No documents found</p>
                            <p className="text-sm text-gray-400">
                              Upload documents to enhance your chatbot's knowledge
                            </p>
                          </div>
                        ) : (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b font-medium flex items-center">
                              <span className="flex-1">Document Name</span>
                              <span className="w-24 text-center">Size</span>
                              <span className="w-32 text-center">Actions</span>
                            </div>
                            <ScrollArea className="h-[400px]">
                              {documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                  <div className="flex-1 truncate">
                                    <span className="font-medium">{doc.name}</span>
                                  </div>
                                  <div className="w-24 text-center text-sm text-gray-500">
                                    {(doc.metadata?.size / 1024).toFixed(2)} KB
                                  </div>
                                  <div className="w-32 flex justify-center gap-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDocumentDownload(doc.name)}
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Download</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                              setItemToDelete({ type: "document", name: doc.name })
                                              setShowConfirmDialog(true)
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Delete</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="urls">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Chatbot URLs</h3>
                          <div className="flex gap-2 mb-6">
                            <Input
                              placeholder="Enter URL (e.g., https://example.com)"
                              value={newUrl}
                              onChange={(e) => setNewUrl(e.target.value)}
                              disabled={savingUrl}
                            />
                            <Button
                              onClick={handleAddUrl}
                              disabled={savingUrl || !newUrl.trim()}
                              className="flex items-center gap-2 whitespace-nowrap"
                            >
                              {savingUrl ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" />
                                  Add URL
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {loadingUrls ? (
                          <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        ) : urls.length === 0 ? (
                          <div className="text-center py-8 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            <Link2 className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-gray-500">No URLs found</p>
                            <p className="text-sm text-gray-400">Add URLs to enhance your chatbot's knowledge</p>
                          </div>
                        ) : (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b font-medium">URLs</div>
                            <ScrollArea className="h-[400px]">
                              {urls.map((url, index) => (
                                <div
                                  key={index}
                                  className="flex items-center p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                  <div className="flex-1 truncate">
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      {url}
                                    </a>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                                    onClick={() => {
                                      setItemToDelete({ type: "url", name: url })
                                      setShowConfirmDialog(true)
                                    }}
                                    disabled={savingUrl}
                                  >
                                    {savingUrl ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="domains">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Allowed Embed Domains</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Add domains where this chatbot is allowed to be embedded. Only websites with these domains
                            will be able to use your chatbot.
                          </p>
                          <div className="flex gap-2 mb-6">
                            <Input
                              placeholder="Enter domain (e.g., https://example.com)"
                              value={newDomain}
                              onChange={(e) => setNewDomain(e.target.value)}
                              disabled={savingDomain}
                            />
                            <Button
                              onClick={handleAddDomain}
                              disabled={savingDomain || !newDomain.trim()}
                              className="flex items-center gap-2 whitespace-nowrap"
                            >
                              {savingDomain ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" />
                                  Add Domain
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {loadingDomains ? (
                          <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        ) : domains.length === 0 ? (
                          <div className="text-center py-8 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            <Globe className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-gray-500">No domains found</p>
                            <p className="text-sm text-gray-400">
                              Add domains where your chatbot is allowed to be embedded
                            </p>
                          </div>
                        ) : (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b font-medium">Allowed Domains</div>
                            <ScrollArea className="h-[400px]">
                              {domains.map((domain, index) => (
                                <div
                                  key={index}
                                  className="flex items-center p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                  <div className="flex-1 truncate">
                                    <a
                                      href={domain}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      {domain}
                                    </a>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                                    onClick={() => {
                                      setItemToDelete({ type: "domain", name: domain })
                                      setShowConfirmDialog(true)
                                    }}
                                    disabled={savingDomain}
                                  >
                                    {savingDomain ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="faqs">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Chatbot FAQs</h3>
                        <div id="faq-form" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="faq-question">Question</Label>
                            <Input
                              id="faq-question"
                              placeholder="Enter FAQ question"
                              value={editingFaqId ? editingQuestion : newQuestion}
                              onChange={(e) =>
                                editingFaqId ? setEditingQuestion(e.target.value) : setNewQuestion(e.target.value)
                              }
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const words = e.target.value.trim().split(/\s+/).filter(Boolean)
                                if (words.length > FAQ_QUESTION_WORD_LIMIT) {
                                  e.target.value = words.slice(0, FAQ_QUESTION_WORD_LIMIT).join(" ")
                                  if (editingFaqId) {
                                    setEditingQuestion(e.target.value)
                                  } else {
                                    setNewQuestion(e.target.value)
                                  }
                                }
                              }}
                              disabled={savingFaq}
                              className={currentQuestionWords > FAQ_QUESTION_WORD_LIMIT ? "border-red-500" : ""}
                            />
                            <p
                              className={`text-xs mt-1 ${currentQuestionWords > FAQ_QUESTION_WORD_LIMIT ? "text-red-500" : "text-gray-500"}`}
                            >
                              {currentQuestionWords}/{FAQ_QUESTION_WORD_LIMIT} words
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="faq-answer">Answer</Label>
                            <Textarea
                              id="faq-answer"
                              placeholder="Enter FAQ answer"
                              value={editingFaqId ? editingAnswer : newAnswer}
                              onChange={(e) =>
                                editingFaqId ? setEditingAnswer(e.target.value) : setNewAnswer(e.target.value)
                              }
                              onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                const words = e.target.value.trim().split(/\s+/).filter(Boolean)
                                if (words.length > FAQ_ANSWER_WORD_LIMIT) {
                                  e.target.value = words.slice(0, FAQ_ANSWER_WORD_LIMIT).join(" ")
                                  if (editingFaqId) {
                                    setEditingAnswer(e.target.value)
                                  } else {
                                    setNewAnswer(e.target.value)
                                  }
                                }
                              }}
                              rows={4}
                              disabled={savingFaq}
                              className={currentAnswerWords > FAQ_ANSWER_WORD_LIMIT ? "border-red-500" : ""}
                            />
                            <p
                              className={`text-xs mt-1 ${currentAnswerWords > FAQ_ANSWER_WORD_LIMIT ? "text-red-500" : "text-gray-500"}`}
                            >
                              {currentAnswerWords}/{FAQ_ANSWER_WORD_LIMIT} words
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveFaq}
                              disabled={
                                savingFaq ||
                                (editingFaqId
                                  ? !editingQuestion.trim() || !editingAnswer.trim()
                                  : !newQuestion.trim() || !newAnswer.trim()) ||
                                currentQuestionWords > FAQ_QUESTION_WORD_LIMIT ||
                                currentAnswerWords > FAQ_ANSWER_WORD_LIMIT
                              }
                              className="flex items-center gap-2"
                            >
                              {savingFaq ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : editingFaqId ? (
                                <>
                                  <Save className="h-4 w-4" />
                                  Update FAQ
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" />
                                  Add FAQ
                                </>
                              )}
                            </Button>
                            {editingFaqId && (
                              <Button
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={savingFaq}
                                className="flex items-center gap-2"
                              >
                                Cancel Edit
                              </Button>
                            )}
                          </div>
                        </div>

                        {loadingFaqs ? (
                          <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        ) : faqs.length === 0 ? (
                          <div className="text-center py-8 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-gray-500">No FAQs found</p>
                            <p className="text-sm text-gray-400">
                              Add frequently asked questions to enhance your chatbot's knowledge
                            </p>
                          </div>
                        ) : (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b font-medium">FAQs List</div>
                            <ScrollArea className="h-[400px]">
                              {faqs.map((faq) => (
                                <div
                                  key={faq.tempId} // Use tempId for key
                                  className="flex items-start p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                  <div className="flex-1 pr-4">
                                    <p className="font-medium">Q: {faq.question}</p>
                                    <p className="text-sm text-gray-600">A: {faq.answer}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                            onClick={() => handleEditFaq(faq)}
                                            disabled={savingFaq}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Edit FAQ</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                                            onClick={() => {
                                              setItemToDelete({ type: "faq", name: faq.question, tempId: faq.tempId })
                                              setShowConfirmDialog(true)
                                            }}
                                            disabled={savingFaq}
                                          >
                                            {savingFaq ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <X className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Delete FAQ</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="avatar">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Chatbot Avatar</h3>

                        {loadingAvatar ? (
                          <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            {avatar ? (
                              <div className="text-center">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-4">
                                  <img
                                    src={avatar || "/placeholder.svg"}
                                    alt="Chatbot Avatar"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Current avatar</p>
                              </div>
                            ) : (
                              <div className="text-center mb-6">
                                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                                  <ImageIcon className="h-12 w-12 text-gray-400" />
                                </div>
                                <p className="text-gray-500">No avatar uploaded</p>
                              </div>
                            )}

                            <div className="flex gap-4 mt-4">
                              <div className="relative">
                                <input
                                  type="file"
                                  ref={avatarInputRef}
                                  onChange={handleAvatarUpload}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  accept="image/*"
                                  disabled={uploadingAvatar}
                                />
                                <Button
                                  variant="outline"
                                  className="flex items-center gap-2"
                                  disabled={uploadingAvatar}
                                >
                                  {uploadingAvatar ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4" />
                                      Upload Avatar
                                    </>
                                  )}
                                </Button>
                              </div>

                              {avatar && (
                                <Button
                                  variant="outline"
                                  className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  onClick={handleAvatarDelete}
                                  disabled={uploadingAvatar}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove Avatar
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="conversations">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Chatbot Conversations</h3>

                        {loadingConversations ? (
                          <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        ) : conversations.length === 0 ? (
                          <div className="text-center py-8 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-gray-500">No conversations found</p>
                            <p className="text-sm text-gray-400">Your chatbot hasn't had any conversations yet</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[calc(100vh-16rem)]">
                            <div className="lg:h-[calc(100vh-16rem)] overflow-hidden">
                              <Card
                                style={{
                                  borderColor: theme.primary_color,
                                  borderWidth: "1px",
                                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                }}
                                className="border-b-2"
                              >
                                <CardHeader>
                                  <CardTitle>Conversation History</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-hidden">
                                  <ScrollArea className="h-[calc(100vh-20rem)] pb-4">
                                    <div className="space-y-2">
                                      {conversations.map((conv) => (
                                        <div
                                          key={conv.date_of_convo}
                                          className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                                          onClick={async () => {
                                            await fetchConversationsForDate(conv.date_of_convo)
                                          }}
                                        >
                                          <p className="font-medium">
                                            {new Date(conv.date_of_convo).toLocaleDateString("en-US", {
                                              weekday: "long",
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            {conv.count} conversation{conv.count !== 1 ? "s" : ""}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </CardContent>
                              </Card>
                            </div>

                            <div className="lg:h-[calc(100vh-16rem)] overflow-hidden">
                              <Card
                                className="h-full flex flex-col"
                                style={{ borderColor: theme.secondary_color, borderWidth: "1px" }}
                              >
                                <CardHeader>
                                  <CardTitle>
                                    {conversationsForDate ? "Conversation Preview" : "Chat Preview"}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-auto">
                                  <ScrollArea className="h-full">
                                    {conversationsForDate ? (
                                      <>
                                        <div className="mb-4">
                                          <label
                                            htmlFor="conversation-select"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                          >
                                            Select Conversation ({conversationsForDate.conversations.length} total):
                                          </label>
                                          <select
                                            id="conversation-select"
                                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                                            style={{
                                              borderColor: theme.primary_color,
                                              backgroundColor: "white",
                                              color: "black",
                                              borderRadius: `${theme.border_radius}px`,
                                              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                                            }}
                                            value={selectedConversationId || ""}
                                            onChange={(e) => {
                                              const newId = e.target.value
                                              handleConversationSelect(newId)
                                            }}
                                          >
                                            {conversationsForDate.conversations.map((conv, index) => (
                                              <option key={conv.id} value={conv.id}>
                                                Conversation {index + 1} -{" "}
                                                {new Date(conv.created_at).toLocaleTimeString()}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div className="space-y-4">
                                          {selectedMessages.length > 0 ? (
                                            selectedMessages.map((message, index) => (
                                              <div
                                                key={index}
                                                className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                                              >
                                                <div
                                                  className={`max-w-[95%] rounded-lg p-3 break-words`}
                                                  style={
                                                    message.role === "assistant"
                                                      ? {
                                                          backgroundColor: "#f3f4f6",
                                                          color: "black",
                                                          borderRadius: `${theme.border_radius}px`,
                                                        }
                                                      : {
                                                          backgroundColor: theme.primary_color,
                                                          color: "white",
                                                          borderRadius: `${theme.border_radius}px`,
                                                        }
                                                  }
                                                >
                                                  <p className="whitespace-pre-wrap">
                                                    {message.content.replace(/[*#]/g, "")}
                                                  </p>
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="text-center py-4">
                                              <p className="text-gray-500">No messages in this conversation</p>
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">Select a conversation to view details</p>
                                      </div>
                                    )}
                                  </ScrollArea>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface - Always visible */}
          <div className="md:col-span-2 relative">
            <div className="sticky top-24">
              <ChatInterface
                chatbotId={params.chatbotId}
                chatbotName={theme.chatbot_name}
                greeting={theme.greeting}
                instruction={theme.instruction}
                avatarUrl={avatar} // Add this line to pass the avatar URL
                themeValues={{
                  primaryColor: theme.primary_color,
                  secondaryColor: theme.secondary_color,
                  borderRadius: theme.border_radius,
                  darkMode: theme.dark_mode,
                  avatarUrl: avatar, // Add this line to include avatarUrl in themeValues
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
