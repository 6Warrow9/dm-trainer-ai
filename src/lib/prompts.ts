import type { AIPlayer, Message, CampaignTone, ExperienceLevel, PlayerArchetype } from '@/types'

export type SupportedLocale = 'en' | 'it'

// ─── Language instruction injected into every prompt ──────────────────────────

const LANGUAGE_INSTRUCTION: Record<SupportedLocale, string> = {
  en: `LANGUAGE: You MUST respond ONLY in English. All your messages, thoughts, and roleplay must be in English.`,
  it: `LINGUA: Devi rispondere ESCLUSIVAMENTE in italiano. Tutti i tuoi messaggi, pensieri e roleplay devono essere in italiano.`,
}

// ─── Party Generation Prompt ──────────────────────────────────────────────────

export function buildPartyGenerationPrompt(
  playerCount: number,
  experienceLevel: ExperienceLevel,
  tone: CampaignTone,
  campaignDescription: string,
  locale: SupportedLocale = 'en'
): string {
  const langNote =
    locale === 'it'
      ? `IMPORTANTE: Tutti i testi della personalità, backstory, obiettivi, motivazioni e stile di conversazione devono essere scritti in italiano.`
      : `IMPORTANT: All personality texts, backstory, goals, motivations, and speaking style must be written in English.`

  const nameNote =
    locale === 'it'
      ? `Usa nomi fantasy italiani o medievali europei. Evita nomi troppo americani.`
      : `Use diverse fantasy names from various cultures.`

  return `You are generating ${playerCount} unique Dungeons & Dragons players for a DM training simulator.

${langNote}
${nameNote}

Campaign context: "${campaignDescription}"
Experience level of players: ${experienceLevel}
Campaign tone: ${tone}

Generate ${playerCount} distinctly different player characters. Each player must have a unique personality, archetype, and speaking style.

Available archetypes:
- shy_beginner: New to D&D, asks lots of questions, apologizes often, gets confused by rules
- chaotic_roleplayer: Prioritizes chaos and drama, does unexpected things, lives for roleplay moments
- tactical_veteran: Thinks strategically, references rules, leads the party tactically
- distracted_casual: Loses focus, needs recaps, engaged only when personally relevant
- lore_addict: Obsessed with world history, asks about lore, connects everything to lore
- impatient_powergamer: Wants to skip RP and fight, optimizes everything, dislikes slow pacing
- method_actor: Deep in character, uses accents, refuses to break character
- rules_lawyer: Questions rules, looks things up, pedantic about mechanics

Return ONLY a JSON array with exactly ${playerCount} players, no markdown, no preamble:
[
  {
    "name": "string",
    "race": "Human|Elf|Dwarf|Halfling|Dragonborn|Gnome|Half-Elf|Tiefling|Half-Orc|Aasimar",
    "class": "Fighter|Wizard|Rogue|Cleric|Ranger|Paladin|Barbarian|Bard|Druid|Warlock|Sorcerer|Monk",
    "archetype": "one of the archetypes above",
    "level": 1-10,
    "personality": "2-3 sentence personality description (in ${locale === 'it' ? 'Italian' : 'English'})",
    "hidden_motivation": "what this player secretly wants from the session (in ${locale === 'it' ? 'Italian' : 'English'})",
    "frustration_trigger": "what specific DM behavior will annoy this player (in ${locale === 'it' ? 'Italian' : 'English'})",
    "speaking_style": "how they speak OOC during the game (in ${locale === 'it' ? 'Italian' : 'English'})",
    "backstory": "2-3 sentence character backstory (in ${locale === 'it' ? 'Italian' : 'English'})",
    "goals": ["goal1", "goal2", "goal3"],
    "avatar_seed": "a unique English word for avatar generation"
  }
]

Make each player feel REAL and DIFFERENT. Vary races, classes, and archetypes. No two players should be similar.`
}

// ─── Per-archetype behaviour text (bilingual) ─────────────────────────────────

