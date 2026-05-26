import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import type { AIPlayer, InventoryItem } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export interface InventoryChange {
  player_id: string
  action: 'add' | 'remove' | 'swap'
  // Item to add (new item found/received)
  item_added?: InventoryItem
  // Name of item to remove (dropped/discarded)
  item_removed_name?: string
  // Slot index to remove (-1 = auto-detect by name)
  slot_to_free?: number
}

export interface UpdateInventoryPayload {
  players: AIPlayer[]
  // The DM message that triggered the scene
  dm_message: string
  // All player responses from this round
  player_responses: Array<{ player_id: string; player_name: string; content: string }>
  locale: 'en' | 'it'
}

export async function POST(req: NextRequest) {
  try {
    const body: UpdateInventoryPayload = await req.json()
    const { players, dm_message, player_responses, locale } = body

    if (!player_responses || player_responses.length === 0) {
      return NextResponse.json({ changes: [] })
    }

    // Build a summary of current inventories
    const inventorySummary = players.map(p => {
      const items = p.inventory
        .map((item, idx) => item ? `slot${idx + 1}: ${item.name}` : `slot${idx + 1}: empty`)
        .join(', ')
      return `${p.name} (${p.class}): [${items}]`
    }).join('\n')

    // Build transcript of what happened
    const transcript = player_responses
      .map(r => `${r.player_name}: ${r.content}`)
      .join('\n')

    const promptEN = `You are analyzing a D&D session to detect inventory changes.

DM said: "${dm_message}"

Current player inventories:
${inventorySummary}

Player responses:
${transcript}

Detect if any player explicitly:
1. PICKED UP or COLLECTED an item (found money, grabbed an object, looted something)
2. DROPPED, DISCARDED, or LEFT BEHIND an item
3. SWAPPED an item (dropped one to pick up another)

Rules:
- Only detect EXPLICIT actions, not hypothetical or planned
- If inventory has a free slot, an ADD action fills it
- If inventory is FULL and player picks something up, they must drop something — detect what they drop
- For coins/gold found, create a "Gold Coins" misc item
- For generic objects (branch, stone, etc.) create a misc item with appropriate emoji
- Keep item names SHORT (1-3 words max)
- If nothing inventory-related happened, return empty changes array

Return ONLY JSON, no markdown:
{
  "changes": [
    {
      "player_id": "exact player id from the list",
      "action": "add" | "remove" | "swap",
      "item_added": {
        "name": "short item name",
        "type": "weapon|armor|magic|consumable|misc",
        "rarity": "common",
        "emoji": "appropriate emoji",
        "description": "one sentence description"
      },
      "item_removed_name": "exact name of item dropped (if swap or remove)"
    }
  ]
}

Player IDs for reference:
${players.map(p => `${p.name}: "${p.id}"`).join('\n')}`

    const promptIT = `Stai analizzando una sessione D&D per rilevare cambiamenti all'inventario.

Il DM ha detto: "${dm_message}"

Inventari attuali dei giocatori:
${inventorySummary}

Risposte dei giocatori:
${transcript}

Rileva se qualche giocatore ha esplicitamente:
1. RACCOLTO o PRESO un oggetto (trovato monete, afferrato qualcosa, saccheggiato)
2. LASCIATO, SCARTATO o ABBANDONATO un oggetto
3. SCAMBIATO un oggetto (lasciato uno per prenderne un altro)

Regole:
- Rileva solo azioni ESPLICITE, non ipotetiche o pianificate
- Se l'inventario ha uno slot libero, un'azione ADD lo riempie
- Se l'inventario è PIENO e il giocatore raccoglie qualcosa, deve lasciare qualcosa — rileva cosa lascia
- Per monete/oro trovati, crea un oggetto misc "Monete d'Oro"
- Per oggetti generici (ramo, pietra, ecc.) crea un oggetto misc con emoji appropriata
- Mantieni i nomi degli oggetti BREVI (1-3 parole max)
- Se non è successo nulla legato all'inventario, restituisci array changes vuoto

Restituisci SOLO JSON, senza markdown:
{
  "changes": [
    {
      "player_id": "id esatto del giocatore dalla lista",
      "action": "add" | "remove" | "swap",
      "item_added": {
        "name": "nome breve oggetto",
        "type": "weapon|armor|magic|consumable|misc",
        "rarity": "common",
        "emoji": "emoji appropriata",
        "description": "descrizione in una frase"
      },
      "item_removed_name": "nome esatto dell'oggetto lasciato (se swap o remove)"
    }
  ]
}

ID giocatori per riferimento:
${players.map(p => `${p.name}: "${p.id}"`).join('\n')}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: locale === 'it' ? promptIT : promptEN }],
      temperature: 0.1,
      max_tokens: 400,
    })

    const raw = completion.choices[0].message.content || '{"changes":[]}'
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)

    // Attach IDs to any new items
    const changes: InventoryChange[] = (result.changes || []).map((c: any) => ({
      ...c,
      item_added: c.item_added ? { ...c.item_added, id: uuidv4() } : undefined,
    }))

    return NextResponse.json({ changes })
  } catch (error) {
    console.error('Update inventory error:', error)
    // Fail silently — inventory detection is optional
    return NextResponse.json({ changes: [] })
  }
}
