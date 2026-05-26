import type { InventoryItem, ItemType, ItemRarity } from '@/types'
import type { PlayerClass } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// ─── Rarity config ────────────────────────────────────────────────────────────

export const RARITY_CONFIG: Record<ItemRarity, {
  label: string; labelIT: string; color: string; glow: string; stars: number
}> = {
  common:    { label: 'Common',    labelIT: 'Comune',      color: '#9ca3af', glow: 'rgba(156,163,175,0.2)', stars: 1 },
  uncommon:  { label: 'Uncommon',  labelIT: 'Non Comune',  color: '#22c55e', glow: 'rgba(34,197,94,0.2)',   stars: 2 },
  rare:      { label: 'Rare',      labelIT: 'Raro',        color: '#3b82f6', glow: 'rgba(59,130,246,0.2)',  stars: 3 },
  very_rare: { label: 'Very Rare', labelIT: 'Molto Raro',  color: '#a855f7', glow: 'rgba(168,85,247,0.2)',  stars: 4 },
  legendary: { label: 'Legendary', labelIT: 'Leggendario', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)',  stars: 5 },
}

export const RARITIES: ItemRarity[] = ['common', 'uncommon', 'rare', 'very_rare', 'legendary']

export const TYPE_CONFIG: Record<ItemType, { label: string; labelIT: string; emoji: string }> = {
  weapon:     { label: 'Weapon',     labelIT: 'Arma',        emoji: '⚔️' },
  armor:      { label: 'Armor',      labelIT: 'Armatura',    emoji: '🛡️' },
  magic:      { label: 'Magic',      labelIT: 'Magia',       emoji: '✨' },
  consumable: { label: 'Consumable', labelIT: 'Consumabile', emoji: '🧪' },
  misc:       { label: 'Item',       labelIT: 'Oggetto',     emoji: '📦' },
}

export const ITEM_TYPES: ItemType[] = ['weapon', 'armor', 'magic', 'consumable', 'misc']

// ─── Catalog item definition ──────────────────────────────────────────────────

export interface CatalogItem {
  name: string
  nameIT: string
  type: ItemType
  emoji: string
  description: string
  descriptionIT: string
  // Which classes prefer this weapon (used for auto-assignment)
  classes?: PlayerClass[]
}

// ─── Weapons by class affinity ────────────────────────────────────────────────

