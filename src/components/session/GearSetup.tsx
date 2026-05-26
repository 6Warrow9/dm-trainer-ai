'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Package, RefreshCw, ChevronRight } from 'lucide-react'
import type { AIPlayer, InventorySlots } from '@/types'
import { RARITY_CONFIG, RARITIES, autoAssignGear, type GearRarityMode, type ItemsMode } from '@/lib/itemCatalog'
import { CLASS_ICONS } from '@/lib/utils'

interface GearSetupProps {
  players: AIPlayer[]
  locale: string
  onUpdate: (players: AIPlayer[]) => void
}

const RARITY_MODES: { value: GearRarityMode; labelEN: string; labelIT: string; desc: string; descIT: string }[] = [
  { value: 'common',    labelEN: 'Common',    labelIT: 'Comune',      desc: 'Basic starting gear for all',             descIT: 'Equipaggiamento base per tutti' },
  { value: 'uncommon',  labelEN: 'Uncommon',  labelIT: 'Non Comune',  desc: 'Slightly enchanted items',                descIT: 'Oggetti leggermente incantati' },
  { value: 'rare',      labelEN: 'Rare',      labelIT: 'Raro',        desc: 'Magical weapons and armor',               descIT: 'Armi e armature magiche' },
  { value: 'very_rare', labelEN: 'Very Rare', labelIT: 'Molto Raro',  desc: 'Powerful enchanted equipment',            descIT: 'Equipaggiamento fortemente incantato' },
  { value: 'legendary', labelEN: 'Legendary', labelIT: 'Leggendario', desc: 'Artifacts of immense power',              descIT: 'Artefatti di immenso potere' },
  { value: 'mixed',     labelEN: 'Mixed',     labelIT: 'Miste',       desc: 'Random mix of all rarities',             descIT: 'Mix casuale di tutte le rarità' },
]

