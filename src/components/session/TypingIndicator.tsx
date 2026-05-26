'use client'

interface TypingIndicatorProps {
  name: string
  color: string
  label?: string
}

export default function TypingIndicator({ name, color, label = 'typing' }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs font-medium" style={{ color }}>{name}</span>
      <span className="text-xs text-[#6b8fa0]">{label}</span>
      <div className="flex gap-1">
        <span className="typing-dot" style={{ background: color }} />
        <span className="typing-dot" style={{ background: color }} />
        <span className="typing-dot" style={{ background: color }} />
      </div>
    </div>
  )
}
