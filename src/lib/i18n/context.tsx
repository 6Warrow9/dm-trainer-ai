'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Locale } from './core'
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectBrowserLocale,
  resolvePath,
  interpolate,
} from './core'

// ─── Dynamic message loader ───────────────────────────────────────────────────
// We load message files lazily to keep the initial bundle small.
async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  // Next.js handles the dynamic import splitting automatically.
  switch (locale) {
    case 'it':
      return (await import('../../../messages/it.json')).default as unknown as Record<string, unknown>
    case 'en':
    default:
      return (await import('../../../messages/en.json')).default as unknown as Record<string, unknown>
  }
}

// ─── Context shape ─────────────────────────────────────────────────────────────
interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  tArray: (key: string) => string[]
  tObject: <T>(key: string) => T
  isLoading: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [messages, setMessages] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(true)

  // On mount: read from localStorage or detect from browser
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
    const initial =
      stored && SUPPORTED_LOCALES.includes(stored)
        ? stored
        : detectBrowserLocale()
    setLocaleState(initial)
  }, [])

  // Load messages whenever locale changes
  useEffect(() => {
    setIsLoading(true)
    loadMessages(locale)
      .then(msgs => {
        setMessages(msgs)
        setIsLoading(false)
        // Update <html lang> attribute
        document.documentElement.lang = locale
      })
      .catch(() => setIsLoading(false))
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) return
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
    setLocaleState(next)
  }, [])

  /** Translate a dot-path key with optional interpolation vars */
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const value = resolvePath(messages, key)
      if (typeof value === 'string') return interpolate(value, vars)
      if (value === undefined) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Missing key: "${key}" (locale: ${locale})`)
        }
        return key
      }
      return String(value)
    },
    [messages, locale]
  )

  /** Return an array from a key that maps to a JSON array of strings */
  const tArray = useCallback(
    (key: string): string[] => {
      const value = resolvePath(messages, key)
      if (Array.isArray(value)) return value.map(v => String(v))
      return []
    },
    [messages]
  )

  /** Return a typed object from a key */
  const tObject = useCallback(
    <T,>(key: string): T => {
      const value = resolvePath(messages, key)
      return value as T
    },
    [messages]
  )

  const value = useMemo(
    () => ({ locale, setLocale, t, tArray, tObject, isLoading }),
    [locale, setLocale, t, tArray, tObject, isLoading]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}

/** Convenience alias */
export const useT = useI18n
