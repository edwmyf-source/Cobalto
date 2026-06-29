import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder = (v) => !v || typeof v !== 'string' || v.includes('TU-PROYECTO') || v.trim() === ''
const urlValid = !isPlaceholder(url) && url.startsWith('http')
const keyValid = !isPlaceholder(key) && key.length > 20

export const hasSupabaseEnv = urlValid && keyValid

// Fetch con timeout: si una request tarda más de 15s, se aborta en lugar de
// quedar colgada para siempre (causa típica de "la app deja de cargar").
const fetchWithTimeout = (input, init = {}) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  return fetch(input, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(timeout))
}

export const supabase = hasSupabaseEnv
  ? createClient(url, key, {
      auth: {
        persistSession:     true,
        autoRefreshToken:   true,
        detectSessionInUrl: true,
        storageKey:         'rodio-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      global: {
        fetch: fetchWithTimeout,
      },
      realtime: {
        params: { eventsPerSecond: 5 },
      },
      db: {
        schema: 'public',
      },
    })
  : null
