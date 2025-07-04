"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"

// Initialize Supabase client
const supabase = createClient(
  "https://zsivtypgrrcttzhtfjsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys",
)

interface AvatarUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  chatbotId: string
  onSuccess: () => void
}

export default function AvatarUploadDialog({ isOpen, onClose, chatbotId, onSuccess }: AvatarUploadDialogProps) {
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

  const handleUpload = async () => {
    if (!selectedFile || !chatbotId) return

    setUploading(true)

    try {
      // First, check if the folder exists and delete any existing files
      const { data: existingFiles, error: listError } = await supabase.storage.from("profile_pictures").list(chatbotId)

      if (!listError && existingFiles && existingFiles.length > 0) {
        // Delete all existing files in the folder
        const filesToDelete = existingFiles.map((file) => `${chatbotId}/${file.name}`)
        const { error: deleteError } = await supabase.storage.from("profile_pictures").remove(filesToDelete)

        if (deleteError) {
          throw new Error(`Failed to delete existing avatar: ${deleteError.message}`)
        }
      }

      // Generate a unique filename with timestamp
      const timestamp = new Date().getTime()
      const fileExtension = selectedFile.name.split(".").pop()
      const fileName = `avatar_${timestamp}.${fileExtension}`
      const filePath = `${chatbotId}/${fileName}`

      // Upload the new file
      const { error: uploadError } = await supabase.storage.from("profile_pictures").upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        throw new Error(`Failed to upload avatar: ${uploadError.message}`)
      }

      toast({
        title: "Avatar updated",
        description: "Your avatar has been successfully updated",
      })

      // Reset state and close dialog
      setSelectedFile(null)
      setPreviewUrl(null)
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Avatar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={uploading}
          />

          {!previewUrl ? (
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">Drag and drop your image here or click to browse</p>
                <p className="mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image src={previewUrl || "/placeholder.svg"} alt="Avatar preview" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-opacity"
                disabled={uploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Avatar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
