import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { FeedbackReport } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { session_data, feedback, user_id } = body

    if (!user_id) {
      // Guest mode — don't save
      return NextResponse.json({ saved: false, reason: 'guest' })
    }

    // Use service role to bypass RLS for server-side inserts
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Save session
    const { data: savedSession, error: sessionError } = await supabase
      .from('sessions')
      .upsert({
        id: session_data.id,
        user_id,
        title: session_data.title,
        campaign_description: session_data.campaign_description,
        tone: session_data.tone,
        difficulty: session_data.difficulty,
        experience_level: session_data.experience_level,
        player_count: session_data.player_count,
        locale: session_data.locale ?? 'en',
        status: 'ended',
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Session save error:', sessionError)
      return NextResponse.json({ saved: false, error: sessionError.message })
    }

    // 2. Save feedback
    if (feedback) {
      const { error: feedbackError } = await supabase
        .from('feedback_reports')
        .upsert({
          id: feedback.id,
          session_id: session_data.id,
          user_id,
          overall_score: feedback.overall_score,
          pacing_score: feedback.pacing_score,
          atmosphere_score: feedback.atmosphere_score,
          player_freedom_score: feedback.player_freedom_score,
          clarity_score: feedback.clarity_score,
          immersion_score: feedback.immersion_score,
          combat_handling_score: feedback.combat_handling_score,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
          coaching_tips: feedback.coaching_tips,
          player_ratings: feedback.player_ratings,
        })

      if (feedbackError) {
        console.error('Feedback save error:', feedbackError)
      }

      // 3. Update profile stats
      await supabase.rpc('update_profile_stats', { p_user_id: user_id })
    }

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Save session error:', error)
    return NextResponse.json({ saved: false, error: 'Internal error' })
  }
}
