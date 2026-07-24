# ⚛️ Cobalto — Guía de inicio rápido

## Para ejecutar en tu máquina (desarrollo)

### 1. Descomprime el archivo
```bash
unzip cobalto-app.zip
cd compact
```

### 2. Instala dependencias
```bash
npm install
```

### 3. Verifica tu `.env`
Debe existir un archivo `.env` en la raíz con tus credenciales reales de Supabase:
```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_XXXXXXXXXXXXXXXX
```
Las encuentras en Supabase → Settings → API.

### 4. Inicia el servidor
```bash
npm run dev
```
Abre http://localhost:5173/

---

## ⚙️ Configurar Supabase (IMPORTANTE)

Antes de que funcione el login, corre el script de base de datos:

1. Ve a https://supabase.com/dashboard → tu proyecto
2. SQL Editor → Nueva query
3. Copia y pega **todo el contenido** de `SETUP_COMPLETO.sql` (incluido en este zip)
4. Run

Es idempotente: puedes volver a correrlo si necesitas aplicar un cambio futuro, sin romper nada existente.

No uses ningún otro SQL para esto — `SETUP_COMPLETO.sql` es la única fuente de verdad del esquema y las políticas de seguridad (RLS).

---

## ✅ Pruebas básicas

Abre la app en dos navegadores (o uno normal + uno en incógnito):

1. **Navegador 1:** regístrate, confirma el email, completa tu perfil y publica algo en el Feed.
2. **Navegador 2:** regístrate con otro correo, busca esa publicación y mándale un mensaje desde "Contactar".
3. **De vuelta en Navegador 1:** ve a Inbox — deberías ver el mensaje en tiempo real, sin recargar.

Si no ves errores rojos en la consola (F12), funciona.

---

## 🔧 Troubleshooting

**"No puedo registrarme" o error de autenticación**
- Verifica que `.env` tiene tus valores reales de Supabase
- Supabase → Authentication → Providers → Email debe estar activado

**Error de permisos / RLS al guardar el perfil**
- Confirma que corriste `SETUP_COMPLETO.sql` completo y sin errores
- Corre este diagnóstico en el SQL Editor para ver qué políticas quedaron activas:
  ```sql
  SELECT tablename, policyname, cmd FROM pg_policies
  WHERE tablename IN ('profiles','profiles_private') ORDER BY 1,2;
  ```

**"Los chats o el feed no actualizan en tiempo real"**
- Supabase → Database → Replication → confirma que `posts`, `messages`, `notifications`, `reactions` y `comments` están con Realtime activo

---

## 📦 Desplegar a producción (Vercel)

1. **Sube el proyecto a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USER/cobalto.git
   git push -u origin main
   ```
   *(El `.env` no se sube — ya está en `.gitignore`.)*

2. **Importa el proyecto en Vercel:**
   - https://vercel.com/dashboard → "Add New Project" → selecciona el repo
   - Framework preset: Vite (debería detectarlo solo)
   - Agrega las env vars `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (las mismas de tu `.env`)
   - Deploy. En 2-3 minutos tienes una URL tipo `cobalto.vercel.app`

3. **Prueba esa URL en producción** antes de conectar el dominio — repite las pruebas básicas de arriba.

4. **Plan de Supabase:** el plan Free de Realtime soporta 200 conexiones simultáneas. Si esperas más de ~200 usuarios activos al mismo tiempo, necesitas el plan Pro (~$25/mes).

---

## 🌐 Conectar el dominio cobalto.app

Cuando compres el dominio:

1. En el dashboard de Vercel → tu proyecto → **Settings → Domains**
2. Escribe `cobalto.app` → Add
3. Vercel te muestra los registros DNS que debes crear donde compraste el dominio (normalmente un registro `A` apuntando a `76.76.21.21` y/o un `CNAME` para `www`)
4. Entra al panel DNS de tu proveedor (Namecheap, GoDaddy, Google Domains, etc.) y crea esos registros exactamente como Vercel los indica
5. La propagación tarda entre minutos y un par de horas. Vercel emite el certificado SSL automáticamente — no tienes que hacer nada manual ahí
6. Repite en **Supabase → Authentication → URL Configuration**: agrega `https://cobalto.app` en "Site URL" y en "Redirect URLs" (si no lo haces, los links de confirmación de email y reset de contraseña seguirán apuntando a la URL vieja de `vercel.app`)

---

## 📚 Stack técnico

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Hosting:** Vercel
- **Seguridad:** RLS a nivel de base de datos, CSP, sanitización de errores, contacto privado separado del perfil público

---

¿Preguntas? El código en `src/` está organizado por carpetas (`api/`, `components/`, `pages/`) y es fácil de seguir.
