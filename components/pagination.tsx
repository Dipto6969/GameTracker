"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4 py-8"
    >
      {/* Items info */}
      <p className="text-sm text-slate-400 font-mono">
        DISPLAYING {startItem}-{endItem} OF {totalItems} TARGETS
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <motion.button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          whileHover={currentPage > 1 ? { scale: 1.05 } : {}}
          whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
          className={`flex items-center gap-1 px-3 py-2 rounded font-mono text-sm transition-all border ${
            currentPage === 1
              ? "bg-slate-800/50 border-slate-700/50 text-slate-600 cursor-not-allowed"
              : "bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30"
          }`}
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">PREV</span>
        </motion.button>

        {/* Page numbers */}
        <div className="flex gap-1">
          {getPageNumbers().map((page, index) => (
            <motion.button
              key={index}
              onClick={() => {
                if (typeof page === "number") {
                  onPageChange(page)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              }}
              whileHover={typeof page === "number" ? { scale: 1.05 } : {}}
              whileTap={typeof page === "number" ? { scale: 0.95 } : {}}
              disabled={typeof page === "string"}
              className={`px-3 py-2 rounded font-mono text-sm transition-all border ${
                page === currentPage
                  ? "bg-purple-500/30 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : typeof page === "string"
                    ? "text-slate-600 cursor-default border-transparent"
                    : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-purple-500/50 hover:text-purple-400"
              }`}
            >
              {page}
            </motion.button>
          ))}
        </div>

        {/* Next Button */}
        <motion.button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          whileHover={currentPage < totalPages ? { scale: 1.05 } : {}}
          whileTap={currentPage < totalPages ? { scale: 0.95 } : {}}
          className={`flex items-center gap-1 px-3 py-2 rounded font-mono text-sm transition-all border ${
            currentPage === totalPages
              ? "bg-slate-800/50 border-slate-700/50 text-slate-600 cursor-not-allowed"
              : "bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30"
          }`}
        >
          <span className="hidden sm:inline">NEXT</span>
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="items-per-page" className="text-sm text-slate-500 font-mono">
          PER PAGE:
        </label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={(e) => {
            // This will be handled by parent component
            const event = new CustomEvent("itemsPerPageChange", {
              detail: parseInt(e.target.value),
            })
            window.dispatchEvent(event)
          }}
          className="px-3 py-1.5 border border-purple-500/50 rounded text-sm bg-slate-800/80 text-purple-300 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>
    </motion.div>
  )
}
