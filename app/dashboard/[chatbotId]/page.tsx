"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Loader2, Pencil, MessageSquare, Save } from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import ChatbotHeader from "@/app/components/chatbot-header"
import { Footer } from "@/app/components/footer"
import { logAuditEvent } from "@/app/utils/audit-logger" // Import logAuditEvent

// Define the structure for an FAQ item within the JSONB array
interface FaqItem {
  question: string
  answer: string
  tempId: string // Client-side generated ID for unique identification
}

export default function UserChatbotDetailsPage({ params }: { params: { chatbotId: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [savingFaq, setSavingFaq] = useState(false)

  // FAQ management states
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [faqsRowId, setFaqsRowId] = useState<string | null>(null)
  const [loadingFaqs, setLoadingFaqs] = useState(false)
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    type: "faq"
    name: string
    tempId?: string
  } | null>(null)

  // New state for FAQ editing
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState("")
  const [editingAnswer, setEditingAnswer] = useState("")

  // Fetch FAQs for the specific chatbot
  const fetchFaqs = async () => {
    try {
      setLoadingFaqs(true)
      const { data, error } = await supabase
        .from("faqs_uploaded")
        .select("id, faqs")
        .eq("chatbot_id", params.chatbotId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          setFaqs([])
          setFaqsRowId(null)
        } else {
          console.error("Error fetching FAQs:", error)
          toast.error("Failed to load FAQs")
          setFaqs([])
          setFaqsRowId(null)
        }
      } else if (data && data.faqs) {
        const faqsArray: { question: string; answer: string }[] = Array.isArray(data.faqs) ? data.faqs : []
        const faqsWithTempIds = faqsArray.map((faq) => ({
          ...faq,
          tempId: crypto.randomUUID(),
        }))
        setFaqs(faqsWithTempIds)
        setFaqsRowId(data.id)
      } else {
        setFaqs([])
        setFaqsRowId(null)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred while loading FAQs")
    } finally {
      setLoadingFaqs(false)
      setLoading(false) // Set main loading to false after initial data fetch
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [params.chatbotId, supabase])

  const handleSaveFaq = async () => {
    const currentQuestion = editingFaqId ? editingQuestion : newQuestion
    const currentAnswer = editingFaqId ? editingAnswer : newAnswer

    if (!currentQuestion.trim() || !currentAnswer.trim()) {
      toast.error("Please enter both a question and an answer.")
      return
    }

    try {
      setSavingFaq(true)

      let updatedFaqsArray: { question: string; answer: string }[] = []
      let saveError
      let auditAction: "faq_added" | "faq_updated" = "faq_added"
      let previousFaq: FaqItem | null = null

      if (faqsRowId) {
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
          const faqIndex = faqs.findIndex((faq) => faq.tempId === editingFaqId)
          if (faqIndex > -1) {
            previousFaq = faqs[faqIndex]
            const tempFaqs = [...faqs]
            tempFaqs[faqIndex] = { ...tempFaqs[faqIndex], question: currentQuestion, answer: currentAnswer }
            updatedFaqsArray = tempFaqs.map(({ tempId, ...rest }) => rest)
            auditAction = "faq_updated"
          } else {
            toast.error("FAQ to edit not found.")
            setSavingFaq(false)
            return
          }
        } else {
          updatedFaqsArray.push({ question: currentQuestion, answer: currentAnswer })
          auditAction = "faq_added"
        }

        const { error } = await supabase.from("faqs_uploaded").update({ faqs: updatedFaqsArray }).eq("id", faqsRowId)
        saveError = error
      } else {
        updatedFaqsArray = [{ question: currentQuestion, answer: currentAnswer }]
        const { data, error } = await supabase
          .from("faqs_uploaded")
          .insert({
            chatbot_id: params.chatbotId,
            faqs: updatedFaqsArray,
          })
          .select("id")
          .single()
        saveError = error
        if (data) {
          setFaqsRowId(data.id)
        }
        auditAction = "faq_added"
      }

      if (saveError) {
        console.error("Error saving FAQ:", saveError)
        toast.error("Failed to save FAQ")
      } else {
        const changes = {
          action: { previous: previousFaq ? "faq_existed" : "no_faqs", current: auditAction },
          faq: {
            previous: previousFaq ? { question: previousFaq.question, answer: previousFaq.answer } : null,
            current: { question: currentQuestion, answer: currentAnswer },
          },
        }
        await logAuditEvent(supabase, params.chatbotId, "user", changes) // Pass supabase client

        setNewQuestion("")
        setNewAnswer("")
        setEditingFaqId(null)
        setEditingQuestion("")
        setEditingAnswer("")
        await fetchFaqs()
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

      const faqToDelete = faqs.find((faq) => faq.tempId === tempIdToDelete)
      if (!faqToDelete) {
        toast.error("FAQ not found for deletion.")
        setSavingFaq(false)
        setShowConfirmDialog(false)
        setItemToDelete(null)
        return
      }

      const updatedFaqsArray = currentFaqsArray.filter(
        (faq) => !(faq.question === faqToDelete.question && faq.answer === faqToDelete.answer),
      )

      let saveError
      if (updatedFaqsArray.length === 0) {
        const { error } = await supabase.from("faqs_uploaded").delete().eq("id", faqsRowId)
        saveError = error
        if (!error) {
          setFaqsRowId(null)
        }
      } else {
        const { error } = await supabase.from("faqs_uploaded").update({ faqs: updatedFaqsArray }).eq("id", faqsRowId)
        saveError = error
      }

      if (saveError) {
        console.error("Error deleting FAQ:", saveError)
        toast.error("Failed to delete FAQ")
      } else {
        const changes = {
          action: { previous: "faq_existed", current: "faq_deleted" },
          deleted_faq: { previous: faqToDelete, current: null },
        }
        await logAuditEvent(supabase, params.chatbotId, "user", changes) // Pass supabase client

        await fetchFaqs()
        toast.success("FAQ deleted successfully")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred during deletion")
    } finally {
      setSavingFaq(false)
      setShowConfirmDialog(false)
      setItemToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading chatbot details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ChatbotHeader currentPage="My Chatbots" />
      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar - Placeholder for user dashboard sidebar if needed */}
          <div className="md:col-span-2">
            {/* You might have a user-specific sidebar here, or remove this column if not needed */}
            {/* For now, just a placeholder or empty div */}
          </div>

          {/* Main content */}
          <div className="md:col-span-8">
            <Card className="shadow-sm">
              <CardContent className="pt-8 px-8 relative flex flex-col min-h-[700px] overflow-y-auto">
                <h1 className="text-3xl font-bold mb-8">Manage Chatbot FAQs</h1>

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
                        disabled={savingFaq}
                      />
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
                        rows={4}
                        disabled={savingFaq}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveFaq}
                        disabled={
                          savingFaq ||
                          (editingFaqId
                            ? !editingQuestion.trim() || !editingAnswer.trim()
                            : !newQuestion.trim() || !newAnswer.trim())
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
                            key={faq.tempId}
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
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface - Always visible */}
          <div className="md:col-span-2 relative">
            {/* This section might be removed or simplified for a user-facing page */}
            {/* For now, keeping it as a placeholder */}
          </div>
        </div>
      </div>
      <Footer />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the FAQ{" "}
              {itemToDelete?.name ? `"${itemToDelete.name}"` : "selected item"} from your chatbot's knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete && itemToDelete.tempId) {
                  handleDeleteFaq(itemToDelete.tempId)
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
