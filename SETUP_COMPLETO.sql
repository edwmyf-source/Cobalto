-- ============================================================
-- COBALTO — SETUP COMPLETO DESDE CERO
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ⚠️  Diseñado para base de datos NUEVA, pero es idempotente:
--     re-ejecutarlo sobre una BD existente la actualiza de forma segura.
-- ============================================================

-- ─── EXTENSIONES ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── LIMPIEZA DE OBJETOS OBSOLETOS ───────────────────────────
-- Vistas y funciones de versiones anteriores que dependen de las
-- columnas phone/email (que vamos a mover a profiles_private).
-- La app actual NO las usa; se eliminan para liberar las columnas.
DROP VIEW IF EXISTS admin_users_view    CASCADE;
DROP VIEW IF EXISTS admin_offers_view   CASCADE;
DROP VIEW IF EXISTS admin_requests_view CASCADE;
DROP VIEW IF EXISTS posts_feed          CASCADE;
DROP VIEW IF EXISTS public_feed         CASCADE;
DROP FUNCTION IF EXISTS get_feed(uuid, text, text, text, text, integer, integer) CASCADE;

-- ─── FUNCIONES DE ROL ────────────────────────────────────────
-- Centralizan el control de admin/moderador. Se usan en las políticas
-- RLS para que el control NO dependa solo del frontend.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.role = 'admin' FROM profiles p WHERE p.id = auth.uid()),
    false
  ) OR COALESCE((auth.jwt() ->> 'email'), '') = 'edwmyf@gmail.com';
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_admin() OR COALESCE(
    (SELECT p.role IN ('moderator', 'admin') FROM profiles p WHERE p.id = auth.uid()),
    false
  );
$$;

-- ─── LIMPIEZA DE POLÍTICAS RLS DUPLICADAS ────────────────────
-- Migraciones anteriores dejaron políticas con OTROS NOMBRES que
-- nuestros "DROP POLICY IF EXISTS" (que solo conocen los nombres
-- actuales) nunca tocaban. Como las políticas RLS se combinan con
-- OR, una política vieja y permisiva puede seguir activa aunque
-- creemos una nueva más estricta — anulando en silencio cualquier
-- arreglo de seguridad. Además, dos políticas viejas de "profiles"
-- hacían una subconsulta a la propia tabla "profiles", causando
-- "infinite recursion detected in policy". Esto borra TODA política
-- existente en cada tabla gestionada por este script, sin importar
-- su nombre, antes de recrear solo las que necesitamos. Es seguro
-- correrlo aunque la tabla aún no exista (no encuentra filas y no
-- hace nada).
DO $cleanup_policies$
DECLARE
  pol  RECORD;
  tbl  TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles','profiles_private','posts','reactions','comments',
    'conversations','messages','notifications','reports','user_blocks','banners'
  ]
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END
$cleanup_policies$;

-- ─── PROFILES (datos PÚBLICOS, sin contacto) ─────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name       TEXT,
  company_name    TEXT,
  city            TEXT,
  email_domain    TEXT,
  avatar_url      TEXT,
  identity_mode   TEXT DEFAULT 'anon',
  identity_number TEXT,
  segment         TEXT,
  role            TEXT DEFAULT 'user',
  banned          BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla ya existía con columnas de contacto, las movemos a la tabla
-- privada (más abajo) y las eliminamos de la tabla pública.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_identity_mode_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_identity_mode_check
  CHECK (identity_mode IN ('anon', 'real'));

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
-- Lectura pública: ahora es segura, la tabla ya no tiene teléfono ni email.
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- El dueño edita lo suyo; staff (admin/moderador) puede banear.
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_staff())
  WITH CHECK (auth.uid() = id OR public.is_staff());

