import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PlayerArchetype, PlayerClass } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Archetype labels are now served via i18n (t('archetypes.<key>'))
// kept here as a fallback for non-React contexts
export const ARCHETYPE_LABELS_FALLBACK: Record<PlayerArchetype, string> = {
  shy_beginner: 'Shy Beginner',
  chaotic_roleplayer: 'Chaotic Roleplayer',
  tactical_veteran: 'Tactical Veteran',
  distracted_casual: 'Casual Gamer',
  lore_addict: 'Lore Addict',
  impatient_powergamer: 'Impatient Powergamer',
  method_actor: 'Method Actor',
  rules_lawyer: 'Rules Lawyer',
}

export const ARCHETYPE_ICONS: Record<PlayerArchetype, string> = {
  shy_beginner: '🌱',
  chaotic_roleplayer: '🎲',
  tactical_veteran: '⚔️',
  distracted_casual: '📱',
  lore_addict: '📚',
  impatient_powergamer: '💥',
  method_actor: '🎭',
  rules_lawyer: '📜',
}

export const CLASS_ICONS: Record<PlayerClass, string> = {
  Fighter: '⚔️',
  Wizard: '🔮',
  Rogue: '🗡️',
  Cleric: '✨',
  Ranger: '🏹',
  Paladin: '🛡️',
  Barbarian: '🪓',
  Bard: '🎸',
  Druid: '🌿',
  Warlock: '👁️',
  Sorcerer: '⚡',
  Monk: '👊',
}

export const PLAYER_COLORS = [
  '#00e5ff', // cyan
  '#00ff87', // emerald
  '#ff6b6b', // coral
  '#ffd93d', // gold
  '#c77dff', // purple
  '#ff9a3c', // amber
]

export function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function getScoreColor(score: number): string {
  if (score >= 8) return '#00ff87'
  if (score >= 6) return '#ffd93d'
  if (score >= 4) return '#ff9a3c'
  return '#ff6b6b'
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return 'Legendary'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Good'
  if (score >= 6) return 'Decent'
  if (score >= 5) return 'Average'
  if (score >= 4) return 'Needs Work'
  return 'Poor'
}
