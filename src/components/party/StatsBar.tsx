'use client'

import { motion } from 'framer-motion'
import { Heart, Zap } from 'lucide-react'

interface StatsBarProps {
  hp: number
  maxHp: number
  stamina: number
  maxStamina: number
  color: string
  compact?: boolean
}

function Bar({
  value, max, color, icon: Icon, label, compact,
}: {
  value: number
  max: number
  color: string
  icon: React.ElementType
  label: string
  compact?: boolean
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  // Color based on percentage
  const barColor = pct > 50 ? color : pct > 25 ? '#ffd93d' : '#ff4444'

  return (
    <div className={compact ? 'flex items-center gap-1.5' : 'flex items-center gap-2'}>
      <Icon
        className={compact ? 'w-3 h-3 flex-shrink-0' : 'w-3.5 h-3.5 flex-shrink-0'}
        style={{ color: barColor }}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`w-full rounded-full overflow-hidden ${compact ? 'h-1.5' : 'h-2'}`}
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: barColor }}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
      {!compact && (
        <span
          className="text-[10px] font-bold w-12 text-right flex-shrink-0"
          style={{ color: barColor }}
        >
          {value}/{max}
        </span>
      )}
      {compact && (
        <span className="text-[9px] font-bold flex-shrink-0" style={{ color: barColor }}>
          {value}
        </span>
      )}
    </div>
  )
}

export default function StatsBar({ hp, maxHp, stamina, maxStamina, color, compact }: StatsBarProps) {
  const isDead = hp <= 0
  const isKnockedOut = hp <= 0

  return (
    <div className={`space-y-1 ${compact ? '' : 'px-0'}`}>
      {isDead && (
        <div className="text-[9px] text-red-400 font-bold text-center py-0.5 rounded"
          style={{ background: 'rgba(255,68,68,0.1)' }}>
          💀 KO
        </div>
      )}
      <Bar
        value={hp} max={maxHp}
        color="#00ff87"
        icon={Heart}
        label="HP"
        compact={compact}
      />
      <Bar
        value={stamina} max={maxStamina}
        color="#ffd93d"
        icon={Zap}
        label="STA"
        compact={compact}
      />
    </div>
  )
}