-- ─── PROFILES_PRIVATE (teléfono y email — solo dueño y admin) ─
CREATE TABLE IF NOT EXISTS profiles_private (
  id         UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  phone      TEXT,
  email      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles_private ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "priv_select" ON profiles_private;
DROP POLICY IF EXISTS "priv_insert" ON profiles_private;
DROP POLICY IF EXISTS "priv_update" ON profiles_private;
CREATE POLICY "priv_select" ON profiles_private FOR SELECT
  USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "priv_insert" ON profiles_private FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "priv_update" ON profiles_private FOR UPDATE USING (auth.uid() = id);

-- Migración segura de datos existentes (no-op en BD nueva)
DO $migrate$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    INSERT INTO profiles_private (id, phone, email)
    SELECT id, phone, email FROM profiles
    ON CONFLICT (id) DO UPDATE
      SET phone = EXCLUDED.phone, email = EXCLUDED.email;
  END IF;
END
$migrate$;

ALTER TABLE profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE profiles DROP COLUMN IF EXISTS email;

-- ─── AUTO-PROFILE AL REGISTRARSE ─────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Perfil público: solo el dominio del email (señal de confianza B2B)
  INSERT INTO public.profiles (id, email_domain, created_at, updated_at)
  VALUES (
    NEW.id,
    CASE WHEN NEW.email LIKE '%@%' THEN '@' || split_part(NEW.email, '@', 2) ELSE NULL END,
    now(), now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Contacto privado: email completo (el teléfono lo agrega el usuario)
  INSERT INTO public.profiles_private (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto identity_number (ya no toca email: vive en profiles_private)
CREATE OR REPLACE FUNCTION set_identity_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.identity_number IS NULL THEN
    NEW.identity_number := LPAD((10000 + (random() * 89999)::int)::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_identity_number ON profiles;
CREATE TRIGGER trg_set_identity_number
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_identity_number();

-- ─── POSTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL,
  subcategory TEXT,
  location    TEXT,
  intent      TEXT DEFAULT 'ofrecen',
  media       JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT 'ofrecen';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media JSONB;

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_intent_check;
ALTER TABLE posts ADD CONSTRAINT posts_intent_check
  CHECK (intent IN ('buscan', 'ofrecen'));

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "posts_select"  ON posts;
DROP POLICY IF EXISTS "posts_insert"  ON posts;
DROP POLICY IF EXISTS "posts_delete"  ON posts;
DROP POLICY IF EXISTS "posts_banned_filter" ON posts;

-- Select: excluye baneados y bloqueados
CREATE POLICY "posts_select" ON posts FOR SELECT
  USING (
    NOT EXISTS (SELECT 1 FROM profiles WHERE id = posts.author_id AND banned = true)
    AND
    NOT EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = auth.uid() AND blocked_id = posts.author_id)
  );
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = author_id OR public.is_staff());

-- ─── REACTIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reactions_select" ON reactions;
DROP POLICY IF EXISTS "reactions_insert" ON reactions;
DROP POLICY IF EXISTS "reactions_delete" ON reactions;
CREATE POLICY "reactions_select" ON reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- ─── COMMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_select" ON comments;
DROP POLICY IF EXISTS "comments_insert" ON comments;
DROP POLICY IF EXISTS "comments_delete" ON comments;
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ─── CONVERSATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id      UUID REFERENCES posts(id) ON DELETE SET NULL,
  last_message TEXT,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES posts(id) ON DELETE SET NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message TEXT;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conv_select" ON conversations;
DROP POLICY IF EXISTS "conv_insert" ON conversations;
DROP POLICY IF EXISTS "conv_update" ON conversations;
CREATE POLICY "conv_select" ON conversations FOR SELECT USING (auth.uid() IN (user1_id, user2_id));
CREATE POLICY "conv_insert" ON conversations FOR INSERT WITH CHECK (auth.uid() IN (user1_id, user2_id));
CREATE POLICY "conv_update" ON conversations FOR UPDATE USING (auth.uid() IN (user1_id, user2_id));

-- ─── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  read            BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "msg_select" ON messages;
DROP POLICY IF EXISTS "msg_insert" ON messages;
CREATE POLICY "msg_select" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations
          WHERE id = messages.conversation_id
          AND (user1_id = auth.uid() OR user2_id = auth.uid()))
);
CREATE POLICY "msg_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ─── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type         TEXT NOT NULL,
  content      TEXT,
  post_id      UUID REFERENCES posts(id) ON DELETE SET NULL,
  read         BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES posts(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select" ON notifications;
DROP POLICY IF EXISTS "notif_insert" ON notifications;
DROP POLICY IF EXISTS "notif_update" ON notifications;
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
-- Cualquier usuario logueado puede notificar, pero NO puede forjar el remitente.
CREATE POLICY "notif_insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (from_user_id = auth.uid() OR from_user_id IS NULL);
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── REPORTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID REFERENCES posts(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  status      TEXT DEFAULT 'pending',
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, reporter_id)
);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reports_insert" ON reports;
DROP POLICY IF EXISTS "reports_select" ON reports;
DROP POLICY IF EXISTS "reports_update" ON reports;
CREATE POLICY "reports_insert" ON reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select" ON reports FOR SELECT USING (public.is_staff());
CREATE POLICY "reports_update" ON reports FOR UPDATE USING (public.is_staff());