export const WEAPONS: CatalogItem[] = [
  { name: 'Longsword',         nameIT: 'Spada Lunga',          type: 'weapon', emoji: '⚔️',  classes: ['Fighter', 'Paladin'],              description: 'A reliable blade for melee combat.',           descriptionIT: 'Lama affidabile per il combattimento ravvicinato.' },
  { name: 'Greatsword',        nameIT: 'Spadone',               type: 'weapon', emoji: '🗡️',  classes: ['Fighter', 'Paladin', 'Barbarian'],  description: 'A massive two-handed blade.',                   descriptionIT: 'Una massiccia lama a due mani.' },
  { name: 'Greataxe',          nameIT: 'Ascia Bipenne',         type: 'weapon', emoji: '🪓',  classes: ['Barbarian', 'Fighter'],             description: 'A powerful axe dealing heavy damage.',          descriptionIT: 'Un\'ascia potente che infligge danni pesanti.' },
  { name: 'Warhammer',         nameIT: 'Martello da Guerra',    type: 'weapon', emoji: '🔨',  classes: ['Paladin', 'Fighter', 'Cleric'],     description: 'Heavy hammer that crushes armor.',              descriptionIT: 'Martello pesante che frantuma armature.' },
  { name: 'Rapier',            nameIT: 'Stocco',                type: 'weapon', emoji: '🤺',  classes: ['Rogue', 'Bard'],                    description: 'An elegant finesse weapon.',                    descriptionIT: 'Un\'arma elegante e precisa.' },
  { name: 'Shortsword',        nameIT: 'Spada Corta',           type: 'weapon', emoji: '🗡️',  classes: ['Rogue', 'Ranger', 'Monk'],          description: 'A light blade for swift attacks.',              descriptionIT: 'Lama leggera per attacchi veloci.' },
  { name: 'Dagger',            nameIT: 'Pugnale',               type: 'weapon', emoji: '🔪',  classes: ['Rogue', 'Wizard', 'Bard'],          description: 'Small, concealable, deadly up close.',          descriptionIT: 'Piccolo, nascondibile e letale.' },
  { name: 'Longbow',           nameIT: 'Arco Lungo',            type: 'weapon', emoji: '🏹',  classes: ['Ranger', 'Fighter'],                description: 'A powerful ranged weapon.',                     descriptionIT: 'Un\'arma a distanza potente.' },
  { name: 'Shortbow',          nameIT: 'Arco Corto',            type: 'weapon', emoji: '🏹',  classes: ['Ranger', 'Rogue'],                  description: 'A quick-firing light bow.',                     descriptionIT: 'Un arco leggero a fuoco rapido.' },
  { name: 'Quarterstaff',      nameIT: 'Bastone',               type: 'weapon', emoji: '🥢',  classes: ['Monk', 'Druid', 'Wizard'],          description: 'A versatile wooden staff.',                     descriptionIT: 'Un bastone di legno versatile.' },
  { name: 'Scimitar',          nameIT: 'Scimitarra',            type: 'weapon', emoji: '⚔️',  classes: ['Druid', 'Ranger'],                  description: 'A curved blade favored by druids.',             descriptionIT: 'Una lama curva preferita dai druidi.' },
  { name: 'Hand Crossbow',     nameIT: 'Balestra a Mano',       type: 'weapon', emoji: '🏹',  classes: ['Rogue', 'Warlock'],                 description: 'A compact crossbow for one hand.',              descriptionIT: 'Una balestra compatta a una mano.' },
  { name: 'Mace',              nameIT: 'Mazza',                 type: 'weapon', emoji: '🔨',  classes: ['Cleric'],                           description: 'A blessed mace for divine warriors.',           descriptionIT: 'Una mazza benedetta per guerrieri divini.' },
  { name: 'Holy Symbol',       nameIT: 'Simbolo Sacro',         type: 'weapon', emoji: '✝️',  classes: ['Cleric', 'Paladin'],                description: 'A sacred focus for divine spellcasting.',       descriptionIT: 'Focus sacro per incantesimi divini.' },
  { name: 'Magic Staff',       nameIT: 'Bastone Arcano',        type: 'weapon', emoji: '🪄',  classes: ['Wizard', 'Sorcerer'],               description: 'A staff imbued with arcane energy.',            descriptionIT: 'Bastone imbevuto di energia arcana.' },
  { name: 'Arcane Wand',       nameIT: 'Bacchetta Arcana',      type: 'weapon', emoji: '✏️',  classes: ['Wizard', 'Sorcerer'],               description: 'A slender wand for casting spells.',            descriptionIT: 'Bacchetta sottile per incantesimi.' },
  { name: 'Eldritch Focus',    nameIT: 'Focus Eldritchico',     type: 'weapon', emoji: '🔮',  classes: ['Warlock'],                          description: 'A dark orb pulsing with eldritch energy.',     descriptionIT: 'Un orb oscuro pulsante di energia eldritch.' },
  { name: 'Lute',              nameIT: 'Liuto',                 type: 'weapon', emoji: '🎸',  classes: ['Bard'],                             description: 'A musical instrument that channels bardic magic.', descriptionIT: 'Strumento musicale che incanalizza la magia bardica.' },
  { name: 'Druidic Focus',     nameIT: 'Focus Druidico',        type: 'weapon', emoji: '🌿',  classes: ['Druid'],                            description: 'A wooden totem or mistletoe sprig.',            descriptionIT: 'Un totem di legno o un ramoscello di vischio.' },
  { name: 'Monk Fists',        nameIT: 'Pugni del Monaco',      type: 'weapon', emoji: '👊',  classes: ['Monk'],                             description: 'Unarmed strikes enhanced by ki energy.',        descriptionIT: 'Colpi senz\'armi potenziati dal ki.' },
  // Enhanced versions (rare+)
  { name: 'Flaming Sword +1',  nameIT: 'Spada Fiammeggiante +1',type:'weapon', emoji: '🔥',  classes: ['Fighter', 'Paladin', 'Barbarian'],  description: 'A blade wreathed in magical fire.',             descriptionIT: 'Lama avvolta in fuoco magico.' },
  { name: 'Frost Axe +1',      nameIT: 'Ascia del Gelo +1',     type: 'weapon', emoji: '❄️',  classes: ['Barbarian', 'Fighter'],             description: 'An axe that freezes on hit.',                   descriptionIT: 'Un\'ascia che congela al colpo.' },
  { name: 'Staff of Power',    nameIT: 'Bastone del Potere',    type: 'weapon', emoji: '⚡',  classes: ['Wizard', 'Sorcerer', 'Warlock'],    description: 'An ancient staff crackling with power.',        descriptionIT: 'Antico bastone crepitante di potere.' },
  { name: 'Holy Avenger',      nameIT: 'Vendicatore Santo',     type: 'weapon', emoji: '✨',  classes: ['Paladin'],                          description: 'A legendary holy sword.',                       descriptionIT: 'Una leggendaria spada santa.' },
  { name: 'Vorpal Blade',      nameIT: 'Lama Vorpal',           type: 'weapon', emoji: '💫',  classes: ['Fighter', 'Rogue'],                 description: 'A legendary blade that can sever heads.',       descriptionIT: 'Lama leggendaria che può decapitare.' },
]

