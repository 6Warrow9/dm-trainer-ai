-- DM Trainer AI — Supabase Schema v2
-- Run this in the Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles (extends Supabase auth.users) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT 'Dungeon Master',
  avatar_url TEXT,
  total_sessions INT DEFAULT 0,
  avg_score NUMERIC(3,1) DEFAULT 0,
  best_score NUMERIC(3,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Sessions ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  title TEXT,
  campaign_description TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'heroic',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  experience_level TEXT NOT NULL DEFAULT 'intermediate',
  player_count INT NOT NULL DEFAULT 4,
  locale TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'setup',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Feedback Reports ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  overall_score NUMERIC(3,1),
  pacing_score JSONB,
  atmosphere_score JSONB,
  player_freedom_score JSONB,
  clarity_score JSONB,
  immersion_score JSONB,
  combat_handling_score JSONB,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  coaching_tips JSONB DEFAULT '[]',
  player_ratings JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: everyone can read (for ranking), only owner can write
CREATE POLICY "Profiles are publicly readable" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Sessions: owner can manage, public can read finished ones
CREATE POLICY "Users manage own sessions" ON public.sessions
  FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

-- Feedback: owner can manage, everyone can read (for ranking)
CREATE POLICY "Feedback publicly readable" ON public.feedback_reports
  FOR SELECT USING (true);
CREATE POLICY "Users manage own feedback" ON public.feedback_reports
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users update own feedback" ON public.feedback_reports
  FOR UPDATE USING (user_id = auth.uid());

-- ─── Function: update profile stats after feedback ────────────────────────────
CREATE OR REPLACE FUNCTION public.update_profile_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total INT;
  v_avg NUMERIC(3,1);
  v_best NUMERIC(3,1);
BEGIN
  SELECT
    COUNT(*),
    ROUND(AVG(overall_score)::NUMERIC, 1),
    MAX(overall_score)
  INTO v_total, v_avg, v_best
  FROM public.feedback_reports
  WHERE user_id = p_user_id AND overall_score IS NOT NULL;

  UPDATE public.profiles
  SET
    total_sessions = v_total,
    avg_score = COALESCE(v_avg, 0),
    best_score = COALESCE(v_best, 0),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_score ON public.feedback_reports(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_avg_score ON public.profiles(avg_score DESC);

-- ─── Updated At Trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
