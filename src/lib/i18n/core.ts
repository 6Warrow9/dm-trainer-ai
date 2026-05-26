export type Locale = 'en' | 'it'

export const SUPPORTED_LOCALES: Locale[] = ['en', 'it']
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'dm-trainer-locale'

/** Detect the best locale from browser settings */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const lang = navigator.language?.toLowerCase() ?? ''
  if (lang.startsWith('it')) return 'it'
  return DEFAULT_LOCALE
}

/** Resolve a dot-separated key path from a nested object */
export function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}

/** Interpolate {{variable}} placeholders */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`
  )
}
