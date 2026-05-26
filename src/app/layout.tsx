import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'DM Trainer AI — Train Your Dungeon Master Skills',
  description: 'Practice DMing with AI-powered players that behave like real tabletop gamers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise-overlay antialiased">
        <I18nProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