function InventoryPreview({ player, locale }: { player: AIPlayer; locale: string }) {
  const isIT = locale === 'it'
  return (
    <div
      className="rounded-sm border p-3"
      style={{ borderColor: `${player.color}25`, background: `${player.color}05` }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-7 h-7 rounded-sm flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
          style={{ background: `${player.color}20`, border: `1px solid ${player.color}40`, color: player.color }}
        >
          {player.name[0]}
        </div>
        <div>
          <div className="text-xs font-bold text-white">{player.name}</div>
          <div className="text-[10px] text-[#6b8fa0]">
            {player.race} {player.class} {CLASS_ICONS[player.class as keyof typeof CLASS_ICONS] || '⚔️'}
          </div>
        </div>
      </div>

      {/* 4 slots */}
      <div className="grid grid-cols-4 gap-1.5">
        {player.inventory.map((item, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm border flex flex-col items-center justify-center p-1 relative"
            style={{
              borderColor: item ? `${RARITY_CONFIG[item.rarity].color}50` : `${player.color}15`,
              background: item ? `${RARITY_CONFIG[item.rarity].color}10` : 'transparent',
            }}
          >
            {item ? (
              <>
                <span className="text-base leading-none">{item.emoji}</span>
                <div
                  className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: RARITY_CONFIG[item.rarity].color }}
                />
              </>
            ) : (
              <span className="text-[#6b8fa0] text-[10px] opacity-30">{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Item names */}
      <div className="mt-2 space-y-0.5">
        {player.inventory.map((item, i) => item && (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <span>{item.emoji}</span>
            <span className="text-white truncate flex-1">{item.name}</span>
            <span style={{ color: RARITY_CONFIG[item.rarity].color }}>
              {'★'.repeat(RARITY_CONFIG[item.rarity].stars)}
            </span>
          </div>
        ))}
        {player.inventory.every(s => !s) && (
          <div className="text-[10px] text-[#6b8fa0] text-center py-1">
            {isIT ? 'Nessun oggetto' : 'No items'}
          </div>
        )}
      </div>
    </div>
  )
}

export default function GearSetup({ players, locale, onUpdate }: GearSetupProps) {
  const isIT = locale === 'it'

  const [gearRarity, setGearRarity] = useState<GearRarityMode>('common')
  const [itemsMode, setItemsMode] = useState<ItemsMode>('none')
  const [assigned, setAssigned] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  const assign = () => {
    setIsAssigning(true)
    setTimeout(() => {
      const updated = players.map(player => ({
        ...player,
        inventory: autoAssignGear(player.class as any, gearRarity, itemsMode, locale),
      }))
      onUpdate(updated)
      setAssigned(true)
      setIsAssigning(false)
    }, 600)
  }

  const reassign = () => {
    setAssigned(false)
    assign()
  }

  const skipAll = () => {
    const updated = players.map(p => ({
      ...p,
      inventory: [null, null, null, null] as InventorySlots,
    }))
    onUpdate(updated)
    setAssigned(true)
  }

  return (
    <div className="space-y-6">
      {/* Step 1 — Gear rarity */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 font-bold text-[10px]">1</div>
          <label className="text-xs font-medium text-white">
            {isIT ? 'Rarità di Armi e Armature' : 'Weapon & Armor Rarity'}
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RARITY_MODES.map(mode => {
            const cfg = mode.value === 'mixed' ? { color: '#c77dff', stars: 0 } : RARITY_CONFIG[mode.value as keyof typeof RARITY_CONFIG]
            const label = isIT ? mode.labelIT : mode.labelEN
            const desc  = isIT ? mode.descIT  : mode.desc
            const isSelected = gearRarity === mode.value
            return (
              <button
                key={mode.value}
                onClick={() => setGearRarity(mode.value)}
                className="p-3 rounded-sm border text-left transition-all"
                style={{
                  borderColor: isSelected ? cfg.color : `${cfg.color}25`,
                  background: isSelected ? `${cfg.color}15` : `${cfg.color}05`,
                }}
              >
                <div className="font-bold text-sm mb-0.5" style={{ color: cfg.color }}>
                  {mode.value === 'mixed' ? '🎲 ' : ('stars' in cfg ? '★'.repeat(cfg.stars) + ' ' : '')}{label}
                </div>
                <div className="text-[10px] text-[#6b8fa0]">{desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2 — Random items */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 font-bold text-[10px]">2</div>
          <label className="text-xs font-medium text-white">
            {isIT ? 'Oggetti Casuali nei Slot Rimanenti' : 'Random Items in Remaining Slots'}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setItemsMode('random')}
            className={`p-4 rounded-sm border text-left transition-all ${itemsMode === 'random' ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-emerald-500/15 hover:border-emerald-500/30'}`}
          >
            <div className="text-sm font-bold text-emerald-400 mb-1">
              🎲 {isIT ? 'Sì, oggetti random' : 'Yes, random items'}
            </div>
            <div className="text-[10px] text-[#6b8fa0]">
              {isIT ? 'Ogni giocatore riceve 0-2 oggetti casuali (pozioni, torce, ecc.)' : 'Each player gets 0-2 random items (potions, torches, etc.)'}
            </div>
          </button>
          <button
            onClick={() => setItemsMode('none')}
            className={`p-4 rounded-sm border text-left transition-all ${itemsMode === 'none' ? 'border-cyan-500/60 bg-cyan-500/10' : 'border-cyan-500/15 hover:border-cyan-500/30'}`}
          >
            <div className="text-sm font-bold text-cyan-400 mb-1">
              ✖️ {isIT ? 'No, solo armi' : 'No, weapons only'}
            </div>
            <div className="text-[10px] text-[#6b8fa0]">
              {isIT ? 'Solo arma e armatura, gli slot 3 e 4 restano liberi per il loot' : 'Only weapon and armor, slots 3-4 stay free for loot'}
            </div>
          </button>
        </div>
      </div>

      {/* Assign button */}
      {!assigned ? (
        <div className="flex gap-3">
          <button
            onClick={assign}
            disabled={isAssigning}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 disabled:opacity-50 transition-all glow-cyan"
          >
            {isAssigning ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {isIT ? 'Assegnazione...' : 'Assigning...'}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                {isIT ? 'Assegna Automaticamente' : 'Auto-Assign Gear'}
              </>
            )}
          </button>
          <button
            onClick={skipAll}
            className="px-4 py-3.5 text-sm text-[#6b8fa0] border border-white/10 rounded-sm hover:text-white hover:border-white/20 transition-all"
          >
            {isIT ? 'Salta tutto' : 'Skip all'}
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-sm border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm">
            ✓ {isIT ? 'Gear assegnato!' : 'Gear assigned!'}
          </div>
          <button
            onClick={reassign}
            className="flex items-center gap-2 px-4 py-3 text-sm border border-cyan-500/30 text-cyan-400 rounded-sm hover:bg-cyan-500/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            {isIT ? 'Rigenera' : 'Reroll'}
          </button>
        </div>
      )}

      {/* Preview */}
      <AnimatePresence>
        {assigned && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="text-xs text-[#6b8fa0] uppercase tracking-wider flex items-center gap-2">
              <Package className="w-3.5 h-3.5" />
              {isIT ? 'Anteprima Inventari' : 'Inventory Preview'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map(player => (
                <InventoryPreview key={player.id} player={player} locale={locale} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