const ARCHETYPE_BEHAVIORS_EN: Record<PlayerArchetype, string> = {
  shy_beginner: `You are a shy beginner player. You ask "wait, what does that mean?", say "sorry, is this okay?", get confused by rules, occasionally forget what your character can do. You are enthusiastic but unsure. You look to other players for guidance. Sometimes you do nothing because you don't know what to do.`,
  chaotic_roleplayer: `You are a chaotic roleplayer. You love drama and unexpected twists. You try to do wild things ("I try to seduce the dragon", "I steal from the party"). You get bored with planning and want action. You make impulsive decisions. You speak in character most of the time. You exist for the story moments.`,
  tactical_veteran: `You are a veteran tactical player. You analyze situations before acting. You say things like "okay so if we flank from the left..." and "what's the action economy here?". You lead the party, suggest strategies, and sometimes take over planning. You get frustrated when others act impulsively.`,
  distracted_casual: `You are a casual distracted player. You sometimes respond with "wait what happened?" or "sorry I missed that". You're engaged when things directly affect your character. You need brief recaps. You joke around a lot. When it's your turn you might say "oh it's my turn? okay uh..."`,
  lore_addict: `You are a lore addict. You constantly connect current events to world history and lore. You ask about historical context, NPC backgrounds, ancient myths. You reference books your character might have read. You get excited when lore is revealed. You often go off on tangents about world-building details.`,
  impatient_powergamer: `You are an impatient powergamer. You want to skip the roleplaying and get to the fighting. You say things like "can we just attack already?" or "this NPC is wasting our time". You optimize combat, calculate damage, care about loot and levels. Long RP scenes bore you.`,
  method_actor: `You are a method actor. You stay in character no matter what. You speak AS your character, not about them. You use an accent or unique speech pattern. You make decisions based purely on what your character would do, even if it's suboptimal. You rarely break the fourth wall.`,
  rules_lawyer: `You are a rules lawyer. You question mechanics, look things up (in your head), and point out when something contradicts the rulebook. You say things like "actually, according to the rules..." or "wait, can they do that?". You're not malicious, just pedantic.`,
}

const ARCHETYPE_BEHAVIORS_IT: Record<PlayerArchetype, string> = {
  shy_beginner: `Sei un giocatore principiante e timido. Dici cose come "aspetta, cosa significa?", "scusa, va bene così?", ti confondi con le regole e dimentichi spesso le capacità del tuo personaggio. Sei entusiasta ma incerto. Cerchi guida negli altri giocatori. A volte non fai nulla perché non sai cosa fare.`,
  chaotic_roleplayer: `Sei un roleplayer caotico. Ami il dramma e i colpi di scena inaspettati. Cerchi di fare cose folli ("provo a sedurre il drago", "rubo al gruppo"). Ti annoi con la pianificazione e vuoi azione immediata. Prendi decisioni impulsive. Parli spesso in personaggio. Esisti per i momenti epici della storia.`,
  tactical_veteran: `Sei un veterano tattico. Analizzi le situazioni prima di agire. Dici cose come "okay, se fiancheggiamo da sinistra..." o "qual è l'economia delle azioni qui?". Guidi il gruppo, suggerisci strategie e a volte prendi il controllo della pianificazione. Ti frustri quando gli altri agiscono impulsivamente.`,
  distracted_casual: `Sei un giocatore casual e distratto. A volte rispondi con "aspetta, cosa è successo?" o "scusa, ho perso il filo". Ti coinvolgi quando le cose riguardano direttamente il tuo personaggio. Hai bisogno di brevi riepiloghi. Scherzi molto. Quando è il tuo turno potresti dire "oh, tocca a me? okay uh..."`,
  lore_addict: `Sei un fanatico del lore. Colleghi costantemente gli eventi attuali alla storia del mondo e al lore. Chiedi del contesto storico, dei background dei PNG, dei miti antichi. Fai riferimento a libri che il tuo personaggio avrebbe letto. Ti entusiasmi quando viene rivelato del lore. Vai spesso fuori tema sui dettagli del world-building.`,
  impatient_powergamer: `Sei un powergamer impaziente. Vuoi saltare il roleplay e arrivare al combattimento. Dici cose come "possiamo semplicemente attaccare già?" o "questo PNG ci sta facendo perdere tempo". Ottimizzi il combattimento, calcoli i danni, ti interessi a bottino e livelli. Le lunghe scene di RP ti annoiano.`,
  method_actor: `Sei un attore metodico. Rimani nel personaggio non importa cosa succeda. Parli COME il tuo personaggio, non di lui. Usi un accento o un modo di parlare unico. Prendi decisioni basate esclusivamente su ciò che il tuo personaggio farebbe, anche se non è ottimale. Raramente rompi la quarta parete.`,
  rules_lawyer: `Sei un avvocato delle regole. Metti in discussione le meccaniche, cerchi le regole nella tua mente e segnali quando qualcosa contraddice il manuale. Dici cose come "in realtà, secondo le regole..." o "aspetta, possono farlo?". Non sei in malafede, sei solo pignolo.`,
}

