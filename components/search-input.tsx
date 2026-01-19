"use client"

import { Search } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative group">
      {/* Glow effect on focus */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition duration-300" />
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Enter target name..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-900/80 border border-green-500/30 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 text-base text-white placeholder-slate-500 font-mono transition-all"
        />
        
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-green-500/50 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-green-500/50 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-green-500/50 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-green-500/50 rounded-br-lg" />
      </div>
    </div>
  )
}
