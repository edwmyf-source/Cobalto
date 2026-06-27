-- =====================================================
-- MIGRATION: follows
-- Ejecutar en Supabase → SQL Editor
-- =====================================================

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- 2. Índices para conteos rápidos
CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- 3. Row Level Security
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer follows (público)
CREATE POLICY "follows_select" ON follows
  FOR SELECT USING (true);

-- Solo puedes seguir como tú mismo
CREATE POLICY "follows_insert" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Solo puedes dejar de seguir como tú mismo
CREATE POLICY "follows_delete" ON follows
  FOR DELETE USING (auth.uid() = follower_id);
