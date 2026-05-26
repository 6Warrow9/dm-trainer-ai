'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Users, Star, Dice6, ArrowLeft, Scroll } from 'lucide-react'
import type { AIPlayer, Message, Session, InventorySlots, InventoryItem } from '@/types'
import { CLASS_ICONS, formatTime } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import PlayerCard from '@/components/party/PlayerCard'
import TypingIndicator from '@/components/session/TypingIndicator'
import FeedbackModal from '@/components/feedback/FeedbackModal'
import SystemMessage from '@/components/session/SystemMessage'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import DiceRoller, { type DiceType, type DiceRollResult } from '@/components/session/DiceRoller'
import DiceRollMessage from '@/components/session/DiceRollMessage'
import DiceNarrationPrompt from '@/components/session/DiceNarrationPrompt'
import InventoryPanel from '@/components/session/InventoryPanel'

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { t, locale } = useI18n()
  const { user } = useAuth()

  const [session, setSession] = useState<Session | null>(null)
  const [players, setPlayers] = useState<AIPlayer[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [dmInput, setDmInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [typingPlayers, setTypingPlayers] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)

  // Dice state
  const [suggestedDice, setSuggestedDice] = useState<DiceType | null>(null)
  const [suggestedReason, setSuggestedReason] = useState<string | null>(null)
  const [suggestedSkill, setSuggestedSkill] = useState<string | null>(null)
  const [suggestedRoller, setSuggestedRoller] = useState<'player' | 'dm' | null>(null)
  const [suggestedPlayerName, setSuggestedPlayerName] = useState<string | null>(null)
  const [isDetectingDice, setIsDetectingDice] = useState(false)

  // After a dice roll, wait for DM to narrate the outcome before players react
  const [pendingNarration, setPendingNarration] = useState<DiceRollResult | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ── Load session ────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem(`session_${id}`)
    if (!stored) { router.push('/dashboard'); return }
    const sessionData = JSON.parse(stored) as Session
    setSession(sessionData)

    const storedPlayers = sessionStorage.getItem(`players_${id}`)
    const storedMessages = sessionStorage.getItem(`messages_${id}`)

    if (storedPlayers) {
      const loadedPlayers: AIPlayer[] = JSON.parse(storedPlayers).map((p: AIPlayer) => ({
        ...p,
        inventory: p.inventory ?? [null, null, null, null],
        hp: p.hp ?? 100,
        max_hp: p.max_hp ?? 100,
        stamina: p.stamina ?? 30,
        max_stamina: p.max_stamina ?? 30,
      }))
      setPlayers(loadedPlayers)
      if (storedMessages) setMessages(JSON.parse(storedMessages))
    } else {
      generateParty(sessionData)
    }
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingPlayers])

  useEffect(() => {
    if (messages.length > 0) sessionStorage.setItem(`messages_${id}`, JSON.stringify(messages))
  }, [messages, id])

  // ── Intro messages per archetype ─────────────────────────────────────────────
  function getIntroMessage(player: AIPlayer, sessionLocale: string): string {
    type IntroMap = Record<string, string[]>
    const introsEN: IntroMap = {
      shy_beginner: [
        `Hi everyone! I'm ${player.name}... this is my first time. Sorry if I mess things up!`,
        `Um, hey. I'm ${player.name}. I watched some videos to prepare but I'm still not sure what I'm doing lol`,
      ],
      chaotic_roleplayer: [
        `*slams hands on the table* LET'S GOOO. ${player.name} is READY. What are we destroying today?`,
        `Okay okay, ${player.name} here. Full chaos mode?`,
      ],
      tactical_veteran: [
        `${player.name} here. I have some questions about the action economy before we start.`,
        `Hey. ${player.name}. Should we establish party roles first? Who's tanking?`,
      ],
      distracted_casual: [
        `Oh hey! Sorry I'm late. What did I miss? I'm ${player.name} btw`,
        `Yo! ${player.name} here. This is gonna be fun. Just need a snack lol`,
      ],
      lore_addict: [
        `${player.name} here! I've already read through the setting lore three times. I have QUESTIONS about the historical timeline.`,
        `Greetings. I am ${player.name}. Particularly interested in the political history of this region.`,
      ],
      impatient_powergamer: [
        `${player.name}. Skip the talking, what are we fighting?`,
        `Ready. ${player.name}. Can we skip the intro? I wanna see what monsters we're dealing with.`,
      ],
      method_actor: [
        `*steps forward dramatically* I am ${player.name}, wanderer of the forgotten roads...`,
        `*in character* The name is ${player.name}. I don't shake hands with strangers.`,
      ],
      rules_lawyer: [
        `Hey, ${player.name} here. Quick question — are we using standard rules or homebrew?`,
        `${player.name}. I brought my rulebook. I might check things occasionally.`,
      ],
    }
    const introsIT: IntroMap = {
      shy_beginner: [
        `Ciao a tutti! Sono ${player.name}... è la mia prima volta. Scusatemi se sbaglio qualcosa!`,
        `Ehm, ciao. Sono ${player.name}. Ho guardato dei video per prepararmi ma non sono sicuro di quello che faccio lol`,
      ],
      chaotic_roleplayer: [
        `*sbatte le mani sul tavolo* ANDIAMOOOO! ${player.name} è PRONTO. Cosa distruggiamo oggi?`,
        `Okay okay, ${player.name} presente. Modalità caos totale?`,
      ],
      tactical_veteran: [
        `${player.name} qui. Ho alcune domande sull'economia delle azioni prima di iniziare.`,
        `Ehi. ${player.name}. Dovremmo stabilire i ruoli del gruppo. Chi tanka?`,
      ],
      distracted_casual: [
        `Oh ciao! Scusate il ritardo. Cosa mi sono perso? Sono ${player.name}`,
        `Yo! ${player.name} qui. Sarà divertente. Ho solo bisogno di uno spuntino lol`,
      ],
      lore_addict: [
        `${player.name} qui! Ho già letto il lore tre volte. Ho DOMANDE sulla linea temporale storica.`,
        `Saluti. Sono ${player.name}. Sono molto interessato alla storia politica di questa regione.`,
      ],
      impatient_powergamer: [
        `${player.name}. Saltiamo i discorsi, cosa combattiamo?`,
        `Pronto. ${player.name}. Possiamo saltare l'intro? Voglio sapere con quali mostri abbiamo a che fare.`,
      ],
      method_actor: [
        `*si fa avanti drammaticamente* Sono ${player.name}, ramingo delle strade dimenticate...`,
        `*in personaggio* Il nome è ${player.name}. Non stringo la mano agli sconosciuti.`,
      ],
      rules_lawyer: [
        `Ehi, ${player.name} qui. Domanda rapida — usiamo regole standard o homebrew?`,
        `${player.name}. Ho portato il manuale. Potrei controllare qualcosa di tanto in tanto.`,
      ],
    }
    const map = sessionLocale === 'it' ? introsIT : introsEN
    const options = map[player.archetype] ?? [`Ciao, sono ${player.name}.`]
    return options[Math.floor(Math.random() * options.length)]
  }

  // ── Generate Party ──────────────────────────────────────────────────────────
  const generateParty = async (sessionData: Session) => {
    setIsGenerating(true)
    const sessionLocale = sessionData.locale ?? locale

    const systemMsg: Message = {
      id: 'sys-start', session_id: id, player_id: null, role: 'system',
      content: t('session.system.sessionStarted', {
        title: sessionData.title || t('session.system.defaultSessionTitle'),
        count: String(sessionData.player_count),
      }),
      created_at: new Date().toISOString(),
    }
    setMessages([systemMsg])

    try {
      const res = await fetch('/api/generate-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: id,
          player_count: sessionData.player_count,
          experience_level: sessionData.experience_level,
          tone: sessionData.tone,
          campaign_description: sessionData.campaign_description,
          locale: sessionLocale,
        }),
      })
      const data = await res.json()
      const generatedPlayers: AIPlayer[] = data.players
      setPlayers(generatedPlayers)
      sessionStorage.setItem(`players_${id}`, JSON.stringify(generatedPlayers))

      const partyMsg: Message = {
        id: 'sys-party', session_id: id, player_id: null, role: 'system',
        content: t('session.system.partyReady', { names: generatedPlayers.map(p => p.name).join(', ') }),
        created_at: new Date().toISOString(),
      }
      const introMessages: Message[] = generatedPlayers.map((p, i) => ({
        id: `intro-${p.id}`, session_id: id, player_id: p.id, role: 'player' as const,
        content: getIntroMessage(p, sessionLocale),
        player_name: p.name, player_class: p.class, player_color: p.color,
        created_at: new Date(Date.now() + i * 500).toISOString(),
      }))
      setMessages([systemMsg, partyMsg, ...introMessages])
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Detect dice — works for both DM messages AND player responses ────────────
  const detectDice = async (message: string, speaker: 'dm' | 'player', sessionLocale: string, playerName?: string) => {
    setIsDetectingDice(true)
    try {
      const res = await fetch('/api/detect-roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, speaker, locale: sessionLocale }),
      })
      const data = await res.json()
      if (data.needsRoll && data.diceType) {
        setSuggestedDice(data.diceType as DiceType)
        setSuggestedReason(data.reason)
        setSuggestedSkill(data.skillOrStat)
        setSuggestedRoller(data.roller)
        // Use explicit player name from the message, fallback to the player who sent the message
        setSuggestedPlayerName(data.playerName ?? playerName ?? null)
      } else {
        setSuggestedDice(null)
        setSuggestedReason(null)
        setSuggestedSkill(null)
        setSuggestedRoller(null)
        setSuggestedPlayerName(null)
      }
    } catch {
      // Fail silently — dice detection is optional
    } finally {
      setIsDetectingDice(false)
    }
  }

  // ── Apply stat changes (HP / Stamina) ───────────────────────────────────────
  const applyStatChanges = (
    changes: Array<{ player_id: string; hp_change: number; stamina_change: number; reason: string }>
  ) => {
    if (!changes || changes.length === 0) return
    setPlayers(prev => {
      const updated = prev.map(player => {
        const change = changes.find(c => c.player_id === player.id)
        if (!change) return player
        const newHp = Math.max(0, Math.min(player.max_hp ?? 100, (player.hp ?? 100) + change.hp_change))
        const newStamina = Math.max(0, Math.min(player.max_stamina ?? 30, (player.stamina ?? 30) + change.stamina_change))
        return { ...player, hp: newHp, stamina: newStamina }
      })
      sessionStorage.setItem(`players_${id}`, JSON.stringify(updated))
      return updated
    })
  }

  const checkStatChanges = async (
    dmMsg: string,
    responses: Array<{ player_id: string | null; player_name?: string; content: string }>,
    sessionLocale: string
  ) => {
    if (!responses.length) return
    try {
      const res = await fetch('/api/update-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players,
          dm_message: dmMsg,
          player_responses: responses
            .filter(r => r.player_id)
            .map(r => ({ player_id: r.player_id, player_name: r.player_name ?? '', content: r.content })),
          locale: sessionLocale,
        }),
      })
      const data = await res.json()
      if (data.changes?.length > 0) {
        applyStatChanges(data.changes)
        const statDescs = data.changes.map((c: any) => {
          const pName = players.find(p => p.id === c.player_id)?.name ?? '?'
          const parts = []
          if (c.hp_change !== 0) parts.push(`${c.hp_change > 0 ? '+' : ''}${c.hp_change} HP`)
          if (c.stamina_change !== 0) parts.push(`${c.stamina_change > 0 ? '+' : ''}${c.stamina_change} STA`)
          return `${pName}: ${parts.join(', ')}${c.reason ? ` (${c.reason})` : ''}`
        }).filter(Boolean).join(' · ')
        if (statDescs) {
          setMessages(prev => [...prev, {
            id: `stats-${Date.now()}`,
            session_id: id, player_id: null,
            role: 'system' as const,
            content: `⚔️ ${statDescs}`,
            created_at: new Date().toISOString(),
          }])
        }
      }
    } catch { /* silent */ }
  }

  // ── Apply inventory changes from AI analysis ────────────────────────────────
  const applyInventoryChanges = (
    changes: Array<{
      player_id: string
      action: 'add' | 'remove' | 'swap'
      item_added?: InventoryItem
      item_removed_name?: string
    }>
  ) => {
    if (!changes || changes.length === 0) return

    setPlayers(prev => {
      const updated = prev.map(player => {
        const change = changes.find(c => c.player_id === player.id)
        if (!change) return player

        const slots = [...player.inventory] as InventorySlots

        if (change.action === 'remove' && change.item_removed_name) {
          // Remove specific item by name (fuzzy match)
          const idx = slots.findIndex(s =>
            s && s.name.toLowerCase().includes(change.item_removed_name!.toLowerCase().split(' ')[0])
          )
          if (idx !== -1) slots[idx] = null
        }

        if (change.action === 'add' && change.item_added) {
          // Find first free slot
          const freeIdx = slots.findIndex(s => s === null)
          if (freeIdx !== -1) {
            slots[freeIdx] = change.item_added!
          }
          // If full, replace last slot (player already decided in chat)
          else {
            slots[3] = change.item_added!
          }
        }

        if (change.action === 'swap' && change.item_added) {
          // Remove the dropped item first
          if (change.item_removed_name) {
            const removeIdx = slots.findIndex(s =>
              s && s.name.toLowerCase().includes(change.item_removed_name!.toLowerCase().split(' ')[0])
            )
            if (removeIdx !== -1) slots[removeIdx] = null
          }
          // Then add the new item
          const freeIdx = slots.findIndex(s => s === null)
          if (freeIdx !== -1) {
            slots[freeIdx] = change.item_added!
          } else {
            // Fallback: replace slot 3
            slots[3] = change.item_added!
          }
        }

        return { ...player, inventory: slots }
      })

      // Persist updated players
      sessionStorage.setItem(`players_${id}`, JSON.stringify(updated))
      return updated
    })
  }

  // ── Send DM message ─────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!dmInput.trim() || isLoading || !session) return
    const sessionLocale = session.locale ?? locale

    const dmMsg: Message = {
      id: `dm-${Date.now()}`, session_id: id, player_id: null, role: 'dm',
      content: dmInput.trim(),
      created_at: new Date().toISOString(),
    }
    const newMessages = [...messages, dmMsg]
    setMessages(newMessages)
    const sentText = dmInput.trim()
    setDmInput('')
    setIsLoading(true)
    setTypingPlayers(players.map(p => p.id))

    // Detect dice from the DM message in parallel
    detectDice(sentText, 'dm', sessionLocale)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-campaign-tone': session.tone },
        body: JSON.stringify({
          session_id: id, dm_message: sentText, players,
          message_history: newMessages.slice(-15), locale: sessionLocale,
        }),
      })
      const data = await res.json()
      const responses: Message[] = data.responses

      for (let i = 0; i < responses.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600 + i * 400))
        setTypingPlayers(prev => prev.filter(pid => pid !== responses[i].player_id))
        setMessages(prev => [...prev, responses[i]])

        // After each player message arrives, check if THAT player declared an action needing a roll
        // Only run detection on the last response to avoid spam
        if (i === responses.length - 1) {
          const lastResp = responses[i]
          detectDice(lastResp.content, 'player', sessionLocale, lastResp.player_name)
        }
      }

      // After ALL responses are in, analyze for inventory changes
      if (responses.length > 0) {
        try {
          const invRes = await fetch('/api/update-inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              players,
              dm_message: sentText,
              player_responses: responses.map(r => ({
                player_id: r.player_id,
                player_name: r.player_name,
                content: r.content,
              })),
              locale: sessionLocale,
            }),
          })
          const invData = await invRes.json()
          if (invData.changes?.length > 0) {
            applyInventoryChanges(invData.changes)

            // Show a subtle system message listing what changed
            const changeDescs = invData.changes.map((c: any) => {
              const playerName = players.find(p => p.id === c.player_id)?.name ?? '?'
              if (c.action === 'add' && c.item_added) {
                return sessionLocale === 'it'
                  ? `${playerName} raccoglie ${c.item_added.emoji} ${c.item_added.name}`
                  : `${playerName} picks up ${c.item_added.emoji} ${c.item_added.name}`
              }
              if (c.action === 'remove' && c.item_removed_name) {
                return sessionLocale === 'it'
                  ? `${playerName} lascia ${c.item_removed_name}`
                  : `${playerName} drops ${c.item_removed_name}`
              }
              if (c.action === 'swap') {
                return sessionLocale === 'it'
                  ? `${playerName} scambia ${c.item_removed_name ?? '?'} con ${c.item_added?.emoji ?? ''} ${c.item_added?.name ?? '?'}`
                  : `${playerName} swaps ${c.item_removed_name ?? '?'} for ${c.item_added?.emoji ?? ''} ${c.item_added?.name ?? '?'}`
              }
              return null
            }).filter(Boolean).join(' · ')

            if (changeDescs) {
              setMessages(prev => [...prev, {
                id: `inv-${Date.now()}`,
                session_id: id,
                player_id: null,
                role: 'system' as const,
                content: `🎒 ${changeDescs}`,
                created_at: new Date().toISOString(),
              }])
            }
          }
        } catch {
          // Inventory detection fails silently
        }

        // Check for HP/Stamina changes
        checkStatChanges(sentText, responses, sessionLocale)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
      setTypingPlayers([])
    }
  }

  // ── Handle dice roll — add to chat, then wait for DM narration ──────────────
  const handleDiceRoll = (rollResult: DiceRollResult) => {
    if (!session) return

    // 1. Add the dice result bubble to chat
    const diceMsg: Message = {
      id: `dice-${Date.now()}`,
      session_id: id,
      player_id: null,
      role: 'dice',
      content: `🎲 ${rollResult.diceType.toUpperCase()}: ${rollResult.result}${rollResult.skillOrStat ? ` — ${rollResult.skillOrStat}` : ''}`,
      dice_type: rollResult.diceType,
      dice_result: rollResult.result,
      dice_skill: rollResult.skillOrStat,
      dice_reason: rollResult.reason,
      dice_roller: rollResult.roller,
      dice_player_name: rollResult.playerName,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, diceMsg])

    // 2. Clear dice suggestions
    setSuggestedDice(null)
    setSuggestedReason(null)
    setSuggestedSkill(null)
    setSuggestedRoller(null)
    setSuggestedPlayerName(null)

    // 3. Show the narration prompt — DM must narrate before players react
    setPendingNarration(rollResult)
  }

  // ── DM writes the narration → players react to it ───────────────────────────
  const handleNarration = async (narrationText: string) => {
    if (!session || !pendingNarration) return
    const roll = pendingNarration
    const sessionLocale = session.locale ?? locale

    // Clear the prompt
    setPendingNarration(null)

    // Add DM narration as a normal DM message
    const dmMsg: Message = {
      id: `dm-${Date.now()}`,
      session_id: id,
      player_id: null,
      role: 'dm',
      content: narrationText,
      created_at: new Date().toISOString(),
    }
    const currentMessages = [...messages.filter(m => m.role !== 'dice' || m.dice_result !== undefined), dmMsg]
    // Actually just append
    setMessages(prev => [...prev, dmMsg])
    const newMessages = [...messages, dmMsg]

    setIsLoading(true)
    setTypingPlayers(players.map(p => p.id))

    // Build the internal context message so AI knows this was after a dice roll
    const sides = { d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100 }[roll.diceType]
    const pct = roll.result / sides
    const outcomeHint = pct >= 0.85 || roll.result === 20
      ? (sessionLocale === 'it' ? 'successo pieno' : 'full success')
      : pct >= 0.6
        ? (sessionLocale === 'it' ? 'successo parziale' : 'partial success')
        : roll.result === 1
          ? (sessionLocale === 'it' ? 'fallimento critico' : 'critical failure')
          : (sessionLocale === 'it' ? 'fallimento' : 'failure')

    const contextPrefix = sessionLocale === 'it'
      ? `[CONTESTO: ${roll.playerName ?? 'un giocatore'} ha appena tirato ${roll.diceType.toUpperCase()} ottenendo ${roll.result}${roll.skillOrStat ? ` per ${roll.skillOrStat}` : ''} — ${outcomeHint}. Il DM ha narrato l'esito. Reagisci a questa narrazione in modo naturale, tenendo conto del risultato del dado.]\n\n`
      : `[CONTEXT: ${roll.playerName ?? 'a player'} just rolled ${roll.diceType.toUpperCase()} getting ${roll.result}${roll.skillOrStat ? ` for ${roll.skillOrStat}` : ''} — ${outcomeHint}. The DM has narrated the outcome. React to this narration naturally, keeping the dice result in mind.]\n\n`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-campaign-tone': session.tone },
        body: JSON.stringify({
          session_id: id,
          dm_message: contextPrefix + narrationText,
          players,
          message_history: newMessages.slice(-15),
          locale: sessionLocale,
        }),
      })
      const data = await res.json()
      const responses: Message[] = data.responses

      for (let i = 0; i < responses.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500 + i * 350))
        setTypingPlayers(prev => prev.filter(pid => pid !== responses[i].player_id))
        setMessages(prev => [...prev, responses[i]])
      }

      // Check for inventory changes after narration reactions
      if (responses.length > 0) {
        try {
          const invRes = await fetch('/api/update-inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              players,
              dm_message: narrationText,
              player_responses: responses.map(r => ({
                player_id: r.player_id,
                player_name: r.player_name,
                content: r.content,
              })),
              locale: sessionLocale,
            }),
          })
          const invData = await invRes.json()
          if (invData.changes?.length > 0) {
            applyInventoryChanges(invData.changes)
            const changeDescs = invData.changes.map((c: any) => {
              const pName = players.find(p => p.id === c.player_id)?.name ?? '?'
              if (c.action === 'add' && c.item_added) return sessionLocale === 'it' ? `${pName} raccoglie ${c.item_added.emoji} ${c.item_added.name}` : `${pName} picks up ${c.item_added.emoji} ${c.item_added.name}`
              if (c.action === 'remove') return sessionLocale === 'it' ? `${pName} lascia ${c.item_removed_name}` : `${pName} drops ${c.item_removed_name}`
              if (c.action === 'swap') return sessionLocale === 'it' ? `${pName} scambia ${c.item_removed_name} con ${c.item_added?.emoji} ${c.item_added?.name}` : `${pName} swaps ${c.item_removed_name} for ${c.item_added?.emoji} ${c.item_added?.name}`
              return null
            }).filter(Boolean).join(' · ')
            if (changeDescs) setMessages(prev => [...prev, { id: `inv-${Date.now()}`, session_id: id, player_id: null, role: 'system' as const, content: `🎒 ${changeDescs}`, created_at: new Date().toISOString() }])
          }
        } catch { /* silent */ }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
      setTypingPlayers([])
    }
  }

  // DM can skip narration — players react anyway with a generic context
  const handleSkipNarration = async () => {
    if (!session || !pendingNarration) return
    const roll = pendingNarration
    const sessionLocale = session.locale ?? locale
    setPendingNarration(null)

    setIsLoading(true)
    setTypingPlayers(players.map(p => p.id))

    const sides = { d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100 }[roll.diceType]
    const pct = roll.result / sides
    const isNat20 = roll.diceType === 'd20' && roll.result === 20
    const isNat1  = roll.diceType === 'd20' && roll.result === 1
    const isHigh  = pct >= 0.75
    const isLow   = pct <= 0.3

    const who = roll.playerName ?? (sessionLocale === 'it' ? 'un giocatore' : 'a player')
    const skill = roll.skillOrStat ?? ''
    const die = roll.diceType.toUpperCase()
    const r = roll.result

    let skipMsg: string
    if (sessionLocale === 'it') {
      if (isNat20) skipMsg = `[TIRO DADO] ${who} ha appena ottenuto un CRITICO NATURALE (${die}: ${r})${skill ? ` per ${skill}` : ''}! Reagite con entusiasmo ed eccitazione — è un momento epico!`
      else if (isNat1) skipMsg = `[TIRO DADO] ${who} ha appena ottenuto un FALLIMENTO CRITICO (${die}: ${r})${skill ? ` per ${skill}` : ''}. Reagite con shock o ilarità — qualcosa va terribilmente storto.`
      else if (isHigh) skipMsg = `[TIRO DADO] ${who} ha tirato ${die} e ottenuto ${r}${skill ? ` per ${skill}` : ''} — un buon risultato. Reagite positivamente.`
      else if (isLow) skipMsg = `[TIRO DADO] ${who} ha tirato ${die} e ottenuto ${r}${skill ? ` per ${skill}` : ''} — un risultato basso. Reagite con preoccupazione o delusione.`
      else skipMsg = `[TIRO DADO] ${who} ha tirato ${die} e ottenuto ${r}${skill ? ` per ${skill}` : ''}. Reagite brevemente al risultato.`
    } else {
      if (isNat20) skipMsg = `[DICE ROLL] ${who} just got a NATURAL CRITICAL (${die}: ${r})${skill ? ` for ${skill}` : ''}! React with excitement — this is an epic moment!`
      else if (isNat1) skipMsg = `[DICE ROLL] ${who} just got a CRITICAL FAIL (${die}: ${r})${skill ? ` for ${skill}` : ''}. React with shock or laughter — something goes terribly wrong.`
      else if (isHigh) skipMsg = `[DICE ROLL] ${who} rolled ${die} and got ${r}${skill ? ` for ${skill}` : ''} — a good result. React positively.`
      else if (isLow) skipMsg = `[DICE ROLL] ${who} rolled ${die} and got ${r}${skill ? ` for ${skill}` : ''} — a low result. React with concern or disappointment.`
      else skipMsg = `[DICE ROLL] ${who} rolled ${die} and got ${r}${skill ? ` for ${skill}` : ''}. React briefly to the result.`
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-campaign-tone': session.tone },
        body: JSON.stringify({
          session_id: id,
          dm_message: skipMsg,
          players,
          message_history: messages.slice(-15),
          locale: sessionLocale,
        }),
      })
      const data = await res.json()
      const responses: Message[] = data.responses
      for (let i = 0; i < responses.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500 + i * 350))
        setTypingPlayers(prev => prev.filter(pid => pid !== responses[i].player_id))
        setMessages(prev => [...prev, responses[i]])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
      setTypingPlayers([])
    }
  }

  // ── End session ─────────────────────────────────────────────────────────────
  const endSession = async () => {
    if (!confirm(t('session.endConfirm'))) return
    setIsGeneratingFeedback(true)
    setShowFeedback(true)
    const sessionLocale = session?.locale ?? locale
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: id, players, message_history: messages, locale: sessionLocale }),
      })
      const data = await res.json()
      const report = data.report
      setFeedback(report)

      // Save session + feedback to Supabase if user is logged in
      if (user && session && report) {
        fetch('/api/save-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_data: session,
            feedback: report,
            user_id: user.id,
          }),
        }).catch(err => console.error('Save session error:', err))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsGeneratingFeedback(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#000508] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#6b8fa0]">
          <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          {t('common.loading')}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#000508] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/10 bg-[#000d14] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-[#6b8fa0] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Dice6 className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="font-display text-sm font-bold text-white">{session.title || t('session.system.defaultSessionTitle')}</div>
            <div className="text-xs text-[#6b8fa0] capitalize">
              {t('session.topBar.subtitle', { tone: session.tone, difficulty: session.difficulty, count: String(players.length) })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <button
            onClick={() => {}}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs border border-cyan-500/20 rounded text-[#6b8fa0] hover:text-white transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            {t('session.topBar.partyButton')}
          </button>
          <button
            onClick={endSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-amber-500/30 rounded text-amber-400 hover:bg-amber-500/10 transition-all"
          >
            <Star className="w-3.5 h-3.5" />
            {t('session.topBar.endButton')}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="border-r border-cyan-500/10 bg-[#000a12] overflow-y-auto flex-shrink-0 hidden md:block" style={{ width: 280 }}>
          <div className="p-4">
            <div className="text-xs text-[#6b8fa0] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              {t('session.sidebar.title')}
            </div>
            <div className="space-y-3">
              {isGenerating
                ? Array(session.player_count).fill(0).map((_, i) => (
                    <div key={i} className="h-28 bg-[#000d14] rounded-sm border border-cyan-500/10 animate-pulse" />
                  ))
                : players.map(player => (
                    <PlayerCard key={player.id} player={player} isTyping={typingPlayers.includes(player.id)} />
                  ))
              }
            </div>
            {/* Inventory panel */}
            {!isGenerating && players.length > 0 && (
              <InventoryPanel
                players={players}
                locale={session.locale ?? locale}
                onUpdatePlayers={updatedPlayers => {
                  setPlayers(updatedPlayers)
                  sessionStorage.setItem(`players_${id}`, JSON.stringify(updatedPlayers))
                }}
                onLootMessage={(_msg, playerId, item, isFull) => {
                  const sessionLocale = session.locale ?? locale
                  const player = players.find(p => p.id === playerId)
                  if (!player) return

                  const rarityLabel = sessionLocale === 'it'
                    ? `${item.emoji} **${item.name}**`
                    : `${item.emoji} **${item.name}**`

                  let systemContent: string
                  let aiPrompt: string

                  if (!isFull) {
                    // Slot free — simple notification
                    systemContent = sessionLocale === 'it'
                      ? `🎁 Il DM dà a ${player.name}: ${item.emoji} ${item.name} (${item.rarity})`
                      : `🎁 DM gives ${player.name}: ${item.emoji} ${item.name} (${item.rarity})`
                    aiPrompt = sessionLocale === 'it'
                      ? `[LOOT] Il DM ti ha appena dato un oggetto: ${item.emoji} ${item.name} (${item.type}, ${item.rarity})${item.description ? ` — ${item.description}` : ''}. Reagisci brevemente come giocatore — sei contento? Sorpreso? Lo metti nell'inventario.`
                      : `[LOOT] The DM just gave you an item: ${item.emoji} ${item.name} (${item.type}, ${item.rarity})${item.description ? ` — ${item.description}` : ''}. React briefly as a player — are you happy? Surprised? You put it in your inventory.`
                  } else {
                    // Inventory full — player must decide what to drop
                    const currentItems = player.inventory.filter(Boolean).map(i => `${i!.emoji} ${i!.name}`).join(', ')
                    systemContent = sessionLocale === 'it'
                      ? `🎁 Il DM offre a ${player.name}: ${item.emoji} ${item.name} — ma l'inventario è PIENO! Deve scegliere cosa scartare.`
                      : `🎁 DM offers ${player.name}: ${item.emoji} ${item.name} — inventory is FULL! Must choose what to drop.`
                    aiPrompt = sessionLocale === 'it'
                      ? `[LOOT] Il DM ti offre: ${item.emoji} ${item.name} (${item.type}, ${item.rarity})${item.description ? ` — ${item.description}` : ''}. MA il tuo inventario è PIENO! Hai: ${currentItems}. Decidi IN PERSONAGGIO se prendi il nuovo oggetto e cosa scarti, oppure lo rifiuti. Sii specifico su cosa tieni e cosa butti.`
                      : `[LOOT] The DM offers you: ${item.emoji} ${item.name} (${item.type}, ${item.rarity})${item.description ? ` — ${item.description}` : ''}. BUT your inventory is FULL! You have: ${currentItems}. Decide IN CHARACTER whether you take the new item and what you drop, or refuse it. Be specific about what you keep and discard.`
                  }

                  // Add system message to chat
                  const sysMsg = {
                    id: `loot-${Date.now()}`,
                    session_id: id,
                    player_id: null,
                    role: 'system' as const,
                    content: systemContent,
                    created_at: new Date().toISOString(),
                  }
                  setMessages(prev => [...prev, sysMsg])

                  // Only the receiving player responds
                  const receivingPlayer = players.find(p => p.id === playerId)
                  if (!receivingPlayer) return

                  setTypingPlayers([playerId])
                  fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-campaign-tone': session.tone },
                    body: JSON.stringify({
                      session_id: id,
                      dm_message: aiPrompt,
                      players: [receivingPlayer], // only this player responds
                      message_history: messages.slice(-10),
                      locale: sessionLocale,
                    }),
                  }).then(r => r.json()).then(data => {
                    if (data.responses?.length > 0) {
                      setTimeout(() => {
                        setMessages(prev => [...prev, data.responses[0]])
                        setTypingPlayers([])

                        // If inventory was full, parse what the player dropped
                        if (isFull) {
                          const playerResponse: string = data.responses[0].content.toLowerCase()
                          // Find which slot the player decided to free based on keywords in their response
                          const currentPlayer = players.find(p => p.id === playerId)
                          if (currentPlayer) {
                            let droppedSlot = -1
                            currentPlayer.inventory.forEach((slotItem, idx) => {
                              if (!slotItem) return
                              const itemName = slotItem.name.toLowerCase()
                              // Check if the player mentioned dropping/discarding this item
                              const dropKeywords = ['butto', 'scarto', 'lascio', 'abbandono', 'drop', 'discard', 'leave', 'throw', 'toss', 'get rid']
                              if (dropKeywords.some(kw => playerResponse.includes(kw) && playerResponse.includes(itemName.split(' ')[0]))) {
                                droppedSlot = idx
                              }
                            })
                            // If we found a slot to drop, update inventory
                            if (droppedSlot !== -1) {
                              setPlayers(prev => prev.map(p => {
                                if (p.id !== playerId) return p
                                const newSlots = [...p.inventory] as InventorySlots
                                newSlots[droppedSlot] = item
                                return { ...p, inventory: newSlots }
                              }))
                            } else if (playerResponse.includes('prendo') || playerResponse.includes('take') || playerResponse.includes('keep') || playerResponse.includes('tengo')) {
                              // Player said they want it but we couldn't figure out what to drop
                              // Replace last slot as fallback
                              setPlayers(prev => prev.map(p => {
                                if (p.id !== playerId) return p
                                const newSlots = [...p.inventory] as InventorySlots
                                newSlots[3] = item
                                return { ...p, inventory: newSlots }
                              }))
                            }
                            // Save updated players
                            setTimeout(() => {
                              setPlayers(prev => {
                                sessionStorage.setItem(`players_${id}`, JSON.stringify(prev))
                                return prev
                              })
                            }, 100)
                          }
                        }
                      }, 700)
                    } else {
                      setTypingPlayers([])
                    }
                  }).catch(() => setTypingPlayers([]))
                }}
              />
            )}
          </div>
        </aside>

        {/* Chat + Dice Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {msg.role === 'system' ? (
                    <SystemMessage content={msg.content} />
                  ) : msg.role === 'dice' ? (
                    <DiceRollMessage
                      diceType={msg.dice_type as any}
                      result={msg.dice_result!}
                      skillOrStat={msg.dice_skill ?? null}
                      reason={msg.dice_reason ?? null}
                      roller={msg.dice_roller as any}
                      playerName={msg.dice_player_name ?? null}
                      timestamp={msg.created_at}
                      locale={session.locale ?? locale}
                    />
                  ) : msg.role === 'dm' ? (
                    <DMMessage msg={msg} dmLabel={t('session.chat.dmLabel')} />
                  ) : (
                    <PlayerMessage msg={msg} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {typingPlayers.map(playerId => {
              const player = players.find(p => p.id === playerId)
              if (!player) return null
              return (
                <motion.div
                  key={`typing-${playerId}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 py-1 px-3"
                >
                  <div
                    className="w-6 h-6 rounded-sm flex items-center justify-center text-xs font-display font-bold flex-shrink-0"
                    style={{ background: `${player.color}20`, border: `1px solid ${player.color}40`, color: player.color }}
                  >
                    {player.name[0]}
                  </div>
                  <TypingIndicator name={player.name} color={player.color} label={t('playerCard.typing')} />
                </motion.div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* 🎲 Narration Prompt — appears after a dice roll, before players react */}
          <AnimatePresence>
            {pendingNarration && (
              <DiceNarrationPrompt
                diceType={pendingNarration.diceType}
                result={pendingNarration.result}
                skillOrStat={pendingNarration.skillOrStat}
                playerName={pendingNarration.playerName}
                locale={session.locale ?? locale}
                onNarrate={handleNarration}
                onSkip={handleSkipNarration}
              />
            )}
          </AnimatePresence>

          {/* 🎲 Dice Roller Panel */}
          <DiceRoller
            suggestedDice={suggestedDice}
            suggestedReason={suggestedReason}
            suggestedSkill={suggestedSkill}
            suggestedRoller={suggestedRoller}
            suggestedPlayerName={suggestedPlayerName}
            locale={session.locale ?? locale}
            onRollComplete={handleDiceRoll}
          />

          {/* DM Input */}
          <div className="border-t border-cyan-500/10 bg-[#000d14] p-4 flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-sm bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Scroll className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={dmInput}
                  onChange={e => setDmInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={pendingNarration
                    ? (session.locale === 'it' || locale === 'it'
                        ? '↑ Narra l\'esito del dado sopra, poi continua...'
                        : '↑ Narrate the dice outcome above, then continue...')
                    : t('session.chat.inputPlaceholder')}
                  disabled={isLoading || isGenerating || !!pendingNarration}
                  rows={3}
                  className="w-full bg-[#000508] border border-cyan-500/15 rounded-sm px-4 py-3 text-white placeholder-[#6b8fa0] focus:outline-none focus:border-cyan-500/35 resize-none text-sm disabled:opacity-50 transition-colors pr-12"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || isGenerating || !dmInput.trim() || !!pendingNarration}
                  className="absolute right-3 bottom-3 p-1.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between px-11">
              <p className="text-xs text-[#6b8fa0]">{t('session.chat.inputHint')}</p>
              <p className="text-xs text-[#6b8fa0]">
                {t('session.chat.dmMessageCount', { count: String(messages.filter(m => m.role === 'dm').length) })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <FeedbackModal
            feedback={feedback}
            isLoading={isGeneratingFeedback}
            players={players}
            isGuest={!user}
            onClose={() => setShowFeedback(false)}
            onNewSession={() => router.push('/dashboard')}
            onSignUp={() => router.push('/auth')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function DMMessage({ msg, dmLabel }: { msg: Message; dmLabel: string }) {
  return (
    <div className="flex justify-end py-1">
      <div className="flex items-start gap-3 max-w-[75%]">
        <div className="flex-1">
          <div className="text-xs text-right text-[#6b8fa0] mb-1.5">
            <span className="text-cyan-400 font-medium">{dmLabel}</span> · {formatTime(msg.created_at)}
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-sm px-4 py-3 text-sm text-white leading-relaxed text-right">
            {msg.content}
          </div>
        </div>
        <div className="w-7 h-7 rounded-sm bg-cyan-500/20 border border-cyan-500/35 flex items-center justify-center flex-shrink-0 mt-5">
          <Scroll className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      </div>
    </div>
  )
}

function PlayerMessage({ msg }: { msg: Message }) {
  const color = msg.player_color || '#00e5ff'
  const icon = msg.player_class ? CLASS_ICONS[msg.player_class as keyof typeof CLASS_ICONS] || '⚔️' : '⚔️'
  return (
    <div className="flex items-start gap-3 py-1 max-w-[80%]">
      <div
        className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-display font-bold flex-shrink-0 mt-5"
        style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
      >
        {(msg.player_name || 'P')[0]}
      </div>
      <div className="flex-1">
        <div className="text-xs text-[#6b8fa0] mb-1.5">
          <span className="font-medium" style={{ color }}>{msg.player_name}</span>
          {msg.player_class && <span className="ml-1.5 opacity-60">{icon} {msg.player_class}</span>}
          <span className="ml-1.5">· {formatTime(msg.created_at)}</span>
        </div>
        <div
          className="rounded-sm px-4 py-3 text-sm text-[#d0e4ee] leading-relaxed"
          style={{ background: `${color}08`, border: `1px solid ${color}20` }}
        >
          {msg.content}
        </div>
      </div>
    </div>
  )
}
