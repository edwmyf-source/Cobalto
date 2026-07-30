# Cobalto — Manual del proyecto

> Documento de referencia con todo lo necesario para entender, mantener y
> restaurar la aplicación. Última actualización: **30 de julio de 2026**
> (commit `f4948a4`).

---

## 1. Qué es Cobalto

Red social B2B para la industria química en Colombia. Conecta proveedores,
laboratorios, empresas y profesionales del sector: se publican productos,
servicios, oportunidades y vacantes, y los usuarios se contactan entre sí por
mensajería interna.

---

## 2. Dónde vive cada cosa

| Servicio | Para qué sirve | Dónde entrar |
|---|---|---|
| **GitHub** | Guarda todo el código y su historial | `github.com/edwmyf-source/Cobalto` |
| **Vercel** | Publica la app en internet (hosting) | `vercel.com` → proyecto "cobalto" |
| **Supabase** | Base de datos, usuarios, archivos | `supabase.com/dashboard/project/oazbsvkysymahdudiodi` |
| **Cloudflare** | Dueño del dominio y su DNS | `dash.cloudflare.com` → `redcobalto.com` |
| **Zoho Mail** | Correo corporativo | `mail.zoho.com` |

**Cuenta usada en todos:** `edwmyf@gmail.com`

### Direcciones públicas

- **Sitio principal:** `https://redcobalto.com`
- **Espejo de Vercel:** `https://cobalto-theta.vercel.app` (sigue activo)
- **Correo corporativo:** `info@redcobalto.com`

---

## 3. Con qué está construida

- **React 18** + **Vite 5** — la interfaz y el compilador
- **Tailwind CSS 3.4** — los estilos
- **Supabase** — base de datos PostgreSQL, autenticación y almacenamiento
- **React Router 7** — la navegación entre pantallas
- **Lucide React** — los íconos

No hay servidor propio: es una aplicación que corre entera en el navegador y
habla directo con Supabase.

---

## 4. Cómo se trabaja en el código

### Flujo normal de cambios

```bash
# 1. Bajar el proyecto (solo la primera vez)
git clone https://github.com/edwmyf-source/Cobalto.git
cd Cobalto

# 2. Instalar dependencias (solo la primera vez, o si falla algo)
npm install

# 3. Crear el archivo de claves (ver sección 5)
#    Copiar .env.example a .env y llenarlo

# 4. Trabajar localmente
npm run dev          # abre en http://localhost:5173

# 5. Verificar que compila ANTES de subir
npm run build

# 6. Subir los cambios
git add -A
git commit -m "descripción del cambio"
git push origin main
```

**Al hacer `push` a la rama `main`, Vercel publica automáticamente** en 2-3
minutos. No hay que hacer nada más.

### Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor local de desarrollo |
| `npm run build` | Compila para producción (verifica que no haya errores) |
| `npm run preview` | Ve el resultado compilado localmente |

---

## 5. Variables de entorno (claves)

El archivo `.env` **nunca se sube a GitHub** (está en `.gitignore` a propósito,
porque contiene claves). Si restauras el proyecto desde cero, hay que crearlo.

Copia `.env.example` a `.env` y llénalo:

```
VITE_SUPABASE_URL=https://oazbsvkysymahdudiodi.supabase.co
VITE_SUPABASE_ANON_KEY=(la clave pública de Supabase)
```

**Dónde obtener la clave:** Supabase → Project Settings → API → `anon` /
`publishable key`.

Esa clave es pública por diseño (va dentro del navegador); la seguridad real la
dan las políticas RLS de la base de datos, no el secreto de esta clave.

> **Nunca** uses aquí la clave `service_role` de Supabase. Esa sí es secreta y
> daría acceso total saltándose todas las protecciones.

---

## 6. Base de datos (Supabase)

**ID del proyecto:** `oazbsvkysymahdudiodi`

### Tablas

