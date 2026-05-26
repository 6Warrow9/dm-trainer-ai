'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import type { AIPlayer, InventoryItem, InventorySlots, ItemType, ItemRarity } from '@/types'
import {
  ITEM_CATALOG, RARITY_CONFIG, TYPE_CONFIG, ITEM_TYPES, RARITIES,
  createItemFromCatalog, createCustomItem, getDefaultEmoji,
} from '@/lib/itemCatalog'
import { useI18n } from '@/lib/i18n'
import { CLASS_ICONS } from '@/lib/utils'

interface InventorySetupProps {
  players: AIPlayer[]
  onUpdate: (players: AIPlayer[]) => void
}

// ─── Rarity badge ─────────────────────────────────────────────────────────────

function RarityBadge({ rarity, small }: { rarity: ItemRarity; small?: boolean }) {
  const cfg = RARITY_CONFIG[rarity]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${small ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'}`}
      style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`, color: cfg.color }}
    >
      {'★'.repeat(cfg.stars)}
    </span>
  )
}

// ─── Single inventory slot ────────────────────────────────────────────────────

function InventorySlot({
  item, slotIndex, playerColor, onRemove, onAdd,
}: {
  item: InventoryItem | null
  slotIndex: number
  playerColor: string
  onRemove: () => void
  onAdd: () => void
}) {
  const rarityColor = item ? RARITY_CONFIG[item.rarity].color : playerColor

  return (
    <motion.div
      layout
      className="relative rounded-sm border overflow-hidden cursor-pointer group"
      style={{
        borderColor: item ? `${rarityColor}50` : `${playerColor}20`,
        background: item ? `${rarityColor}08` : `${playerColor}05`,
        minHeight: 72,
      }}
      whileHover={{ borderColor: item ? `${rarityColor}80` : `${playerColor}40` }}
    >
      {item ? (
        <div className="p-2 h-full flex flex-col gap-1">
          {/* Top row: emoji + rarity */}
          <div className="flex items-start justify-between gap-1">
            <span className="text-xl leading-none">{item.emoji}</span>
            <div className="flex items-center gap-1">
              <RarityBadge rarity={item.rarity} small />
              <button
                onClick={e => { e.stopPropagation(); onRemove() }}
                className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(255,100,100,0.2)', color: '#ff6b6b' }}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
          {/* Name */}
          <div className="text-[10px] font-medium text-white leading-tight line-clamp-2">{item.name}</div>
          {/* Type */}
          <div className="text-[9px] text-[#6b8fa0] capitalize mt-auto">{TYPE_CONFIG[item.type].emoji} {item.type}</div>
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-[#6b8fa0] hover:text-white transition-colors"
          style={{ minHeight: 72 }}
        >
          <Plus className="w-4 h-4 opacity-40" />
          <span className="text-[9px] uppercase tracking-wider opacity-40">Slot {slotIndex + 1}</span>
        </button>
      )}
    </motion.div>
  )
}

// ─── Item picker modal ────────────────────────────────────────────────────────

function ItemPicker({
  playerColor, locale,
  onSelect, onClose,
}: {
  playerColor: string
  locale: string
  onSelect: (item: InventoryItem) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<ItemType | 'all'>('all')
  const [filterRarity, setFilterRarity] = useState<ItemRarity | 'all'>('all')
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity>('common')
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customType, setCustomType] = useState<ItemType>('misc')
  const [customRarity, setCustomRarity] = useState<ItemRarity>('common')
  const [customEmoji, setCustomEmoji] = useState('')
  const [customDesc, setCustomDesc] = useState('')

  const isIT = locale === 'it'

  const filtered = useMemo(() => {
    return ITEM_CATALOG.filter(item => {
      const name = isIT ? item.nameIT : item.name
      const matchSearch = name.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'all' || item.type === filterType
      const matchRarity = filterRarity === 'all' || item.defaultRarity === filterRarity
      return matchSearch && matchType && matchRarity
    })
  }, [search, filterType, filterRarity, isIT])

  const handleSelectCatalog = (catalogItem: typeof ITEM_CATALOG[0]) => {
    const item = createItemFromCatalog(catalogItem, selectedRarity, locale)
    onSelect(item)
  }

  const handleCustomCreate = () => {
    if (!customName.trim()) return
    const item = createCustomItem(
      customName.trim(),
      customType,
      customRarity,
      customEmoji || getDefaultEmoji(customType),
      customDesc.trim() || (isIT ? 'Oggetto personalizzato.' : 'Custom item.')
    )
    onSelect(item)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        className="w-full max-w-lg max-h-[85vh] flex flex-col bg-[#000d14] border border-cyan-500/20 rounded-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/10">
          <h3 className="font-display text-sm font-bold text-white">
            {isIT ? 'Aggiungi Oggetto' : 'Add Item'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCustomMode(m => !m)}
              className={`text-xs px-3 py-1 rounded-sm border transition-all ${customMode ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10' : 'border-cyan-500/20 text-[#6b8fa0] hover:text-white'}`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              {isIT ? 'Personalizzato' : 'Custom'}
            </button>
            <button onClick={onClose} className="text-[#6b8fa0] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {customMode ? (
          /* ── Custom item creator ── */
          <div className="p-4 space-y-3 overflow-y-auto">
            <div>
              <label className="text-[10px] text-[#6b8fa0] uppercase tracking-wider">{isIT ? 'Nome *' : 'Name *'}</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder={isIT ? 'es. Ramo Antico, Chiave Arrugginita...' : 'e.g. Ancient Branch, Rusty Key...'}
                className="w-full mt-1 bg-[#000508] border border-cyan-500/15 rounded-sm px-3 py-2 text-sm text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/35"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#6b8fa0] uppercase tracking-wider">{isIT ? 'Tipo' : 'Type'}</label>
                <select
                  value={customType}
                  onChange={e => setCustomType(e.target.value as ItemType)}
                  className="w-full mt-1 bg-[#000508] border border-cyan-500/15 rounded-sm px-3 py-2 text-sm text-white focus:outline-none"
                >
                  {ITEM_TYPES.map(t => (
                    <option key={t} value={t}>{isIT ? TYPE_CONFIG[t].labelIT : TYPE_CONFIG[t].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#6b8fa0] uppercase tracking-wider">{isIT ? 'Rarità' : 'Rarity'}</label>
                <select
                  value={customRarity}
                  onChange={e => setCustomRarity(e.target.value as ItemRarity)}
                  className="w-full mt-1 bg-[#000508] border border-cyan-500/15 rounded-sm px-3 py-2 text-sm text-white focus:outline-none"
                >
                  {RARITIES.map(r => (
                    <option key={r} value={r}>{isIT ? RARITY_CONFIG[r].labelIT : RARITY_CONFIG[r].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#6b8fa0] uppercase tracking-wider">{isIT ? 'Emoji (opzionale)' : 'Emoji (optional)'}</label>
              <input
                type="text"
                value={customEmoji}
                onChange={e => setCustomEmoji(e.target.value)}
                placeholder={getDefaultEmoji(customType)}
                className="w-full mt-1 bg-[#000508] border border-cyan-500/15 rounded-sm px-3 py-2 text-sm text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/35"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#6b8fa0] uppercase tracking-wider">{isIT ? 'Descrizione' : 'Description'}</label>
              <textarea
                value={customDesc}
                onChange={e => setCustomDesc(e.target.value)}
                placeholder={isIT ? 'Descrizione breve...' : 'Short description...'}
                rows={2}
                className="w-full mt-1 bg-[#000508] border border-cyan-500/15 rounded-sm px-3 py-2 text-sm text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/35 resize-none"
              />
            </div>
            <button
              onClick={handleCustomCreate}
              disabled={!customName.trim()}
              className="w-full py-2.5 text-sm font-semibold text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isIT ? 'Crea Oggetto' : 'Create Item'}
            </button>
          </div>
        ) : (
          /* ── Catalog picker ── */
          <>
            {/* Search + filters */}
            <div className="px-4 py-3 border-b border-cyan-500/10 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b8fa0]" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={isIT ? 'Cerca oggetto...' : 'Search item...'}
                  className="w-full bg-[#000508] border border-cyan-500/15 rounded-sm pl-9 pr-3 py-2 text-sm text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/30"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* Type filter */}
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as ItemType | 'all')}
                  className="bg-[#000508] border border-cyan-500/15 rounded-sm px-2 py-1 text-xs text-[#6b8fa0] focus:outline-none"
                >
                  <option value="all">{isIT ? 'Tutti i tipi' : 'All types'}</option>
                  {ITEM_TYPES.map(t => (
                    <option key={t} value={t}>{isIT ? TYPE_CONFIG[t].labelIT : TYPE_CONFIG[t].label}</option>
                  ))}
                </select>
                {/* Rarity filter */}
                <select
                  value={filterRarity}
                  onChange={e => setFilterRarity(e.target.value as ItemRarity | 'all')}
                  className="bg-[#000508] border border-cyan-500/15 rounded-sm px-2 py-1 text-xs text-[#6b8fa0] focus:outline-none"
                >
                  <option value="all">{isIT ? 'Tutte le rarità' : 'All rarities'}</option>
                  {RARITIES.map(r => (
                    <option key={r} value={r}>{isIT ? RARITY_CONFIG[r].labelIT : RARITY_CONFIG[r].label}</option>
                  ))}
                </select>
                {/* Rarity override for selected item */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[10px] text-[#6b8fa0]">{isIT ? 'Livello:' : 'Power:'}</span>
                  <select
                    value={selectedRarity}
                    onChange={e => setSelectedRarity(e.target.value as ItemRarity)}
                    className="bg-[#000508] border rounded-sm px-2 py-1 text-xs focus:outline-none"
                    style={{ borderColor: RARITY_CONFIG[selectedRarity].color + '60', color: RARITY_CONFIG[selectedRarity].color }}
                  >
                    {RARITIES.map(r => (
                      <option key={r} value={r}>{isIT ? RARITY_CONFIG[r].labelIT : RARITY_CONFIG[r].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Item list */}
            <div className="overflow-y-auto flex-1 p-3 grid grid-cols-1 gap-1.5">
              {filtered.map((catalogItem, i) => {
                const name = isIT ? catalogItem.nameIT : catalogItem.name
                const desc = isIT ? catalogItem.descriptionIT : catalogItem.description
                const rarityColor = RARITY_CONFIG[selectedRarity].color
                return (
                  <motion.button
                    key={i}
                    onClick={() => handleSelectCatalog(catalogItem)}
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-sm border text-left transition-all hover:border-white/20"
                    style={{ borderColor: `${rarityColor}25`, background: `${rarityColor}05` }}
                  >
                    <span className="text-xl flex-shrink-0">{catalogItem.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{name}</span>
                        <RarityBadge rarity={selectedRarity} small />
                      </div>
                      <div className="text-[10px] text-[#6b8fa0] truncate">{desc}</div>
                    </div>
                    <span className="text-[10px] text-[#6b8fa0] flex-shrink-0">{TYPE_CONFIG[catalogItem.type].emoji}</span>
                  </motion.button>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-[#6b8fa0] text-sm">
                  {isIT ? 'Nessun oggetto trovato' : 'No items found'}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Main InventorySetup ──────────────────────────────────────────────────────

export default function InventorySetup({ players, onUpdate }: InventorySetupProps) {
  const { locale } = useI18n()
  const isIT = locale === 'it'

  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(players[0]?.id ?? null)
  const [pickerFor, setPickerFor] = useState<{ playerId: string; slotIndex: number } | null>(null)

  const updatePlayerInventory = (playerId: string, slots: InventorySlots) => {
    onUpdate(players.map(p => p.id === playerId ? { ...p, inventory: slots } : p))
  }

  const addItem = (playerId: string, slotIndex: number, item: InventoryItem) => {
    const player = players.find(p => p.id === playerId)
    if (!player) return
    const newSlots = [...player.inventory] as InventorySlots
    newSlots[slotIndex] = item
    updatePlayerInventory(playerId, newSlots)
    setPickerFor(null)
  }

  const removeItem = (playerId: string, slotIndex: number) => {
    const player = players.find(p => p.id === playerId)
    if (!player) return
    const newSlots = [...player.inventory] as InventorySlots
    newSlots[slotIndex] = null
    updatePlayerInventory(playerId, newSlots)
  }

  return (
    <div className="space-y-2">
      {players.map(player => {
        const isExpanded = expandedPlayer === player.id
        const itemCount = player.inventory.filter(Boolean).length
        const classIcon = CLASS_ICONS[player.class] || '⚔️'

        return (
          <div
            key={player.id}
            className="rounded-sm border overflow-hidden"
            style={{ borderColor: `${player.color}25` }}
          >
            {/* Player header */}
            <button
              onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/2 transition-colors"
              style={{ background: `${player.color}06` }}
            >
              <div
                className="w-8 h-8 rounded-sm flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                style={{ background: `${player.color}20`, border: `1px solid ${player.color}40`, color: player.color }}
              >
                {player.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{player.name}</div>
                <div className="text-[10px] text-[#6b8fa0]">{player.race} {player.class} {classIcon}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6b8fa0]">
                  {itemCount}/4 {isIT ? 'oggetti' : 'items'}
                </span>
                {/* Mini slot preview */}
                <div className="flex gap-1">
                  {player.inventory.map((item, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-sm border flex items-center justify-center text-xs"
                      style={{
                        borderColor: item ? `${RARITY_CONFIG[item.rarity].color}50` : `${player.color}20`,
                        background: item ? `${RARITY_CONFIG[item.rarity].color}10` : 'transparent',
                      }}
                    >
                      {item ? item.emoji.slice(0, 2) : ''}
                    </div>
                  ))}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-[#6b8fa0]" /> : <ChevronDown className="w-4 h-4 text-[#6b8fa0]" />}
              </div>
            </button>

            {/* Inventory slots */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: `${player.color}15` }}>
                    <div className="text-[10px] text-[#6b8fa0] uppercase tracking-wider mb-2">
                      {isIT ? 'Inventario Iniziale (4 slot)' : 'Starting Inventory (4 slots)'}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {player.inventory.map((item, slotIndex) => (
                        <InventorySlot
                          key={slotIndex}
                          item={item}
                          slotIndex={slotIndex}
                          playerColor={player.color}
                          onRemove={() => removeItem(player.id, slotIndex)}
                          onAdd={() => setPickerFor({ playerId: player.id, slotIndex })}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Item picker modal */}
      <AnimatePresence>
        {pickerFor && (
          <ItemPicker
            playerColor={players.find(p => p.id === pickerFor.playerId)?.color ?? '#00e5ff'}
            locale={locale}
            onSelect={item => addItem(pickerFor.playerId, pickerFor.slotIndex, item)}
            onClose={() => setPickerFor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
