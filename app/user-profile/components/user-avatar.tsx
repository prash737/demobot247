"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"
import AvatarUploadDialog from "./avatar-upload-dialog"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

interface UserAvatarProps {
  chatbotId: string
  firstName?: string
  lastName?: string
  username?: string
  size?: "sm" | "md" | "lg"
  onEditClick?: () => void
}

const sizeMap = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
}

export default function UserAvatar({
  chatbotId,
  firstName,
  lastName,
  username,
  size = "md",
  onEditClick,
}: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const fetchAvatar = async () => {
    setLoading(true)
    setError(null)

    try {
      // First, try to find a folder with the chatbot ID
      const { data: folderData, error: folderError } = await supabase.storage.from("profile_pictures").list(chatbotId)

      // If folder exists and contains files
      if (!folderError && folderData && folderData.length > 0) {
        // Get the first image file
        const imageFile = folderData[0]

        // Get the public URL for the image
        const {
          data: { publicUrl },
        } = supabase.storage.from("profile_pictures").getPublicUrl(`${chatbotId}/${imageFile.name}`)

        setAvatarUrl(publicUrl)
      } else {
        // If no folder or no files, try to get default avatar
        const { data: defaultData, error: defaultError } = await supabase.storage
          .from("profile_pictures")
          .list("defaultavatar")

        if (!defaultError && defaultData && defaultData.length > 0) {
          // Get the first default image
          const defaultImage = defaultData[0]

          // Get the public URL for the default image
          const {
            data: { publicUrl },
          } = supabase.storage.from("profile_pictures").getPublicUrl(`defaultavatar/${defaultImage.name}`)

          setAvatarUrl(publicUrl)
        } else {
          // If all else fails, set to null (will show initials)
          setAvatarUrl(null)
        }
      }
    } catch (error) {
      console.error("Error fetching avatar:", error)
      setError("Failed to load avatar")
      setAvatarUrl(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvatar()
  }, [chatbotId])

  // Generate initials for fallback
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    } else if (username) {
      return username.substring(0, 2).toUpperCase()
    }
    return "NR"
  }

  const handleOpenUploadDialog = () => {
    setIsUploadDialogOpen(true)
  }

  const handleCloseUploadDialog = () => {
    setIsUploadDialogOpen(false)
  }

  const handleUploadSuccess = () => {
    // Refresh the avatar after successful upload
    fetchAvatar()
  }

  return (
    <>
      <div className="flex items-center mb-8">
        <div className={`relative ${sizeMap[size]} rounded-full overflow-hidden bg-blue-200 dark:bg-blue-800`}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : avatarUrl ? (
            <Image src={avatarUrl || "/placeholder.svg"} alt="User avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-semibold text-blue-800 dark:text-blue-200">
              {getInitials()}
            </div>
          )}
        </div>

        <button onClick={handleOpenUploadDialog} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Edit Avatar
        </button>
        <div className="ml-2 text-gray-500 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-info"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
      </div>

      <AvatarUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={handleCloseUploadDialog}
        chatbotId={chatbotId}
        onSuccess={handleUploadSuccess}
      />
    </>
  )
}
