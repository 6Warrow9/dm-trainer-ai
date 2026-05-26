import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { buildFeedbackPrompt, type SupportedLocale } from '@/lib/prompts'
import type { FeedbackPayload, FeedbackReport } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as FeedbackPayload
    const { session_id, players, message_history } = body
    const locale: SupportedLocale = body.locale ?? 'en'

    if (message_history.length < 3) {
      const msg =
        locale === 'it'
          ? 'Sessione troppo breve. Gioca una sessione più lunga prima!'
          : 'Session too short to evaluate. Have a longer session first!'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const prompt = buildFeedbackPrompt(players, message_history, locale)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1600,
    })

    const raw = completion.choices[0].message.content || '{}'
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const reportData = JSON.parse(cleaned)

    const report: FeedbackReport = {
      id: uuidv4(),
      session_id,
      created_at: new Date().toISOString(),
      ...reportData,
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 })
  }
}
