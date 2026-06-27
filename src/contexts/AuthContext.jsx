import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, hasSupabaseEnv } from '../api/supabase'
import { getProfile } from '../api/profiles'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession]         = useState(null)
  const [profile, setProfile]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [mfaRequired, setMfaRequired] = useState(false)

  const syncProfile = useCallback(async (uid) => {
    try {
      const p = await getProfile(uid)
      setProfile(p)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await syncProfile(session.user.id)
  }, [session?.user?.id, syncProfile])

  const checkMFA = useCallback(async (currentSession) => {
    if (!currentSession) { setMfaRequired(false); return }
    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      // nextLevel > currentLevel significa que hay factores enrollados pero no verificados en esta sesión
      if (data?.nextLevel === 'aal2' && data?.currentLevel === 'aal1') {
        setMfaRequired(true)
      } else {
        setMfaRequired(false)
      }
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

    supabase.auth.getSession().then(async ({ data, error: se }) => {
      if (!mounted) return
      if (se) setError(se.message)
      setSession(data.session)
      await checkMFA(data.session)
      if (data.session?.user) await syncProfile(data.session.user.id)
      if (mounted) setLoading(false)
    }).catch((e) => {
      if (mounted) { setError(e.message); setLoading(false) }
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_ev, ns) => {
      if (!mounted) return
      setSession(ns)
      await checkMFA(ns)
      if (!ns?.user) { setProfile(null); setLoading(false); return }
      await syncProfile(ns.user.id)
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
