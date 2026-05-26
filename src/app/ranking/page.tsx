'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, ArrowLeft, Dice6, Medal, Star, TrendingUp, Crown, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { getScoreColor, getScoreLabel } from '@/lib/utils'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

interface RankingEntry {
  id: string
  display_name: string
  total_sessions: number
  avg_score: number
  best_score: number
}

const RANK_ICONS = ['👑', '🥈', '🥉']
const RANK_COLORS = ['#ffd93d', '#c0c0c0', '#cd7f32']

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <div className="w-8 h-8 flex items-center justify-center text-xl flex-shrink-0">
        {RANK_ICONS[rank - 1]}
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-sm border border-white/10 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-[#6b8fa0]">{rank}</span>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const color = getScoreColor(score)
  const pct = score / 10
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <motion.circle
          cx="24" cy="24" r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-black text-sm leading-none" style={{ color }}>{score.toFixed(1)}</span>
      </div>
    </div>
  )
}

export default function RankingPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    loadRanking()
  }, [user])

  const loadRanking = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, total_sessions, avg_score, best_score')
      .gt('total_sessions', 0)
      .order('avg_score', { ascending: false })
      .limit(100)

    if (data) {
      setRanking(data as RankingEntry[])
      if (user) {
        const rank = data.findIndex(d => d.id === user.id)
        if (rank !== -1) setMyRank(rank + 1)
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#000508]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-500/3 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-cyan-500/10">
        <button
          onClick={() => router.push(user ? '/profile' : '/dashboard')}
          className="flex items-center gap-2 text-[#6b8fa0] hover:text-cyan-400 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {user ? 'Profilo' : 'Dashboard'}
        </button>
        <div className="flex items-center gap-2">
          <Dice6 className="w-5 h-5 text-cyan-400" />
          <span className="font-display text-sm font-bold text-white tracking-widest uppercase">DM Trainer AI</span>
        </div>
        <LanguageSwitcher variant="compact" />
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-sm bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: '0 0 30px rgba(245,158,11,0.2)' }}>
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="font-display text-3xl font-black text-white">Ranking Globale</h1>
          <p className="text-[#6b8fa0] text-sm mt-2">
            I migliori Dungeon Master del mondo, classificati per media punteggio
          </p>
        </motion.div>

        {/* My rank banner */}
        {user && myRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-sm border border-cyan-500/30 bg-cyan-500/8 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-sm bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-display font-black text-cyan-400">
              {(profile?.display_name ?? 'DM')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">La tua posizione</div>
              <div className="text-xs text-[#6b8fa0]">{profile?.display_name}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-black text-cyan-400">#{myRank}</div>
              <div className="text-xs text-[#6b8fa0]">nel ranking</div>
            </div>
          </motion.div>
        )}

        {/* Top 3 podium */}
        {!isLoading && ranking.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {/* 2nd place */}
            <div className="flex flex-col items-center pt-4">
              <div className="text-2xl mb-2">🥈</div>
              <div
                className="w-full rounded-sm border p-3 text-center"
                style={{ borderColor: '#c0c0c040', background: '#c0c0c010', paddingTop: 12 }}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 font-display font-black text-white text-lg">
                  {ranking[1].display_name[0].toUpperCase()}
                </div>
                <div className="text-xs font-bold text-white truncate">{ranking[1].display_name}</div>
                <div className="font-display text-xl font-black mt-1" style={{ color: '#c0c0c0' }}>
                  {ranking[1].avg_score.toFixed(1)}
                </div>
                <div className="text-[10px] text-[#6b8fa0]">{ranking[1].total_sessions} sess.</div>
              </div>
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">👑</div>
              <div
                className="w-full rounded-sm border p-3 text-center"
                style={{ borderColor: '#ffd93d50', background: '#ffd93d10', boxShadow: '0 0 20px rgba(255,217,61,0.15)' }}
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2 font-display font-black text-amber-400 text-xl">
                  {ranking[0].display_name[0].toUpperCase()}
                </div>
                <div className="text-sm font-bold text-white truncate">{ranking[0].display_name}</div>
                <div className="font-display text-2xl font-black mt-1 text-glow-cyan" style={{ color: '#ffd93d' }}>
                  {ranking[0].avg_score.toFixed(1)}
                </div>
                <div className="text-[10px] text-[#6b8fa0]">{ranking[0].total_sessions} sess.</div>
              </div>
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center pt-8">
              <div className="text-2xl mb-2">🥉</div>
              <div
                className="w-full rounded-sm border p-3 text-center"
                style={{ borderColor: '#cd7f3240', background: '#cd7f3210' }}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 font-display font-black text-white text-lg">
                  {ranking[2].display_name[0].toUpperCase()}
                </div>
                <div className="text-xs font-bold text-white truncate">{ranking[2].display_name}</div>
                <div className="font-display text-xl font-black mt-1" style={{ color: '#cd7f32' }}>
                  {ranking[2].avg_score.toFixed(1)}
                </div>
                <div className="text-[10px] text-[#6b8fa0]">{ranking[2].total_sessions} sess.</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full ranking list */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-4 h-4 text-amber-400" />
            <h2 className="font-display text-sm font-bold text-white">Classifica Completa</h2>
            <span className="text-xs text-[#6b8fa0] ml-auto">{ranking.length} DM</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-[#000d14] rounded-sm border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-16 text-[#6b8fa0]">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nessun DM nel ranking ancora.</p>
              <p className="text-xs mt-1 opacity-60">Sii il primo! Completa una sessione e ricevi una valutazione.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ranking.map((entry, i) => {
                const isMe = user?.id === entry.id
                const color = getScoreColor(entry.avg_score)
                const rank = i + 1

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-sm border transition-all"
                    style={{
                      borderColor: isMe ? 'rgba(0,229,255,0.3)' : rank <= 3 ? `${RANK_COLORS[rank-1]}30` : 'rgba(255,255,255,0.06)',
                      background: isMe ? 'rgba(0,229,255,0.05)' : rank <= 3 ? `${RANK_COLORS[rank-1]}08` : 'transparent',
                    }}
                  >
                    <RankBadge rank={rank} />

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-sm flex items-center justify-center font-display font-black text-base flex-shrink-0"
                      style={{
                        background: isMe ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.06)',
                        border: isMe ? '1px solid rgba(0,229,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        color: isMe ? '#00e5ff' : '#c8d8e0',
                      }}
                    >
                      {entry.display_name[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isMe ? 'text-cyan-400' : 'text-white'}`}>
                          {entry.display_name}
                        </span>
                        {isMe && <span className="text-[10px] text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">Tu</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#6b8fa0]">{entry.total_sessions} sessioni</span>
                        <span className="text-[#6b8fa0] text-[10px]">·</span>
                        <span className="text-[10px]" style={{ color }}>
                          {getScoreLabel(entry.avg_score)} DM
                        </span>
                        {entry.best_score > 0 && (
                          <>
                            <span className="text-[#6b8fa0] text-[10px]">·</span>
                            <span className="text-[10px] text-[#6b8fa0]">
                              Miglior: <span style={{ color: getScoreColor(entry.best_score) }}>{entry.best_score.toFixed(1)}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <ScoreRing score={entry.avg_score} />
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
