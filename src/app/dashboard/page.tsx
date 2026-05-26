'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sword, ChevronRight, Dice6, Plus, Minus, ArrowLeft, Package, Users } from 'lucide-react'
import type { SessionSetupForm, CampaignTone, Difficulty, ExperienceLevel, AIPlayer, InventorySlots } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import GearSetup from '@/components/session/GearSetup'
import { useAuth } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const { t, tObject, locale } = useI18n()
  const { user, profile } = useAuth()

  // Step 1 = session config, Step 2 = inventory setup
  const [step, setStep] = useState<1 | 2>(1)
  const [generatedPlayers, setGeneratedPlayers] = useState<AIPlayer[]>([])
  const [isGeneratingParty, setIsGeneratingParty] = useState(false)
  const [sessionId] = useState(() => uuidv4())

  const [form, setForm] = useState<SessionSetupForm>({
    title: '',
    campaign_description: '',
    tone: 'heroic',
    difficulty: 'medium',
    experience_level: 'intermediate',
    player_count: 4,
  })
  const [isLoading, setIsLoading] = useState(false)

  type ToneOption = { label: string; desc: string }
  type DiffOption = { label: string; desc: string }
  type ExpOption  = { label: string; desc: string }

  const toneOptions   = tObject<Record<CampaignTone, ToneOption>>('dashboard.toneField.options') ?? {} as Record<CampaignTone, ToneOption>
  const diffOptions   = tObject<Record<Difficulty, DiffOption>>('dashboard.difficultyField.options') ?? {} as Record<Difficulty, DiffOption>
  const expOptions    = tObject<Record<ExperienceLevel, ExpOption>>('dashboard.experienceField.options') ?? {} as Record<ExperienceLevel, ExpOption>
  const exampleCampaigns: string[] = tObject<string[]>('dashboard.descriptionField.exampleCampaigns') ?? []

  const TONE_ICONS: Record<CampaignTone, string> = {
    heroic: '⚔️', gritty: '🩸', comedic: '🎭', horror: '💀', political: '👑',
  }
  const TONES: CampaignTone[] = ['heroic', 'gritty', 'comedic', 'horror', 'political']
  const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
  const EXPERIENCE_LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'veteran']

  // Step 1 → generate party preview and move to inventory step
  const handleSubmit = async () => {
    if (!form.campaign_description.trim()) {
      alert(t('dashboard.validation.descriptionRequired'))
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/generate-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          player_count: form.player_count,
          experience_level: form.experience_level,
          tone: form.tone,
          campaign_description: form.campaign_description,
          locale,
        }),
      })
      const data = await res.json()
      // Give each player an empty 4-slot inventory
      const players: AIPlayer[] = data.players.map((p: AIPlayer) => ({
        ...p,
        inventory: [null, null, null, null] as InventorySlots,
      }))
      setGeneratedPlayers(players)
      setStep(2)
    } catch (err) {
      console.error(err)
      alert('Error generating party. Check your API key.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 → save everything and start session
  const handleStartSession = () => {
    const sessionData = {
      id: sessionId,
      ...form,
      title: form.title || t('dashboard.defaultTitle', { date: new Date().toLocaleDateString() }),
      status: 'setup',
      created_at: new Date().toISOString(),
      locale,
    }
    sessionStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData))
    // Save players with inventories
    sessionStorage.setItem(`players_${sessionId}`, JSON.stringify(generatedPlayers))
    router.push(`/session/${sessionId}`)
  }

  // Show step 2 — inventory configuration
  if (step === 2) {
    return (
      <InventoryStepPage
        players={generatedPlayers}
        locale={locale}
        sessionTitle={form.title}
        onUpdate={setGeneratedPlayers}
        onBack={() => setStep(1)}
        onStart={handleStartSession}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#000508]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-emerald-500/4 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-cyan-500/10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[#6b8fa0] hover:text-cyan-400 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
        <div className="flex items-center gap-2">
          <Dice6 className="w-5 h-5 text-cyan-400" />
          <span className="font-display text-sm font-bold text-white tracking-widest uppercase">{t('common.appName')}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          {user ? (
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-cyan-500/25 rounded text-cyan-400 hover:bg-cyan-500/10 transition-all"
            >
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-[10px]">
                {(profile?.display_name ?? user.email ?? 'DM')[0].toUpperCase()}
              </span>
              {profile?.display_name ?? 'Profilo'}
            </button>
          ) : (
            <button
              onClick={() => router.push('/auth')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-cyan-500/25 rounded text-[#6b8fa0] hover:text-white hover:border-cyan-500/40 transition-all"
            >
              Accedi / Registrati
            </button>
          )}
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="text-xs text-cyan-400 uppercase tracking-widest">{t('dashboard.label')}</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">{t('dashboard.title')}</h1>
          <p className="text-[#6b8fa0] mt-2">{t('dashboard.subtitle')}</p>
        </motion.div>

        <div className="space-y-8">
          {/* Session Title */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="block text-xs text-[#6b8fa0] uppercase tracking-wider mb-3">
              {t('dashboard.titleField.label')} <span className="text-white/30">{t('dashboard.titleField.optional')}</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('dashboard.titleField.placeholder')}
              className="w-full bg-[#000d14] border border-cyan-500/15 rounded-sm px-4 py-3 text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/40 transition-colors"
            />
          </motion.div>

          {/* Campaign Description */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label className="block text-xs text-[#6b8fa0] uppercase tracking-wider mb-3">
              {t('dashboard.descriptionField.label')} <span className="text-red-400">{t('dashboard.descriptionField.required')}</span>
            </label>
            <textarea
              value={form.campaign_description}
              onChange={e => setForm(prev => ({ ...prev, campaign_description: e.target.value }))}
              placeholder={t('dashboard.descriptionField.placeholder')}
              rows={4}
              className="w-full bg-[#000d14] border border-cyan-500/15 rounded-sm px-4 py-3 text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/40 transition-colors resize-none"
            />
            <div className="mt-3">
              <p className="text-xs text-[#6b8fa0] mb-2">{t('dashboard.descriptionField.examples')}</p>
              <div className="flex flex-wrap gap-2">
                {exampleCampaigns.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setForm(prev => ({ ...prev, campaign_description: ex }))}
                    className="text-xs px-3 py-1.5 border border-cyan-500/15 rounded-sm text-[#6b8fa0] hover:text-cyan-400 hover:border-cyan-500/35 transition-all"
                  >
                    {t('dashboard.descriptionField.exampleButton', { n: String(i + 1) })}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Campaign Tone */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className="block text-xs text-[#6b8fa0] uppercase tracking-wider mb-3">
              {t('dashboard.toneField.label')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {TONES.map(tone => (
                <button
                  key={tone}
                  onClick={() => setForm(prev => ({ ...prev, tone }))}
                  className={`p-4 rounded-sm border text-left transition-all ${
                    form.tone === tone
                      ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                      : 'border-cyan-500/10 text-[#6b8fa0] hover:border-cyan-500/30 hover:text-white'
                  }`}
                >
                  <div className="text-xl mb-2">{TONE_ICONS[tone]}</div>
                  <div className="text-sm font-medium">{toneOptions[tone]?.label ?? tone}</div>
                  <div className="text-xs opacity-60 mt-0.5 hidden sm:block">{toneOptions[tone]?.desc}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Difficulty & Experience */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-xs text-[#6b8fa0] uppercase tracking-wider mb-3">
                {t('dashboard.difficultyField.label')}
              </label>
              <div className="space-y-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(prev => ({ ...prev, difficulty: d }))}
                    className={`w-full p-3 rounded-sm border text-left transition-all ${
                      form.difficulty === d
                        ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                        : 'border-cyan-500/10 text-[#6b8fa0] hover:border-cyan-500/30 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-medium">{diffOptions[d]?.label ?? d}</div>
                    <div className="text-xs opacity-60">{diffOptions[d]?.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#6b8fa0] uppercase tracking-wider mb-3">
                {t('dashboard.experienceField.label')}
              </label>
              <div className="space-y-2">
                {EXPERIENCE_LEVELS.map(e => (
                  <button
                    key={e}
                    onClick={() => setForm(prev => ({ ...prev, experience_level: e }))}
                    className={`w-full p-3 rounded-sm border text-left transition-all ${
                      form.experience_level === e
                        ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                        : 'border-cyan-500/10 text-[#6b8fa0] hover:border-cyan-500/30 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-medium">{expOptions[e]?.label ?? e}</div>
                    <div className="text-xs opacity-60">{expOptions[e]?.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Player Count */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <label className="block text-xs text-[#6b8fa0] uppercase tracking-wider mb-3">
              {t('dashboard.playerCountField.label')}
            </label>
            <div className="flex items-center gap-5">
              <button
                onClick={() => setForm(prev => ({ ...prev, player_count: Math.max(2, prev.player_count - 1) }))}
                className="w-10 h-10 rounded-sm border border-cyan-500/20 flex items-center justify-center text-[#6b8fa0] hover:text-white hover:border-cyan-500/40 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                {[2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => setForm(prev => ({ ...prev, player_count: n }))}
                    className={`w-10 h-10 rounded-sm border font-display font-bold text-sm transition-all ${
                      form.player_count === n
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-400 glow-cyan'
                        : 'border-cyan-500/15 text-[#6b8fa0] hover:border-cyan-500/30 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setForm(prev => ({ ...prev, player_count: Math.min(6, prev.player_count + 1) }))}
                className="w-10 h-10 rounded-sm border border-cyan-500/20 flex items-center justify-center text-[#6b8fa0] hover:text-white hover:border-cyan-500/40 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#6b8fa0] mt-2">
              {t('dashboard.playerCountField.hint', { count: String(form.player_count) })}
            </p>
          </motion.div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 text-base font-semibold text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-cyan"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {locale === 'it' ? 'Generazione gruppo...' : 'Generating party...'}
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  {locale === 'it' ? 'Genera Gruppo →' : 'Generate Party →'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ─── This component is only shown in step === 2 below ────────────────────────
// (kept in same file for simplicity)
function InventoryStepPage({
  players, locale, sessionTitle,
  onUpdate, onBack, onStart,
}: {
  players: AIPlayer[]
  locale: string
  sessionTitle: string
  onUpdate: (p: AIPlayer[]) => void
  onBack: () => void
  onStart: () => void
}) {
  const isIT = locale === 'it'
  return (
    <div className="min-h-screen bg-[#000508]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/4 rounded-full blur-3xl" />
      </div>
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-cyan-500/10">
        <button onClick={onBack} className="flex items-center gap-2 text-[#6b8fa0] hover:text-cyan-400 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          {isIT ? 'Indietro' : 'Back'}
        </button>
        <div className="flex items-center gap-2">
          <Dice6 className="w-5 h-5 text-cyan-400" />
          <span className="font-display text-sm font-bold text-white tracking-widest uppercase">DM Trainer AI</span>
        </div>
        <div className="w-20" />
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-[#6b8fa0] text-xs">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">✓</div>
            {isIT ? 'Configurazione' : 'Configuration'}
          </div>
          <div className="flex-1 h-px bg-cyan-500/20" />
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 font-bold text-[10px]">2</div>
            {isIT ? 'Inventario' : 'Inventory'}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-cyan-400" />
            <span className="text-xs text-cyan-400 uppercase tracking-widest">{isIT ? 'Passo 2 di 2' : 'Step 2 of 2'}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            {isIT ? 'Configura gli Inventari' : 'Configure Inventories'}
          </h1>
          <p className="text-[#6b8fa0] mt-2 text-sm">
            {isIT
              ? 'Assegna oggetti di partenza ai tuoi giocatori. Puoi lasciare gli slot vuoti o riempirli tutti.'
              : 'Assign starting items to your players. You can leave slots empty or fill them all.'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GearSetup players={players} locale={locale} onUpdate={onUpdate} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-3 py-4 text-base font-semibold text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 transition-all glow-cyan"
          >
            <Sword className="w-5 h-5" />
            {isIT ? 'Inizia Sessione!' : 'Start Session!'}
            <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-center text-xs text-[#6b8fa0] mt-2">
            {isIT ? 'Puoi modificare gli inventari anche durante la sessione' : 'You can also modify inventories during the session'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
