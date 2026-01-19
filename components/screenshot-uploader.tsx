"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ScreenshotUploaderProps {
  gameId: string
  existingScreenshots?: string[]
  onUploadComplete?: (screenshots: string[]) => void
}

export default function ScreenshotUploader({ gameId, existingScreenshots = [], onUploadComplete }: ScreenshotUploaderProps) {
  const [screenshots, setScreenshots] = useState<string[]>(existingScreenshots)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Get Cloudinary config from environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration missing. Please set up environment variables.")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)
    formData.append("folder", `gametracker/${gameId}`) // Organize by game ID

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error("Failed to upload to Cloudinary")
    }

    const data = await response.json()
    return data.secure_url
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Limit to 10 screenshots per game
    if (screenshots.length + files.length > 10) {
      toast({
        title: "Too many screenshots",
        description: "Maximum 10 screenshots per game allowed",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadedUrls: string[] = []
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file",
            description: `${file.name} is not an image`,
            variant: "destructive",
          })
          continue
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB`,
            variant: "destructive",
          })
          continue
        }

        try {
          const url = await uploadToCloudinary(file)
          uploadedUrls.push(url)
          setUploadProgress(((i + 1) / totalFiles) * 100)
        } catch (error) {
          console.error("Upload error:", error)
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          })
        }
      }

      if (uploadedUrls.length > 0) {
        const newScreenshots = [...screenshots, ...uploadedUrls]
        setScreenshots(newScreenshots)

        // Save to database
        await saveScreenshots(newScreenshots)

        toast({
          title: "Success",
          description: `Uploaded ${uploadedUrls.length} screenshot${uploadedUrls.length > 1 ? "s" : ""}`,
        })

        onUploadComplete?.(newScreenshots)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload screenshots. Check Cloudinary setup.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const saveScreenshots = async (newScreenshots: string[]) => {
    try {
      const response = await fetch(`/api/updateGame/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshots: newScreenshots }),
      })

      if (!response.ok) {
        throw new Error("Failed to save screenshots")
      }
    } catch (error) {
      console.error("Error saving screenshots:", error)
      throw error
    }
  }

  const handleRemoveScreenshot = async (urlToRemove: string) => {
    try {
      const newScreenshots = screenshots.filter(url => url !== urlToRemove)
      setScreenshots(newScreenshots)
      await saveScreenshots(newScreenshots)
      
      toast({
        title: "Screenshot removed",
        description: "Screenshot deleted successfully",
      })

      onUploadComplete?.(newScreenshots)
    } catch (error) {
      console.error("Error removing screenshot:", error)
      toast({
        title: "Error",
        description: "Failed to remove screenshot",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-pink-400 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          // SCREENSHOTS ({screenshots.length}/10)
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || screenshots.length >= 10}
          className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 disabled:bg-slate-800 border border-pink-500/50 disabled:border-slate-700 text-pink-400 disabled:text-slate-600 rounded font-mono text-sm transition-all flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress.toFixed(0)}%
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              UPLOAD
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {screenshots.length === 0 ? (
        <div className="relative border border-dashed border-pink-500/30 rounded-lg p-8 text-center bg-slate-900/50">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-pink-500/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-pink-500/50" />
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-pink-500/50" />
          <p className="text-slate-400 mb-2 font-mono">NO CAPTURES YET</p>
          <p className="text-sm text-slate-600">
            Add your personal gameplay screenshots here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {screenshots.map((url, index) => (
            <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-slate-800 border border-slate-700/50 hover:border-pink-500/50 transition-colors">
              <img
                src={url}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {/* Scan effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 animate-[scanline_2s_linear_infinite] transition-opacity" />
              <button
                onClick={() => handleRemoveScreenshot(url)}
                className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 border border-red-400/50"
                title="Remove screenshot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-600 font-mono">
        MAX 10 CAPTURES • 10MB EACH • JPG, PNG, WEBP
      </p>
    </div>
  )
}
