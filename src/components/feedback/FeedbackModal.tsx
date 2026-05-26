'use client'

import { motion } from 'framer-motion'
import { X, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, RotateCcw, Star, UserPlus, Dice6 } from 'lucide-react'
import type { FeedbackReport, AIPlayer } from '@/types'
import { getScoreColor } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

interface FeedbackModalProps {
  feedback: FeedbackReport | null
  isLoading: boolean
  players: AIPlayer[]
  isGuest?: boolean
  onClose: () => void
  onNewSession: () => void
  onSignUp?: () => void
}

function getDMRank(score: number, t: (k: string) => string): string {
  if (score >= 9) return t('feedback.dmRanks.legendary')
  if (score >= 8) return t('feedback.dmRanks.excellent')
  if (score >= 7) return t('feedback.dmRanks.good')
  if (score >= 6) return t('feedback.dmRanks.decent')
  if (score >= 5) return t('feedback.dmRanks.average')
  return t('feedback.dmRanks.poor')
}

// ─── Guest signup banner ──────────────────────────────────────────────────────
function GuestSignupBanner({ locale, onSignUp }: { locale: string; onSignUp?: () => void }) {
  const isIT = locale === 'it'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-sm border p-5 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(0,229,255,0.08) 0%, rgba(0,255,135,0.05) 100%)',
        borderColor: 'rgba(0,229,255,0.3)',
        boxShadow: '0 0 30px rgba(0,229,255,0.08)',
      }}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-sm bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
        <Dice6 className="w-6 h-6 text-cyan-400" />
      </div>

      <h3 className="font-display text-lg font-bold text-white mb-2">
        {isIT ? '🎲 Hai completato la tua sessione ospite!' : '🎲 You completed your guest session!'}
      </h3>

      <p className="text-sm text-[#6b8fa0] leading-relaxed mb-4">
        {isIT
          ? 'Registrati gratuitamente e ottieni altre 5 sessioni beta — salva i tuoi punteggi e partecipa al ranking globale!'
          : 'Sign up for free and get 5 more beta sessions — save your scores and join the global ranking!'
        }
      </p>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: '🎲', label: isIT ? '5 sessioni gratis' : '5 free sessions' },
          { icon: '📊', label: isIT ? 'Storico voti' : 'Score history' },
          { icon: '🏆', label: isIT ? 'Ranking globale' : 'Global ranking' },
        ].map(item => (
          <div key={item.label} className="p-2 rounded-sm border border-cyan-500/15 bg-cyan-500/5">
            <div className="text-xl mb-1">{item.icon}</div>
            <div className="text-[10px] text-[#6b8fa0]">{item.label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onSignUp}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 transition-all glow-cyan"
      >
        <UserPlus className="w-4 h-4" />
        {isIT ? 'Registrati Gratis →' : 'Sign Up Free →'}
      </button>

      <p className="text-[10px] text-[#6b8fa0] mt-2">
        {isIT ? 'Nessuna carta di credito richiesta' : 'No credit card required'}
      </p>
    </motion.div>
  )
}

