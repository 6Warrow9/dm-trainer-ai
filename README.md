# 🎲 DM Trainer AI

**Train your Dungeon Master skills against AI players that behave like real people.**

DM Trainer AI is a web application that simulates a tabletop D&D session. You play the Dungeon Master. The app generates a party of AI players with distinct personalities, archetypes, and behaviors — then lets you run a session. At the end, you get a detailed performance report with scores, strengths, weaknesses, and coaching tips.

---

## ✨ Features

- **AI Party Generation** — 8 unique player archetypes (Shy Beginner, Chaotic Roleplayer, Tactical Veteran, Lore Addict, etc.)
- **Realistic Player Behavior** — players ask questions, disagree, hesitate, roleplay, react emotionally
- **Session Memory** — players remember what happened earlier in the session
- **DM Evaluation System** — 7-category scoring with honest, specific feedback
- **Dark Fantasy UI** — cinematic, immersive interface with Framer Motion animations
- **Guest Mode** — no account required to start training

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | TailwindCSS, Framer Motion |
| AI | OpenAI GPT-4o-mini |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-username/dm-trainer-ai
cd dm-trainer-ai
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your keys:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Paste and run the contents of `supabase-schema.sql`
4. Copy your **Project URL** and **Anon Key** from Settings → API

### 4. Set Up OpenAI

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Go to API Keys and create a new key
3. Add it to `.env.local` as `OPENAI_API_KEY`
4. Make sure your account has access to `gpt-4o-mini`

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-party/route.ts   # Generate AI party
│   │   ├── chat/route.ts             # Player responses
│   │   └── feedback/route.ts         # DM evaluation
│   ├── dashboard/page.tsx            # Session setup
│   ├── session/[id]/page.tsx         # Main game interface
│   └── page.tsx                      # Landing page
├── components/
│   ├── party/PlayerCard.tsx          # AI player card
│   ├── session/
│   │   ├── TypingIndicator.tsx       # Typing animation
│   │   └── SystemMessage.tsx         # System notifications
│   └── feedback/FeedbackModal.tsx    # End-of-session report
├── lib/
│   ├── openai.ts                     # OpenAI client
│   ├── supabase.ts                   # Supabase client
│   ├── prompts.ts                    # All AI prompts
│   └── utils.ts                      # Helpers & constants
└── types/index.ts                    # TypeScript types
```

---

## 🎭 AI Player Archetypes

| Archetype | Behavior |
|---|---|
| 🌱 Shy Beginner | Asks many questions, apologizes, gets confused |
| 🎲 Chaotic Roleplayer | Impulsive decisions, loves drama, breaks plans |
| ⚔️ Tactical Veteran | Analyzes situations, leads strategy, asks about mechanics |
| 📱 Casual Gamer | Gets distracted, needs recaps, jokes around |
| 📚 Lore Addict | Asks about world history, connects everything to lore |
| 💥 Impatient Powergamer | Wants to fight, skips RP, optimizes damage |
| 🎭 Method Actor | Never breaks character, uses accents, makes character decisions |
| 📜 Rules Lawyer | Questions rules, cites rulebook, wants fairness |

---

## 📊 DM Evaluation Categories

| Category | What It Measures |
|---|---|
| Pacing | Did you keep momentum? Avoid dragging scenes? |
| Atmosphere | Did you build tension and immersion? |
| Player Freedom | Did players feel agency? Were ideas acknowledged? |
| Clarity | Were scenes clearly described? Could players understand? |
| Immersion | Did the world feel alive and consistent? |
| Combat Handling | Was combat exciting, fair, and clear? |

---

## 🚢 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set all environment variables in your Vercel project settings under **Settings → Environment Variables**.

---

## 🔮 Future Features (Architecture Ready)

- Discord bot integration
- Voice AI for players
- Dice rolling system
- Virtual tabletop overlay
- Campaign marketplace
- Multiplayer sessions
- AI voice personalities

---

## 📝 Notes

- The MVP uses `sessionStorage` for guest mode (no auth required)
- With Supabase connected, sessions persist across devices
- The app uses `gpt-4o-mini` for cost efficiency — upgrade to `gpt-4o` for better responses
- Each session costs approximately $0.02–0.10 in API credits depending on length

---

## License

MIT
