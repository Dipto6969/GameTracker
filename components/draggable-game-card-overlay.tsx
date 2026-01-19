'use client'

import { CSSProperties } from 'react'
import { GripHorizontal } from 'lucide-react'

interface DraggableGameCardProps {
  isDragging?: boolean
  style?: CSSProperties
  showDragHandle?: boolean
}

export function DraggableGameCardOverlay({ isDragging, style, showDragHandle = true }: DraggableGameCardProps) {
  return (
    <>
      {isDragging && (
        <div
          style={style}
          className="fixed top-0 left-0 z-50 bg-slate-900/95 border border-purple-500/50 rounded-lg shadow-[0_0_30px_rgba(168,85,247,0.4)] opacity-90 pointer-events-none"
        />
      )}
      {showDragHandle && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
          <GripHorizontal className="text-purple-400" size={20} />
        </div>
      )}
    </>
  )
}

export default DraggableGameCardOverlay
