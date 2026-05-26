import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import type { AIPlayer } from '@/types'

export interface StatChange {
  player_id: string
  hp_change: number       // negative = damage, positive = healing
  stamina_change: number  // negative = exhaustion, positive = rest
  reason: string
}

export interface UpdateStatsPayload {
  players: AIPlayer[]
  dm_message: string
  player_responses: Array<{ player_id: string; player_name: string; content: string }>
  locale: 'en' | 'it'
}

export async function POST(req: NextRequest) {
  try {
    const body: UpdateStatsPayload = await req.json()
    const { players, dm_message, player_responses, locale } = body

    if (!player_responses || player_responses.length === 0) {
      return NextResponse.json({ changes: [] })
    }

    // Build current stats summary
    const statsSummary = players.map(p =>
      `${p.name}: HP ${p.hp}/${p.max_hp}, Stamina ${p.stamina}/${p.max_stamina}`
    ).join('\n')

    const transcript = player_responses
      .map(r => `${r.player_name}: ${r.content}`)
      .join('\n')

    const promptEN = `You are a D&D rules expert analyzing a combat/action scene to determine HP and Stamina changes.

DM said: "${dm_message}"

Current player stats:
${statsSummary}

Player responses:
${transcript}

Detect ONLY explicit HP and Stamina changes. Rules:
- HP decreases: taking damage from attacks, traps, spells, falls, poison
- HP increases: healing potions, cure wounds spells, rest
- Stamina decreases: running, climbing, swimming, heavy physical exertion, casting many spells
- Stamina increases: short rest, catching breath, drinking water
- If nothing relevant happened to HP or Stamina, return empty changes array
- HP changes typically range from -5 to -30 for normal hits, -50 for critical/massive damage
- Stamina changes typically range from -5 to -15 for exertion, +10 to +20 for rest
- Do NOT invent damage if nothing happened — only detect clear events

Return ONLY JSON, no markdown:
{
  "changes": [
    {
      "player_id": "exact player id",
      "hp_change": 0,
      "stamina_change": -10,
      "reason": "brief reason in English"
    }
  ]
}

Player IDs:
${players.map(p => `${p.name}: "${p.id}"`).join('\n')}`

    const promptIT = `Sei un esperto di regole D&D che analizza una scena di combattimento/azione per determinare i cambiamenti di HP e Stamina.

Il DM ha detto: "${dm_message}"

Statistiche attuali dei giocatori:
${statsSummary}

Risposte dei giocatori:
${transcript}

Rileva SOLO cambiamenti espliciti di HP e Stamina. Regole:
- HP diminuisce: subire danni da attacchi, trappole, incantesimi, cadute, veleno
- HP aumenta: pozioni curative, incantesimi cura ferite, riposo
- Stamina diminuisce: correre, arrampicarsi, nuotare, sforzo fisico intenso, lanciare molti incantesimi
- Stamina aumenta: riposo breve, riprendere fiato, bere acqua
- Se non è successo niente di rilevante per HP o Stamina, restituisci array changes vuoto
- I cambiamenti HP vanno tipicamente da -5 a -30 per colpi normali, -50 per danni massicci
- I cambiamenti Stamina vanno da -5 a -15 per sforzo, +10 a +20 per riposo
- NON inventare danni se non è successo niente — rileva solo eventi chiari

Restituisci SOLO JSON, senza markdown:
{
  "changes": [
    {
      "player_id": "id esatto del giocatore",
      "hp_change": 0,
      "stamina_change": -10,
      "reason": "breve motivo in italiano"
    }
  ]
}

ID giocatori:
${players.map(p => `${p.name}: "${p.id}"`).join('\n')}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: locale === 'it' ? promptIT : promptEN }],
      temperature: 0.1,
      max_tokens: 300,
    })

    const raw = completion.choices[0].message.content || '{"changes":[]}'
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json({ changes: result.changes ?? [] })
  } catch (error) {
    console.error('Update stats error:', error)
    return NextResponse.json({ changes: [] })
  }
}
