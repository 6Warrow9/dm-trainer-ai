'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Dice6, Trophy, Star, TrendingUp, Calendar,
  LogOut, ChevronRight, BarChart2, Shield
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getScoreColor, getScoreLabel } from '@/lib/utils'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

interface SessionRecord {
  id: string
  title: string
  tone: string
  difficulty: string
  player_count: number
  created_at: string
  feedback: {
    overall_score: number
    pacing_score: { score: number }
    atmosphere_score: { score: number }
    player_freedom_score: { score: number }
    clarity_score: { score: number }
    immersion_score: { score: number }
    combat_handling_score: { score: number }
  } | null
}

// ─── Mini score bar ───────────────────────────────────────────────────────────
function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = getScoreColor(score)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[#6b8fa0] w-28 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="font-bold w-6 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

// ─── Score timeline chart (simple SVG) ───────────────────────────────────────
function ScoreChart({ sessions }: { sessions: SessionRecord[] }) {
  const scored = sessions.filter(s => s.feedback?.overall_score).reverse()
  if (scored.length < 2) return (
    <div className="flex items-center justify-center h-32 text-[#6b8fa0] text-sm">
      Serve almeno 2 sessioni valutate per il grafico
    </div>
  )

  const scores = scored.map(s => s.feedback!.overall_score)
  const min = Math.min(...scores, 0)
  const max = Math.max(...scores, 10)
  const W = 500
  const H = 120
  const pad = 20

  const points = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (W - pad * 2)
    const y = H - pad - ((s - min) / (max - min || 1)) * (H - pad * 2)
    return { x, y, score: s, date: scored[i].created_at }
  })

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ')

  const fillD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const avgColor = getScoreColor(avgScore)

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[2, 4, 6, 8, 10].map(v => {
          const y = H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2)
          return (
            <line key={v} x1={pad} y1={y} x2={W - pad} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          )
        })}
        {/* Area fill */}
        <path d={fillD} fill={`${avgColor}15`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={avgColor} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill={getScoreColor(p.score)}
              stroke="#000508" strokeWidth="2" />
          </g>
        ))}
      </svg>
      {/* Score labels */}
      <div className="flex justify-between mt-1 px-4">
        {points.map((p, i) => (
          <div key={i} className="text-center">
            <div className="text-xs font-bold" style={{ color: getScoreColor(p.score) }}>
              {p.score}
            </div>
            <div className="text-[9px] text-[#6b8fa0]">
              {new Date(p.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({ session }: { session: SessionRecord }) {
  const [expanded, setExpanded] = useState(false)
  const score = session.feedback?.overall_score
  const color = score ? getScoreColor(score) : '#6b8fa0'

  return (
    <motion.div
      layout
      className="rounded-sm border overflow-hidden transition-all"
      style={{ borderColor: score ? `${color}30` : 'rgba(255,255,255,0.08)' }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/2 transition-colors"
      >
        {/* Score badge */}
        <div
          className="w-12 h-12 rounded-sm flex flex-col items-center justify-center flex-shrink-0"
          style={{ background: score ? `${color}15` : 'rgba(255,255,255,0.05)', border: `1px solid ${score ? color + '40' : 'rgba(255,255,255,0.1)'}` }}
        >
          {score ? (
            <>
              <span className="font-display font-black text-lg leading-none" style={{ color }}>{score}</span>
              <span className="text-[9px] text-[#6b8fa0]">/10</span>
            </>
          ) : (
            <span className="text-[#6b8fa0] text-xs">N/A</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-bold text-white truncate">
            {session.title || 'Sessione senza titolo'}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[#6b8fa0] capitalize">{session.tone}</span>
            <span className="text-[#6b8fa0] text-[10px]">·</span>
            <span className="text-[10px] text-[#6b8fa0]">{session.player_count} giocatori</span>
            <span className="text-[#6b8fa0] text-[10px]">·</span>
            <span className="text-[10px] text-[#6b8fa0]">
              {new Date(session.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
          {score && (
            <div className="text-[10px] mt-0.5 font-medium" style={{ color }}>
              {getScoreLabel(score)} DM
            </div>
          )}
        </div>

        <ChevronRight className={`w-4 h-4 text-[#6b8fa0] flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && session.feedback && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-white/5 px-4 pb-4 pt-3 space-y-2"
        >
          <ScoreBar label="Ritmo" score={session.feedback.pacing_score.score} />
          <ScoreBar label="Atmosfera" score={session.feedback.atmosphere_score.score} />
          <ScoreBar label="Libertà Giocatori" score={session.feedback.player_freedom_score.score} />
          <ScoreBar label="Chiarezza" score={session.feedback.clarity_score.score} />
          <ScoreBar label="Immersione" score={session.feedback.immersion_score.score} />
          <ScoreBar label="Combattimento" score={session.feedback.combat_handling_score.score} />
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, signOut, isLoading: authLoading } = useAuth()
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }
    if (user) loadSessions()
  }, [user, authLoading])

  const loadSessions = async () => {
    const { data } = await supabase
      .from('sessions')
      .select(`
        id, title, tone, difficulty, player_count, created_at,
        feedback_reports (
          overall_score, pacing_score, atmosphere_score,
          player_freedom_score, clarity_score, immersion_score, combat_handling_score
        )
      `)
      .eq('user_id', user!.id)
      .eq('status', 'ended')
      .order('created_at', { ascending: false })

    if (data) {
      const mapped: SessionRecord[] = data.map((s: any) => ({
        ...s,
        feedback: s.feedback_reports?.[0] ?? null,
      }))
      setSessions(mapped)
    }
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-[#000508] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    )
  }

  const scoredSessions = sessions.filter(s => s.feedback?.overall_score)
  const avgScore = scoredSessions.length > 0
    ? (scoredSessions.reduce((acc, s) => acc + (s.feedback?.overall_score ?? 0), 0) / scoredSessions.length).toFixed(1)
    : null
  const bestScore = scoredSessions.length > 0
    ? Math.max(...scoredSessions.map(s => s.feedback?.overall_score ?? 0))
    : null

  return (
    <div className="min-h-screen bg-[#000508]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/4 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-cyan-500/10">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-[#6b8fa0] hover:text-cyan-400 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Dice6 className="w-5 h-5 text-cyan-400" />
          <span className="font-display text-sm font-bold text-white tracking-widest uppercase">DM Trainer AI</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="compact" />
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-[#6b8fa0] hover:text-red-400 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Esci
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-sm bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-2xl font-black text-cyan-400">
                {(profile?.display_name ?? user?.email ?? 'DM')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-white">{profile?.display_name ?? 'Dungeon Master'}</h1>
              <p className="text-[#6b8fa0] text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => router.push('/ranking')}
                  className="flex items-center gap-1.5 text-xs text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded hover:bg-amber-500/10 transition-all"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Ranking Globale
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded hover:bg-cyan-500/10 transition-all"
                >
                  <Dice6 className="w-3.5 h-3.5" />
                  Nuova Sessione
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            {
              icon: BarChart2,
              color: '#00e5ff',
              label: 'Sessioni Giocate',
              value: sessions.length,
              sub: 'totale',
            },
            {
              icon: Star,
              color: '#ffd93d',
              label: 'Media Voti',
              value: avgScore ?? '—',
              sub: avgScore ? getScoreLabel(parseFloat(avgScore)) : 'nessuna sessione',
            },
            {
              icon: TrendingUp,
              color: '#00ff87',
              label: 'Miglior Voto',
              value: bestScore ?? '—',
              sub: bestScore ? getScoreLabel(bestScore) + ' DM' : 'nessuna sessione',
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-sm border p-4 text-center"
              style={{ borderColor: `${stat.color}25`, background: `${stat.color}06` }}
            >
              <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
              <div className="font-display text-2xl font-black" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-[#6b8fa0] mt-0.5">{stat.label}</div>
              <div className="text-[10px] text-[#6b8fa0]/60 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Score chart */}
        {scoredSessions.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-sm border border-cyan-500/15 p-5 bg-[#000d14]"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="font-display text-sm font-bold text-white">Andamento Punteggi</h2>
            </div>
            <ScoreChart sessions={sessions} />
          </motion.div>
        )}

        {/* Session history */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h2 className="font-display text-sm font-bold text-white">Storico Sessioni</h2>
            <span className="text-xs text-[#6b8fa0] ml-auto">{sessions.length} sessioni</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-[#000d14] rounded-sm border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16 text-[#6b8fa0]">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nessuna sessione completata ancora.</p>
              <p className="text-xs mt-1 opacity-60">Gioca e valuta una sessione per vederla qui.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 px-5 py-2 text-sm text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/10 transition-all"
              >
                Inizia una sessione →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
