'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Dice6, Mail, Lock, User, Eye, EyeOff, ArrowLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!email.trim()) {
      setError('Inserisci la tua email.')
      return
    }

    // Password reset mode
    if (mode === 'reset') {
      setIsLoading(true)
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/update-password`,
        })
        if (error) {
          setError('Errore nell\'invio dell\'email. Controlla l\'indirizzo.')
        } else {
          setSuccess('Email inviata! Controlla la tua casella di posta e clicca il link per reimpostare la password.')
        }
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (!password.trim()) {
      setError('Inserisci la password.')
      return
    }
    if (mode === 'signup' && !displayName.trim()) {
      setError('Inserisci un nome da visualizzare.')
      return
    }
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.')
      return
    }

    setIsLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email.trim(), password, displayName.trim())
        if (error) {
          setError(error)
        } else {
          setSuccess('Account creato! Ora puoi accedere.')
          setMode('login')
        }
      } else {
        const { error } = await signIn(email.trim(), password)
        if (error) {
          setError('Email o password non corretti.')
        } else {
          window.location.href = '/dashboard'
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const modeConfig = {
    login: { title: 'Bentornato, DM', subtitle: 'Accedi per vedere il tuo storico e il ranking' },
    signup: { title: 'Crea Account', subtitle: 'Registrati per salvare le tue sessioni' },
    reset: { title: 'Reset Password', subtitle: 'Ti mandiamo un link per reimpostare la password' },
  }

  return (
    <div className="min-h-screen bg-[#000508] flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-emerald-500/4 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-cyan-500/10">
        <button
          onClick={() => mode === 'reset' ? setMode('login') : router.push('/')}
          className="flex items-center gap-2 text-[#6b8fa0] hover:text-cyan-400 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {mode === 'reset' ? 'Indietro' : 'Home'}
        </button>
        <div className="flex items-center gap-2">
          <Dice6 className="w-5 h-5 text-cyan-400" />
          <span className="font-display text-sm font-bold text-white tracking-widest uppercase">DM Trainer AI</span>
        </div>
        <div className="w-16" />
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-sm bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 glow-cyan">
              <Dice6 className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              {modeConfig[mode].title}
            </h1>
            <p className="text-[#6b8fa0] text-sm mt-1">
              {modeConfig[mode].subtitle}
            </p>
          </div>

          {/* Mode switcher — only for login/signup */}
          {mode !== 'reset' && (
            <div className="flex rounded-sm border border-cyan-500/20 overflow-hidden mb-6">
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                    mode === m
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : 'text-[#6b8fa0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {m === 'login' ? 'Accedi' : 'Registrati'}
                </button>
              ))}
            </div>
          )}

          {/* Error / success */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 rounded-sm border border-red-500/30 bg-red-500/10 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fields */}
          <div className="space-y-3">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8fa0]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Nome da visualizzare (es. DragonSlayer)"
                  className="w-full bg-[#000d14] border border-cyan-500/15 rounded-sm pl-10 pr-4 py-3 text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/40 transition-colors text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8fa0]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Email"
                className="w-full bg-[#000d14] border border-cyan-500/15 rounded-sm pl-10 pr-4 py-3 text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/40 transition-colors text-sm"
              />
            </div>

            {mode !== 'reset' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8fa0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Password (min 6 caratteri)"
                  className="w-full bg-[#000d14] border border-cyan-500/15 rounded-sm pl-10 pr-10 py-3 text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/40 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8fa0] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Forgot password link */}
          {mode === 'login' && (
            <div className="text-right mt-2">
              <button
                onClick={() => { setMode('reset'); setError(null); setSuccess(null) }}
                className="text-xs text-[#6b8fa0] hover:text-cyan-400 transition-colors"
              >
                Password dimenticata?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-cyan"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Accedi' : mode === 'signup' ? 'Crea Account' : 'Invia Email Reset'}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Guest mode */}
          {mode !== 'reset' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-xs text-[#6b8fa0] hover:text-white transition-colors"
              >
                Continua come ospite (senza salvataggio) →
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
