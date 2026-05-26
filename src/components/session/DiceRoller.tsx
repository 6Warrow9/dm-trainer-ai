'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Scroll } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

export interface DiceRollResult {
  diceType: DiceType
  result: number
  reason: string | null
  skillOrStat: string | null
  roller: 'player' | 'dm' | null
  playerName: string | null
  timestamp: string
}

const DICE_CONFIG: Record<DiceType, { sides: number; color: string; glowColor: string; symbol: string }> = {
  d4:   { sides: 4,   color: '#c77dff', glowColor: 'rgba(199,125,255,0.3)', symbol: '△' },
  d6:   { sides: 6,   color: '#00e5ff', glowColor: 'rgba(0,229,255,0.3)',   symbol: '⬡' },
  d8:   { sides: 8,   color: '#00ff87', glowColor: 'rgba(0,255,135,0.3)',   symbol: '◇' },
  d10:  { sides: 10,  color: '#ffd93d', glowColor: 'rgba(255,217,61,0.3)',  symbol: '⬟' },
  d12:  { sides: 12,  color: '#ff9a3c', glowColor: 'rgba(255,154,60,0.3)',  symbol: '⬠' },
  d20:  { sides: 20,  color: '#ff6b6b', glowColor: 'rgba(255,107,107,0.3)', symbol: '⬡' },
  d100: { sides: 100, color: '#8ecae6', glowColor: 'rgba(142,202,230,0.3)', symbol: '%' },
}

const ALL_DICE: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']

function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

// ─── Single Dice Button ───────────────────────────────────────────────────────

function DiceButton({
  type, isHighlighted, isRolling, animatingNumber, onClick,
}: {
  type: DiceType
  isHighlighted: boolean
  isRolling: boolean
  animatingNumber: number | null
  onClick: () => void
}) {
  const cfg = DICE_CONFIG[type]

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.92 }}
      className="relative flex flex-col items-center justify-center gap-1 p-2.5 rounded-sm border transition-all duration-200 cursor-pointer select-none"
      style={{
        background: isHighlighted ? `${cfg.color}20` : 'rgba(0,13,20,0.8)',
        borderColor: isHighlighted ? cfg.color : `${cfg.color}30`,
        boxShadow: isHighlighted ? `0 0 16px ${cfg.glowColor}` : 'none',
      }}
      animate={isRolling ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {isHighlighted && (
        <motion.div
          className="absolute inset-0 rounded-sm border-2"
          style={{ borderColor: cfg.color }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Rolling number overlay */}
      {isRolling && animatingNumber !== null ? (
        <span className="text-lg font-display font-black leading-none" style={{ color: cfg.color }}>
          {animatingNumber}
        </span>
      ) : (
        <span
          className="text-lg leading-none"
          style={{ color: cfg.color, filter: isHighlighted ? `drop-shadow(0 0 4px ${cfg.color})` : 'none' }}
        >
          {cfg.symbol}
        </span>
      )}

      <span
        className="text-[10px] font-display font-bold tracking-wider"
        style={{ color: isHighlighted ? cfg.color : `${cfg.color}aa` }}
      >
        {type.toUpperCase()}
      </span>
    </motion.button>
  )
}

// ─── Roll Result ──────────────────────────────────────────────────────────────

function RollResultDisplay({ result, locale }: { result: DiceRollResult; locale: string }) {
  const cfg = DICE_CONFIG[result.diceType]
  const sides = cfg.sides
  const isNat20 = result.diceType === 'd20' && result.result === 20
  const isNat1  = result.diceType === 'd20' && result.result === 1
  const isMax   = result.result === sides && !isNat20

  const critLabel = locale === 'it' ? '✨ CRITICO NATURALE!' : '✨ NATURAL CRITICAL!'
  const failLabel = locale === 'it' ? '💀 FALLIMENTO CRITICO' : '💀 CRITICAL FAIL'
  const maxLabel  = locale === 'it' ? '⚡ MASSIMO!' : '⚡ MAXIMUM!'
  const forLabel  = locale === 'it' ? 'per' : 'for'
  const rolledLabel = locale === 'it' ? 'ha tirato' : 'rolled'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="flex items-center gap-3 p-3 rounded-sm border mt-2"
      style={{
        background: `${cfg.color}10`,
        borderColor: `${cfg.color}40`,
        boxShadow: isNat20 ? `0 0 24px ${cfg.glowColor}` : 'none',
      }}
    >
      {/* Number */}
      <motion.div
        className="font-display font-black leading-none flex-shrink-0 w-12 text-center"
        style={{ color: cfg.color, fontSize: '2rem', textShadow: `0 0 14px ${cfg.color}` }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 500, delay: 0.05 }}
      >
        {result.result}
      </motion.div>

      <div className="w-px h-8 flex-shrink-0" style={{ background: `${cfg.color}30` }} />

      <div className="flex-1 min-w-0">
        {isNat20 && (
          <motion.div className="text-xs font-bold text-yellow-400 mb-0.5"
            animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            {critLabel}
          </motion.div>
        )}
        {isNat1  && <div className="text-xs font-bold text-red-400 mb-0.5">{failLabel}</div>}
        {isMax   && <div className="text-xs font-bold mb-0.5" style={{ color: cfg.color }}>{maxLabel}</div>}

        <div className="text-xs text-[#6b8fa0]">
          {result.playerName
            ? <><span className="font-medium text-white">{result.playerName}</span> {rolledLabel} <span className="font-bold text-white">{result.diceType.toUpperCase()}</span></>
            : <>🎲 <span className="font-bold text-white">{result.diceType.toUpperCase()}</span></>
          }
          {result.skillOrStat && (
            <span> {forLabel} <span className="font-medium" style={{ color: cfg.color }}>{result.skillOrStat}</span></span>
          )}
        </div>
        {result.reason && (
          <div className="text-[10px] text-[#6b8fa0]/60 truncate mt-0.5">{result.reason}</div>
        )}
      </div>

      {/* Die label */}
      <div className="text-[10px] font-display text-[#6b8fa0] flex-shrink-0">{result.diceType.toUpperCase()}</div>
    </motion.div>
  )
}

