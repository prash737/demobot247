"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"

const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

interface ProfilePictureProps {
  username: string
  chatbotId: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "h-10 w-10",
  md: "h-20 w-20",
  lg: "h-32 w-32",
}

export function ProfilePicture({ username, chatbotId, size = "md" }: ProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [currentImage, setCurrentImage] = useState(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MCV6AYVKcBcFxuZx6z0Ce9wIBUnY2r.png",
  )
  const { toast } = useToast()

  useEffect(() => {
    const checkExistingImage = async () => {
      const { data, error } = await supabase.storage.from("profile_pictures").list(chatbotId)

      if (!error && data && data.length > 0) {
        const existingImage = data[0]
        const {
          data: { publicUrl },
        } = supabase.storage.from("profile_pictures").getPublicUrl(`${chatbotId}/${existingImage.name}`)

        setCurrentImage(publicUrl)
      }
    }

    checkExistingImage()
  }, [chatbotId])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // List existing files in the chatbot's folder
      const { data: existingFiles, error: listError } = await supabase.storage.from("profile_pictures").list(chatbotId)

      if (listError) {
        console.error("Error listing existing files:", listError)
      } else {
        // Delete existing files
        for (const existingFile of existingFiles) {
          const { error: deleteError } = await supabase.storage
            .from("profile_pictures")
            .remove([`${chatbotId}/${existingFile.name}`])

          if (deleteError) {
            console.error("Error deleting existing file:", deleteError)
          }
        }
      }

      // Upload new profile picture
      const fileExt = file.name.split(".").pop()
      const fileName = `${chatbotId}/${username}-${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage.from("profile_pictures").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_pictures").getPublicUrl(fileName)

      setCurrentImage(publicUrl)

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      setCurrentImage(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MCV6AYVKcBcFxuZx6z0Ce9wIBUnY2r.png",
      )
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${sizeMap[size]} rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800`}>
        <Image
          src={currentImage || "/placeholder.svg"}
          alt={`${username}'s profile picture`}
          fill
          className="object-cover"
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="file"
          id="profile-picture"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("profile-picture")?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Picture"}
        </Button>
      </div>
    </div>
  )
}
