'use client'

import { Info } from 'lucide-react'

interface SystemMessageProps {
  content: string
}

export default function SystemMessage({ content }: SystemMessageProps) {
  return (
    <div className="flex items-center gap-2 py-2 px-4">
      <div className="h-px flex-1 bg-cyan-500/10" />
      <div className="flex items-center gap-2 text-xs text-[#6b8fa0] px-3 py-1.5 rounded-full border border-cyan-500/15 bg-cyan-500/5">
        <Info className="w-3 h-3 text-cyan-500/60" />
        {content}
      </div>
      <div className="h-px flex-1 bg-cyan-500/10" />
    </div>
  )
}
