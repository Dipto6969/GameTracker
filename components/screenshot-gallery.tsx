"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ScreenshotGalleryProps {
  screenshots: string[]
  gameName?: string
}

export default function ScreenshotGallery({ screenshots, gameName }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!screenshots || screenshots.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex - 1 + screenshots.length) % screenshots.length)
  }

  const goToNext = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex + 1) % screenshots.length)
  }

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${gameName || "game"}-screenshot-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedIndex === null) return
    if (e.key === "ArrowLeft") goToPrevious()
    if (e.key === "ArrowRight") goToNext()
    if (e.key === "Escape") closeLightbox()
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {screenshots.map((url, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="relative aspect-video rounded-lg overflow-hidden bg-slate-800 border border-slate-700/50 hover:border-pink-500/50 transition-all group"
          >
            <img
              src={url}
              alt={`Screenshot ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {/* Scan effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 animate-[scanline_2s_linear_infinite] transition-opacity" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {/* Index badge */}
            <div className="absolute bottom-2 left-2 bg-slate-900/80 text-pink-400 px-2 py-1 rounded text-xs font-mono border border-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
              #{index + 1}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent 
          className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border border-pink-500/30"
          onKeyDown={(e) => handleKeyDown(e as any)}
        >
          {selectedIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-pink-500 pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-pink-500 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-pink-500 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 bg-slate-900/80 hover:bg-pink-500/20 text-pink-400 p-2 rounded border border-pink-500/50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Download Button */}
              <button
                onClick={() => downloadImage(screenshots[selectedIndex], selectedIndex)}
                className="absolute top-4 right-16 z-50 bg-slate-900/80 hover:bg-cyan-500/20 text-cyan-400 p-2 rounded border border-cyan-500/50 transition-colors"
                title="Download screenshot"
              >
                <Download className="w-6 h-6" />
              </button>

              {/* Previous Button */}
              {screenshots.length > 1 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 z-50 bg-slate-900/80 hover:bg-purple-500/20 text-purple-400 p-3 rounded border border-purple-500/50 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              {/* Image */}
              <div className="w-full h-full flex items-center justify-center p-16">
                <img
                  src={screenshots[selectedIndex]}
                  alt={`Screenshot ${selectedIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded border border-slate-700/50"
                />
              </div>

              {/* Next Button */}
              {screenshots.length > 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 z-50 bg-slate-900/80 hover:bg-purple-500/20 text-purple-400 p-3 rounded border border-purple-500/50 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/80 text-pink-400 px-4 py-2 rounded font-mono text-sm border border-pink-500/30">
                {selectedIndex + 1} / {screenshots.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
