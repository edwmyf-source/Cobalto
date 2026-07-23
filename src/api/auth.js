import { supabase } from './supabase'
import { clearAllCaches } from '../lib/cacheManager'

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// Enlace mágico: inicia sesión solo con el email, sin escribir contraseña.
export const signInWithMagicLink = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  if (error) throw error
}

// ─── Registro / login por celular (OTP vía SMS) ───────────────────────────────
// Requiere que Twilio (u otro proveedor SMS) esté configurado en Supabase:
// Dashboard → Authentication → Providers → Phone → habilitar y poner credenciales.

// Normaliza a formato E.164. Colombia (+57) por defecto si no trae indicativo.
export const normalizePhone = (raw, defaultCountry = '57') => {
  const digits = String(raw || '').replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  const clean = digits.replace(/^0+/, '')
  if (clean.startsWith(defaultCountry) && clean.length > 10) return `+${clean}`
  return `+${defaultCountry}${clean}`
}

// Envía el código SMS. Sirve tanto para registro como para login:
// si el número no existe, Supabase crea el usuario automáticamente.
export const sendPhoneCode = async (phone) => {
  const { error } = await supabase.auth.signInWithOtp({ phone: normalizePhone(phone) })
  if (error) throw error
}

// Verifica el código recibido por SMS y abre sesión.
export const verifyPhoneCode = async (phone, code) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalizePhone(phone),
    token: String(code).trim(),
    type: 'sms',
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  clearAllCaches()
  return supabase?.auth.signOut()
}

// Cambiar/establecer contraseña del usuario logueado
export const updatePassword = async (newPassword) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('La actualización de contraseña tardó demasiado.')), 8000)
  )
  const { data, error } = await Promise.race([
    supabase.auth.updateUser({ password: newPassword }),
    timeout,
  ])
  if (error) throw error
  return data
}

// ─── 2FA / MFA ────────────────────────────────────────────────────────────────

// Verificar si el login requiere 2FA
export const getMFALevel = async () => {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error) throw error
  return data // { currentLevel, nextLevel, currentAuthenticationMethods }
}

// Listar factores MFA enrollados
export const listMFAFactors = async () => {
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw error
  return data?.totp || []
}

// Iniciar enroll de TOTP (devuelve QR + secret)
export const enrollMFA = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Cobalto' })
  if (error) throw error
  return data // { id, type, totp: { qr_code, secret, uri } }
}

// Verificar código al enrollar (confirmar el factor)
export const verifyMFAEnroll = async (factorId, code) => {
  const { data: challenge, error: ce } = await supabase.auth.mfa.challenge({ factorId })
  if (ce) throw ce
  const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code })
  if (error) throw error
  return data
}

// Crear challenge de login (cuando Supabase pide 2FA)
export const challengeMFA = async (factorId) => {
  const { data, error } = await supabase.auth.mfa.challenge({ factorId })
  if (error) throw error
  return data // { id }
}

// Verificar código de login
export const verifyMFALogin = async (factorId, challengeId, code) => {
  const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
  if (error) throw error
  return data
}

// Eliminar factor MFA
export const unenrollMFA = async (factorId) => {
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) throw error
}