| Tabla | Contiene |
|---|---|
| `profiles` | Datos públicos del perfil (nombre, ciudad, empresa, avatar) |
| `profiles_private` | **Datos privados: teléfono y correo.** Solo el dueño y admin pueden leerla |
| `posts` | Las publicaciones del feed |
| `comments` | Comentarios en publicaciones |
| `reactions` | "Me gusta" |
| `conversations` | Hilos de chat entre dos usuarios |
| `messages` | Mensajes dentro de cada chat |
| `notifications` | Avisos de interacciones |
| `reports` | Reportes de contenido inapropiado |
| `user_blocks` | Bloqueos entre usuarios |
| `banners` | Banners promocionales que el admin gestiona |

### Almacenamiento de archivos (Storage)

- `avatars` — fotos de perfil
- `post-media` — imágenes y archivos de las publicaciones

### Seguridad: Row Level Security (RLS)

**Todas las tablas tienen RLS activo con 35 políticas.** Esto significa que la
base de datos misma decide qué puede ver y hacer cada usuario, sin depender de
la app. Aunque alguien manipulara el código desde el navegador, no podría leer
ni borrar datos ajenos.

Puntos clave del diseño:

- **El teléfono y el correo viven en `profiles_private`**, separados de los datos
  públicos. La promesa de privacidad de la app se cumple en la base de datos, no
  solo en la interfaz.
- **Solo el autor (o un administrador) puede borrar una publicación.**
- Al borrar un post, sus comentarios y reacciones se borran en cascada, **pero
  las conversaciones sobreviven** (solo pierden el enlace al post). Nadie pierde
  sus chats.

### Archivos SQL del repositorio

| Archivo | Para qué |
|---|---|
| `SETUP_COMPLETO.sql` | **Crea la base de datos desde cero.** Todas las tablas, políticas y funciones |
| `MIGRACIONES_APLICADAS.sql` | Cambios aplicados después del setup inicial |
| `MIGRATION_follows.sql` | Sistema de seguidores |
| `OPTIMIZACION_INDICES.sql` | Índices para acelerar consultas |
| `REMEDIACION_SEGURIDAD.sql` | Correcciones de seguridad aplicadas |
| `REMEDIACION_RENDIMIENTO.sql` | Correcciones de rendimiento aplicadas |

---

## 7. Dominio y DNS (Cloudflare)

**Dominio:** `redcobalto.com`, comprado en Cloudflare Registrar
(~$10.46 USD/año, sin salto de precio en la renovación).

### Registros DNS configurados

| Tipo | Nombre | Valor | Proxy |
|---|---|---|---|
| CNAME | `@` | `c17516d4e4244fef.vercel-dns-017.com` | **DNS only** (gris) |
| CNAME | `www` | `c17516d4e4244fef.vercel-dns-017.com` | **DNS only** (gris) |
| MX | `@` | `mx.zoho.com` (prioridad 10) | — |
| MX | `@` | `mx2.zoho.com` (prioridad 20) | — |
| MX | `@` | `mx3.zoho.com` (prioridad 50) | — |
| TXT | `@` | `v=spf1 include:zohomail.com ~all` | — |
| TXT | `@` | `zoho-verification=zb73813482.zmverify.zoho.com` | — |
| TXT | `zmail._domainkey` | (clave DKIM larga de Zoho) | — |

> **Importante:** los CNAME que apuntan a Vercel deben quedar en **"DNS only"**
> (nube gris, no naranja). Si el proxy de Cloudflare queda activo, Vercel avisa
> "Proxy Detected" y sus protecciones dejan de funcionar bien.

---

## 8. Correo corporativo (Zoho Mail)

- **Plan:** Mail Lite, ~$1 USD/usuario/mes (facturado anual)
- **Renovación:** 25 de julio de 2027 (cobro automático)
- **Cuenta creada:** `info@redcobalto.com`
- **Webmail:** `mail.zoho.com`

Los registros MX, SPF y DKIM ya están configurados en Cloudflare (ver sección 7),
así que el correo envía y recibe correctamente y no cae en spam.

---

