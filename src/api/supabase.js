import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder = (v) => !v || typeof v !== 'string' || v.includes('TU-PROYECTO') || v.trim() === ''
const urlValid = !isPlaceholder(url) && url.startsWith('http')
const keyValid = !isPlaceholder(key) && key.length > 20

export const hasSupabaseEnv = urlValid && keyValid
export const supabase = hasSupabaseEnv
  ? createClient(url, key, {
      auth: {
        persistSession:     true,      // guarda en localStorage → sobrevive cierres del navegador
        autoRefreshToken:   true,      // renueva el token automáticamente antes de que expire
        detectSessionInUrl: true,
        storageKey:         'rodio-auth', // clave única, evita conflictos con otras apps
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      realtime: {
        params: { eventsPerSecond: 5 },
      },
      db: {
        schema: 'public',
      },
    })
  : null