export default function FeedbackModal({
  feedback, isLoading, players, isGuest, onClose, onNewSession, onSignUp,
}: FeedbackModalProps) {
  const { t, locale } = useI18n()

  const scoreCategories = feedback
    ? [
        { key: 'pacing', label: t('feedback.categories.pacing'), data: feedback.pacing_score },
        { key: 'atmosphere', label: t('feedback.categories.atmosphere'), data: feedback.atmosphere_score },
        { key: 'playerFreedom', label: t('feedback.categories.playerFreedom'), data: feedback.player_freedom_score },
        { key: 'clarity', label: t('feedback.categories.clarity'), data: feedback.clarity_score },
        { key: 'immersion', label: t('feedback.categories.immersion'), data: feedback.immersion_score },
        { key: 'combat', label: t('feedback.categories.combat'), data: feedback.combat_handling_score },
      ]
    : []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-sm border border-cyan-500/20"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-6" />
            <h3 className="font-display text-xl font-bold text-white mb-2">{t('feedback.loading.title')}</h3>
            <p className="text-[#6b8fa0] text-sm">{t('feedback.loading.subtitle')}</p>
          </div>
        ) : feedback ? (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/10">
              <div>
                <div className="text-xs text-cyan-400 uppercase tracking-widest mb-1">{t('feedback.sectionComplete')}</div>
                <h2 className="font-display text-2xl font-bold text-white">{t('feedback.title')}</h2>
              </div>
              <button onClick={onClose} className="text-[#6b8fa0] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Guest signup banner — shown FIRST for guests */}
              {isGuest && (
                <GuestSignupBanner locale={locale} onSignUp={onSignUp} />
              )}

              {/* Overall Score */}
              <div
                className="flex items-center justify-between p-6 rounded-sm fantasy-border"
                style={{
                  background: `${getScoreColor(feedback.overall_score)}10`,
                  borderColor: `${getScoreColor(feedback.overall_score)}30`,
                }}
              >
                <div>
                  <div className="text-xs text-[#6b8fa0] uppercase tracking-wider mb-1">{t('feedback.overallScore')}</div>
                  <div className="font-display text-6xl font-black" style={{ color: getScoreColor(feedback.overall_score) }}>
                    {feedback.overall_score}
                    <span className="text-xl text-[#6b8fa0] font-normal ml-1">/ 10</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-bold text-white">{getDMRank(feedback.overall_score, t)}</div>
                  <div className="flex mt-2 gap-1 justify-end">
                    {Array(10).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{
                          background: i < feedback.overall_score
                            ? getScoreColor(feedback.overall_score)
                            : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Score Categories */}
              <div>
                <div className="grid grid-cols-1 gap-3">
                  {scoreCategories.map(({ label, data }) => (
                    <div key={label} className="p-4 rounded-sm border border-white/5 bg-white/2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{label}</span>
                        <span className="font-display font-bold text-base" style={{ color: getScoreColor(data.score) }}>
                          {data.score}/10
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${data.score * 10}%` }}
                          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: getScoreColor(data.score) }}
                        />
                      </div>
                      <p className="text-xs text-[#6b8fa0]">{data.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              {feedback.strengths?.length > 0 && (
                <div>
                  <h3 className="text-xs text-[#6b8fa0] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    {t('feedback.strengths')}
                  </h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#c8d8e0] p-3 rounded-sm bg-emerald-500/5 border border-emerald-500/15">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {feedback.weaknesses?.length > 0 && (
                <div>
                  <h3 className="text-xs text-[#6b8fa0] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    {t('feedback.weaknesses')}
                  </h3>
                  <ul className="space-y-2">
                    {feedback.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#c8d8e0] p-3 rounded-sm bg-amber-500/5 border border-amber-500/15">
                        <span className="text-amber-400 mt-0.5">!</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Coaching Tips */}
              {feedback.coaching_tips?.length > 0 && (
                <div>
                  <h3 className="text-xs text-[#6b8fa0] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                    {t('feedback.coachingTips')}
                  </h3>
                  <ul className="space-y-2">
                    {feedback.coaching_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#c8d8e0] p-3 rounded-sm bg-cyan-500/5 border border-cyan-500/15">
                        <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Player Ratings */}
              {feedback.player_ratings?.length > 0 && (
                <div>
                  <h3 className="text-xs text-[#6b8fa0] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                    {t('feedback.playerSatisfaction')}
                  </h3>
                  <div className="space-y-2">
                    {feedback.player_ratings.map(rating => {
                      const player = players.find(p => p.id === rating.player_id)
                      return (
                        <div key={rating.player_id} className="p-3 rounded-sm border border-white/5 bg-white/2 flex items-start gap-3">
                          <div
                            className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-display font-bold flex-shrink-0"
                            style={{
                              background: `${player?.color || '#00e5ff'}20`,
                              border: `1px solid ${player?.color || '#00e5ff'}40`,
                              color: player?.color || '#00e5ff',
                            }}
                          >
                            {rating.player_name[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-white">{rating.player_name}</span>
                              <span className="text-sm font-bold" style={{ color: getScoreColor(rating.satisfaction) }}>
                                {rating.satisfaction}/10
                              </span>
                            </div>
                            <p className="text-xs text-[#6b8fa0]">{rating.comment}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-cyan-500/10">
                {!isGuest && (
                  <button
                    onClick={onNewSession}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('feedback.actions.newSession')}
                  </button>
                )}
                {isGuest && (
                  <button
                    onClick={onSignUp}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    {locale === 'it' ? 'Registrati Gratis' : 'Sign Up Free'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-sm text-[#6b8fa0] border border-white/10 rounded-sm hover:text-white hover:border-white/20 transition-all"
                >
                  {t('feedback.actions.continueSession')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-[#6b8fa0]">{t('feedback.error')}</p>
            <button onClick={onClose} className="mt-4 text-sm text-cyan-400">{t('common.close')}</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
