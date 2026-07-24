-- ============================================================
-- COBALTO — MIGRACIONES APLICADAS (ejecutar en Supabase SQL Editor)
-- ============================================================
-- Este archivo reúne TODOS los ajustes de base de datos que se
-- hicieron para que la app funcione correctamente. Si recreas la
-- base desde cero, ejecuta primero SETUP_COMPLETO.sql y luego esto.
--
-- UUID del admin: 359ebe0a-e3d3-4400-ada2-0789612df659
-- Email admin:    edwmyf@gmail.com
-- ============================================================


-- ─── 1. Rol: permitir 'user' y 'admin' ───────────────────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['buyer','seller','both','user','admin']));
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';


-- ─── 2. Trigger: crear perfil automáticamente al registrarse ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email_domain, role, created_at)
  VALUES (
    NEW.id,
    CASE WHEN NEW.email LIKE '%@%'
         THEN '@' || split_part(NEW.email, '@', 2)
         ELSE NULL END,
    'user',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 3. profiles: lectura pública + cada quien edita lo suyo ──
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "usuarios pueden insertar su propio perfil" ON profiles;
CREATE POLICY "usuarios pueden insertar su propio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ─── 4. profiles_private: cada usuario solo ve/edita lo suyo ──
-- (CAUSA RAÍZ del bug "me pide los datos cada vez": la tabla tenía
--  RLS activado SIN políticas, lo que bloqueaba todo.)
DROP POLICY IF EXISTS "privado_select" ON profiles_private;
DROP POLICY IF EXISTS "privado_insert" ON profiles_private;
DROP POLICY IF EXISTS "privado_update" ON profiles_private;
DROP POLICY IF EXISTS "privado_upsert" ON profiles_private;

CREATE POLICY "privado_select" ON profiles_private
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "privado_insert" ON profiles_private
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "privado_update" ON profiles_private
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- ─── 5. Banners (publicidad): RLS desactivado ────────────────
-- Son contenido público; el control de quién los sube está en el
-- frontend (solo el admin ve la pantalla de banners).
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;


-- ─── 6. Storage post-media: subir archivos ───────────────────
DROP POLICY IF EXISTS "autenticados pueden subir a post-media" ON storage.objects;
CREATE POLICY "autenticados pueden subir a post-media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media');


-- ─── 7. Eventos: columna de fecha para "Próximos eventos" ────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS event_date DATE;
CREATE INDEX IF NOT EXISTS idx_posts_event_date
  ON posts(event_date) WHERE event_date IS NOT NULL;


-- ─── 8. (OPCIONAL) Insertar/actualizar el perfil del admin ───
-- Útil si el perfil del admin se borra o necesitas restaurarlo.
INSERT INTO profiles (id, full_name, company_name, city, email_domain, identity_mode, identity_number, role, created_at)
VALUES (
  '359ebe0a-e3d3-4400-ada2-0789612df659',
  'EDWARD ANDRES ALFONSO SUAREZ',
  'Admin Cobalto', 'Bogotá D.C.', '@gmail.com', 'real', '58166', 'admin', now()
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

INSERT INTO profiles_private (id, phone, email)
VALUES ('359ebe0a-e3d3-4400-ada2-0789612df659', '3007182952', 'edwmyf@gmail.com')
ON CONFLICT (id) DO UPDATE SET phone = '3007182952', email = 'edwmyf@gmail.com';


-- ============================================================
-- VERIFICACIÓN (opcional): correr para confirmar que todo quedó
-- ============================================================
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles_private';
--   → debe mostrar privado_select, privado_insert, privado_update
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name='posts' AND column_name='event_date';
--   → debe mostrar event_date
