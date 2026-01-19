"use client"

export default function Logo() {
  return (
    <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
      <div className="flex items-center gap-3">
        {/* Custom Game Controller SVG Logo */}
        <div className="relative">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_12px_rgba(168,85,247,0.6)] group-hover:drop-shadow-[0_0_16px_rgba(168,85,247,0.8)] transition-all"
          >
            {/* Controller Body */}
            <path
              d="M24 8C14 8 8 14 6 20C4 26 4 30 8 34C10 36 13 36 15 34C17 32 19 28 24 28C29 28 31 32 33 34C35 36 38 36 40 34C44 30 44 26 42 20C40 14 34 8 24 8Z"
              fill="url(#gradient1)"
              className="group-hover:opacity-90 transition-opacity"
            />
            {/* D-Pad */}
            <circle cx="16" cy="22" r="2" fill="#E879F9" />
            <circle cx="16" cy="26" r="2" fill="#E879F9" />
            <circle cx="14" cy="24" r="2" fill="#E879F9" />
            <circle cx="18" cy="24" r="2" fill="#E879F9" />
            {/* Buttons */}
            <circle cx="32" cy="22" r="2.5" fill="#06B6D4" />
            <circle cx="32" cy="26" r="2.5" fill="#06B6D4" />
            <circle cx="30" cy="24" r="2.5" fill="#06B6D4" />
            <circle cx="34" cy="24" r="2.5" fill="#06B6D4" />
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradient1" x1="6" y1="8" x2="42" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="50%" stopColor="#C026D3" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg blur-xl -z-10 group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-all" />
        </div>
        
        {/* Text Logo */}
        <div>
          <h1 className="text-lg font-black text-white tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all">
            GAME TRACKER
          </h1>
          <p className="text-[10px] text-purple-400 font-mono tracking-wider">// COMMAND CENTER</p>
        </div>
      </div>
    </a>
  )
}
