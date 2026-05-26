'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Gift, X, ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react'
import type { AIPlayer, InventoryItem, InventorySlots, ItemType, ItemRarity } from '@/types'
import { RARITY_CONFIG, RARITIES, TYPE_CONFIG, ITEM_TYPES, LOOT_ITEMS, pickRandomLoot, createCustomItem, getDefaultEmoji } from '@/lib/itemCatalog'
import { CLASS_ICONS } from '@/lib/utils'

// ─── Compact slot (in sidebar) ────────────────────────────────────────────────

function CompactSlot({ item, playerColor }: { item: InventoryItem | null; playerColor: string }) {
  const [hover, setHover] = useState(false)
  const rarityColor = item ? RARITY_CONFIG[item.rarity].color : playerColor

  return (
    <div
      className="relative aspect-square rounded-sm border flex items-center justify-center"
      style={{
        borderColor: item ? `${rarityColor}50` : `${playerColor}15`,
        background: item ? `${rarityColor}10` : 'transparent',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {item ? (
        <>
          <span className="text-base leading-none">{item.emoji}</span>
          <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: rarityColor }} />
          {/* Tooltip */}
          <AnimatePresence>
            {hover && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-32 p-2 rounded-sm border text-left pointer-events-none"
                style={{ background: '#000d14', borderColor: `${rarityColor}40` }}
              >
                <div className="text-[10px] font-bold text-white leading-tight">{item.name}</div>
                <div className="text-[9px] mt-0.5" style={{ color: rarityColor }}>
                  {'★'.repeat(RARITY_CONFIG[item.rarity].stars)} {RARITY_CONFIG[item.rarity].label}
                </div>
                {item.description && (
                  <div className="text-[9px] text-[#6b8fa0] mt-0.5 leading-relaxed">{item.description}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <span className="text-[9px] text-[#6b8fa0] opacity-20">—</span>
      )}
    </div>
  )
}

// ─── Loot Modal ───────────────────────────────────────────────────────────────

interface LootModalProps {
  players: AIPlayer[]
  locale: string
  onGiveLoot: (playerId: string, item: InventoryItem) => void
  onClose: () => void
}

function LootModal({ players, locale, onGiveLoot, onClose }: LootModalProps) {
  const isIT = locale === 'it'
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id ?? '')
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity>('common')
  const [generatedItem, setGeneratedItem] = useState<InventoryItem | null>(null)
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customType, setCustomType] = useState<ItemType>('misc')
  const [customEmoji, setCustomEmoji] = useState('')
  const [customDesc, setCustomDesc] = useState('')

  const generateRandom = () => {
    setGeneratedItem(pickRandomLoot(selectedRarity, locale))
  }

  const handleGive = (item: InventoryItem) => {
    onGiveLoot(selectedPlayer, item)
    setGeneratedItem(null)
  }

  const handleCustomGive = () => {
    if (!customName.trim()) return
    const item = createCustomItem(
      customName.trim(), customType, selectedRarity,
      customEmoji || getDefaultEmoji(customType),
      customDesc.trim() || (isIT ? 'Oggetto trovato.' : 'Found item.')
    )
    onGiveLoot(selectedPlayer, item)
  }

  const rarityColor = RARITY_CONFIG[selectedRarity].color

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-sm bg-[#000d14] border border-emerald-500/30 rounded-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span className="font-display text-sm font-bold text-white">
              {isIT ? 'Dai Loot' : 'Give Loot'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCustomMode(m => !m)}
              className={`text-[10px] px-2 py-1 rounded border transition-all ${customMode ? 'border-cyan-400/60 text-cyan-400' : 'border-white/15 text-[#6b8fa0] hover:text-white'}`}
            >
              <Sparkles className="w-2.5 h-2.5 inline mr-1" />
              {isIT ? 'Custom' : 'Custom'}
            </button>
            <button onClick={onClose} className="text-[#6b8fa0] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Who receives */}
          <div>
            <label className="text-[10px] text-[#6b8fa0] uppercase tracking-wider block mb-1.5">
              {isIT ? 'Chi riceve il loot' : 'Who receives'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {players.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayer(p.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-xs font-medium transition-all"
                  style={{
                    borderColor: selectedPlayer === p.id ? p.color : `${p.color}25`,
                    background: selectedPlayer === p.id ? `${p.color}15` : 'transparent',
                    color: selectedPlayer === p.id ? p.color : '#6b8fa0',
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity */}
          <div>
            <label className="text-[10px] text-[#6b8fa0] uppercase tracking-wider block mb-1.5">
              {isIT ? 'Rarità' : 'Rarity'}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {RARITIES.map(r => (
                <button
                  key={r}
                  onClick={() => { setSelectedRarity(r); setGeneratedItem(null) }}
                  className="px-2.5 py-1 rounded-full text-[10px] border font-medium transition-all"
                  style={{
                    borderColor: selectedRarity === r ? RARITY_CONFIG[r].color : `${RARITY_CONFIG[r].color}25`,
                    background: selectedRarity === r ? `${RARITY_CONFIG[r].color}20` : 'transparent',
                    color: selectedRarity === r ? RARITY_CONFIG[r].color : '#6b8fa0',
                  }}
                >
                  {'★'.repeat(RARITY_CONFIG[r].stars)} {isIT ? RARITY_CONFIG[r].labelIT : RARITY_CONFIG[r].label}
                </button>
              ))}
            </div>
          </div>

          {customMode ? (
            /* ── Custom item ── */
            <div className="space-y-2">
              <input
                type="text" value={customName} onChange={e => setCustomName(e.target.value)}
                placeholder={isIT ? 'Nome oggetto...' : 'Item name...'}
                className="w-full bg-[#000508] border border-emerald-500/20 rounded-sm px-3 py-2 text-sm text-white placeholder-[#6b8fa0] focus:outline-none focus:border-emerald-500/40"
              />
              <div className="grid grid-cols-2 gap-2">
                <select value={customType} onChange={e => setCustomType(e.target.value as ItemType)}
                  className="bg-[#000508] border border-emerald-500/20 rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none">
                  {ITEM_TYPES.map(t => (
                    <option key={t} value={t}>{isIT ? TYPE_CONFIG[t].labelIT : TYPE_CONFIG[t].label}</option>
                  ))}
                </select>
                <input type="text" value={customEmoji} onChange={e => setCustomEmoji(e.target.value)}
                  placeholder={`Emoji ${getDefaultEmoji(customType)}`}
                  className="bg-[#000508] border border-emerald-500/20 rounded-sm px-2 py-1.5 text-xs text-white placeholder-[#6b8fa0] focus:outline-none" />
              </div>
              <input type="text" value={customDesc} onChange={e => setCustomDesc(e.target.value)}
                placeholder={isIT ? 'Descrizione...' : 'Description...'}
                className="w-full bg-[#000508] border border-emerald-500/20 rounded-sm px-3 py-2 text-sm text-white placeholder-[#6b8fa0] focus:outline-none" />
              <button onClick={handleCustomGive} disabled={!customName.trim()}
                className="w-full py-2.5 text-sm font-bold text-black bg-emerald-400 rounded-sm hover:bg-emerald-300 disabled:opacity-40 transition-all">
                {isIT ? '🎁 Dai Oggetto' : '🎁 Give Item'}
              </button>
            </div>
          ) : (
            /* ── Random loot ── */
            <div className="space-y-3">
              {/* Generated item preview */}
              <AnimatePresence mode="wait">
                {generatedItem && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    key={generatedItem.id}
                    className="flex items-center gap-3 p-3 rounded-sm border"
                    style={{
                      borderColor: `${rarityColor}40`,
                      background: `${rarityColor}08`,
                    }}
                  >
                    <span className="text-2xl flex-shrink-0">{generatedItem.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{generatedItem.name}</div>
                      <div className="text-[10px]" style={{ color: rarityColor }}>
                        {'★'.repeat(RARITY_CONFIG[generatedItem.rarity].stars)} {isIT ? RARITY_CONFIG[generatedItem.rarity].labelIT : RARITY_CONFIG[generatedItem.rarity].label}
                      </div>
                      <div className="text-[10px] text-[#6b8fa0] mt-0.5">{generatedItem.description}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2">
                <button
                  onClick={generateRandom}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm border rounded-sm transition-all"
                  style={{ borderColor: `${rarityColor}40`, color: rarityColor, background: `${rarityColor}08` }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isIT ? 'Genera Casuale' : 'Generate Random'}
                </button>
                {generatedItem && (
                  <button
                    onClick={() => handleGive(generatedItem)}
                    className="flex-1 py-2.5 text-sm font-bold text-black rounded-sm transition-all"
                    style={{ background: rarityColor }}
                  >
                    {isIT ? '🎁 Dai!' : '🎁 Give!'}
                  </button>
                )}
              </div>

              {!generatedItem && (
                <p className="text-[10px] text-[#6b8fa0] text-center">
                  {isIT ? 'Clicca "Genera Casuale" per creare un oggetto loot' : 'Click "Generate Random" to create a loot item'}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main InventoryPanel ──────────────────────────────────────────────────────

interface InventoryPanelProps {
  players: AIPlayer[]
  locale: string
  onUpdatePlayers: (players: AIPlayer[]) => void
  onLootMessage: (msg: string, playerId: string, item: InventoryItem, isFull: boolean) => void
}

export default function InventoryPanel({ players, locale, onUpdatePlayers, onLootMessage }: InventoryPanelProps) {
  const isIT = locale === 'it'
  const [showLoot, setShowLoot] = useState(false)
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)

  const handleGiveLoot = (playerId: string, item: InventoryItem) => {
    const player = players.find(p => p.id === playerId)
    if (!player) return

    const freeSlotIndex = player.inventory.findIndex(s => s === null)
    const isFull = freeSlotIndex === -1

    if (!isFull) {
      // Slot free — add directly
      const newSlots = [...player.inventory] as InventorySlots
      newSlots[freeSlotIndex] = item
      onUpdatePlayers(players.map(p => p.id === playerId ? { ...p, inventory: newSlots } : p))
    }
    // Whether full or not, fire the loot message (player will decide to swap if full)
    onLootMessage('', playerId, item, isFull)
    setShowLoot(false)
  }

  const removeItem = (playerId: string, slotIndex: number) => {
    const player = players.find(p => p.id === playerId)
    if (!player) return
    const newSlots = [...player.inventory] as InventorySlots
    newSlots[slotIndex] = null
    onUpdatePlayers(players.map(p => p.id === playerId ? { ...p, inventory: newSlots } : p))
  }

  // Called when player AI decides to swap an item (full inventory scenario)
  // The parent session page handles parsing the AI response and calling this
  // We expose the slot removal via removeItem

  return (
    <>
      <div className="border-t border-cyan-500/10 pt-4 mt-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] text-[#6b8fa0] uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3 h-3" />
            {isIT ? 'Inventari' : 'Inventories'}
          </div>
          <button
            onClick={() => setShowLoot(true)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] border border-emerald-500/25 rounded text-emerald-400 hover:bg-emerald-500/10 transition-all font-medium"
          >
            <Gift className="w-3 h-3" />
            Loot
          </button>
        </div>

        {/* Player inventory rows */}
        <div className="space-y-2">
          {players.map(player => {
            const isExpanded = expandedPlayer === player.id
            const itemCount = player.inventory.filter(Boolean).length

            return (
              <div key={player.id} className="rounded-sm border overflow-hidden" style={{ borderColor: `${player.color}18` }}>
                <button
                  onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-white/2"
                  style={{ background: `${player.color}04` }}
                >
                  <span className="text-xs font-bold truncate flex-1" style={{ color: player.color }}>{player.name}</span>
                  {/* Mini slots */}
                  <div className="flex gap-1 flex-shrink-0">
                    {player.inventory.map((item, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded border flex items-center justify-center text-[9px]"
                        style={{
                          borderColor: item ? `${RARITY_CONFIG[item.rarity].color}40` : `${player.color}12`,
                          background: item ? `${RARITY_CONFIG[item.rarity].color}10` : 'transparent',
                        }}
                      >
                        {item?.emoji?.slice(0, 2) ?? ''}
                      </div>
                    ))}
                  </div>
                  {isExpanded ? <ChevronUp className="w-3 h-3 text-[#6b8fa0] flex-shrink-0" /> : <ChevronDown className="w-3 h-3 text-[#6b8fa0] flex-shrink-0" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2.5 pb-2.5 pt-1.5 border-t" style={{ borderColor: `${player.color}12` }}>
                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                          {player.inventory.map((item, slotIndex) => (
                            <div key={slotIndex} className="relative group">
                              <CompactSlot item={item} playerColor={player.color} />
                              {item && (
                                <button
                                  onClick={() => removeItem(player.id, slotIndex)}
                                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  style={{ background: 'rgba(255,80,80,0.25)', color: '#ff6b6b' }}
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Item list */}
                        <div className="space-y-0.5">
                          {player.inventory.map((item, i) => item && (
                            <div key={i} className="flex items-center gap-1.5 text-[10px]">
                              <span className="flex-shrink-0">{item.emoji}</span>
                              <span className="text-white truncate flex-1">{item.name}</span>
                              <span style={{ color: RARITY_CONFIG[item.rarity].color }}>
                                {'★'.repeat(RARITY_CONFIG[item.rarity].stars)}
                              </span>
                            </div>
                          ))}
                          {itemCount === 0 && (
                            <p className="text-[10px] text-[#6b8fa0] text-center py-0.5">
                              {isIT ? 'Vuoto' : 'Empty'}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* Loot modal */}
      <AnimatePresence>
        {showLoot && (
          <LootModal
            players={players}
            locale={locale}
            onGiveLoot={handleGiveLoot}
            onClose={() => setShowLoot(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
