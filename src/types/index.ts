// ─── Inventory Types ──────────────────────────────────────────────────────────

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary'
export type ItemType = 'weapon' | 'armor' | 'magic' | 'consumable' | 'misc'

export interface InventoryItem {
  id: string
  name: string
  type: ItemType
  rarity: ItemRarity
  emoji: string
  description: string
  equipped?: boolean
}

export type InventorySlots = [
  InventoryItem | null,
  InventoryItem | null,
  InventoryItem | null,
  InventoryItem | null,
]

// ─── Core Player Types ──────────────────────────────────────────────────────

export type PlayerRace =
  | 'Human' | 'Elf' | 'Dwarf' | 'Halfling' | 'Dragonborn'
  | 'Gnome' | 'Half-Elf' | 'Tiefling' | 'Half-Orc' | 'Aasimar';

export type PlayerClass =
  | 'Fighter' | 'Wizard' | 'Rogue' | 'Cleric' | 'Ranger'
  | 'Paladin' | 'Barbarian' | 'Bard' | 'Druid' | 'Warlock' | 'Sorcerer' | 'Monk';

export type PlayerArchetype =
  | 'shy_beginner'
  | 'chaotic_roleplayer'
  | 'tactical_veteran'
  | 'distracted_casual'
  | 'lore_addict'
  | 'impatient_powergamer'
  | 'method_actor'
  | 'rules_lawyer';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'veteran';
export type CampaignTone = 'gritty' | 'heroic' | 'comedic' | 'horror' | 'political';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AIPlayer {
  id: string;
  session_id: string;
  name: string;
  race: PlayerRace;
  class: PlayerClass;
  archetype: PlayerArchetype;
  level: number;
  personality: string;
  hidden_motivation: string;
  frustration_trigger: string;
  speaking_style: string;
  backstory: string;
  goals: string[];
  relationships: Record<string, string>;
  avatar_seed: string;
  color: string;
  inventory: InventorySlots;
  created_at: string;
}

// ─── Session Types ────────────────────────────────────────────────────────────

export type SessionStatus = 'setup' | 'active' | 'ended';

export interface Session {
  id: string;
  user_id: string | null;
  title: string;
  campaign_description: string;
  tone: CampaignTone;
  difficulty: Difficulty;
  experience_level: ExperienceLevel;
  player_count: number;
  status: SessionStatus;
  locale: 'en' | 'it';
  created_at: string;
  updated_at: string;
}

// ─── Message Types ────────────────────────────────────────────────────────────

export type MessageRole = 'dm' | 'player' | 'system' | 'dice';

export interface Message {
  id: string;
  session_id: string;
  player_id: string | null;
  role: MessageRole;
  content: string;
  player_name?: string;
  player_class?: string;
  player_color?: string;
  // Dice roll fields (only when role === 'dice')
  dice_type?: string;
  dice_result?: number;
  dice_skill?: string | null;
  dice_reason?: string | null;
  dice_roller?: 'player' | 'dm' | null;
  dice_player_name?: string | null;
  created_at: string;
}

// ─── Feedback Types ───────────────────────────────────────────────────────────

export interface ScoreCategory {
  label: string;
  score: number;
  comment: string;
}

export interface FeedbackReport {
  id: string;
  session_id: string;
  overall_score: number;
  pacing_score: ScoreCategory;
  atmosphere_score: ScoreCategory;
  player_freedom_score: ScoreCategory;
  clarity_score: ScoreCategory;
  immersion_score: ScoreCategory;
  combat_handling_score: ScoreCategory;
  strengths: string[];
  weaknesses: string[];
  coaching_tips: string[];
  player_ratings: PlayerRating[];
  created_at: string;
}

export interface PlayerRating {
  player_id: string;
  player_name: string;
  satisfaction: number;
  comment: string;
}

// ─── API Payload Types ─────────────────────────────────────────────────────────

export interface GeneratePartyPayload {
  session_id: string;
  player_count: number;
  experience_level: ExperienceLevel;
  tone: CampaignTone;
  campaign_description: string;
}

export interface ChatPayload {
  session_id: string;
  dm_message: string;
  players: AIPlayer[];
  message_history: Message[];
  locale: 'en' | 'it';
}

export interface FeedbackPayload {
  session_id: string;
  players: AIPlayer[];
  message_history: Message[];
  locale: 'en' | 'it';
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export interface SessionSetupForm {
  title: string;
  campaign_description: string;
  tone: CampaignTone;
  difficulty: Difficulty;
  experience_level: ExperienceLevel;
  player_count: number;
}
