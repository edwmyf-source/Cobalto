-- ============================================================================
-- REMEDIACIÓN DE RENDIMIENTO — Cobalto
-- Aplicar en el SQL Editor de Supabase. Léelo completo antes de ejecutar.
-- Los CREATE INDEX usan CONCURRENTLY para no bloquear la tabla en producción.
-- (CONCURRENTLY no puede correr dentro de una transacción; ejecuta línea a línea
--  o quita CONCURRENTLY si lo corres todo junto en el editor.)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- M1: índices sobre foreign keys sin cubrir
-- Mejora JOINs y filtros por estas columnas. Empieza por las de mayor uso.
-- ----------------------------------------------------------------------------

-- Alta prioridad (tablas muy consultadas)
CREATE INDEX IF NOT EXISTS idx_comments_user_id       ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id     ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notif_from_user        ON public.notifications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_notif_post             ON public.notifications(post_id);

-- Media prioridad
CREATE INDEX IF NOT EXISTS idx_offers_request_id      ON public.offers(request_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id       ON public.offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id    ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked    ON public.user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor     ON public.activity_log(actor_id);

-- Módulo de solicitudes/ofertas (si lo usas activamente)
CREATE INDEX IF NOT EXISTS idx_buyer_req_buyer        ON public.buyer_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_req_category     ON public.buyer_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_buyer_req_company      ON public.buyer_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_buyer_req_closed_by    ON public.buyer_requests(closed_by);
CREATE INDEX IF NOT EXISTS idx_req_dist_seller        ON public.request_distribution(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_seg_category    ON public.seller_segments(category_id);


-- ----------------------------------------------------------------------------
-- M2: borrar índices DUPLICADOS (idénticos entre sí)
-- Ocupan disco y ralentizan escrituras sin aportar nada.
-- ----------------------------------------------------------------------------
DROP INDEX IF EXISTS public.idx_msg_conv;                  -- = idx_messages_conv
DROP INDEX IF EXISTS public.idx_posts_category_created;    -- = idx_posts_cat_created
DROP INDEX IF EXISTS public.idx_posts_cat_intent_created;  -- = idx_posts_cat_intent
DROP INDEX IF EXISTS public.idx_posts_created_at;          -- = idx_posts_created
DROP INDEX IF EXISTS public.idx_posts_title_fts;           -- = idx_posts_search
-- (Se conserva el otro de cada par. Verifica los nombres si los renombraste.)


-- ----------------------------------------------------------------------------
-- M3: RLS que re-evalúa auth.uid() por fila en buyer_requests
-- Reemplazar auth.<fn>() por (SELECT auth.<fn>()) para que se evalúe una vez.
-- Ajusta la definición completa según tu política real; ejemplo de patrón:
--
--   ALTER POLICY "any auth can read open requests" ON public.buyer_requests
--     USING ( ... (SELECT auth.uid()) ... );
--
-- Revisa la definición actual con:
--   SELECT policyname, qual FROM pg_policies
--   WHERE tablename='buyer_requests';
-- y reescríbela envolviendo las llamadas a auth.* en (SELECT ...).
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------
-- M5: índices SIN USO (candidatos a borrar) — REVISAR ANTES, NO BORRAR A CIEGAS
-- "Sin uso" puede significar que esa consulta aún no corrió, no que sea inútil.
-- Borra solo los que correspondan a features que retiraste.
-- ----------------------------------------------------------------------------
-- Candidatos (descomenta solo los que confirmes que no necesitas):
-- DROP INDEX IF EXISTS public.idx_wa_post;
-- DROP INDEX IF EXISTS public.idx_wa_viewer;
-- DROP INDEX IF EXISTS public.idx_wa_created;
-- DROP INDEX IF EXISTS public.idx_posts_segment;
-- DROP INDEX IF EXISTS public.idx_posts_sub2;
-- DROP INDEX IF EXISTS public.idx_posts_city;
-- DROP INDEX IF EXISTS public.idx_posts_intent;
-- DROP INDEX IF EXISTS public.idx_posts_location;
-- DROP INDEX IF EXISTS public.buyer_requests_serial_idx;
-- DROP INDEX IF EXISTS public.buyer_requests_expires_idx;
-- DROP INDEX IF EXISTS public.buyer_requests_segment_idx;
-- ... (lista completa en los advisors de rendimiento del dashboard)


-- ----------------------------------------------------------------------------
-- Después de crear/borrar índices, actualiza estadísticas del planner:
-- ----------------------------------------------------------------------------
-- ANALYZE public.comments;
-- ANALYZE public.messages;
-- ANALYZE public.notifications;
-- ANALYZE public.offers;
-- ANALYZE public.posts;
