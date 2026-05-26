'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sword, Users, Brain, Star, ChevronRight, Zap, Shield, BookOpen, Dice6 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const FEATURE_ICONS = [Users, Brain, Star, Zap]
const FEATURE_COLORS = ['#00e5ff', '#00ff87', '#ffd93d', '#c77dff']

const ARCHETYPE_NAMES = [
  'Thorin Stonebreaker', 'Sylvara Moonwhisper', 'Pip Tumblebottom',
  'Marcus', 'Zara Duskfall', 'Derek',
]
const ARCHETYPE_RACES = ['Dwarf', 'Elf', 'Halfling', 'Human', 'Tiefling', 'Half-Elf']
const ARCHETYPE_CLASSES = ['Barbarian', 'Wizard', 'Rogue', 'Fighter', 'Warlock', 'Bard']
const ARCHETYPE_COLORS = ['#ff6b6b', '#00e5ff', '#00ff87', '#ffd93d', '#c77dff', '#ff9a3c']

export default function LandingPage() {
  const router = useRouter()
  const { t, tArray, tObject } = useI18n()

  type Step = { title: string; desc: string }
  type ArchetypeItem = { type: string; desc: string }
  type FeatureItem = { title: string; description: string }

  const steps = tObject<Step[]>('landing.howItWorks.steps') ?? []
  const archetypeItems = tObject<ArchetypeItem[]>('landing.players.archetypes') ?? []
  const featureItems = tObject<FeatureItem[]>('landing.features.items') ?? []
  const sampleTips = tArray('landing.evaluation.sampleTips')
  const evalCategories = tObject<Record<string, string>>('landing.evaluation.categories') ?? {}

  return (
    <div className="min-h-screen bg-[#000508] overflow-x-hidden">
      {/* Background ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-cyan-500/40 flex items-center justify-center glow-cyan">
            <Dice6 className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-widest uppercase">
            {t('common.appName')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="full" />
          <button
            onClick={() => router.push('/dashboard')}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 border border-cyan-500/30 rounded hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all duration-200"
          >
            {t('nav.openApp')}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-black bg-cyan-400 rounded hover:bg-cyan-300 transition-colors duration-200"
          >
            {t('nav.startTraining')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32">
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {t('landing.badge')}
        </motion.div>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-none mb-6"
        >
          {t('landing.heroTitle1')}
          <br />
          <span className="text-cyan-400 text-glow-cyan">{t('landing.heroTitle2')}</span>
          <br />
          {t('landing.heroTitle3')}
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="max-w-2xl text-lg md:text-xl text-[#6b8fa0] leading-relaxed mb-10"
        >
          {t('landing.heroSubtitle')}
        </motion.p>

        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="group flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 transition-all duration-200 glow-cyan"
          >
            <Sword className="w-5 h-5" />
            {t('landing.ctaPrimary')}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center justify-center gap-3 px-8 py-4 text-base font-medium text-cyan-400 border border-cyan-500/30 rounded-sm hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all duration-200">
            <BookOpen className="w-5 h-5" />
            {t('landing.ctaSecondary')}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-cyan-500/10 w-full max-w-2xl"
        >
          {[
            { value: '8', key: 'landing.stats.archetypes' },
            { value: '6', key: 'landing.stats.tones' },
            { value: '7', key: 'landing.stats.categories' },
            { value: '∞', key: 'landing.stats.sessions' },
          ].map(stat => (
            <div key={stat.key} className="text-center">
              <div className="font-display text-3xl font-bold text-cyan-400">{stat.value}</div>
              <div className="text-xs text-[#6b8fa0] mt-1 uppercase tracking-wider">{t(stat.key)}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 md:px-12 py-24 border-t border-cyan-500/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs text-cyan-400 uppercase tracking-widest">{t('landing.howItWorks.label')}</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">{t('landing.howItWorks.title')}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-sm p-6 fantasy-border"
              >
                <div className="font-display text-5xl font-black text-cyan-500/20 mb-4">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-[#6b8fa0] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Player Archetypes */}
      <section className="relative z-10 px-6 md:px-12 py-24 border-t border-cyan-500/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs text-cyan-400 uppercase tracking-widest">{t('landing.players.label')}</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">{t('landing.players.title')}</h2>
            <p className="text-[#6b8fa0] mt-4 max-w-xl mx-auto">{t('landing.players.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archetypeItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-card rounded-sm p-5 hover:border-white/20 transition-all duration-300 group cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-sm flex items-center justify-center text-xl font-display font-bold flex-shrink-0"
                    style={{ background: `${ARCHETYPE_COLORS[i]}20`, border: `1px solid ${ARCHETYPE_COLORS[i]}40`, color: ARCHETYPE_COLORS[i] }}
                  >
                    {ARCHETYPE_NAMES[i][0]}
                  </div>
                  <div>
                    <div className="font-display text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {ARCHETYPE_NAMES[i]}
                    </div>
                    <div className="text-xs text-[#6b8fa0] mt-0.5">
                      {ARCHETYPE_RACES[i]} · {ARCHETYPE_CLASSES[i]}
                    </div>
                    <div className="text-xs mt-1" style={{ color: ARCHETYPE_COLORS[i] }}>{item.type}</div>
                  </div>
                </div>
                <p className="text-sm text-[#8aa0b0] italic mt-4 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 py-24 border-t border-cyan-500/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs text-cyan-400 uppercase tracking-widest">{t('landing.features.label')}</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">{t('landing.features.title')}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureItems.map((feature, i) => {
              const Icon = FEATURE_ICONS[i]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-sm p-8 fantasy-border"
                >
                  <div
                    className="w-12 h-12 rounded-sm flex items-center justify-center mb-5"
                    style={{ background: `${FEATURE_COLORS[i]}15`, border: `1px solid ${FEATURE_COLORS[i]}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: FEATURE_COLORS[i] }} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-[#6b8fa0] leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Evaluation preview */}
      <section className="relative z-10 px-6 md:px-12 py-24 border-t border-cyan-500/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs text-cyan-400 uppercase tracking-widest">{t('landing.evaluation.label')}</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">{t('landing.evaluation.title')}</h2>
            <p className="text-[#6b8fa0] mt-4 max-w-xl mx-auto">{t('landing.evaluation.subtitle')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card rounded-sm p-8 fantasy-border"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs text-[#6b8fa0] uppercase tracking-wider">{t('landing.evaluation.sessionScore')}</div>
                <div className="font-display text-5xl font-black text-cyan-400 mt-1">
                  7.4 <span className="text-lg text-[#6b8fa0]">/ 10</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#6b8fa0] uppercase tracking-wider">{t('landing.evaluation.rank')}</div>
                <div className="font-display text-2xl font-bold text-emerald-400 mt-1">{t('landing.evaluation.rankValue')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[
                { key: 'pacing', score: 8, color: '#00ff87' },
                { key: 'atmosphere', score: 7, color: '#00e5ff' },
                { key: 'playerFreedom', score: 6, color: '#ffd93d' },
                { key: 'clarity', score: 8, color: '#00ff87' },
                { key: 'immersion', score: 7, color: '#00e5ff' },
                { key: 'combat', score: 6, color: '#ffd93d' },
              ].map(item => (
                <div key={item.key} className="p-3 rounded-sm border border-white/5 bg-white/2">
                  <div className="text-xs text-[#6b8fa0] mb-2">{evalCategories[item.key] ?? item.key}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.score * 10}%`, background: item.color }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.score}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-cyan-500/10 pt-6">
              <div className="text-xs text-[#6b8fa0] uppercase tracking-wider mb-3">{t('landing.evaluation.coachingTips')}</div>
              <ul className="space-y-2">
                {sampleTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#8aa0b0]">
                    <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-12 py-32 border-t border-cyan-500/10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-[#6b8fa0] text-lg mb-10 max-w-xl mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="group inline-flex items-center gap-3 px-10 py-5 text-lg font-semibold text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 transition-all duration-200 glow-cyan"
          >
            {t('landing.cta.button')}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-cyan-500/10 text-center text-xs text-[#6b8fa0]">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Dice6 className="w-4 h-4 text-cyan-500/40" />
          <span className="font-display tracking-widest uppercase text-sm font-bold text-white/20">
            {t('common.appName')}
          </span>
        </div>
        <p>{t('landing.footer')}</p>
      </footer>
    </div>
  )
}
