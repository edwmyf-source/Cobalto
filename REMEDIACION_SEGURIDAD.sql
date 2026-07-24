-- ============================================================================
-- REMEDIACIÓN DE SEGURIDAD — Cobalto
-- Aplicar en el SQL Editor de Supabase. Léelo completo antes de ejecutar.
-- Recomendado: probar en staging o hacer backup antes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- C1 (CRÍTICO): feed_widgets y quiz_preguntas permiten escritura anónima
-- Problema: política ALL con USING(true) WITH CHECK(true) deja que CUALQUIERA
--           (incluso sin login) inserte/edite/borre.
-- Solución: lectura pública se mantiene; escritura solo para admin.
-- ----------------------------------------------------------------------------

-- feed_widgets
DROP POLICY IF EXISTS widgets_admin_all ON public.feed_widgets;

CREATE POLICY widgets_admin_write ON public.feed_widgets
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
-- (widgets_public_read se conserva: SELECT con activo = true)

-- quiz_preguntas
DROP POLICY IF EXISTS quiz_admin_all ON public.quiz_preguntas;

CREATE POLICY quiz_admin_write ON public.quiz_preguntas
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
-- (quiz_public_read se conserva: SELECT con activa = true)


-- ----------------------------------------------------------------------------
-- A1 (ALTO): buckets públicos permiten LISTAR archivos
-- Para servir imágenes por URL pública NO se necesita permiso de listado.
-- Estas políticas amplias permiten enumerar todos los objetos del bucket.
--
-- NOTA: revisa los nombres exactos de tus políticas antes de borrar.
-- Los archivos siguen siendo accesibles por su URL pública directa; lo único
-- que se quita es la capacidad de LISTAR el contenido del bucket.
-- ----------------------------------------------------------------------------

-- avatars — quitar políticas de listado amplio
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "avatars_read" ON storage.objects;

-- post-media — quitar políticas de listado amplio
DROP POLICY IF EXISTS "Public read post media" ON storage.objects;
DROP POLICY IF EXISTS "post-media lectura publica" ON storage.objects;

-- Los buckets públicos ya sirven objetos por URL sin necesidad de política SELECT.
-- Si notas que alguna imagen deja de cargar, es que el bucket no estaba marcado
-- como público; en ese caso, marca el bucket como público en el dashboard
-- (Storage → bucket → Settings → Public) en lugar de reañadir el SELECT amplio.


-- ----------------------------------------------------------------------------
-- A3 (ALTO): activar protección de contraseñas filtradas
-- Esto NO se hace por SQL. Ve a:
--   Dashboard → Authentication → Policies (o Providers → Email)
--   → activa "Leaked password protection" (HaveIBeenPwned).
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------
-- SECURITY DEFINER functions ejecutables por anon/authenticated
-- Los advisors marcan varias funciones RPC como ejecutables sin login.
-- Muchas son intencionales (is_admin, is_staff se usan dentro de RLS).
-- Revisa una por una: si una función NO debe ser llamable directamente desde
-- el cliente, revócale EXECUTE. Ejemplo (ajusta según tu lógica real):
--
--   REVOKE EXECUTE ON FUNCTION public.distribute_request_to_sellers(uuid,uuid,text) FROM anon;
--   REVOKE EXECUTE ON FUNCTION public.redistribute_request(uuid) FROM anon, authenticated;
--
-- is_admin() e is_staff() SÍ necesitan ser ejecutables porque se invocan
-- dentro de las políticas RLS — no las toques.
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------
-- Verificación posterior: confirmar que quedaron bien
-- ----------------------------------------------------------------------------
-- SELECT tablename, policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname='public' AND tablename IN ('feed_widgets','quiz_preguntas')
-- ORDER BY tablename, cmd;
