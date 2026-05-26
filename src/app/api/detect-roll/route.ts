import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

export interface DiceDetectionResult {
  needsRoll: boolean
  diceType: DiceType | null
  reason: string | null
  skillOrStat: string | null
  // Who needs to roll — 'player' means a specific AI player, 'dm' means the DM rolled for the scene
  roller: 'player' | 'dm' | null
  playerName: string | null
}

export async function POST(req: NextRequest) {
  try {
    const { message, speaker, locale } = await req.json()
    // speaker = 'dm' | 'player'
    // message = the text to analyze

    const rulesBlock = locale === 'it'
      ? `Regole per scegliere il dado:
- d20: prove di abilità (percezione, persuasione, furtività, atletica, intimidazione, inganno, storia, arcano, religione, ecc.), tiri per colpire, tiri salvezza, prove di caratteristica
- d12: danno ascia bipenne, alcune abilità del barbaro
- d10: danno balestra/spada a due mani, alcune caratteristiche di classe
- d8: danno spada lunga/stocco, incantesimi curativi (cure ferite leggere), dadi vita chierico
- d6: danno spada corta/pugnale/freccia di fuoco, molti incantesimi offensivi, danni comuni
- d4: danno pugnale/dardo magico, incantesimi minori, dado ispirazione
- d100: ondata di magia selvaggia, tabelle casuali, percentuali`
      : `Rules for choosing the die:
- d20: skill checks (perception, persuasion, stealth, athletics, intimidation, deception, history, arcana, religion, etc.), attack rolls, saving throws, ability checks
- d12: greataxe damage, some barbarian features
- d10: crossbow/greatsword damage, some class features
- d8: longsword/rapier damage, healing spells (cure wounds), cleric hit dice
- d6: shortsword/dagger/firebolt damage, many offensive spells, common damage
- d4: dagger/magic missile damage, minor spells, inspiration die
- d100: wild magic surge, random tables, percentile rolls`

    const promptEN = `You are a D&D rules expert. Analyze this message spoken by a ${speaker === 'dm' ? 'Dungeon Master' : 'player'} and determine if it implies a dice roll is needed.

Message: "${message}"
Speaker: ${speaker === 'dm' ? 'Dungeon Master' : 'a player'}

${rulesBlock}

IMPORTANT LOGIC:
- If a PLAYER says they attempt something risky (attack, sneak, persuade, climb, pick a lock, cast a spell, etc.) → needsRoll = true, roller = "player", playerName = extract the player's name from context if possible
- If the DM describes a scene that requires players to roll (trap, saving throw, perception check) → needsRoll = true, roller = "player"
- If the DM describes a result that already happened → needsRoll = false
- Pure description, dialogue, planning, or reactions → needsRoll = false

Return ONLY a JSON object, no markdown:
{
  "needsRoll": true or false,
  "diceType": "d20" | "d12" | "d10" | "d8" | "d6" | "d4" | "d100" | null,
  "reason": "short explanation in English of why this roll is needed" or null,
  "skillOrStat": "specific skill or stat (e.g. Stealth, Persuasion, Strength, Attack Roll)" or null,
  "roller": "player" | "dm" | null,
  "playerName": "name of the player who needs to roll if identifiable" or null
}`

    const promptIT = `Sei un esperto di regole D&D. Analizza questo messaggio pronunciato da ${speaker === 'dm' ? 'un Dungeon Master' : 'un giocatore'} e determina se implica la necessità di un tiro di dado.

Messaggio: "${message}"
Chi parla: ${speaker === 'dm' ? 'Dungeon Master' : 'un giocatore'}

${rulesBlock}

LOGICA IMPORTANTE:
- Se un GIOCATORE dice che tenta qualcosa di rischioso (attaccare, sgattaiolare, persuadere, arrampicarsi, scassinare, lanciare un incantesimo, ecc.) → needsRoll = true, roller = "player", playerName = estrai il nome del giocatore se identificabile
- Se il DM descrive una scena che richiede ai giocatori di tirare (trappola, tiro salvezza, prova di percezione) → needsRoll = true, roller = "player"
- Se il DM descrive un risultato già avvenuto → needsRoll = false
- Descrizione pura, dialogo, pianificazione o reazioni → needsRoll = false

Restituisci SOLO un oggetto JSON, senza markdown:
{
  "needsRoll": true o false,
  "diceType": "d20" | "d12" | "d10" | "d8" | "d6" | "d4" | "d100" | null,
  "reason": "breve spiegazione in italiano del perché questo tiro è necessario" o null,
  "skillOrStat": "abilità o caratteristica specifica (es. Furtività, Persuasione, Forza, Tiro per Colpire)" o null,
  "roller": "player" | "dm" | null,
  "playerName": "nome del giocatore che deve tirare se identificabile" o null
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: locale === 'it' ? promptIT : promptEN }],
      temperature: 0.1,
      max_tokens: 180,
    })

    const raw = completion.choices[0].message.content || '{}'
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const result: DiceDetectionResult = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Dice detection error:', error)
    return NextResponse.json({
      needsRoll: false, diceType: null, reason: null,
      skillOrStat: null, roller: null, playerName: null,
    })
  }
}
