import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder = (v) => !v || typeof v !== 'string' || v.includes('TU-PROYECTO') || v.trim() === ''
const urlValid = !isPlaceholder(url) && url.startsWith('http')
const keyValid = !isPlaceholder(key) && key.length > 20

export const hasSupabaseEnv = urlValid && keyValid

// Migración de claves de almacenamiento heredadas ('rodio-*' → 'cobalto-*').
// Se ejecuta ANTES de crear el cliente para que Supabase encuentre la sesión ya
// movida y nadie pierda su sesión al desplegar el cambio de nombre.
const migrateLegacyStorage = () => {
  if (typeof window === 'undefined') return
  const pairs = [['rodio-auth', 'cobalto-auth'], ['rodio-profile', 'cobalto-profile']]
  for (const [oldKey, newKey] of pairs) {
    try {
      const legacy = window.localStorage.getItem(oldKey)
      if (legacy !== null && window.localStorage.getItem(newKey) === null) {
        window.localStorage.setItem(newKey, legacy)
      }
      if (legacy !== null) window.localStorage.removeItem(oldKey)
    } catch { /* almacenamiento no disponible: seguir sin romper */ }
  }
}
migrateLegacyStorage()

export const supabase = hasSupabaseEnv
  ? createClient(url, key, {
      auth: {
        persistSession:     true,
        autoRefreshToken:   true,
        // Necesario para enlaces mágicos y OAuth: el token llega en la URL de
        // retorno y el cliente debe leerlo para abrir la sesión.
        detectSessionInUrl: true,
        flowType:           'implicit',
        storageKey:         'cobalto-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      realtime: {
        params: { eventsPerSecond: 2 },
      },
      db: { schema: 'public' },
    })
  : null
