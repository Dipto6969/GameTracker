"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ExternalLink, RefreshCw, ChevronDown, Newspaper, AlertTriangle, 
  Clock, Zap, Search, X, Filter, Calendar, Gamepad2, Monitor,
  SortAsc, SortDesc, Sparkles, User, Star, TrendingUp, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NewsArticle {
  id: string
  title: string
  description: string
  source: string
  publishedAt: string
  url: string
  imageUrl?: string
  matchReason?: string
  relevanceScore?: number
}

interface UpcomingGame {
  title: string
  releaseWindow: string
  genres: string[]
  platforms: string[]
  description: string
  imageUrl?: string
  matchScore: number
}

interface PersonalizedResponse {
  forYou: NewsArticle[]
  upcoming2026: UpcomingGame[]
  userGenres: string[]
  userGames: string[]
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

interface Filters {
  keyword: string
  dateRange: "24h" | "7d" | "30d" | "all"
  category: string
  platform: string
  sortBy: "newest" | "oldest" | "relevance"
}

const DATE_RANGES = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
]

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "release", label: "🎮 Game Releases" },
  { value: "update", label: "🔄 Updates & Patches" },
  { value: "esports", label: "🏆 Esports" },
  { value: "industry", label: "📊 Industry News" },
  { value: "review", label: "⭐ Reviews" },
]

const PLATFORMS = [
  { value: "", label: "All Platforms" },
  { value: "pc", label: "🖥️ PC" },
  { value: "playstation", label: "🎮 PlayStation" },
  { value: "xbox", label: "🎮 Xbox" },
  { value: "nintendo", label: "🕹️ Nintendo Switch" },
  { value: "mobile", label: "📱 Mobile" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First", icon: SortDesc },
  { value: "oldest", label: "Oldest First", icon: SortAsc },
  { value: "relevance", label: "Most Relevant", icon: Sparkles },
]

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
      <div className="absolute -inset-0.5 bg-linear-to-r from-purple-600/20 to-cyan-600/20 rounded-lg blur opacity-30" />
      <div className="relative bg-neutral-900/90 border border-neutral-700/50 rounded-lg overflow-hidden">
        <div className="aspect-video bg-neutral-800 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-neutral-700 rounded animate-pulse" />
            <div className="h-4 w-16 bg-neutral-700 rounded animate-pulse" />
          </div>
          <div className="h-5 w-full bg-neutral-700 rounded animate-pulse" />
          <div className="h-5 w-3/4 bg-neutral-700 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-neutral-800 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-neutral-800 rounded animate-pulse" />
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
      <div className="absolute -inset-0.5 bg-linear-to-r from-purple-600/30 to-cyan-600/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative bg-neutral-900/90 border border-neutral-700/50 rounded-lg overflow-hidden group-hover:border-cyan-500/50 transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        {article.imageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none"
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-neutral-900 to-transparent" />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 p-4 space-y-2 flex flex-col">
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
          <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed flex-1">
            {article.description}
          </p>
          
          {/* Link indicator */}
          <div className="flex items-center gap-1 text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
            <span className="font-mono">READ_MORE</span>
            <ExternalLink size={12} />
          </div>
        </div>
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-linear-to-bl from-cyan-500/20 to-transparent transform rotate-45 translate-x-6 -translate-y-6" />
        </div>
      </div>
    </motion.a>
  )
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative py-16"
    >
      <div className="absolute inset-0 bg-linear-to-r from-purple-500/5 to-cyan-500/5 rounded-lg" />
      <div className="relative text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-800/50 border border-neutral-700">
          <Newspaper className="w-10 h-10 text-neutral-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            {hasFilters ? "NO MATCHING ARTICLES" : "NO NEWS AVAILABLE"}
          </h3>
          <p className="text-sm text-neutral-500 font-mono max-w-md mx-auto">
            {hasFilters 
              ? "// Try adjusting your filters or search terms" 
              : "// Signal lost. Try again later."}
          </p>
        </div>
        {hasFilters && (
          <Button
            onClick={onClear}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <X size={14} className="mr-2" />
            CLEAR FILTERS
          </Button>
        )}
      </div>
    </motion.div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative py-16"
    >
      <div className="absolute inset-0 bg-linear-to-r from-red-500/5 to-orange-500/5 rounded-lg border border-red-500/20" />
      <div className="relative text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-400 mb-2">CONNECTION ERROR</h3>
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