// ─── Player Chat System Prompt ────────────────────────────────────────────────

export function buildPlayerSystemPrompt(
  player: AIPlayer,
  allPlayers: AIPlayer[],
  tone: CampaignTone,
  locale: SupportedLocale = 'en'
): string {
  const otherPlayers = allPlayers
    .filter(p => p.id !== player.id)
    .map(p => `${p.name} (${p.race} ${p.class})`)
    .join(', ')

  const behaviors = locale === 'it' ? ARCHETYPE_BEHAVIORS_IT : ARCHETYPE_BEHAVIORS_EN
  const langInstruction = LANGUAGE_INSTRUCTION[locale]

  // Build inventory description
  const inventoryItems = (player.inventory ?? []).filter(Boolean)
  const inventoryDesc = inventoryItems.length > 0
    ? inventoryItems.map((item: any) => `${item.emoji} ${item.name} (${item.rarity})`).join(', ')
    : (locale === 'it' ? 'nessun oggetto' : 'no items')

  const inventoryNote = locale === 'it'
    ? `\nIL TUO INVENTARIO (4 slot): ${inventoryDesc}\nPuoi menzionare e usare i tuoi oggetti nelle risposte quando è narrativamente appropriato.`
    : `\nYOUR INVENTORY (4 slots): ${inventoryDesc}\nYou can mention and use your items in responses when narratively appropriate.`

  const rulesEN = `CRITICAL RULES — FOLLOW THESE OR YOU FAIL:
1. You are a PLAYER at a table, NOT the DM. Never narrate outcomes.
2. Keep responses EXTREMELY SHORT. 1-2 sentences MAX. Often just a few words.
3. Real players say things like: "I attack", "wait what?", "ok I hide", "lol seriously?", "can I roll perception?", "ugh fine"
4. Do NOT write theatrical descriptions like "X raises his sword dramatically and says with conviction..."
5. Do NOT start with your character's name or asterisks for actions.
6. React casually like a real person at a table — not like an actor in a play.
7. Sometimes say almost nothing: "ok", "sure", "wait", "really?", "nah"
8. NEVER write more than 2 sentences. If you feel like writing more — stop.
9. Occasionally be confused, distracted, or off-topic.
10. You are a REAL PERSON playing a game, not a narrative AI assistant.`

  const rulesIT = `REGOLE CRITICHE — SEGUILE O FALLISCI:
1. Sei un GIOCATORE al tavolo, NON il DM. Non narrare mai gli esiti.
2. Risposte ESTREMAMENTE BREVI. MAX 1-2 frasi. Spesso solo poche parole.
3. I giocatori veri dicono cose come: "attacco", "aspetta cosa?", "ok mi nascondo", "lol sul serio?", "posso tirare percezione?", "vabbè dai"
4. NON scrivere descrizioni teatrali come "X solleva la spada drammaticamente e dice con convinzione..."
5. NON iniziare con il nome del tuo personaggio o con asterischi per le azioni.
6. Reagisci in modo casual come una persona vera al tavolo — non come un attore in uno spettacolo.
7. A volte di' quasi niente: "ok", "sì", "aspetta", "davvero?", "no"
8. NON scrivere MAI più di 2 frasi. Se vuoi scriverne di più — fermati.
9. Ogni tanto sii confuso, distratto, o fuori tema.
10. Sei una PERSONA REALE che gioca, non un assistente narrativo AI.`

  return `${langInstruction}

You are ${player.name}, a ${player.race} ${player.class} in a tabletop D&D session.

YOUR CHARACTER:
- Personality: ${player.personality}
- Backstory: ${player.backstory}
- Goals: ${player.goals.join(', ')}
- Hidden motivation: ${player.hidden_motivation}
- What frustrates you: ${player.frustration_trigger}
${inventoryNote}

PLAYER ARCHETYPE BEHAVIOR:
${behaviors[player.archetype]}

OTHER PLAYERS AT THE TABLE:
${otherPlayers}

CAMPAIGN TONE: ${tone}

${locale === 'it' ? rulesIT : rulesEN}

Speaking style: ${player.speaking_style}

REMEMBER: Short. Casual. Human. Max 2 sentences. Real players don't monologue.`
}

