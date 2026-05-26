'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

const FLAG: Record<Locale, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
}

const LANG_NAMES: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
}

interface LanguageSwitcherProps {
  /** compact = flag + chevron only; full = flag + name + chevron */
  variant?: 'compact' | 'full'
}

export default function LanguageSwitcher({ variant = 'full' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const locales: Locale[] = ['en', 'it']

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Change language"
        aria-expanded={open}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-sm border transition-all duration-200
          border-cyan-500/20 text-[#6b8fa0] hover:text-white hover:border-cyan-500/40
          ${open ? 'border-cyan-500/40 text-white bg-cyan-500/5' : ''}
        `}
      >
        <Globe className="w-3.5 h-3.5 flex-shrink-0" />
        {variant === 'full' && (
          <span className="text-xs font-medium hidden sm:inline">{FLAG[locale]} {LANG_NAMES[locale]}</span>
        )}
        {variant === 'compact' && (
          <span className="text-xs font-medium">{FLAG[locale]}</span>
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1.5 w-36 rounded-sm border border-cyan-500/20 bg-[#000d14] shadow-xl shadow-black/50 z-50 overflow-hidden"
          >
            {locales.map(loc => (
              <button
                key={loc}
                onClick={() => { setLocale(loc); setOpen(false) }}
                className={`
                  w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors
                  ${locale === loc
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-[#6b8fa0] hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{FLAG[loc]}</span>
                  <span className="font-medium">{LANG_NAMES[loc]}</span>
                </span>
                {locale === loc && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