// ─── Main DiceRoller ──────────────────────────────────────────────────────────

interface DiceRollerProps {
  suggestedDice: DiceType | null
  suggestedReason: string | null
  suggestedSkill: string | null
  suggestedRoller: 'player' | 'dm' | null   // ← NEW: who needs to roll
  suggestedPlayerName: string | null          // ← NEW: which player
  locale: string
  onRollComplete: (result: DiceRollResult) => void
}

export default function DiceRoller({
  suggestedDice,
  suggestedReason,
  suggestedSkill,
  suggestedRoller,
  suggestedPlayerName,
  locale,
  onRollComplete,
}: DiceRollerProps) {
  const [rollingDice, setRollingDice] = useState<DiceType | null>(null)
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null)
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null)

  const roll = (type: DiceType) => {
    if (rollingDice) return
    setRollingDice(type)
    setLastResult(null)

    const cfg = DICE_CONFIG[type]
    const totalFrames = 14
    let frame = 0

    const interval = setInterval(() => {
      frame++
      setAnimatingNumber(Math.floor(Math.random() * cfg.sides) + 1)
      if (frame >= totalFrames) {
        clearInterval(interval)
        setAnimatingNumber(null)

        const finalResult = rollDice(cfg.sides)
        const rollResult: DiceRollResult = {
          diceType: type,
          result: finalResult,
          reason: type === suggestedDice ? suggestedReason : null,
          skillOrStat: type === suggestedDice ? suggestedSkill : null,
          roller: type === suggestedDice ? suggestedRoller : null,
          playerName: type === suggestedDice ? suggestedPlayerName : null,
          timestamp: new Date().toISOString(),
        }
        setLastResult(rollResult)
        setRollingDice(null)
        onRollComplete(rollResult)
      }
    }, 55)
  }

  // Labels
  const isIT = locale === 'it'
  const labelRoll      = isIT ? 'Tira dado' : 'Roll dice'
  const labelSuggested = isIT ? 'Tiro richiesto' : 'Roll needed'
  const labelFor       = isIT ? 'per' : 'for'
  const labelPlayer    = isIT ? 'Giocatore' : 'Player'
  const labelDM        = isIT ? 'DM' : 'DM'
  const labelBtn       = isIT ? '🎲 Lancia' : '🎲 Roll'

  // Who is rolling label
  const rollerLabel = suggestedRoller === 'player'
    ? (suggestedPlayerName ? suggestedPlayerName : labelPlayer)
    : suggestedRoller === 'dm' ? labelDM : null

  return (
    <div className="border-t border-cyan-500/10 bg-[#00060f] px-4 py-3 flex-shrink-0">

      {/* ── Suggestion banner ── */}
      <AnimatePresence mode="wait">
        {suggestedDice && (
          <motion.div
            key={suggestedDice + suggestedReason + suggestedPlayerName}
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm border"
              style={{
                background: `${DICE_CONFIG[suggestedDice].color}08`,
                borderColor: `${DICE_CONFIG[suggestedDice].color}35`,
              }}
            >
              {/* Who rolls icon */}
              <div
                className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${DICE_CONFIG[suggestedDice].color}20`,
                  border: `1px solid ${DICE_CONFIG[suggestedDice].color}40`,
                }}
              >
                {suggestedRoller === 'player'
                  ? <User className="w-3.5 h-3.5" style={{ color: DICE_CONFIG[suggestedDice].color }} />
                  : <Scroll className="w-3.5 h-3.5" style={{ color: DICE_CONFIG[suggestedDice].color }} />
                }
              </div>

              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold" style={{ color: DICE_CONFIG[suggestedDice].color }}>
                    {labelSuggested}: {suggestedDice.toUpperCase()}
                  </span>
                  {rollerLabel && (
                    <span className="text-xs text-[#6b8fa0]">
                      — <span className="text-white font-medium">{rollerLabel}</span>
                    </span>
                  )}
                  {suggestedSkill && (
                    <span className="text-xs text-[#6b8fa0]">
                      {labelFor} <span className="font-medium text-white">{suggestedSkill}</span>
                    </span>
                  )}
                </div>
                {/* Reason */}
                {suggestedReason && (
                  <div className="text-[10px] text-[#6b8fa0]/70 mt-0.5 truncate">{suggestedReason}</div>
                )}
              </div>

              {/* Roll button */}
              <motion.button
                onClick={() => roll(suggestedDice)}
                disabled={!!rollingDice}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 px-4 py-1.5 rounded-sm text-xs font-bold text-black disabled:opacity-50 transition-all"
                style={{ background: DICE_CONFIG[suggestedDice].color }}
              >
                {rollingDice === suggestedDice && animatingNumber !== null
                  ? <span className="font-display font-black text-sm">{animatingNumber}</span>
                  : labelBtn
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dice grid ── */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#6b8fa0] uppercase tracking-wider flex-shrink-0 w-12 text-right">
          {labelRoll}:
        </span>
        <div className="flex gap-1.5 flex-1">
          {ALL_DICE.map(type => (
            <div key={type} className="flex-1 min-w-0">
              <DiceButton
                type={type}
                isHighlighted={type === suggestedDice}
                isRolling={rollingDice === type}
                animatingNumber={rollingDice === type ? animatingNumber : null}
                onClick={() => roll(type)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Last result ── */}
      <AnimatePresence mode="wait">
        {lastResult && (
          <RollResultDisplay key={lastResult.timestamp} result={lastResult} locale={locale} />
        )}
      </AnimatePresence>
    </div>
  )
}