// ─── Armor by class affinity ──────────────────────────────────────────────────

export const ARMORS: CatalogItem[] = [
  { name: 'Leather Armor',       nameIT: 'Armatura di Cuoio',      type: 'armor', emoji: '🥋',  classes: ['Ranger', 'Rogue', 'Bard', 'Monk', 'Druid'],          description: 'Light protection, free movement.',              descriptionIT: 'Protezione leggera, movimento libero.' },
  { name: 'Studded Leather',     nameIT: 'Cuoio Borchiato',        type: 'armor', emoji: '🛡️',  classes: ['Ranger', 'Rogue', 'Bard'],                            description: 'Reinforced leather for better protection.',     descriptionIT: 'Cuoio rinforzato per protezione migliore.' },
  { name: 'Chain Shirt',         nameIT: 'Camisola di Maglia',     type: 'armor', emoji: '🛡️',  classes: ['Fighter', 'Cleric', 'Paladin', 'Ranger'],             description: 'A flexible mail shirt worn under clothes.',     descriptionIT: 'Maglia flessibile indossata sotto i vestiti.' },
  { name: 'Chain Mail',          nameIT: 'Cotta di Maglia',        type: 'armor', emoji: '🛡️',  classes: ['Fighter', 'Cleric', 'Paladin'],                        description: 'Interlocked metal rings.',                      descriptionIT: 'Anelli metallici intrecciati.' },
  { name: 'Half Plate',          nameIT: 'Mezza Armatura',         type: 'armor', emoji: '⚙️',  classes: ['Fighter', 'Paladin'],                                  description: 'Partial plate covering vital areas.',           descriptionIT: 'Piastre parziali che coprono le zone vitali.' },
  { name: 'Full Plate',          nameIT: 'Armatura a Piastre',     type: 'armor', emoji: '⚙️',  classes: ['Fighter', 'Paladin'],                                  description: 'Heavy full plate for frontline warriors.',      descriptionIT: 'Armatura pesante integrale.' },
  { name: 'Mage Robes',          nameIT: 'Vesti del Mago',         type: 'armor', emoji: '👘',  classes: ['Wizard', 'Sorcerer', 'Warlock'],                       description: 'Enchanted robes boosting spell power.',         descriptionIT: 'Vesti incantate che potenziano gli incantesimi.' },
  { name: 'Monk Gi',             nameIT: 'Gi del Monaco',          type: 'armor', emoji: '🥋',  classes: ['Monk'],                                                description: 'A traditional garb allowing full movement.',    descriptionIT: 'Abbigliamento tradizionale per movimento completo.' },
  { name: 'Druid Vestments',     nameIT: 'Abiti del Druido',       type: 'armor', emoji: '🌿',  classes: ['Druid'],                                               description: 'Nature-blessed garments of woven vines.',       descriptionIT: 'Indumenti benedetti dalla natura.' },
  { name: 'Shield',              nameIT: 'Scudo',                  type: 'armor', emoji: '🛡️',  classes: ['Fighter', 'Paladin', 'Cleric'],                        description: 'A sturdy shield (+2 AC).',                      descriptionIT: 'Uno scudo robusto (+2 CA).' },
  // Enhanced versions (rare+)
  { name: 'Cloak of Shadows',    nameIT: 'Mantello delle Ombre',   type: 'armor', emoji: '🌑',  classes: ['Rogue', 'Ranger', 'Bard'],                            description: 'Advantage on Stealth checks.',                  descriptionIT: 'Vantaggio alle prove di Furtività.' },
  { name: 'Mithral Plate',       nameIT: 'Armatura di Mithral',    type: 'armor', emoji: '💿',  classes: ['Fighter', 'Paladin'],                                  description: 'Lightweight plate that never encumbers.',        descriptionIT: 'Armatura leggera che non ingombra mai.' },
  { name: 'Dragon Scale Mail',   nameIT: 'Maglia di Scaglie',      type: 'armor', emoji: '🐉',  classes: ['Fighter', 'Paladin', 'Ranger', 'Barbarian'],           description: 'Armor forged from dragon scales.',              descriptionIT: 'Armatura forgiata da scaglie di drago.' },
  { name: 'Robe of the Archmagi',nameIT: 'Veste dell\'Arcimago',   type: 'armor', emoji: '⭐',  classes: ['Wizard', 'Sorcerer', 'Warlock'],                       description: 'A legendary robe boosting all spellcasting.',   descriptionIT: 'Veste leggendaria per incantatori.' },
]

