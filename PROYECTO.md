# RedCobalto — Documento de referencia

Punto de restauración del proyecto. Versión académica / de pruebas.

---

## 1. Accesos y credenciales

### Supabase (base de datos, autenticación, archivos)
- **Panel:** https://supabase.com/dashboard/project/oazbsvkysymahdudiodi
- **URL del proyecto:** `https://oazbsvkysymahdudiodi.supabase.co`
- **ID del proyecto:** `oazbsvkysymahdudiodi`
- **Llave pública (anon/publishable):** `sb_publishable_TW5A2JJSi1QuruGyaSDCLw_iu5DrYjz`

> Esta llave pública está pensada para ir en el navegador: por sí sola no da
> acceso a nada, porque las reglas de seguridad (RLS) de cada tabla son las
> que deciden qué puede ver o escribir cada usuario. Ya está en el archivo
> `.env` incluido, así que el proyecto funciona apenas se descomprime.

### GitHub
- **Repositorio:** https://github.com/edwmyf-source/Cobalto
- **Cuenta:** edwmyf-source
- **Token de acceso:** se genera desde
  GitHub → Settings → Developer settings → Personal access tokens (classic),
  con permiso `repo`.

> El token no se incluye aquí a propósito: los tokens de GitHub caducan y son
> de un solo uso práctico. Ya nos pasó una vez que dejó de funcionar a mitad
> de sesión. Es más rápido generar uno nuevo (2 minutos) que depender de uno
> viejo guardado en un archivo.

### Vercel (donde vive la web)
- **Dominio:** https://www.redcobalto.com
- Despliegue automático: cada `push` a la rama `main` publica en 2-3 minutos.

### Cuenta de administrador de la app
- **Correo:** edwmyf@gmail.com
- El rol de admin **no** está escrito en el código: vive en la columna `role`
  de la tabla `profiles`. Para nombrar otro administrador, se cambia ese
  campo a `'admin'` en Supabase. Sin desplegar nada.

---

## 2. Cómo levantar el proyecto

```bash
npm install
npm run dev      # desarrollo local
npm run build    # compilar la web para producción
```

El archivo `.env` ya viene incluido con las credenciales, no hay que
configurar nada más.

---

## 3. Tecnologías

| Capa | Herramienta |
|---|---|
| Interfaz | React + Vite |
| Estilos | Tailwind CSS + variables CSS propias |
| Tipografía | DM Sans |
| Base de datos / auth / archivos | Supabase |
| Hosting web | Vercel |
| Apps móviles | Capacitor (modo remoto) |

---

## 4. Apps móviles (Android e iOS)

Están configuradas en **modo remoto**: la app nativa es un contenedor que
carga `www.redcobalto.com` en vivo. Esto significa que **al actualizar la web,
la app se actualiza sola** — no hay que recompilar ni volver a subir nada a
las tiendas, salvo que cambie algo nativo (ícono, splash, permisos).

### Compilar Android
1. Instalar [Android Studio](https://developer.android.com/studio) (gratis,
   sirve Windows / Mac / Linux).
2. Abrir la carpeta `android/` del proyecto.
3. Menú **Build → Generate Signed Bundle / APK**.
4. Subir el archivo resultante a
   [Google Play Console](https://play.google.com/console) (pago único 25 USD).

### Compilar iOS
Requiere **obligatoriamente una Mac** (Xcode solo existe para macOS).
1. Instalar Xcode.
2. Abrir `ios/App/App.xcworkspace`.
3. Conectar la cuenta de Apple Developer (99 USD/año).
4. **Product → Archive** → subir a App Store Connect.

> Si no hay Mac disponible, existen servicios de compilación en la nube
> (por ejemplo Codemagic) que generan el archivo de iOS sin necesitar una.

### Si se cambia el ícono o el splash
Editar `resources/icon-source.svg` o `resources/splash-source.svg`, y luego:
```bash
npx capacitor-assets generate
npx cap sync
```
Esto sí requiere recompilar y volver a subir a las tiendas.

---

## 5. Pendientes conocidos

**Solo el dueño del proyecto puede hacer estos:**
- Activar la protección de contraseñas filtradas en
  Supabase → Authentication → Policies.
- Configurar un servicio de correo propio (Resend, Brevo) en Supabase. El
  correo por defecto tiene un límite bajo de envíos por hora, insuficiente
  si llegan muchos registros.
- Rotar credenciales antes de salir a producción real (ver sección 6).

**Mejoras técnicas identificadas, no urgentes:**
- Tabla `activity_log` con 23 filas heredadas del proyecto anterior; ningún
  código actual la usa. Candidata a limpieza.
- Verificación en dos pasos (2FA): decidido no implementar por ahora.

---

## 6. Nota de seguridad para la versión real

Este documento incluye credenciales en texto plano porque el proyecto está
en fase académica y de pruebas. **Antes de abrirlo a usuarios reales:**

1. Rotar la llave de Supabase (panel → Settings → API → Reset).
2. Rotar el secreto de Google OAuth (Google Cloud Console).
3. Rotar cualquier credencial que haya circulado por chats o capturas.
4. Sacar este archivo del repositorio, o vaciar esta sección.
5. Verificar que `.env` esté en `.gitignore` (ya lo está).
