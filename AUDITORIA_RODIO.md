# Auditoría técnica — Rodio

Revisión de seguridad, rendimiento, código y UX. Fecha: julio 2026.
Alcance: base de datos Supabase (`oazbsvkysymahdudiodi`), frontend React, configuración de despliegue.

---

## Resumen ejecutivo

La aplicación está en buen estado general: sin XSS, sin secretos hardcodeados en el código ni en el historial de git, `.env` correctamente ignorado, ErrorBoundary presente, dependencias mínimas y actualizadas. La ruta de admin está protegida en el cliente.

**Sin embargo, hay 3 hallazgos de seguridad reales que deben corregirse ya**, todos en la capa de base de datos (RLS). El más grave permite que cualquier visitante anónimo modifique o borre contenido. La protección de admin existe en el frontend, pero el frontend nunca es una frontera de seguridad — lo que protege de verdad son las políticas RLS, y ahí están los huecos.

Prioridad de lectura: Crítico → Alto → Medio → Bajo.

---

## 🔴 CRÍTICO — corregir de inmediato

### C1. Cualquiera puede escribir/borrar en `feed_widgets` y `quiz_preguntas`

Las políticas RLS `widgets_admin_all` y `quiz_admin_all` usan `USING (true) WITH CHECK (true)` sobre el comando `ALL`. Eso significa que **el rol anónimo** (cualquier visitante sin login) puede hacer INSERT, UPDATE y DELETE vía la API pública de Supabase, no solo leer.

Un atacante podría, con una llamada HTTP simple usando la anon key (que es pública por diseño):
- Borrar las 600 preguntas del quiz.
- Insertar widgets con imágenes o enlaces maliciosos que se muestran a todos los usuarios en el feed.
- Modificar cualquier registro de esas tablas.

**Impacto**: alto. **Explotabilidad**: trivial (la anon key viene en el bundle del frontend, es pública por diseño; la seguridad real depende de RLS).

**Remediación**: reemplazar esas políticas por unas que exijan `is_admin()` para escritura, dejando la lectura pública. Ver `REMEDIACION_SEGURIDAD.sql` incluido, sección C1.

### C2. Protección de admin solo del lado del cliente para escrituras sensibles

`RequireAdmin` en `routes.jsx` y `isAdmin()` en `constants.js` solo controlan qué se **muestra** en la interfaz. No impiden que alguien llame directamente a la API. Como las tablas críticas (widgets, quiz) no tienen RLS de escritura correcta (ver C1), el panel de admin es en la práctica bypasseable saltándose la UI.

Una vez corregido C1, este punto queda mitigado para esas tablas. Aun así, la recomendación es: **toda tabla que el admin edite debe tener RLS que valide `is_admin()` en el servidor**, nunca confiar en que la UI oculta el botón.

---

## 🟠 ALTO

### A1. Buckets de Storage públicos permiten listar todos los archivos

Los buckets `avatars` y `post-media` son públicos (correcto, para servir imágenes por URL), pero tienen políticas SELECT amplias sobre `storage.objects` que permiten **listar** todos los archivos del bucket, no solo acceder a uno por su URL.

**Impacto**: un tercero puede enumerar todos los archivos subidos (avatares, imágenes de posts, banners, widgets) aunque no tenga el enlace directo. Filtración de contenido que se creía "no listado".

**Remediación**: para servir imágenes por URL pública NO se necesita permiso de listado. Restringir la política SELECT del `storage.objects` para que no permita `list()`. Ver `REMEDIACION_SEGURIDAD.sql` sección A1.

### A2. Uploads de imágenes sin validación de tipo ni tamaño

`uploadWidgetImage` y `uploadBannerImage` (en `api/admin.js`) toman la extensión del nombre del archivo (`file.name.split('.').pop()`) sin validar:
- Que el archivo sea realmente una imagen (un `.jpg` puede contener cualquier cosa).
- Un tamaño máximo (alguien puede subir un archivo enorme y consumir tu cuota de Storage).

**Remediación**: validar `file.type` contra una lista blanca (`image/jpeg`, `image/png`, `image/webp`) y `file.size` contra un máximo (p. ej. 5 MB) antes de subir. Además, configurar límites a nivel de bucket en Supabase (allowed MIME types + max file size). Ver sección "Cambios de código sugeridos" abajo.

### A3. Protección contra contraseñas filtradas desactivada

Supabase Auth puede verificar contraseñas contra la base de HaveIBeenPwned para rechazar las que ya se filtraron en brechas conocidas. Está desactivado.

**Remediación**: actívalo en el dashboard de Supabase → Authentication → Policies → "Leaked password protection". Un clic, sin cambios de código.

---

## 🟡 MEDIO — rendimiento de base de datos

### M1. Foreign keys sin índice (15 casos)

Tablas como `comments`, `messages`, `notifications`, `offers`, `buyer_requests`, `reports`, `user_blocks` tienen claves foráneas sin índice que las cubra. En consultas con JOIN o filtros por esas columnas, Postgres hace scans secuenciales — lento a medida que crecen los datos.

**Remediación**: crear índices sobre esas columnas FK. Ver `REMEDIACION_RENDIMIENTO.sql` sección M1. Las más importantes por frecuencia de uso: `comments.user_id`, `messages.sender_id`, `notifications.post_id`, `notifications.from_user_id`.

### M2. Índices duplicados (5 pares)

Hay índices idénticos que ocupan espacio y ralentizan las escrituras (cada INSERT/UPDATE debe mantener ambos):
- `messages`: `idx_messages_conv` = `idx_msg_conv`
- `posts`: `idx_posts_cat_created` = `idx_posts_category_created`
- `posts`: `idx_posts_cat_intent` = `idx_posts_cat_intent_created`
- `posts`: `idx_posts_created` = `idx_posts_created_at`
- `posts`: `idx_posts_search` = `idx_posts_title_fts`

