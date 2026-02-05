"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, RefreshCw, ChevronDown, Newspaper, AlertTriangle, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NewsArticle {
  id: string
  title: string
  description: string
  source: string
  publishedAt: string
  url: string
  imageUrl?: string
}

interface NewsResponse {
  news: NewsArticle[]
  totalResults: number
  page: number
  pageSize: number
  hasMore: boolean
  cached?: boolean
  rateLimited?: boolean
  error?: boolean
  message?: string
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function NewsCardSkeleton() {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg blur opacity-30" />
      <div className="relative bg-neutral-900/90 border border-neutral-700/50 rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-48 h-32 bg-neutral-800 animate-pulse" />
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-neutral-700 rounded animate-pulse" />
              <div className="h-4 w-16 bg-neutral-700 rounded animate-pulse" />
            </div>
            <div className="h-5 w-3/4 bg-neutral-700 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-neutral-800 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-neutral-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewsCard({ article, index }: { article: NewsArticle; index: number }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative group block"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative bg-neutral-900/90 border border-neutral-700/50 rounded-lg overflow-hidden group-hover:border-cyan-500/50 transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          {article.imageUrl && (
            <div className="relative w-full md:w-48 h-32 md:h-auto overflow-hidden shrink-0">
              <img
                src={article.imageUrl}
                alt=""
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-neutral-900/80 hidden md:block" />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 p-4 space-y-2">
            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 font-mono uppercase tracking-wider">
                {article.source}
              </span>
              <span className="flex items-center gap-1 text-neutral-500">
                <Clock size={12} />
                {formatRelativeTime(article.publishedAt)}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight">
              {article.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
              {article.description}
            </p>
            
            {/* Link indicator */}
            <div className="flex items-center gap-1 text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="font-mono">READ_MORE</span>
              <ExternalLink size={12} />
            </div>
          </div>
        </div>
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-cyan-500/20 to-transparent transform rotate-45 translate-x-6 -translate-y-6" />
        </div>
      </div>
    </motion.a>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative py-12"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-lg" />
      <div className="relative text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-800/50 border border-neutral-700">
          <Newspaper className="w-8 h-8 text-neutral-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">NO NEWS AVAILABLE</h3>
          <p className="text-sm text-neutral-500 font-mono">
            // Signal lost. Try again later.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative py-12"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-lg border border-red-500/20" />
      <div className="relative text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-400 mb-1">CONNECTION ERROR</h3>
          <p className="text-sm text-neutral-500 font-mono max-w-md mx-auto">
            {message || "// Failed to fetch news feed"}
          </p>
        </div>
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <RefreshCw size={14} className="mr-2" />
          RETRY CONNECTION
        </Button>
      </div>
    </motion.div>
  )
}

export default function GamingNewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [isCached, setIsCached] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const fetchNews = async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
        setError(null)
      }

      const response = await fetch(`/api/gaming-news?page=${pageNum}&pageSize=6`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || "Failed to fetch news")
      }

      const data: NewsResponse = await response.json()

      if (append) {
        setNews(prev => [...prev, ...data.news])
      } else {
        setNews(data.news)
      }

      setHasMore(data.hasMore)
      setTotalResults(data.totalResults)
      setIsCached(data.cached || false)
      setPage(pageNum)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchNews(1)
  }, [])

  const handleLoadMore = () => {
    fetchNews(page + 1, true)
  }

  const handleRetry = () => {
    fetchNews(1)
  }

  const handleRefresh = () => {
    setNews([])
    fetchNews(1)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500/50" />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-black text-white tracking-wider">
              <span className="text-cyan-400">//</span> GAMING NEWS
            </h2>
            <ChevronDown 
              className={`w-4 h-4 text-neutral-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
        </div>

        <div className="flex items-center gap-2">
          {isCached && (
            <span className="text-xs text-neutral-500 font-mono px-2 py-1 bg-neutral-800/50 rounded border border-neutral-700/50">
              CACHED
            </span>
          )}
          {totalResults > 0 && (
            <span className="text-xs text-neutral-500 font-mono">
              {totalResults} ARTICLES
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-neutral-400 hover:text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <ErrorState message={error} onRetry={handleRetry} />
            )}

            {/* Empty State */}
            {!isLoading && !error && news.length === 0 && (
              <EmptyState />
            )}

            {/* News List */}
            {!isLoading && !error && news.length > 0 && (
              <div className="space-y-4">
                {news.map((article, index) => (
                  <NewsCard key={article.id} article={article} index={index} />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center pt-4"
                  >
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono tracking-wider"
                    >
                      {isLoadingMore ? (
                        <>
                          <RefreshCw size={14} className="mr-2 animate-spin" />
                          LOADING...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} className="mr-2" />
                          LOAD MORE [{news.length}/{totalResults}]
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