function FilterSection({ 
  filters, 
  onFilterChange, 
  onClear,
  isExpanded,
  onToggleExpand 
}: { 
  filters: Filters
  onFilterChange: (key: keyof Filters, value: string) => void
  onClear: () => void
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const hasActiveFilters = !!(filters.keyword || filters.category || filters.platform || filters.dateRange !== "all")

  return (
    <div className="space-y-4">
      {/* Search Bar - Always visible */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            type="text"
            placeholder="Search news... (e.g., 'Elden Ring', 'GTA 6', 'Steam')"
            value={filters.keyword}
            onChange={(e) => onFilterChange("keyword", e.target.value)}
            className="pl-10 bg-neutral-900/50 border-neutral-700 focus:border-cyan-500 text-white placeholder:text-neutral-500"
          />
        </div>
        <Button
          variant="outline"
          onClick={onToggleExpand}
          className={`border-neutral-700 ${isExpanded ? "bg-purple-500/20 border-purple-500/50 text-purple-400" : "text-neutral-400 hover:text-white"}`}
        >
          <Filter size={16} className="mr-2" />
          FILTERS
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-neutral-900/50 border border-neutral-700/50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 font-mono flex items-center gap-2">
                    <Calendar size={12} />
                    DATE RANGE
                  </Label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => onFilterChange("dateRange", e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {DATE_RANGES.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 font-mono flex items-center gap-2">
                    <Gamepad2 size={12} />
                    CATEGORY
                  </Label>
                  <select
                    value={filters.category}
                    onChange={(e) => onFilterChange("category", e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Platform */}
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 font-mono flex items-center gap-2">
                    <Monitor size={12} />
                    PLATFORM
                  </Label>
                  <select
                    value={filters.platform}
                    onChange={(e) => onFilterChange("platform", e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {PLATFORMS.map((plat) => (
                      <option key={plat.value} value={plat.value}>
                        {plat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 font-mono flex items-center gap-2">
                    <SortDesc size={12} />
                    SORT BY
                  </Label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => onFilterChange("sortBy", e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex justify-end pt-2 border-t border-neutral-700/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X size={14} className="mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Tags */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {filters.keyword && (
            <span className="px-2 py-1 text-xs bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 font-mono flex items-center gap-1">
              "{filters.keyword}"
              <button onClick={() => onFilterChange("keyword", "")} className="hover:text-white">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.dateRange !== "all" && (
            <span className="px-2 py-1 text-xs bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 font-mono flex items-center gap-1">
              {DATE_RANGES.find(d => d.value === filters.dateRange)?.label}
              <button onClick={() => onFilterChange("dateRange", "all")} className="hover:text-white">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.category && (
            <span className="px-2 py-1 text-xs bg-green-500/20 border border-green-500/30 rounded text-green-400 font-mono flex items-center gap-1">
              {CATEGORIES.find(c => c.value === filters.category)?.label}
              <button onClick={() => onFilterChange("category", "")} className="hover:text-white">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.platform && (
            <span className="px-2 py-1 text-xs bg-orange-500/20 border border-orange-500/30 rounded text-orange-400 font-mono flex items-center gap-1">
              {PLATFORMS.find(p => p.value === filters.platform)?.label}
              <button onClick={() => onFilterChange("platform", "")} className="hover:text-white">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [isCached, setIsCached] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  
  // Personalized news state
  const [personalizedNews, setPersonalizedNews] = useState<NewsArticle[]>([])
  const [upcomingGames, setUpcomingGames] = useState<UpcomingGame[]>([])
  const [userGenres, setUserGenres] = useState<string[]>([])
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(true)
  const [showUpcoming, setShowUpcoming] = useState(false)
  
  const [filters, setFilters] = useState<Filters>({
    keyword: "",
    dateRange: "all",
    category: "",
    platform: "",
    sortBy: "newest",
  })

  // Fetch personalized news
  const fetchPersonalized = useCallback(async (refresh: boolean = false) => {
    try {
      setIsLoadingPersonalized(true)
      const url = refresh ? "/api/personalized-news?refresh=true" : "/api/personalized-news"
      const response = await fetch(url)
      
      if (response.ok) {
        const data: PersonalizedResponse = await response.json()
        setPersonalizedNews(data.forYou || [])
        setUpcomingGames(data.upcoming2026 || [])
        setUserGenres(data.userGenres || [])
      }
    } catch (err) {
      console.log("Could not fetch personalized news:", err)
    } finally {
      setIsLoadingPersonalized(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchPersonalized()
  }, [fetchPersonalized])

  const buildQueryString = useCallback((pageNum: number, isRefresh: boolean = false) => {
    const params = new URLSearchParams()
    params.set("page", pageNum.toString())
    params.set("pageSize", "12")
    
    if (filters.keyword) params.set("keyword", filters.keyword)
    if (filters.dateRange !== "all") params.set("dateRange", filters.dateRange)
    if (filters.category) params.set("category", filters.category)
    if (filters.platform) params.set("platform", filters.platform)
    if (filters.sortBy) params.set("sortBy", filters.sortBy)
    if (isRefresh) params.set("refresh", "true")
    
    return params.toString()
  }, [filters])

  const fetchNews = useCallback(async (pageNum: number, append: boolean = false, isRefresh: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
        setError(null)
      }

      const queryString = buildQueryString(pageNum, isRefresh)
      const response = await fetch(`/api/gaming-news?${queryString}`)
      
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
  }, [buildQueryString])

  // Fetch on mount and when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchNews(1)
    }, 300) // Debounce for keyword search
    
    return () => clearTimeout(debounceTimer)
  }, [filters, fetchNews])

  const handleLoadMore = () => {
    fetchNews(page + 1, true)
  }

  const handleRetry = () => {
    fetchNews(1)
  }

  const handleRefresh = () => {
    setNews([])
    fetchNews(1, false, true)
    fetchPersonalized(true)
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      keyword: "",
      dateRange: "all",
      category: "",
      platform: "",
      sortBy: "newest",
    })
  }

  const hasActiveFilters = !!(filters.keyword || filters.category || filters.platform || filters.dateRange !== "all")

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-purple-500/50 to-transparent" />
          <Zap className="w-6 h-6 text-cyan-400" />
          <h1 className="text-3xl font-black text-white tracking-wider">
            <span className="text-cyan-400">//</span> GAMING NEWS
          </h1>
          <Zap className="w-6 h-6 text-cyan-400" />
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />
        </div>
        <p className="text-center text-neutral-500 font-mono text-sm">
          LATEST UPDATES FROM THE GAMING UNIVERSE
        </p>
      </motion.div>

      {/* FOR YOU - Personalized Headlines */}
      {(personalizedNews.length > 0 || isLoadingPersonalized) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white tracking-wider">
                <span className="text-purple-400">//</span> FOR YOU
              </h2>
              {userGenres.length > 0 && (
                <span className="text-xs text-neutral-500 font-mono ml-2">
                  Based on your {userGenres.slice(0, 3).join(", ")} games
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpcoming(!showUpcoming)}
              className="text-neutral-400 hover:text-purple-400"
            >
              <TrendingUp size={14} className="mr-2" />
              {showUpcoming ? "HIDE" : "UPCOMING 2026"}
            </Button>
          </div>
          
          {isLoadingPersonalized ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-neutral-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {personalizedNews.slice(0, 4).map((article, index) => (
                <motion.a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative block"
                >
                  <div className="absolute -inset-0.5 bg-linear-to-r from-purple-600/40 to-pink-600/40 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-neutral-900/90 border border-purple-500/30 rounded-lg p-4 h-full group-hover:border-purple-500/60 transition-colors">
                    {article.matchReason && (
                      <div className="flex items-center gap-1 text-xs text-purple-400 font-mono mb-2">
                        <Star size={10} className="fill-purple-400" />
                        {article.matchReason}
                      </div>
                    )}
                    <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
                      <span>{article.source}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatRelativeTime(article.publishedAt)}
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* UPCOMING 2026 Games */}
      <AnimatePresence>
        {showUpcoming && upcomingGames.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-wider">
                  <span className="text-cyan-400">//</span> UPCOMING 2026 - MATCHING YOUR TASTE
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {upcomingGames.map((game, index) => (
                  <motion.div
                    key={game.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-600/30 to-blue-600/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-neutral-900/90 border border-cyan-500/20 rounded-lg overflow-hidden group-hover:border-cyan-500/50 transition-colors">
                      {game.imageUrl && (
                        <div className="aspect-video bg-neutral-800">
                          <img
                            src={game.imageUrl}
                            alt={game.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-cyan-400 transition-colors">
                            {game.title}
                          </h3>
                          <span className="shrink-0 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded">
                            {game.matchScore}%
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-2">
                          {game.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {game.genres.slice(0, 2).map(genre => (
                            <span key={genre} className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 text-xs rounded">
                              {genre}
                            </span>
                          ))}
                          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded font-mono">
                            {game.releaseWindow}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 truncate">
                          {game.platforms.join(" • ")}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          isExpanded={filtersExpanded}
          onToggleExpand={() => setFiltersExpanded(!filtersExpanded)}
        />
      </motion.div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          {totalResults > 0 && (
            <span className="text-neutral-400">
              <span className="text-cyan-400">{news.length}</span> of <span className="text-cyan-400">{totalResults}</span> ARTICLES
            </span>
          )}
          {isCached && (
            <span className="px-2 py-1 bg-neutral-800/50 border border-neutral-700/50 rounded text-neutral-500">
              CACHED
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-neutral-400 hover:text-cyan-400 hover:bg-cyan-500/10"
        >
          <RefreshCw size={14} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
          REFRESH
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
        <EmptyState hasFilters={hasActiveFilters} onClear={handleClearFilters} />
      )}

      {/* News Grid */}
      {!isLoading && !error && news.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {news.map((article, index) => (
              <NewsCard key={article.id} article={article} index={index} />
            ))}
          </motion.div>

          {/* Load More Button */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-8"
            >
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                size="lg"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono tracking-wider"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    LOADING...
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="mr-2" />
                    LOAD MORE [{news.length}/{totalResults}]
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
