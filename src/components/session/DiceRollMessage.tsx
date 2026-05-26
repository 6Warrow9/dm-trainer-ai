'use client'

import { motion } from 'framer-motion'
import type { DiceType } from './DiceRoller'

interface DiceRollMessageProps {
  diceType: DiceType
  result: number
  skillOrStat: string | null
  reason: string | null
  roller?: string | null
  playerName?: string | null
  timestamp: string
  locale: string
}

const DICE_COLORS: Record<DiceType, string> = {
  d4: '#c77dff',
  d6: '#00e5ff',
  d8: '#00ff87',
  d10: '#ffd93d',
  d12: '#ff9a3c',
  d20: '#ff6b6b',
  d100: '#8ecae6',
}

const DICE_SIDES: Record<DiceType, number> = {
  d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100,
}

export default function DiceRollMessage({
  diceType,
  result,
  skillOrStat,
  reason,
  roller,
  playerName,
  timestamp,
  locale,
}: DiceRollMessageProps) {
  const color = DICE_COLORS[diceType]
  const sides = DICE_SIDES[diceType]
  const isNat20 = diceType === 'd20' && result === 20
  const isNat1 = diceType === 'd20' && result === 1
  const isMax = result === sides && !isNat20

  const critLabel = locale === 'it' ? '✨ CRITICO NATURALE!' : '✨ NATURAL CRITICAL!'
  const failLabel = locale === 'it' ? '💀 FALLIMENTO CRITICO' : '💀 CRITICAL FAIL'
  const maxLabel = locale === 'it' ? '⚡ MASSIMO!' : '⚡ MAXIMUM!'
  const rolledLabel = locale === 'it' ? 'ha tirato' : 'rolled'
  // Who rolled — show player name if available, otherwise DM
  const rollerName = playerName ?? (roller === 'player'
    ? (locale === 'it' ? 'Giocatore' : 'Player')
    : 'DM')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className="flex justify-center py-2"
    >
      <div
        className="flex items-center gap-4 px-5 py-3 rounded-sm border max-w-sm w-full"
        style={{
          background: `${color}10`,
          borderColor: `${color}35`,
          boxShadow: isNat20
            ? `0 0 24px ${color}40, 0 0 8px ${color}20`
            : `0 0 8px ${color}15`,
        }}
      >
        {/* Big result */}
        <div className="text-center flex-shrink-0 w-14">
          <motion.div
            className="font-display font-black leading-none"
            style={{
              color,
              fontSize: result >= 100 ? '1.8rem' : '2.2rem',
              textShadow: `0 0 16px ${color}`,
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, delay: 0.05 }}
          >
            {result}
          </motion.div>
          <div
            className="text-[10px] font-display font-bold tracking-widest uppercase"
            style={{ color: `${color}99` }}
          >
            {diceType}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 flex-shrink-0" style={{ background: `${color}30` }} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isNat20 && (
            <motion.div
              className="text-xs font-bold text-yellow-400 mb-1"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {critLabel}
            </motion.div>
          )}
          {isNat1 && (
            <div className="text-xs font-bold text-red-400 mb-1">{failLabel}</div>
          )}
          {isMax && (
            <div className="text-xs font-bold mb-1" style={{ color }}>{maxLabel}</div>
          )}

          <div className="text-xs text-[#6b8fa0]">
            🎲 <span className="font-medium text-white">{rollerName}</span> {rolledLabel} <span className="font-bold text-white">{diceType.toUpperCase()}</span>
            {skillOrStat && (
              <span> — <span style={{ color }} className="font-medium">{skillOrStat}</span></span>
            )}
          </div>
          {reason && (
            <div className="text-[10px] text-[#6b8fa0]/70 mt-0.5 truncate">{reason}</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