## 9. Interruptores de funciones

En `src/lib/constants.js` hay opciones que activan funciones sin tocar más código:

| Interruptor | Estado actual | Qué hace |
|---|---|---|
| `PHONE_AUTH_ENABLED` | `false` | Activa el código de verificación al registrarse. **Requiere Twilio configurado en Supabase** |
| `PHONE_AUTH_CHANNEL` | `'whatsapp'` | Canal del código: `'whatsapp'` o `'sms'` |
| `EMAIL_CODE_AUTH_ENABLED` | `false` | Registro con código de 6 dígitos por correo |
| `ADMIN_EMAILS` | `['edwmyf@gmail.com']` | Quién ve el panel de administración |

### Cómo funciona el registro hoy

Como todavía no hay proveedor de SMS/WhatsApp, el registro pide **solo nombre y
celular**, sin código de verificación.

Para que Supabase pueda crear la cuenta (siempre exige un identificador), se
genera un **correo interno invisible** con el formato
`573001234567@phone.redcobalto.com`. El usuario nunca lo ve ni lo escribe.

Ese correo se filtra en 6 lugares del código para que nunca aparezca en pantalla:
`api/auth.js`, `ProfileSetup`, `ProfilePage`, `AppLayout`, `Topbar` y
`ContactoPage`. **Si algún día cambias ese dominio, hay que actualizarlo en los
6.**

> **Riesgo conocido:** sin verificación, quien pierda el dispositivo o borre los
> datos del navegador no puede recuperar su cuenta (no hay contraseña conocida ni
> correo real). Por eso existe la sección **"Asegura tu cuenta"** en Mi Perfil,
> que invita a definir una contraseña real.

---

## 10. Estructura del código

```
src/
├── api/          Todo lo que habla con Supabase (auth, posts, perfiles, chats…)
├── components/
│   ├── auth/     Login, registro, recuperar contraseña, MFA
│   ├── feed/     Tarjetas de publicación, filtros, publicar
│   ├── layout/   Barra superior, navegación inferior, menús
│   ├── profile/  Configuración inicial del perfil
│   ├── shared/   Piezas reutilizables (avatar, avisos, splash)
│   └── ui/       Sistema de diseño: Button, Input, Card, Chip, Badge…
├── contexts/     Estado global (sesión del usuario)
├── hooks/        Lógica reutilizable
├── lib/          Constantes, utilidades, manejo de caché
└── pages/        Las pantallas completas
```

### Sistema de diseño

Los colores, tamaños, bordes y sombras están definidos como **variables en
`src/index.css`**. Cambiar un valor ahí lo cambia en toda la app.

Por ejemplo, para cambiar el color de acento de toda la aplicación, solo se tocan
estas líneas:

```css
--accent-deep:   #0B2E68;   /* azul cobalto oscuro */
--accent:        #1A5AC8;   /* azul cobalto */
--accent-soft:   #E4EDFB;   /* fondo suave del acento */
--border-focus:  #1A5AC8;   /* borde al enfocar un campo */
```

---

## 11. Cómo restaurar si algo falla

### Caso A: rompiste algo y quieres volver atrás

```bash
# Ver el historial
git log --oneline

# Volver a un commit anterior (sin perder nada)
git revert <código-del-commit>
git push origin main
```

### Caso B: restaurar desde el respaldo `.zip`

```bash
unzip cobalto-backup-2026-07-30.zip
cd repo
npm install
# Crear el archivo .env (ver sección 5)
npm run build
```

El respaldo incluye **todo el historial de Git**, así que puedes volver a
cualquier versión anterior.

### Caso C: la base de datos se dañó

Ejecuta `SETUP_COMPLETO.sql` en Supabase → SQL Editor. Recrea todas las tablas,
políticas y funciones desde cero.

> Ojo: esto **no recupera los datos de los usuarios**, solo la estructura. Para
> los datos, usa las copias de seguridad automáticas de Supabase
> (Database → Backups).

