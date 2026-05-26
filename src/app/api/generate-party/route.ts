import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { buildPartyGenerationPrompt, type SupportedLocale } from '@/lib/prompts'
import { PLAYER_COLORS } from '@/lib/utils'
import type { GeneratePartyPayload, AIPlayer } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GeneratePartyPayload & { locale?: SupportedLocale }
    const { session_id, player_count, experience_level, tone, campaign_description } = body
    const locale: SupportedLocale = body.locale ?? 'en'

    const prompt = buildPartyGenerationPrompt(
      player_count,
      experience_level,
      tone,
      campaign_description,
      locale
    )

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 2200,
    })

    const raw = completion.choices[0].message.content || '[]'
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const playersData = JSON.parse(cleaned)

    const players: AIPlayer[] = playersData.map(
      (p: Omit<AIPlayer, 'id' | 'session_id' | 'color' | 'created_at' | 'relationships' | 'inventory'>, index: number) => ({
        ...p,
        id: uuidv4(),
        session_id,
        color: PLAYER_COLORS[index % PLAYER_COLORS.length],
        relationships: {},
        inventory: [null, null, null, null],
        hp: 100,
        max_hp: 100,
        stamina: 30,
        max_stamina: 30,
        created_at: new Date().toISOString(),
      })
    )

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Generate party error:', error)
    return NextResponse.json({ error: 'Failed to generate party' }, { status: 500 })
  }
}