// ─── Loot items (consumables + misc, used during session) ────────────────────

export const LOOT_ITEMS: CatalogItem[] = [
  // Consumables
  { name: 'Healing Potion',        nameIT: 'Pozione di Cura',          type: 'consumable', emoji: '🧪', description: 'Restores 2d4+2 HP.',          descriptionIT: 'Ripristina 2d4+2 PF.' },
  { name: 'Greater Healing Potion',nameIT: 'Pozione di Cura Superiore',type: 'consumable', emoji: '💉', description: 'Restores 4d4+4 HP.',          descriptionIT: 'Ripristina 4d4+4 PF.' },
  { name: 'Antitoxin',             nameIT: 'Antitossina',              type: 'consumable', emoji: '💊', description: 'Advantage vs poison saves.',   descriptionIT: 'Vantaggio ai TS contro veleno.' },
  { name: 'Smoke Bomb',            nameIT: 'Bomba Fumogena',           type: 'consumable', emoji: '💨', description: 'Creates 10ft smoke sphere.',   descriptionIT: 'Crea sfera di fumo 3m.' },
  { name: 'Alchemist Fire',        nameIT: 'Fuoco dell\'Alchimista',   type: 'consumable', emoji: '🔥', description: '1d4 fire damage per round.',   descriptionIT: '1d4 danni fuoco per round.' },
  { name: 'Thunderstone',          nameIT: 'Pietra del Tuono',         type: 'consumable', emoji: '⚡', description: 'Deafens in 10ft radius.',      descriptionIT: 'Assorda nel raggio di 3m.' },
  { name: 'Scroll of Fireball',    nameIT: 'Pergamena di Palla di Fuoco', type: 'consumable', emoji: '📜', description: 'Cast Fireball once.',       descriptionIT: 'Lancia Palla di Fuoco una volta.' },
  { name: 'Scroll of Healing',     nameIT: 'Pergamena di Cura',        type: 'consumable', emoji: '📜', description: 'Cast Cure Wounds once.',      descriptionIT: 'Lancia Cura Ferite una volta.' },
  { name: 'Arrow +1 (x10)',        nameIT: 'Frecce +1 (x10)',          type: 'consumable', emoji: '🏹', description: '+1 to attack and damage.',     descriptionIT: '+1 a colpire e danni.' },
  { name: 'Ration',                nameIT: 'Razioni',                  type: 'consumable', emoji: '🍖', description: 'One day of food and water.',   descriptionIT: 'Un giorno di cibo e acqua.' },
  // Misc loot
  { name: 'Gemstone',              nameIT: 'Pietra Preziosa',          type: 'misc', emoji: '💎', description: 'Worth 50gp.',                      descriptionIT: 'Valore 50 po.' },
  { name: 'Gold Coins (50)',        nameIT: 'Monete d\'Oro (50)',       type: 'misc', emoji: '🪙', description: '50 gold pieces.',                  descriptionIT: '50 monete d\'oro.' },
  { name: 'Mysterious Key',        nameIT: 'Chiave Misteriosa',        type: 'misc', emoji: '🗝️', description: 'A key of unknown purpose.',        descriptionIT: 'Una chiave di scopo sconosciuto.' },
  { name: 'Map Fragment',          nameIT: 'Frammento di Mappa',       type: 'misc', emoji: '🗺️', description: 'Part of a larger map.',            descriptionIT: 'Parte di una mappa più grande.' },
  { name: 'Mysterious Amulet',     nameIT: 'Amuleto Misterioso',       type: 'misc', emoji: '📿', description: 'Its power is unknown.',            descriptionIT: 'Il suo potere è sconosciuto.' },
  { name: 'Ancient Tome',          nameIT: 'Tomo Antico',              type: 'misc', emoji: '📖', description: 'A book written in a dead language.', descriptionIT: 'Libro scritto in lingua morta.' },
  { name: 'Rope (50ft)',           nameIT: 'Corda (15m)',              type: 'misc', emoji: '🪢', description: '50ft of strong hemp rope.',         descriptionIT: '15m di robusta corda di canapa.' },
  { name: 'Torch',                 nameIT: 'Torcia',                   type: 'misc', emoji: '🔦', description: 'Illuminates 20ft radius.',          descriptionIT: 'Illumina raggio 6m.' },
  { name: 'Thieves\' Tools',       nameIT: 'Arnesi da Scassinatore',   type: 'misc', emoji: '🔧', description: 'Used to pick locks and traps.',     descriptionIT: 'Per scassinare serrature e trappole.' },
  { name: 'Skull',                 nameIT: 'Teschio',                  type: 'misc', emoji: '💀', description: 'An unsettling humanoid skull.',     descriptionIT: 'Un inquietante teschio umanoide.' },
  { name: 'Ancient Branch',        nameIT: 'Ramo Antico',              type: 'misc', emoji: '🌿', description: 'A gnarled branch from an old tree.', descriptionIT: 'Ramo nodoso da un albero antico.' },
  { name: 'Sending Stone',         nameIT: 'Pietra di Comunicazione',  type: 'misc', emoji: '🪨', description: 'Telepathic communication.',          descriptionIT: 'Comunicazione telepatica.' },
  { name: 'Dark Crystal',          nameIT: 'Cristallo Oscuro',         type: 'misc', emoji: '🔮', description: 'Pulses with dark energy.',          descriptionIT: 'Pulsa di energia oscura.' },
]

