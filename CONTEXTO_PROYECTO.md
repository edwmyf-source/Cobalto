# Rodio — Contexto del proyecto

Red social B2B para el sector químico colombiano. React + Vite + Tailwind, backend en Supabase (DB, Auth, Storage, Realtime), deploy en Vercel.

## ⚠️ Seguridad — leer primero

Este archivo **NO contiene contraseñas ni tokens**, a propósito. La versión anterior de este documento (`RODIO_CONTEXTO.md`) sí tenía un token de GitHub en texto plano, y ese token circuló por varios chats con Claude — debe darse por comprometido.

Antes de seguir editando, haz esto:
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → revoca cualquier token viejo relacionado con este proyecto.
2. Genera uno nuevo con permisos de `repo` solamente.
3. Guárdalo en un gestor de contraseñas o variable de entorno local — nunca lo pegues dentro de un archivo que subes a un chat o repo.
4. Cuando necesites que Claude haga push por ti, pégalo directamente en el chat en el momento (no en un archivo), sabiendo que quedará en el historial de esa conversación puntual.

## Accesos y dónde viven

| Recurso | Dónde está | Notas |
|---|---|---|
| Repositorio | `https://github.com/edwmyf-source/LITIO.git`, rama `main` | Clona con tu propio token, no reutilices el expuesto anteriormente |
| Hosting | Vercel, proyecto asociado a `rodio-theta.vercel.app` | Auto-deploy en cada push a `main` |
| Base de datos | Supabase, project ref `oazbsvkysymahdudiodi` | Acceso vía dashboard de Supabase o MCP de Supabase en Claude |
| Variables de entorno | `.env` local (no incluido, ver `.env.example`) | `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` |

## Stack técnico

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime)
- **Deploy**: Vercel, auto-deploy on push a `main`
- **Package manager**: npm

## Estructura relevante

```
src/
  pages/
    FeedPage.jsx          — feed principal, 3 columnas en desktop
    HerramientasPage.jsx  — calculadora "Honorarios vs salario" (única herramienta activa)
    QuimicaGamePage.jsx   — juego de trivia de química, 20 niveles, preguntas desde Supabase
    AdminPage.jsx         — panel admin (usuarios, posts, banners, widgets feed, reportes)
  components/
    feed/
      PostCard.jsx        — tarjeta de post estilo LinkedIn (footer: Me gusta, Comentar, Compartir, Contactar)
      FeedWidgets.jsx      — widgets 1:1 con imagen real o emoji+gradiente de respaldo
      ReactionBar.jsx      — YA NO SE USA en el feed real (quedó huérfano tras simplificar a "Me gusta" simple)
  api/
    admin.js              — funciones de admin, incluye uploadWidgetImage (bucket post-media)
    reactions.js          — toggleReaction / getReactionsForPost (genérico, ahora solo se usa type='like')
```

## Base de datos (tablas clave)

- `quiz_preguntas` — 600 preguntas del juego (20 niveles × 30 c/u), columnas: `nivel, tema, categoria, pregunta, opciones[], respuesta_correcta, activa`
- `feed_widgets` — widgets del feed, columna `imagen_url` para imagen real subida a Storage (bucket `post-media`, público)
- `reactions` — reacciones a posts, columna `type` (actualmente solo se usa `'like'` desde el feed)

## Cambios recientes (más reciente primero)

1. Footer de posts simplificado: se quitó la barra de 5 reacciones (emoji-like), ahora es un botón simple "Me gusta" con contador y notificación al autor.
2. Avatar de posts reducido de 48px a 40px, estilo LinkedIn.
3. Calculadora "Honorarios vs salario": tabla comparativa con conceptos a la izquierda y valores de Honorario/Salario en columnas paralelas (0 explícito donde un concepto no aplica). Mensaje final explicativo en ambas pestañas (Mensual y Anual). Default: Prestación de servicios.
4. Página "Herramientas" reducida a una sola calculadora (se retiró la sección Formulación, aunque el código sigue en el archivo sin usarse).
5. Juego de química migrado a leer preguntas desde Supabase (antes hardcoded). Niveles sincronizados con temas de la base de datos (biología, cuerpo humano, física, química...).
6. Panel admin: los widgets del feed ahora permiten subir una imagen real (antes solo emoji + gradiente).

## Cómo seguir editando con Claude

1. Sube este zip a un chat nuevo de Claude, o clona el repo directo si Claude tiene acceso a herramientas de código.
2. Dale a Claude el token de GitHub **directamente en el chat** cuando vayas a pedir un push (no antes, no en archivo).
3. Pide cambios puntuales — Claude puede leer el código, hacer los ajustes, compilar (`npm run build`) para validar, y hacer commit + push si le das el token.
4. Para cambios de base de datos, Claude puede usar el conector de Supabase directamente si está conectado en tu cuenta.

## Pendientes conocidos (no bloqueantes)

- `ReactionBar.jsx` y `FeedPost.jsx` quedaron sin usarse en el feed real — se pueden borrar con seguridad si quieres limpiar el repo.
- El código de Formulación/Diluciones/Conversión/Pureza/pH sigue en `HerramientasPage.jsx` sin usarse — mismo caso, limpieza opcional.
