-- ═══════════════════════════════════════════════════════════════════════════
-- ÍNDICES DE ESCALABILIDAD — Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════
-- Estos índices hacen que las queries sean rápidas incluso con miles de filas.
-- Sin ellos, PostgreSQL escanea toda la tabla en cada consulta → lento a escala.
-- Es seguro ejecutarlo varias veces (IF NOT EXISTS).

-- ── POSTS — la tabla más consultada (feed) ─────────────────────────────────
-- Orden por fecha (feed cronológico + cursor pagination)
CREATE INDEX IF NOT EXISTS idx_posts_created_at      ON posts (created_at DESC);
-- Filtros del feed
CREATE INDEX IF NOT EXISTS idx_posts_category        ON posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_subcategory     ON posts (subcategory);
CREATE INDEX IF NOT EXISTS idx_posts_intent          ON posts (intent);
CREATE INDEX IF NOT EXISTS idx_posts_location        ON posts (location);
CREATE INDEX IF NOT EXISTS idx_posts_author          ON posts (author_id);
-- Índice compuesto para el caso más común: categoría + fecha
CREATE INDEX IF NOT EXISTS idx_posts_cat_created     ON posts (category, created_at DESC);
-- Eventos próximos
CREATE INDEX IF NOT EXISTS idx_posts_event_date      ON posts (event_date) WHERE event_date IS NOT NULL;

-- Búsqueda full-text en español sobre el título (textSearch)
CREATE INDEX IF NOT EXISTS idx_posts_title_fts
  ON posts USING gin (to_tsvector('spanish', title));

-- ── REACTIONS ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reactions_post        ON reactions (post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user        ON reactions (user_id);
-- Compuesto: "mis reacciones a estos posts" (la query del feed)
CREATE INDEX IF NOT EXISTS idx_reactions_user_post   ON reactions (user_id, post_id);

-- ── COMMENTS ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_comments_post         ON comments (post_id);

-- ── NOTIFICATIONS ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications (user_id);
-- Compuesto: contar no leídas (user_id + read)
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications (user_id, read) WHERE read = false;

-- ── CONVERSATIONS ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conv_user1            ON conversations (user1_id);
CREATE INDEX IF NOT EXISTS idx_conv_user2            ON conversations (user2_id);
CREATE INDEX IF NOT EXISTS idx_conv_post             ON conversations (post_id);

-- ── MESSAGES ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_conv         ON messages (conversation_id, created_at);

-- ── FOLLOWS ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_follows_follower      ON follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following     ON follows (following_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- REALTIME — habilitar solo las tablas necesarias (reduce carga del WebSocket)
-- ═══════════════════════════════════════════════════════════════════════════
-- Si alguna ya está en la publicación, este comando dará error inofensivo.
-- Ejecuta solo las que falten.
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ═══════════════════════════════════════════════════════════════════════════
-- ANÁLISIS — actualiza estadísticas para que el planificador use los índices
-- ═══════════════════════════════════════════════════════════════════════════
ANALYZE posts;
ANALYZE reactions;
ANALYZE comments;
ANALYZE notifications;
ANALYZE conversations;
ANALYZE messages;
ANALYZE follows;
