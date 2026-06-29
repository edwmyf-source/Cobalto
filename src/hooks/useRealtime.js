import { useEffect, useRef } from 'react'
import { supabase } from '../api/supabase'

// ─── CANALES COMPARTIDOS CON RECONEXIÓN ──────────────────────────────────────
// Un solo canal por tabla+evento, compartido entre componentes.
//
// MEJORAS contra congelamiento:
// 1. Si el canal entra en estado CHANNEL_ERROR o TIMED_OUT, se reintenta solo.
// 2. Al volver a la pestaña (visibilitychange) o recuperar conexión (online),
//    se re-suscriben todos los canales — clave en móvil donde el WebSocket
//    muere al bloquear la pantalla.
// 3. Los callbacks nunca rompen el bucle: cada uno va en su propio try/catch.

const registry = new Map() // key -> { channel, listeners:Set, table, event }

function subscribeChannel(entry) {
  const { table, event } = entry
  const channel = supabase
    .channel(`rt-${table}:${event}-${Date.now()}`)
    .on('postgres_changes', { event, schema: 'public', table }, (payload) => {
      entry.listeners.forEach(fn => { try { fn(payload) } catch {} })
    })
    .subscribe((status) => {
      // Si el canal falla, reintentar tras 2s (solo si aún hay oyentes)
      if ((status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED')
          && entry.listeners.size > 0 && !entry.reconnecting) {
        entry.reconnecting = true
        setTimeout(() => {
          if (entry.listeners.size === 0) { entry.reconnecting = false; return }
          try { supabase.removeChannel(entry.channel) } catch {}
          entry.channel = subscribeChannel(entry)
          entry.reconnecting = false
        }, 2000)
      }
    })
  return channel
}

function getOrCreateChannel(table, event) {
  const key = `${table}:${event}`
  let entry = registry.get(key)
  if (entry) return entry

  entry = { channel: null, listeners: new Set(), table, event, reconnecting: false }
  entry.channel = subscribeChannel(entry)
  registry.set(key, entry)
  return entry
}

// ── Re-suscribir todos los canales al volver a la pestaña o recuperar red ────
let globalListenersAttached = false
function attachGlobalListeners() {
  if (globalListenersAttached || typeof window === 'undefined') return
  globalListenersAttached = true

  const resubscribeAll = () => {
    for (const entry of registry.values()) {
      if (entry.listeners.size === 0) continue
      try { supabase.removeChannel(entry.channel) } catch {}
      entry.channel = subscribeChannel(entry)
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resubscribeAll()
  })
  window.addEventListener('online', resubscribeAll)
}

export function useRealtime(table, event, callback) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    if (!supabase) return
    attachGlobalListeners()

    const key = `${table}:${event}`
    const entry = getOrCreateChannel(table, event)
    const listener = (payload) => cbRef.current?.(payload)
    entry.listeners.add(listener)

    return () => {
      entry.listeners.delete(listener)
      if (entry.listeners.size === 0) {
        try { supabase.removeChannel(entry.channel) } catch {}
        registry.delete(key)
      }
    }
  }, [table, event])
}