// ─── Smart auto-assign gear for a class + rarity ─────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function resolveRarity(mode: GearRarityMode): ItemRarity {
  if (mode === 'mixed') {
    const weights: [ItemRarity, number][] = [
      ['common', 40], ['uncommon', 30], ['rare', 20], ['very_rare', 8], ['legendary', 2],
    ]
    const total = weights.reduce((s, [, w]) => s + w, 0)
    let r = Math.random() * total
    for (const [rarity, w] of weights) { r -= w; if (r <= 0) return rarity }
    return 'common'
  }
  return mode
}

export type GearRarityMode = ItemRarity | 'mixed'
export type ItemsMode = 'random' | 'none'

function makeItem(catalog: CatalogItem, rarity: ItemRarity, locale: string): InventoryItem {
  return {
    id: uuidv4(),
    name: locale === 'it' ? catalog.nameIT : catalog.name,
    type: catalog.type,
    rarity,
    emoji: catalog.emoji,
    description: locale === 'it' ? catalog.descriptionIT : catalog.description,
  }
}

/**
 * Auto-assigns weapon + armor for a player class at a given rarity.
 * Returns an InventorySlots array [weapon, armor, null, null].
 * Slots 3 and 4 are filled by assignRandomItems if requested.
 */
export function autoAssignGear(
  playerClass: PlayerClass,
  gearRarity: GearRarityMode,
  itemsMode: ItemsMode,
  locale: string
): [InventoryItem | null, InventoryItem | null, InventoryItem | null, InventoryItem | null] {
  // Pick weapon
  const classWeapons = WEAPONS.filter(w => w.classes?.includes(playerClass))
  const weaponPool = classWeapons.length > 0 ? classWeapons : WEAPONS.filter(w => w.type === 'weapon')
  const weaponRarity = resolveRarity(gearRarity)

  // Filter by appropriate rarity range
  const rarityIndex = RARITIES.indexOf(weaponRarity)
  // Enhanced items (flaming sword etc) require rare+
  const eligibleWeapons = weaponPool.filter(w => {
    const isEnhanced = w.name.includes('+') || ['Flaming Sword', 'Frost Axe', 'Staff of Power', 'Holy Avenger', 'Vorpal Blade'].includes(w.name)
    if (isEnhanced) return rarityIndex >= 2  // rare+
    return true
  })
  const chosenWeapon = pickRandom(eligibleWeapons.length > 0 ? eligibleWeapons : weaponPool)
  const weapon = makeItem(chosenWeapon, weaponRarity, locale)

  // Pick armor
  const classArmors = ARMORS.filter(a => a.classes?.includes(playerClass))
  const armorPool = classArmors.length > 0 ? classArmors : ARMORS.slice(0, 3)
  const armorRarity = resolveRarity(gearRarity)
  const armorRarityIndex = RARITIES.indexOf(armorRarity)
  const eligibleArmors = armorPool.filter(a => {
    const isEnhanced = ['Cloak of Shadows', 'Mithral Plate', 'Dragon Scale Mail', 'Robe of the Archmagi'].includes(a.name)
    if (isEnhanced) return armorRarityIndex >= 2
    return true
  })
  const chosenArmor = pickRandom(eligibleArmors.length > 0 ? eligibleArmors : armorPool)
  const armor = makeItem(chosenArmor, armorRarity, locale)

  // Pick 0-2 random items for the remaining slots
  let item1: InventoryItem | null = null
  let item2: InventoryItem | null = null

  if (itemsMode === 'random') {
    // Random number of items: 0, 1, or 2 (for slots 3 and 4)
    const itemCount = Math.floor(Math.random() * 3) // 0, 1, or 2
    if (itemCount >= 1) {
      const chosen = pickRandom(LOOT_ITEMS)
      item1 = makeItem(chosen, 'common', locale)
    }
    if (itemCount >= 2) {
      const remaining = LOOT_ITEMS.filter(i => i.name !== (item1 ? (locale === 'it' ? LOOT_ITEMS.find(x => x.nameIT === item1!.name)?.name : item1?.name) : ''))
      const chosen = pickRandom(remaining.length > 0 ? remaining : LOOT_ITEMS)
      item2 = makeItem(chosen, 'common', locale)
    }
  }

  return [weapon, armor, item1, item2]
}

/**
 * Pick a random loot item (consumable or misc) for the loot panel during session.
 */
export function pickRandomLoot(rarity: ItemRarity, locale: string): InventoryItem {
  const chosen = pickRandom(LOOT_ITEMS)
  return makeItem(chosen, rarity, locale)
}

export function createCustomItem(
  name: string, type: ItemType, rarity: ItemRarity, emoji: string, description: string
): InventoryItem {
  return { id: uuidv4(), name, type, rarity, emoji, description }
}

export function getDefaultEmoji(type: ItemType): string {
  return TYPE_CONFIG[type].emoji
}
