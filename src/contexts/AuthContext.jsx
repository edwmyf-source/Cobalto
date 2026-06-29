import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, hasSupabaseEnv } from '../api/supabase'
import { getProfile } from '../api/profiles'
import { preloadFeed } from '../lib/feedPreloader'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession]         = useState(null)
  const [profile, setProfile]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [mfaRequired, setMfaRequired] = useState(false)

  // Reintenta hasta 3 veces con backoff — crítico en móvil con conexión inestable
  const syncProfile = useCallback(async (uid, retries = 3) => {
    if (!uid) return
    for (let i = 0; i < retries; i++) {
      try {
        const p = await getProfile(uid)
        if (p) {
          setProfile(p)
          setError('')
          return p
        }
      } catch (e) {
        if (i === retries - 1) {
          console.warn('syncProfile falló tras', retries, 'intentos:', e.message)
          setError(e.message)
        } else {
          // Esperar antes de reintentar: 500ms, 1000ms
          await new Promise(r => setTimeout(r, 500 * (i + 1)))
        }
      }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    if (data?.user?.id) await syncProfile(data.user.id)
  }, [syncProfile])

  const checkMFA = useCallback(async (currentSession) => {
    if (!currentSession) { setMfaRequired(false); return }
    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      setMfaRequired(data?.nextLevel === 'aal2' && data?.currentLevel === 'aal1')
    } catch {
      setMfaRequired(false)
    }
  }, [])

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setLoading(false)
      setError('Faltan variables de entorno de Supabase.')
      return
    }

    let mounted = true
    const safetyTimer = setTimeout(() => { if (mounted) setLoading(false) }, 8000)

    supabase.auth.getSession().then(async ({ data, error: se }) => {
      if (!mounted) return
      if (se) setError(se.message)
      const sess = data.session
      setSession(sess)
      clearTimeout(safetyTimer)
      setLoading(false)

      if (sess?.user) {
        // Perfil y MFA en paralelo, con reintentos automáticos
        Promise.all([
          syncProfile(sess.user.id),
          checkMFA(sess),
        ]).then(([prof]) => {
          if (mounted && prof) preloadFeed(sess.user.id)
        }).catch(e => console.warn('Init:', e.message))
      }
    }).catch((e) => {
      clearTimeout(safetyTimer)
      if (mounted) { setError(e.message); setLoading(false) }
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, ns) => {
      if (!mounted) return

      // TOKEN_REFRESHED: solo actualizar sesión, no re-sincronizar
      if (event === 'TOKEN_REFRESHED') {
        setSession(ns)
        return
      }

      if (event === 'SIGNED_OUT') {
        setSession(null)
        setProfile(null)
        setMfaRequired(false)
        return
      }

      setSession(ns)
      if (ns?.user) {
        await Promise.all([checkMFA(ns), syncProfile(ns.user.id)])
      } else {
        setProfile(null)
      }
      if (mounted) setLoading(false)
    })

    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [syncProfile, checkMFA])

  return (
    <AuthCtx.Provider value={{ session, profile, setProfile, refreshProfile, loading, error, mfaRequired, setMfaRequired }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