**Remediación**: borrar uno de cada par. Ver `REMEDIACION_RENDIMIENTO.sql` sección M2.

### M3. Políticas RLS re-evalúan `auth.uid()` por fila

En `buyer_requests`, dos políticas llaman `auth.<función>()` directamente en lugar de `(SELECT auth.<función>())`. Postgres las re-evalúa por cada fila en lugar de una sola vez, lo que degrada el rendimiento a escala.

**Remediación**: envolver las llamadas en `(SELECT ...)`. Ver sección M3 del SQL.

### M4. Muchas políticas permisivas múltiples

Numerosas tablas (`posts`, `profiles`, `offers`, `buyer_requests`, `comments`, `reactions`, `banners`, `companies`, `feed_widgets`, `quiz_preguntas`) tienen varias políticas permisivas para el mismo rol y acción. Cada consulta debe evaluar todas. Además, indica **políticas duplicadas/legadas** que se fueron acumulando (p. ej. `lectura_posts` + `posts_select`, `lectura_profiles` + `profiles_select` + `profiles_select_all`).

**Remediación**: consolidar en una sola política por rol+acción y borrar las redundantes. Esto también reduce superficie de error de seguridad. Requiere revisar caso por caso — ver notas en el SQL. Recomiendo hacerlo con calma en un entorno de staging.

### M5. 30+ índices sin uso

Muchos índices (`idx_posts_*`, `idx_notif_*`, `idx_wa_*`, `buyer_requests_*`, `idx_quiz_nivel`, `idx_reactions_user_post`, etc.) nunca se han usado. Ocupan disco y ralentizan escrituras.

**Cautela**: "sin uso" puede significar simplemente que esa consulta aún no se ha ejecutado desde el último reinicio de estadísticas, no que sea inútil. No los borres a ciegas. Revisa cuáles corresponden a funciones que sí usas y borra solo los que correspondan a features retiradas. Lista completa en el SQL, comentada.

---

## 🟢 BAJO / observaciones

### B1. `idx_quiz_nivel` sin uso pese a que el juego filtra por nivel

El juego ahora carga todas las preguntas de una vez (una sola query sin filtro por nivel), por eso el índice sobre `nivel` no se usa. Es coherente con la migración que hicimos. Puedes dejarlo (por si vuelves a filtrar por nivel) o borrarlo.

### B2. Código muerto en el repo

- `ReactionBar.jsx` y `FeedPost.jsx` ya no se usan en el feed (se reemplazaron por el botón "Me gusta" simple).
- En `HerramientasPage.jsx`: `FormulacionSimple`, `CalcDiluciones`, `CalcConversion`, `CalcPureza`, `CalcPH` quedaron sin usar tras dejar solo la calculadora salario/honorario.

No afectan el bundle final (tree-shaking los elimina), pero ensucian el repo. Borrado opcional para mantenimiento.

### B3. Admin definido por email hardcodeado

`ADMIN_EMAILS = ['edwmyf@gmail.com']` en `constants.js` y también dentro de la función `is_admin()` en la base de datos. Funciona, pero tener el criterio de admin en dos lugares es frágil: si cambias de email o agregas admins, hay que tocar ambos. Recomendación: basar la condición solo en `profiles.role = 'admin'` y quitar el email hardcodeado de ambos lados una vez que tu perfil tenga `role='admin'` asignado.

### B4. Bundle del feed relativamente grande

`FeedPage` pesa ~55 KB (15 KB gzip). Es aceptable, pero si crece, considera dividir en más chunks con lazy loading de secciones no visibles al inicio (comentarios, modales).

### B5. Sin rate limiting visible en acciones de escritura

No vi control de frecuencia en creación de posts, comentarios o likes más allá del `eventsPerSecond: 2` de realtime. A escala, alguien podría spamear. Supabase no da rate limiting por fila directamente; se puede mitigar con lógica en funciones o un middleware. Baja prioridad hasta que tengas tráfico real.

---

## Lo que está bien (no tocar)

- Sin `dangerouslySetInnerHTML` ni `eval` — no hay vector XSS por inyección de HTML.
- Sin secretos en el código ni en el historial de git.
- `.env` correctamente en `.gitignore`.
- `supabase.js` bien configurado (persistSession, autoRefresh, storageKey propio, sin OAuth innecesario).
- ErrorBoundary presente y montado en las rutas.
- Cero `console.log` sueltos en producción.
- Dependencias mínimas (5 de runtime), sin paquetes pesados innecesarios.
- Anon key usada correctamente vía variable de entorno (es pública por diseño; lo que protege son las RLS).

---

## Plan de acción recomendado (en orden)

1. **Hoy**: aplicar `REMEDIACION_SEGURIDAD.sql` (C1, A1) y activar leaked password protection (A3). Son los que cierran huecos explotables.
2. **Esta semana**: validación de uploads (A2) en `api/admin.js`, y aplicar índices FK de `REMEDIACION_RENDIMIENTO.sql` (M1) + borrar índices duplicados (M2).
3. **Cuando tengas un rato en staging**: consolidar políticas RLS duplicadas (M4), envolver `auth.uid()` en SELECT (M3), revisar índices sin uso (M5).
4. **Mantenimiento**: limpiar código muerto (B2), unificar criterio de admin (B3).

Los archivos `REMEDIACION_SEGURIDAD.sql` y `REMEDIACION_RENDIMIENTO.sql` acompañan este informe con el SQL listo para aplicar. Léelos antes de ejecutar — algunos cambios (sobre todo la consolidación de políticas) conviene probarlos en staging primero.