-- ─── USER BLOCKS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "blocks_all" ON user_blocks;
CREATE POLICY "blocks_all" ON user_blocks
  FOR ALL USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);

-- ─── BANNERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url  TEXT NOT NULL,
  position   INT DEFAULT 0,
  active     BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "banners_select" ON banners;
DROP POLICY IF EXISTS "banners_admin"  ON banners;
DROP POLICY IF EXISTS "banners_write"  ON banners;
CREATE POLICY "banners_select" ON banners FOR SELECT USING (true);
CREATE POLICY "banners_write"  ON banners FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_author          ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category        ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created         ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_intent          ON posts(intent);
CREATE INDEX IF NOT EXISTS idx_posts_location        ON posts(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_cat_intent      ON posts(category, intent, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_loc_created     ON posts(location, created_at DESC) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_search          ON posts USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_reactions_post        ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user        ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post         ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_conv_user1            ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conv_user2            ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_msg_conv              ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notif_user            ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread          ON notifications(user_id, created_at DESC) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_profiles_email_domain ON profiles(email_domain);

-- ─── RATE LIMITING ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_post_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count FROM posts
  WHERE author_id = NEW.author_id AND created_at > NOW() - INTERVAL '1 hour';
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING HINT = 'Máximo 10 publicaciones por hora.', ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_rate_limit ON posts;
CREATE TRIGGER trg_post_rate_limit
  BEFORE INSERT ON posts FOR EACH ROW EXECUTE FUNCTION check_post_rate_limit();

CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count FROM messages
  WHERE sender_id = NEW.sender_id AND created_at > NOW() - INTERVAL '1 hour';
  IF recent_count >= 30 THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING HINT = 'Demasiados mensajes. Intenta en unos minutos.', ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_message_rate_limit ON messages;
CREATE TRIGGER trg_message_rate_limit
  BEFORE INSERT ON messages FOR EACH ROW EXECUTE FUNCTION check_message_rate_limit();

-- ─── STORAGE BUCKETS ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own avatar"   ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar"   ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars"       ON storage.objects;
DROP POLICY IF EXISTS "Users upload own media"    ON storage.objects;
DROP POLICY IF EXISTS "Public read post media"    ON storage.objects;
DROP POLICY IF EXISTS "Users delete own media"    ON storage.objects;

CREATE POLICY "Users upload own avatar"  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own avatar"  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public read avatars"      ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own media"   ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public read post media"   ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'post-media');
CREATE POLICY "Users delete own media"   ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ─── REALTIME ─────────────────────────────────────────────────
DO $realtime$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['posts','messages','notifications','reactions','comments']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    END IF;
  END LOOP;
END
$realtime$;

-- ============================================================
-- ✅ LISTO. Próximos pasos:
-- 1. Configura las variables de entorno en tu plataforma de deploy
-- 2. Haz: npm install && npm run build
-- 3. Sube la carpeta dist/ a Netlify/Vercel
-- ============================================================
