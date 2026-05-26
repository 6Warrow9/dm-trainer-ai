import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { buildChatMessages, type SupportedLocale } from '@/lib/prompts'
import type { ChatPayload, Message } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatPayload
    const { session_id, dm_message, players, message_history } = body
    const locale: SupportedLocale = body.locale ?? 'en'
    const tone = (req.headers.get('x-campaign-tone') as any) || 'heroic'

    const responses: Message[] = []

    for (const player of players) {
      // 90% chance each player responds (simulate occasional distraction)
      if (Math.random() < 0.1) continue

      const messages = buildChatMessages(
        player,
        dm_message,
        [...message_history, ...responses],
        players,
        tone,
        locale
      )

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.85,
          max_tokens: 200,
        })

        const content = completion.choices[0].message.content || ''
        if (content.trim()) {
          responses.push({
            id: uuidv4(),
            session_id,
            player_id: player.id,
            role: 'player',
            content: content.trim(),
            player_name: player.name,
            player_class: player.class,
            player_color: player.color,
            created_at: new Date().toISOString(),
          })
        }
      } catch (playerError) {
        console.error(`Error getting response from ${player.name}:`, playerError)
      }
    }

    return NextResponse.json({ responses })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to get player responses' }, { status: 500 })
  }
}