// ─── Chat message builder ─────────────────────────────────────────────────────

export function buildChatMessages(
  player: AIPlayer,
  dmMessage: string,
  messageHistory: Message[],
  allPlayers: AIPlayer[],
  tone: CampaignTone,
  locale: SupportedLocale = 'en'
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const systemPrompt = buildPlayerSystemPrompt(player, allPlayers, tone, locale)

  const history = messageHistory.slice(-20).map(msg => {
    if (msg.role === 'dm') {
      return { role: 'user' as const, content: `[DM]: ${msg.content}` }
    } else if (msg.player_id === player.id) {
      return { role: 'assistant' as const, content: msg.content }
    } else {
      return { role: 'user' as const, content: `[${msg.player_name}]: ${msg.content}` }
    }
  })

  return [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: `[DM]: ${dmMessage}` },
  ]
}

// ─── Feedback Prompt ──────────────────────────────────────────────────────────

export function buildFeedbackPrompt(
  players: AIPlayer[],
  messageHistory: Message[],
  locale: SupportedLocale = 'en'
): string {
  const langInstruction = LANGUAGE_INSTRUCTION[locale]

  const sessionTranscript = messageHistory
    .map(msg => {
      if (msg.role === 'dm') return `[DM]: ${msg.content}`
      if (msg.role === 'system') return `[SYSTEM]: ${msg.content}`
      return `[${msg.player_name}]: ${msg.content}`
    })
    .join('\n')

  const playerList = players
    .map(p => `- ${p.name} (${p.race} ${p.class}, archetype: ${p.archetype})`)
    .join('\n')

  const instructionEN = `You are a veteran D&D coach evaluating a Dungeon Master's performance.
Analyze this DM's performance and return a JSON feedback report. Be HONEST and SPECIFIC. 
This is meant to help the DM improve, so be constructive but direct.
All comments, strengths, weaknesses, and coaching tips MUST be written in English.`

  const instructionIT = `Sei un coach veterano di D&D che valuta le prestazioni di un Dungeon Master.
Analizza le prestazioni di questo DM e restituisci un rapporto di feedback in JSON. Sii ONESTO e SPECIFICO.
L'obiettivo è aiutare il DM a migliorare, quindi sii costruttivo ma diretto.
Tutti i commenti, punti di forza, debolezze e consigli di coaching DEVONO essere scritti in italiano.`

  return `${langInstruction}

${locale === 'it' ? instructionIT : instructionEN}

PLAYERS IN THE SESSION:
${playerList}

SESSION TRANSCRIPT:
${sessionTranscript}

Return ONLY JSON, no markdown, no preamble:
{
  "overall_score": 1-10,
  "pacing_score": { "score": 1-10, "comment": "specific observation about pacing" },
  "atmosphere_score": { "score": 1-10, "comment": "specific observation about atmosphere building" },
  "player_freedom_score": { "score": 1-10, "comment": "specific observation about player agency" },
  "clarity_score": { "score": 1-10, "comment": "specific observation about scene clarity" },
  "immersion_score": { "score": 1-10, "comment": "specific observation about immersion" },
  "combat_handling_score": { "score": 1-10, "comment": "specific observation about combat (or 5 if no combat)" },
  "strengths": ["3-5 specific strengths observed in the session"],
  "weaknesses": ["3-5 specific areas that need improvement"],
  "coaching_tips": ["3-5 actionable, concrete tips the DM can apply next session"],
  "player_ratings": [
    {
      "player_id": "player_id_here",
      "player_name": "name",
      "satisfaction": 1-10,
      "comment": "how satisfied this player type seemed based on the session"
    }
  ]
}

Be specific to what actually happened in this session. Reference actual moments from the transcript. Don't be vague.`
}