### Caso D: el sitio no carga pero Vercel dice que el deploy salió bien

Revisa en este orden:

1. **DNS en Cloudflare** — ¿el CNAME sigue apuntando a Vercel y en "DNS only"?
2. **Vercel → Domains** — ¿`redcobalto.com` dice "Valid Configuration"?
3. **Variables de entorno en Vercel** — Settings → Environment Variables. Si
   faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, la app carga en blanco.
4. **Supabase** — ¿el proyecto está activo? Los proyectos gratuitos se pausan
   por inactividad.

---

## 12. Tareas pendientes

### Prioridad alta

- [ ] **Revocar los tokens de GitHub** usados en conversaciones anteriores
      (`github.com/settings/tokens`) y generar uno nuevo. Quedaron expuestos en
      texto plano en el chat.

### Verificación por WhatsApp (para activar el registro con código)

- [ ] Crear cuenta en Twilio (`twilio.com/try-twilio`)
- [ ] Activar un remitente de WhatsApp:
      - *Sandbox* (gratis, para probar): cada persona debe enviar primero un
        mensaje "join …" al número de pruebas de Twilio
      - *Producción*: número de WhatsApp Business, requiere verificar la empresa
        ante Meta (puede tardar días)
- [ ] Crear un servicio **Verify** en Twilio y copiar su Service SID (`VA…`)
- [ ] En Supabase → Authentication → Providers → Phone: activar y elegir
      **Twilio Verify**, pegando Account SID, Auth Token y Service SID
- [ ] Cambiar `PHONE_AUTH_ENABLED` a `true` en `src/lib/constants.js`

### Correo saliente desde el dominio propio

- [ ] Configurar **SMTP personalizado** en Supabase (Project Settings → Auth →
      SMTP) con las credenciales de Zoho, para que los correos de confirmación y
      enlace mágico salgan de `@redcobalto.com` en vez del dominio genérico de
      Supabase.

### Menores

- [ ] Limpiar las columnas `quimica_personaje`, `quimica_nombre` y `quimica_pts`
      de los `SELECT` en `src/api/posts.js`. Son restos del juego eliminado: no
      se muestran en ninguna parte, pero siguen viajando en cada consulta.
- [ ] Verificar en un iPhone real las correcciones de iOS del commit `f4948a4`.
- [ ] `EMAIL_CODE_AUTH_ENABLED` requiere agregar `{{ .Token }}` a la plantilla de
      Magic Link en Supabase (Authentication → Email Templates).

---

## 13. Notas de mantenimiento

### Cosas que ya se corrigieron y conviene no repetir

- **Pesos de fuente:** Manrope solo llega hasta el peso **800**. Usar `font-black`
  (900) hace que iOS "invente" el grosor y descuadre los botones. Nunca usar
  peso 900.
- **Zoom en móvil:** cualquier campo con letra menor a **16px** hace que iOS y
  Android hagan zoom automático al enfocarlo. Hay una regla global en
  `index.css` que lo previene; no la quites.
- **Altura de pantalla:** en iOS, `100vh` incluye la barra del navegador. Usar
  siempre la clase `.min-h-app` (que aplica `100dvh` con respaldo).
- **Nunca uses `maximum-scale=1`** en el viewport para evitar el zoom: impide que
  las personas con baja visión amplíen la pantalla.

### Antes de cada `push`

1. `npm run build` — si falla, no subas
2. Revisa que no hayas dejado claves o tokens en el código
3. Escribe un mensaje de commit que explique **por qué**, no solo qué

---

## 14. Limitaciones conocidas

- **No hay recuperación de cuenta** para quien se registró solo con celular y no
  definió contraseña (ver sección 9).
- **Las publicaciones largas se cortan** a 3 líneas en el feed y no hay botón de
  "Ver más".
- **El código por WhatsApp no está activo** hasta configurar Twilio.
- **Los correos de Supabase** (confirmación, enlace mágico) todavía salen del
  dominio genérico de Supabase, no de `@redcobalto.com`.
