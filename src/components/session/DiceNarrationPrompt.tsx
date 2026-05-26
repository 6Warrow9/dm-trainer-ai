'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scroll, ChevronRight, Lightbulb } from 'lucide-react'
import type { DiceType } from './DiceRoller'

interface DiceNarrationPromptProps {
  diceType: DiceType
  result: number
  skillOrStat: string | null
  playerName: string | null
  locale: string
  onNarrate: (narration: string) => void
  onSkip: () => void
}

const DICE_COLORS: Record<DiceType, string> = {
  d4: '#c77dff', d6: '#00e5ff', d8: '#00ff87',
  d10: '#ffd93d', d12: '#ff9a3c', d20: '#ff6b6b', d100: '#8ecae6',
}

const DICE_SIDES: Record<DiceType, number> = {
  d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100,
}

function getOutcomeInfo(
  diceType: DiceType,
  result: number,
  skillOrStat: string | null,
  playerName: string | null,
  locale: string
): { level: 'critical' | 'high' | 'medium' | 'low' | 'fail'; label: string; hint: string; color: string } {
  const sides = DICE_SIDES[diceType]
  const isNat20 = diceType === 'd20' && result === 20
  const isNat1  = diceType === 'd20' && result === 1
  const pct     = result / sides

  const who   = playerName ?? (locale === 'it' ? 'il personaggio' : 'the character')
  const skill = skillOrStat ?? (locale === 'it' ? "l'azione" : 'the action')

  if (isNat20) return {
    level: 'critical', color: '#ffd93d',
    label: locale === 'it' ? '✨ CRITICO NATURALE — Successo Straordinario' : '✨ NATURAL CRITICAL — Extraordinary Success',
    hint: locale === 'it'
      ? `${who} riesce in modo spettacolare. Qualcosa di sorprendente accade — un bonus inaspettato, un effetto eccezionale, il momento più epico della scena.`
      : `${who} succeeds spectacularly. Something surprising happens — an unexpected bonus, an exceptional effect, the most epic moment of the scene.`,
  }
  if (isNat1) return {
    level: 'fail', color: '#ff4444',
    label: locale === 'it' ? '💀 FALLIMENTO CRITICO — Qualcosa Va Storto' : '💀 CRITICAL FAIL — Something Goes Wrong',
    hint: locale === 'it'
      ? `${who} fallisce nel peggiore dei modi. Non si tratta solo di un fallimento — qualcosa di brutto accade. Una conseguenza drammatica, un imprevisto, una complicazione.`
      : `${who} fails in the worst way. Not just a failure — something bad happens. A dramatic consequence, an unexpected complication, a setback.`,
  }
  if (pct >= 0.85) return {
    level: 'high', color: '#00ff87',
    label: locale === 'it' ? '⚡ Successo Pieno' : '⚡ Full Success',
    hint: locale === 'it'
      ? `${who} riesce perfettamente in ${skill}. Descrivi il risultato positivo con un dettaglio vivido.`
      : `${who} fully succeeds at ${skill}. Describe the positive outcome with a vivid detail.`,
  }
  if (pct >= 0.6) return {
    level: 'medium', color: '#00e5ff',
    label: locale === 'it' ? '〰️ Successo con Complicazione' : '〰️ Success with Complication',
    hint: locale === 'it'
      ? `${who} riesce parzialmente. Ce la fa, ma c'è un costo o una complicazione minore. Qualcosa non va esattamente come previsto.`
      : `${who} partially succeeds. They manage it, but at a cost or with a minor complication. Something doesn't go exactly as planned.`,
  }
  if (pct >= 0.3) return {
    level: 'low', color: '#ff9a3c',
    label: locale === 'it' ? '⚠️ Fallimento Parziale' : '⚠️ Partial Failure',
    hint: locale === 'it'
      ? `${who} non riesce completamente in ${skill}. Fallisce, ma senza conseguenze gravi. Forse può riprovare, forse la situazione peggiora leggermente.`
      : `${who} doesn't quite manage ${skill}. They fail, but without severe consequences. Maybe they can try again, or the situation worsens slightly.`,
  }
  return {
    level: 'fail', color: '#ff6b6b',
    label: locale === 'it' ? '✖️ Fallimento' : '✖️ Failure',
    hint: locale === 'it'
      ? `${who} fallisce in ${skill}. Descrivi cosa non funziona e come la situazione cambia di conseguenza.`
      : `${who} fails at ${skill}. Describe what goes wrong and how the situation changes as a result.`,
  }
}

export default function DiceNarrationPrompt({
  diceType, result, skillOrStat, playerName, locale, onNarrate, onSkip,
}: DiceNarrationPromptProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const outcome = getOutcomeInfo(diceType, result, skillOrStat, playerName, locale)
  const color = DICE_COLORS[diceType]

  useEffect(() => {
    // Focus textarea after mount
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  const handleSubmit = () => {
    if (!text.trim()) return
    onNarrate(text.trim())
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const isIT = locale === 'it'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="mx-4 mb-3 rounded-sm border overflow-hidden"
      style={{ borderColor: `${outcome.color}40`, background: `${outcome.color}06` }}
    >
      {/* Header — outcome label */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b"
        style={{ borderColor: `${outcome.color}25`, background: `${outcome.color}12` }}
      >
        <div
          className="w-8 h-8 rounded-sm flex items-center justify-center font-display font-black text-sm flex-shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
        >
          {result}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold" style={{ color: outcome.color }}>{outcome.label}</div>
          <div className="text-[10px] text-[#6b8fa0] mt-0.5">
            {diceType.toUpperCase()}
            {skillOrStat && <span> — {skillOrStat}</span>}
            {playerName && <span> · {playerName}</span>}
          </div>
        </div>
      </div>

      {/* Hint for DM */}
      <div className="px-4 pt-3 pb-2 flex items-start gap-2">
        <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: outcome.color }} />
        <p className="text-xs leading-relaxed" style={{ color: `${outcome.color}cc` }}>
          {outcome.hint}
        </p>
      </div>

      {/* DM narration input */}
      <div className="px-4 pb-3">
        <div className="text-[10px] text-[#6b8fa0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Scroll className="w-3 h-3" />
          {isIT ? 'Narra l\'esito (tu sei il DM):' : 'Narrate the outcome (you are the DM):'}
        </div>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isIT
              ? 'Descrivi cosa succede in base al risultato del dado...'
              : 'Describe what happens based on the dice result...'}
            rows={3}
            className="w-full bg-[#000508] border rounded-sm px-3 py-2.5 text-sm text-white placeholder-[#6b8fa0] focus:outline-none resize-none pr-10 transition-colors"
            style={{ borderColor: `${outcome.color}30` }}
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="absolute right-2 bottom-2.5 p-1.5 rounded transition-all disabled:opacity-30"
            style={{ background: text.trim() ? `${outcome.color}30` : 'transparent', color: outcome.color }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-[#6b8fa0]">
            {isIT ? 'Invio per inviare · i giocatori reagiranno dopo' : 'Enter to send · players will react after'}
          </p>
          <button
            onClick={onSkip}
            className="text-[10px] text-[#6b8fa0] hover:text-white transition-colors"
          >
            {isIT ? 'salta →' : 'skip →'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
