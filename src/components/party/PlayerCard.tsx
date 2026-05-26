'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { AIPlayer } from '@/types'
import { CLASS_ICONS, ARCHETYPE_ICONS } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

interface PlayerCardProps {
  player: AIPlayer
  isTyping?: boolean
}

export default function PlayerCard({ player, isTyping }: PlayerCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useI18n()

  const classIcon = CLASS_ICONS[player.class] || '⚔️'
  const archetypeIcon = ARCHETYPE_ICONS[player.archetype] || '🎲'
  const archetypeLabel = t(`archetypes.${player.archetype}`)

  return (
    <motion.div
      layout
      className="rounded-sm overflow-hidden transition-all duration-200"
      style={{
        background: `linear-gradient(135deg, ${player.color}08 0%, rgba(0,13,20,0.95) 100%)`,
        border: `1px solid ${isTyping ? player.color + '60' : player.color + '25'}`,
        boxShadow: isTyping ? `0 0 12px ${player.color}20` : 'none',
      }}
    >
      <button onClick={() => setExpanded(prev => !prev)} className="w-full p-3 text-left">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center text-lg font-display font-bold flex-shrink-0 relative"
            style={{ background: `${player.color}18`, border: `1px solid ${player.color}35` }}
          >
            <span style={{ color: player.color }}>{player.name[0]}</span>
            {isTyping && (
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-[#000508]"
                style={{ background: player.color, animation: 'pulse 1s ease-in-out infinite' }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm font-bold text-white truncate">{player.name}</div>
            <div className="text-xs" style={{ color: player.color + 'cc' }}>
              {player.race} {player.class} {classIcon}
            </div>
          </div>
          <div className="flex-shrink-0">
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-[#6b8fa0]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#6b8fa0]" />}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="text-xs px-2 py-0.5 rounded-full border text-[#8aa0b0]"
            style={{ borderColor: player.color + '30', background: player.color + '10' }}
          >
            {archetypeIcon} {archetypeLabel}
          </span>
        </div>

        {isTyping && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs" style={{ color: player.color }}>{t('playerCard.typing')}</span>
            <div className="flex gap-0.5">
              <span className="typing-dot" style={{ background: player.color }} />
              <span className="typing-dot" style={{ background: player.color }} />
              <span className="typing-dot" style={{ background: player.color }} />
            </div>
          </div>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 border-t text-xs" style={{ borderColor: player.color + '20' }}>
              <div className="pt-3">
                <span className="text-[#6b8fa0] uppercase tracking-wider text-[10px]">{t('playerCard.personality')}</span>
                <p className="text-[#c8d8e0] mt-1 leading-relaxed">{player.personality}</p>
              </div>
              <div>
                <span className="text-[#6b8fa0] uppercase tracking-wider text-[10px]">{t('playerCard.goals')}</span>
                <ul className="mt-1 space-y-0.5">
                  {player.goals.slice(0, 2).map((goal, i) => (
                    <li key={i} className="text-[#c8d8e0]">· {goal}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 rounded-sm" style={{ background: player.color + '08', border: `1px solid ${player.color}20` }}>
                <span className="text-[#6b8fa0] uppercase tracking-wider text-[10px]">{t('playerCard.frustrationTrigger')}</span>
                <p className="text-[#c8d8e0] mt-1 leading-relaxed">{player.frustration_trigger}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
