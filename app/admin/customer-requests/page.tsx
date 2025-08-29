"use client" // This page needs to be a client component for interactivity

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { AdminHeader } from "@/app/components/admin-header"
import { AdminBreadcrumbs } from "@/app/components/admin-breadcrumbs"
import { AdminTable } from "@/app/components/admin-table"
import { format } from "date-fns"
import { AdminCard } from "@/app/components/admin-card"
import { Button } from "@/components/ui/button" // Import Button for actions
import { useToast } from "@/components/ui/use-toast" // Import useToast for feedback
import { Loader2, Trash2, Mail } from "lucide-react" // Import icons

// Define the type for a contact request
interface ContactRequest {
  id: string
  name: string
  email: string
  phone_number: string | null
  message: string
  created_at: string
}

// Initialize Supabase client (for client-side reads)
// Note: For delete, we'll use a server action/route for security with service_role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", // Ensure these are set in your .env.local or Vercel env
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

export default function CustomerRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const isMountedRef = useRef(true) // To prevent state updates on unmounted component

  const fetchContactRequests = useCallback(async () => {
    if (!isMountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      if (isMountedRef.current) {
        setRequests(data || [])
      }
    } catch (err: any) {
      console.error("Error fetching contact requests:", err)
      if (isMountedRef.current) {
        setError(`Failed to load customer requests: ${err.message || "Unknown error"}`)
        toast({
          title: "Error",
          description: "Failed to load customer requests. Please refresh the page.",
          variant: "destructive",
        })
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [toast])

  useEffect(() => {
    isMountedRef.current = true
    fetchContactRequests()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchContactRequests])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) {
      return
    }

    try {
      const response = await fetch("/api/delete-contact-request", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete request.")
      }

      toast({
        title: "Success!",
        description: "Contact request deleted successfully.",
      })
      fetchContactRequests() // Refresh the list after deletion
    } catch (err: any) {
      console.error("Error deleting contact request:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete contact request.",
        variant: "destructive",
      })
    }
  }

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const columns = [
    {
      key: "createdAt",
      label: "Date",
      render: (value: string) => value, // Already formatted in formattedRequests
    },
    {
      key: "name",
      label: "Name",
      render: (value: string) => value,
    },
    {
      key: "email",
      label: "Email",
      render: (value: string) => value,
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      render: (value: string | null) => value || "—",
    },
    {
      key: "message",
      label: "Message",
      render: (value: string) => <span className="line-clamp-2">{value}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      // Corrected render function to receive the full rowData
      render: (cellValue: any, rowData: ContactRequest) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleReply(rowData.email)}>
            <Mail className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(rowData.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const formattedRequests = requests.map((req) => ({
    ...req,
    createdAt: format(new Date(req.created_at), "MMM dd, yyyy HH:mm"),
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading customer requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 light">
      <AdminHeader title="Customer Requests" />
      <AdminBreadcrumbs
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/customer-requests", label: "Customer Requests" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <AdminCard className="border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">All Requests</h2>
            {/* QuickExport component can be re-enabled if it's a client component */}
            {/* <QuickExport data={formattedRequests} columns={columns} /> */}
          </div>
          {formattedRequests.length === 0 && !error ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No customer requests found. Submit a request via the contact form to see data here.
            </div>
          ) : (
            <AdminTable columns={columns} data={formattedRequests} />
          )}
        </AdminCard>
      </div>
    </div>
  )
}
