import { useEffect, useRef } from 'react'
import { supabase } from '../api/supabase'

let channelCounter = 0

export function useRealtime(table, event, callback) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    if (!supabase) return

    const key = `rt-${table}-${event}-${++channelCounter}`
    let channel

    try {
      channel = supabase
        .channel(key)
        .on(
          'postgres_changes',
          { event, schema: 'public', table },
          (payload) => cbRef.current?.(payload)
        )
        .subscribe()
    } catch {
      return
    }

    return () => {
      try { supabase.removeChannel(channel) } catch {}
    }
  }, [table, event])
}
