import { useEffect, useRef } from 'react'
import { supabase } from '../api/supabase'

// ─── CANALES COMPARTIDOS ─────────────────────────────────────────────────────
// PROBLEMA ANTERIOR: cada montaje/re-render creaba un canal NUEVO de Supabase
// (rt-posts-INSERT-1, -2, -3...). Las conexiones WebSocket se acumulaban hasta
// saturar el navegador y el límite de Supabase (~100 conexiones) → la app se
// congelaba tras ~1 min de uso.
//
// SOLUCIÓN: un solo canal por combinación tabla+evento, compartido entre todos
// los componentes. Los callbacks se guardan en un Set y se invocan todos al
// llegar un cambio. El canal se cierra solo cuando NADIE lo usa.

const registry = new Map() // key -> { channel, listeners:Set }

function getOrCreateChannel(table, event) {
  const key = `${table}:${event}`
  let entry = registry.get(key)
  if (entry) return entry

  const listeners = new Set()
  const channel = supabase
    .channel(`rt-${key}`)
    .on('postgres_changes', { event, schema: 'public', table }, (payload) => {
      listeners.forEach(fn => { try { fn(payload) } catch {} })
    })
    .subscribe()

  entry = { channel, listeners }
  registry.set(key, entry)
  return entry
}

export function useRealtime(table, event, callback) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    if (!supabase) return

    const key = `${table}:${event}`
    const entry = getOrCreateChannel(table, event)
    const listener = (payload) => cbRef.current?.(payload)
    entry.listeners.add(listener)

    return () => {
      entry.listeners.delete(listener)
      // Si ya nadie escucha este canal, lo cerramos para liberar la conexión
      if (entry.listeners.size === 0) {
        try { supabase.removeChannel(entry.channel) } catch {}
        registry.delete(key)
      }
    }
  }, [table, event])
}
