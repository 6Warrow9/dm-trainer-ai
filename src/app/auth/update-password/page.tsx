'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Dice6, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpdate = async () => {
    setError(null)
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError('Errore nell\'aggiornamento. Riprova.')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#000508] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-sm bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Dice6 className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Nuova Password</h1>
          <p className="text-[#6b8fa0] text-sm mt-1">Scegli una nuova password per il tuo account</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-emerald-400 font-medium">Password aggiornata!</p>
            <p className="text-[#6b8fa0] text-sm mt-1">Reindirizzamento in corso...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-sm border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="relative mb-5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8fa0]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                placeholder="Nuova password (min 6 caratteri)"
                className="w-full bg-[#000d14] border border-cyan-500/15 rounded-sm pl-10 pr-10 py-3 text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/40 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8fa0] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-black bg-cyan-400 rounded-sm hover:bg-cyan-300 disabled:opacity-50 transition-all glow-cyan"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <><Lock className="w-4 h-4" /> Aggiorna Password <ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
